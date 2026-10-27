# 🗄️ Arquitetura do Banco de Dados (SQLite) — Portal Escola Elza

Este documento define a estrutura completa de dados e tabelas para a API do **Portal Escola Elza**.

---

## ⚙️ Regras Gerais e Padrão de Campos

- **Banco Utilizado:** SQLite (`database.db`)
- **Convenção de Tipos:**
  - `INTEGER`: Chaves primárias, chaves estrangeiras e booleanos (`0` ou `1`).
  - `TEXT`: Strings, textos longos, e-mails, URLs e JSONs.
  - `DATETIME`: Datas e horários no formato ISO (`YYYY-MM-DD HH:MM:SS`).

---

## 🚀 FASE 1: Banco Mínimo (MVP Inicial)

Esta é a estrutura essencial necessária para colocar as primeiras rotas e formulários para rodar.

### 1. `users` (Usuários e Autenticação)
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  perfil TEXT DEFAULT 'estudante', -- 'estudante', 'professor', 'coordenador', 'diretor', 'admin'
  matricula TEXT,
  serie TEXT,
  turma TEXT,
  telefone TEXT,
  ativo BOOLEAN DEFAULT 1,
  ultimo_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  deleted_at DATETIME
);

CREATE TABLE IF NOT EXISTS suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anonimo BOOLEAN DEFAULT 0,
  nome TEXT,
  email TEXT,
  perfil TEXT, -- 'estudante', 'professor', 'responsavel', 'comunidade'
  categoria TEXT, -- 'infraestrutura', 'projeto', 'convivencia', 'elogio', 'outro'
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  status TEXT DEFAULT 'recebido', -- 'recebido', 'em_analise', 'respondido', 'arquivado'
  responsavel_id INTEGER,
  resposta TEXT,
  respondido_at DATETIME,
  ip_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  deleted_at DATETIME,
  FOREIGN KEY (responsavel_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER,
  autor_nome TEXT NOT NULL,
  categoria TEXT NOT NULL, -- 'noticia_geral', 'artigo_cientifico', 'ser_onu', 'cultura_afro'
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE,
  resumo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  status TEXT DEFAULT 'aguardando_coordenacao', -- 'rascunho', 'aguardando_coordenacao', 'em_revisao', 'aprovado', 'publicado', 'recusado'
  motivo_recusa TEXT,
  featured BOOLEAN DEFAULT 0,
  published_at DATETIME,
  published_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  deleted_at DATETIME,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (published_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS media_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  alt_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria TEXT, -- 'neaonnim', 'ser_onu', 'vozes_negras', 'conselho', 'outros'
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE,
  descricao TEXT,
  data_inicio DATETIME NOT NULL,
  data_fim DATETIME,
  local TEXT NOT NULL,
  imagem_id INTEGER,
  inscricao_aberta BOOLEAN DEFAULT 0,
  inscricao_url TEXT,
  status TEXT DEFAULT 'publicado',
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  deleted_at DATETIME,
  FOREIGN KEY (imagem_id) REFERENCES media_files(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  acao TEXT NOT NULL, -- ex: 'login', 'aprovou_noticia', 'deletou_evento'
  entidade TEXT NOT NULL, -- ex: 'articles', 'users'
  entidade_id INTEGER,
  dados_novos TEXT,
  ip_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

🎯 FASE 2: Tabelas de Expansão (Módulos Futuros)

(Estas tabelas serão criadas na sequência para Suporte Editorial, LGPD e Eletivas)

    article_reviews: Histórico das etapas pedagógicas/editoriais de aprovação de artigos.

    image_authorizations: Controle de autorização de direito de imagem de menores.

    subjects: Cadastros de matérias e eletivas oferecidas.

    elective_enrollments: Inscrições de alunos nas matérias eletivas.

    consents: Registro de aceite de termos de uso e política de privacidade (LGPD).