require('dotenv').config();

const path = require('node:path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('./database');
const { authMiddleware, requireProfiles, signToken } = require('./middleware/auth');

const app = express();
const port = Number(process.env.PORT || 3333);

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../../WebSite')));

app.get('/health', async (_req, res, next) => {
  try {
    const db = await getDatabase();
    await db.get('SELECT 1 AS ok');
    res.json({ status: 'ok', database: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { nome, email, senha, matricula, serie, turma } = req.body;
    if (!nome || !email || !senha || senha.length < 8) {
      return res.status(400).json({ error: 'nome, email e senha de ao menos 8 caracteres são obrigatórios' });
    }
    const db = await getDatabase();
    const senhaHash = await bcrypt.hash(senha, 12);
    const result = await db.run(
      `INSERT INTO users (nome, email, senha_hash, perfil, matricula, serie, turma)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      nome.trim(), email.trim().toLowerCase(), senhaHash, 'estudante', matricula || null, serie || null, turma || null,
    );
    const user = await db.get('SELECT id, nome, email, perfil, created_at FROM users WHERE id = ?', result.lastID);
    res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') return res.status(409).json({ error: 'E-mail já cadastrado' });
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', email?.trim().toLowerCase());
    if (!user || !user.ativo || !(await bcrypt.compare(senha || '', user.senha_hash))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    await db.run('UPDATE users SET ultimo_login_at = CURRENT_TIMESTAMP WHERE id = ?', user.id);
    res.json({ user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil }, token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/sugestoes', async (req, res, next) => {
  try {
    const { anonimo = false, nome, email, perfil, categoria, titulo, mensagem } = req.body;
    if (!titulo || !mensagem || !perfil || !categoria) {
      return res.status(400).json({ error: 'perfil, categoria, titulo e mensagem são obrigatórios' });
    }
    const db = await getDatabase();
    const category = await db.get('SELECT id FROM suggestion_categories WHERE codigo = ? AND ativo = 1', categoria);
    if (!category) return res.status(400).json({ error: 'Categoria de sugestão inválida' });
    const result = await db.run(
      `INSERT INTO suggestions (anonimo, nome, email, perfil, category_id, titulo, mensagem)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      anonimo ? 1 : 0, anonimo ? null : nome || null, anonimo ? null : email || null,
      perfil, category.id, titulo.trim(), mensagem.trim(),
    );
    res.status(201).json({ id: result.lastID, status: 'recebido' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/eventos', async (req, res, next) => {
  try {
    const db = await getDatabase();
    const events = await db.all(
      `SELECT e.*, c.codigo AS categoria_codigo, c.nome AS categoria_nome
       FROM events e LEFT JOIN event_categories c ON c.id = e.category_id
       WHERE e.deleted_at IS NULL AND e.status = 'publicado'
       AND (? IS NULL OR e.data_inicio >= ?)
       ORDER BY e.data_inicio ASC`,
      req.query.a_partir_de || null, req.query.a_partir_de || null,
    );
    res.json(events);
  } catch (error) {
    next(error);
  }
});

app.get('/api/artigos', async (req, res, next) => {
  try {
    const db = await getDatabase();
    const articles = await db.all(
      `SELECT a.*, c.codigo AS categoria_codigo, c.nome AS categoria_nome
       FROM articles a LEFT JOIN article_categories c ON c.id = a.category_id
       WHERE a.deleted_at IS NULL AND a.status = 'publicado'
       ORDER BY a.published_at DESC, a.created_at DESC`,
    );
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

app.post('/api/artigos', async (req, res, next) => {
  try {
    const { autor_nome, categoria, titulo, resumo, conteudo } = req.body;
    if (!autor_nome || !categoria || !titulo || !resumo || !conteudo) {
      return res.status(400).json({ error: 'autor_nome, categoria, titulo, resumo e conteudo são obrigatórios' });
    }
    const db = await getDatabase();
    const category = await db.get('SELECT id FROM article_categories WHERE codigo = ? AND ativo = 1', categoria);
    if (!category) return res.status(400).json({ error: 'Categoria de artigo inválida' });
    const result = await db.run(
      `INSERT INTO articles (autor_nome, category_id, titulo, resumo, conteudo, status)
       VALUES (?, ?, ?, ?, ?, 'aguardando_coordenacao')`,
      autor_nome.trim(), category.id, titulo.trim(), resumo.trim(), conteudo.trim(),
    );
    res.status(201).json({ id: result.lastID, status: 'aguardando_coordenacao' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/eventos', authMiddleware, requireProfiles('coordenador', 'diretor', 'admin'), async (req, res, next) => {
  try {
    const { categoria, titulo, descricao, data_inicio, data_fim, local, endereco, inscricao_aberta = false, inscricao_url } = req.body;
    if (!titulo || !data_inicio || !local) return res.status(400).json({ error: 'titulo, data_inicio e local são obrigatórios' });
    const db = await getDatabase();
    const category = categoria ? await db.get('SELECT id FROM event_categories WHERE codigo = ?', categoria) : null;
    const result = await db.run(
      `INSERT INTO events (category_id, titulo, descricao, data_inicio, data_fim, local, endereco, inscricao_aberta, inscricao_url, created_by, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      category?.id || null, titulo.trim(), descricao || null, data_inicio, data_fim || null, local.trim(), endereco || null,
      inscricao_aberta ? 1 : 0, inscricao_url || null, req.user.sub,
    );
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/admin/artigos/:id/moderacao', authMiddleware, requireProfiles('professor', 'coordenador', 'diretor', 'admin'), async (req, res, next) => {
  try {
    const { status, comentario, etapa = 'coordenacao' } = req.body;
    const allowed = ['em_revisao', 'aprovado', 'publicado', 'recusado'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Status de moderação inválido' });
    const db = await getDatabase();
    const article = await db.get('SELECT id, status FROM articles WHERE id = ? AND deleted_at IS NULL', req.params.id);
    if (!article) return res.status(404).json({ error: 'Artigo não encontrado' });
    await db.run(
      `UPDATE articles SET status = ?, motivo_recusa = ?, published_at = CASE WHEN ? = 'publicado' THEN CURRENT_TIMESTAMP ELSE published_at END,
       published_by = CASE WHEN ? = 'publicado' THEN ? ELSE published_by END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      status, status === 'recusado' ? comentario || null : null, status, status, req.user.sub, article.id,
    );
    await db.run(
      `INSERT INTO article_reviews (article_id, etapa, status, reviewer_id, comentario, decision, decided_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      article.id, etapa, status, req.user.sub, comentario || null, status,
    );
    res.json({ id: article.id, status });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

if (require.main === module) {
  getDatabase()
    .then(() => app.listen(port, () => console.log(`API disponível em http://localhost:${port}`)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = app;
