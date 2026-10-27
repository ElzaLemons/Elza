const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const dataDir = path.resolve(__dirname, '..');
const databasePath = process.env.DATABASE_PATH || path.join(dataDir, 'database.db');

let connection;

async function getDatabase() {
  if (!connection) {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    connection = await open({ filename: databasePath, driver: sqlite3.Database });
    await connection.exec('PRAGMA foreign_keys = ON;');
    await migrate(connection);
  }
  return connection;
}

async function migrate(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      senha_hash TEXT NOT NULL,
      perfil TEXT NOT NULL DEFAULT 'estudante',
      matricula TEXT,
      serie TEXT,
      turma TEXT,
      telefone TEXT,
      ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
      email_verificado INTEGER NOT NULL DEFAULT 0 CHECK (email_verificado IN (0, 1)),
      ultimo_login_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      role_id INTEGER NOT NULL REFERENCES roles(id),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token_hash TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suggestion_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      descricao TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anonimo INTEGER NOT NULL DEFAULT 0 CHECK (anonimo IN (0, 1)),
      nome TEXT,
      email TEXT,
      perfil TEXT,
      category_id INTEGER REFERENCES suggestion_categories(id),
      titulo TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'recebido',
      responsavel_id INTEGER REFERENCES users(id),
      resposta TEXT,
      respondido_at DATETIME,
      ip_hash TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS suggestion_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suggestion_id INTEGER NOT NULL REFERENCES suggestions(id),
      status_anterior TEXT,
      status_novo TEXT NOT NULL,
      observacao TEXT,
      changed_by INTEGER REFERENCES users(id),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS article_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      descricao TEXT,
      cor_tema TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER REFERENCES users(id),
      autor_nome TEXT NOT NULL,
      category_id INTEGER REFERENCES article_categories(id),
      titulo TEXT NOT NULL,
      slug TEXT UNIQUE,
      resumo TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'aguardando_coordenacao',
      motivo_recusa TEXT,
      featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
      published_at DATETIME,
      published_by INTEGER REFERENCES users(id),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS article_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES articles(id),
      version_number INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      resumo TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      edited_by INTEGER REFERENCES users(id),
      change_summary TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(article_id, version_number)
    );

    CREATE TABLE IF NOT EXISTS article_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES articles(id),
      etapa TEXT NOT NULL,
      status TEXT NOT NULL,
      reviewer_id INTEGER REFERENCES users(id),
      comentario TEXT,
      decision TEXT,
      decided_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER REFERENCES users(id),
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      public_url TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      extension TEXT,
      size_bytes INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      checksum TEXT,
      alt_text TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS article_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES articles(id),
      media_id INTEGER NOT NULL REFERENCES media_files(id),
      tipo TEXT NOT NULL DEFAULT 'imagem',
      ordem INTEGER NOT NULL DEFAULT 0,
      is_cover INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS image_authorizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      media_id INTEGER NOT NULL REFERENCES media_files(id),
      article_id INTEGER REFERENCES articles(id),
      nome_pessoa_retratada TEXT NOT NULL,
      nome_responsavel TEXT NOT NULL,
      email_responsavel TEXT,
      tipo_autorizacao TEXT NOT NULL,
      arquivo_autorizacao_id INTEGER REFERENCES media_files(id),
      autorizado INTEGER NOT NULL DEFAULT 0,
      data_autorizacao DATETIME,
      validade_at DATETIME,
      observacao TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      descricao TEXT,
      cor_tema TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER REFERENCES event_categories(id),
      titulo TEXT NOT NULL,
      slug TEXT UNIQUE,
      descricao TEXT,
      data_inicio DATETIME NOT NULL,
      data_fim DATETIME,
      local TEXT NOT NULL,
      endereco TEXT,
      responsavel_id INTEGER REFERENCES users(id),
      imagem_id INTEGER REFERENCES media_files(id),
      inscricao_aberta INTEGER NOT NULL DEFAULT 0,
      inscricao_url TEXT,
      limite_participantes INTEGER,
      status TEXT NOT NULL DEFAULT 'publicado',
      created_by INTEGER REFERENCES users(id),
      published_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id),
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT,
      perfil TEXT,
      serie TEXT,
      turma TEXT,
      observacoes TEXT,
      status TEXT NOT NULL DEFAULT 'confirmada',
      consentimento_dados INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      cancelled_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      slug TEXT UNIQUE,
      descricao TEXT,
      professor_id INTEGER REFERENCES users(id),
      area TEXT,
      serie TEXT,
      periodo_letivo TEXT,
      vagas INTEGER,
      horario TEXT,
      local TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      deleted_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS elective_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL REFERENCES subjects(id),
      nome_aluno TEXT NOT NULL,
      email_aluno TEXT,
      matricula TEXT,
      serie TEXT,
      turma TEXT,
      responsavel_nome TEXT,
      responsavel_email TEXT,
      status TEXT NOT NULL DEFAULT 'pendente',
      consentimento_dados INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      cancelled_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      email TEXT,
      tipo TEXT NOT NULL,
      versao_termo TEXT NOT NULL,
      aceito INTEGER NOT NULL DEFAULT 0,
      ip_hash TEXT,
      accepted_at DATETIME,
      revoked_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS external_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      url TEXT NOT NULL,
      tipo TEXT NOT NULL,
      icone TEXT,
      ordem INTEGER NOT NULL DEFAULT 0,
      ativo INTEGER NOT NULL DEFAULT 1,
      created_by INTEGER REFERENCES users(id),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      descricao_curta TEXT,
      descricao_completa TEXT,
      imagem_id INTEGER REFERENCES media_files(id),
      cor_tema TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      ordem INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS project_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      funcao TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      UNIQUE(project_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS article_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES articles(id),
      project_id INTEGER NOT NULL REFERENCES projects(id),
      UNIQUE(article_id, project_id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      acao TEXT NOT NULL,
      entidade TEXT NOT NULL,
      entidade_id INTEGER,
      dados_anteriores TEXT,
      dados_novos TEXT,
      ip_hash TEXT,
      user_agent TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
    CREATE INDEX IF NOT EXISTS idx_events_data_inicio ON events(data_inicio);
    CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entidade, entidade_id);
  `);

  await seed(db);
}

async function seed(db) {
  const roles = [
    ['estudante_autor', 'Pode enviar publicações'],
    ['professor_revisor', 'Pode revisar publicações'],
    ['coordenador', 'Pode coordenar e moderar conteúdo'],
    ['diretor', 'Pode validar publicações institucionalmente'],
    ['administrador', 'Acesso total ao painel'],
  ];
  for (const [nome, descricao] of roles) {
    await db.run('INSERT OR IGNORE INTO roles (nome, descricao) VALUES (?, ?)', nome, descricao);
  }

  const suggestions = [
    ['infraestrutura', 'Melhoria de Espaço & Infraestrutura'],
    ['projeto', 'Ideia para Projeto / Evento'],
    ['convivencia', 'Convivência & Clima Escolar'],
    ['elogio', 'Elogio ou Agradecimento'],
    ['outro', 'Outro assunto'],
  ];
  for (const [codigo, nome] of suggestions) {
    await db.run('INSERT OR IGNORE INTO suggestion_categories (codigo, nome) VALUES (?, ?)', codigo, nome);
  }

  const articleCategories = [
    ['noticia_geral', 'Notícia Geral'],
    ['artigo_cientifico', 'Artigo Científico'],
    ['ser_onu', 'Diplomacia & Ser ONU'],
    ['cultura_afro', 'Cultura Afro-Brasileira'],
  ];
  for (const [codigo, nome] of articleCategories) {
    await db.run('INSERT OR IGNORE INTO article_categories (codigo, nome) VALUES (?, ?)', codigo, nome);
  }

  const eventCategories = [
    ['neaonnim', 'Acadêmico & NeaOnnim'],
    ['ser_onu', 'Ser ONU'],
    ['vozes_negras', 'Vozes Negras & Cultura'],
    ['conselho', 'Reuniões & Conselho'],
    ['outros', 'Outros'],
  ];
  for (const [codigo, nome] of eventCategories) {
    await db.run('INSERT OR IGNORE INTO event_categories (codigo, nome) VALUES (?, ?)', codigo, nome);
  }
}

module.exports = { getDatabase, databasePath };
