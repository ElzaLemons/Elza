# 🛠️ Guia de Arquitetura & Implementação do Back-end

Este documento serve como a especificação oficial de contexto e instruções para o desenvolvimento da API e do banco de dados do **Portal Escola Elza**.

---

## 🎯 Objetivo
Transformar o protótipo visual atual (páginas HTML/JS/Tailwind na pasta `WebSite`) em uma aplicação funcional, com dados persistidos em banco de dados, autenticação de usuários e rotas de API seguras.

---

## 📁 Estrutura de Pastas Esperada

```text
/
├── backend/
│   ├── src/
│   │   ├── middleware/    # Validações e proteção por JWT
│   │   ├── database.js    # Conexão, migrations e seed do SQLite
│   │   └── server.js      # Ponto de entrada do Express
│   ├── uploads/           # Armazenamento de imagens
│   ├── database.db        # Arquivo do SQLite (gerado automaticamente)
│   ├── .env               # Variáveis de ambiente (PORT, JWT_SECRET)
│   └── package.json
└── WebSite/               # Front-end estático (não alterar estrutura de pastas)


⚙️ Tecnologias Principais

    Runtime: Node.js

    Framework: Express.js

    Banco de Dados: SQLite (sqlite / sqlite3)

    Autenticação: JWT (jsonwebtoken) + Criptografia de senha (bcryptjs)

    Upload de Arquivos: previsto para a próxima etapa; os metadados já estão em `media_files`

### Acesso e configuração da API

A porta padrão da API é `5000` (`PORT` no arquivo `backend/.env`). Em desenvolvimento local, o front-end usa essa porta automaticamente quando aberto em `localhost`, `127.0.0.1` ou como arquivo local. Em implantação, configure `window.API_URL` antes de carregar `js/auth.js` quando o endereço da API for diferente da origem do site, e inclua a origem autorizada do site em `CORS_ORIGIN`.

O acesso em redes corporativas depende das regras de firewall e proxy do ambiente. Use apenas endereços e portas autorizados pela equipe de TI; esta configuração não contorna bloqueios de rede.

🗄️ Esquema de Tabelas (SQLite)

O esquema completo está implementado em `backend/src/database.js` e cobre autenticação, sugestões, publicações, moderação, mídia, eventos, eletivas, consentimentos e auditoria.

As tabelas implementadas são: `users`, `roles`, `user_roles`, `refresh_tokens`, `suggestion_categories`, `suggestions`, `suggestion_status_history`, `article_categories`, `articles`, `article_revisions`, `article_reviews`, `media_files`, `article_media`, `image_authorizations`, `event_categories`, `events`, `event_registrations`, `subjects`, `elective_enrollments`, `consents`, `external_links`, `projects`, `project_members`, `article_projects` e `audit_logs`.
1. users

    id (INTEGER PRIMARY KEY AUTOINCREMENT)

    nome (TEXT NOT NULL)

    email (TEXT UNIQUE NOT NULL)

    senha_hash (TEXT NOT NULL)

    perfil (TEXT - 'estudante', 'professor', 'admin')

    ativo (BOOLEAN DEFAULT 1)

    created_at (DATETIME DEFAULT CURRENT_TIMESTAMP)

2. suggestions

    id (INTEGER PRIMARY KEY AUTOINCREMENT)

    anonimo (BOOLEAN DEFAULT 0)

    nome (TEXT)

    email (TEXT)

    perfil (TEXT)

    categoria (TEXT)

    titulo (TEXT NOT NULL)

    mensagem (TEXT NOT NULL)

    status (TEXT DEFAULT 'recebido') -- 'recebido', 'em_analise', 'respondido'

    created_at (DATETIME DEFAULT CURRENT_TIMESTAMP)

3. articles (Publicações)

    id (INTEGER PRIMARY KEY AUTOINCREMENT)

    autor_id (INTEGER, FOREIGN KEY -> users.id)

    autor_nome (TEXT)

    categoria (TEXT)

    titulo (TEXT NOT NULL)

    resumo (TEXT)

    conteudo (TEXT NOT NULL)

    imagem_url (TEXT)

    status (TEXT DEFAULT 'aguardando_coordenacao')

    created_at (DATETIME DEFAULT CURRENT_TIMESTAMP)

4. events

    id (INTEGER PRIMARY KEY AUTOINCREMENT)

    titulo (TEXT NOT NULL)

    data (TEXT NOT NULL)

    local (TEXT NOT NULL)

    descricao (TEXT)

    created_at (DATETIME DEFAULT CURRENT_TIMESTAMP)

🚀 Fases do Desenvolvimento (Roteiro para o Codex)

    Fase 1: Configuração do Servidor Base

        Estruturar o servidor Express em backend/src/server.js habilitando CORS e JSON.

        Criar arquivo de conexão SQLite e geração automática das tabelas.

    Fase 2: Rotas Públicas (Sugestões & Eventos)

        POST /api/sugestoes (Criação de sugestões/feedback).

        GET /api/eventos (Listagem de eventos para exibição na página).

    Fase 3: Autenticação & Gestão de Usuários

        POST /api/auth/register (Cadastro de usuários).

        POST /api/auth/login (Geração de token JWT).

        Middleware authMiddleware.js para proteger rotas do painel admin.

    Fase 4: Artigos e Upload de Imagens

        Rota POST /api/artigos com persistência do conteúdo; o upload multipart será adicionado quando o storage de arquivos for definido.

        Rotas de moderação para o painel admin.html.

    Fase 5: Integração do Front-end

        Os formulários de sugestão e publicação já usam `fetch()` para comunicar com a API local.
