# 🛠️ Guia de Arquitetura & Implementação do Front-end (Local / Modulo)

Este documento serve como a especificação oficial de contexto e instruções para o desenvolvimento da lógica de dados e simulação de persistência do **Portal Escola Elza**.

---

## 🎯 Objetivo
Desenvolver e validar todas as telas e fluxos do protótipo visual utilizando a arquitetura **MVC com JavaScript Vanilla** no Front-end. A persistência de dados (usuários, notícias, eventos e sugestões) será simulada via **`localStorage`** para testes locais antes da integração definitiva com o banco de dados/API.

---

## 📁 Estrutura de Pastas Esperada

```text
/
└── WebSite/               # Front-end do portal
    ├── src/
    │   ├── models/        # Regras de negócio, manipulação do localStorage e mocks
    │   ├── views/         # Manipulação do DOM e renderização de HTML
    │   ├── controllers/   # Intermediário entre a View e o LocalStorage (Model)
    │   └── config/        # Mocks e dados iniciais de teste (Seed Local)
    ├── pages/             # Páginas HTML do portal
    └── index.html

    ⚙️ Tecnologias e Estratégia de Persistência Local

    Tecnologia: JavaScript Vanilla (ES6 Modules) + Tailwind CSS

    Armazenamento: localStorage do navegador para simulação do banco de dados.

    Autenticação Simulado: Gravação de Token fictício (mock_token) e objeto user no localStorage.

    Uploads de Mídia (Testes): Manipulação de URLs de imagem externas (Unsplash / Supabase Bucket Público) ou conversão temporária para DataURL (Base64).

    🗄️ Estrutura das Chaves no localStorage

As Models serão responsáveis por ler e gravar nas seguintes chaves principais do localStorage:
1. elza_users

Array de objetos simulando a tabela de usuários:

[
  {
    "id": 1,
    "nome": "Usuário Teste",
    "email": "admin@elza.com",
    "senha": "123",
    "perfil": "admin",
    "ativo": true,
    "created_at": "2026-10-28T10:00:00Z"
  }
]

2. elza_suggestions

Array de sugestões enviadas pelo formulário público:

[
  {
    "id": 1,
    "anonimo": false,
    "nome": "João",
    "email": "joao@email.com",
    "perfil": "estudante",
    "categoria": "infraestrutura",
    "titulo": "Melhoria na Biblioteca",
    "mensagem": "Sugiro novos livros...",
    "status": "recebido",
    "created_at": "2026-10-28T10:00:00Z"
  }
]

3. elza_articles

Array de publicações e notícias do portal:
[
  {
    "id": 1,
    "author_id": 1,
    "autor_nome": "Admin",
    "categoria": "noticia_geral",
    "titulo": "Boas vindas ao Portal",
    "resumo": "Portal atualizado com sucesso",
    "conteudo": "<p>Texto da notícia...</p>",
    "imagem_url": "[https://images.unsplash.com/photo-1577896851231-70ef18881754](https://images.unsplash.com/photo-1577896851231-70ef18881754)",
    "status": "aprovado",
    "created_at": "2026-10-28T10:00:00Z"
  }
]

4. elza_events

Array de eventos da agenda escolar:

[
  {
    "id": 1,
    "titulo": "Feira de Ciências",
    "data_inicio": "2026-11-10T14:00:00Z",
    "local": "Auditório Principal",
    "descricao": "Apresentação dos projetos dos alunos.",
    "created_at": "2026-10-28T10:00:00Z"
  }
]

🚀 Fases do Desenvolvimento Local (Roteiro para o Codex)
Fase 1: Seeds e Inicialização do LocalStorage

    Criar um script utilitário (src/config/seed.js) que popula o localStorage com dados de teste caso as chaves ainda não existam.

Fase 2: Models em MVC com LocalStorage

    Construir classes estáticas nas src/models/ (ex: NoticiaModel.js, AuthModel.js) contendo métodos obterTodas(), salvar(), deletar(), lendo e escrevendo via JSON.parse() e JSON.stringify() no localStorage.

Fase 3: Controllers e Interatividade das Views

    Conectar os formulários e botões das páginas HTML às Views/Controllers em src/, permitindo criar notícias, cadastrar eventos e fazer login sem recarregar a tela.

Fase 4: Preparação para Troca Futura

    Estruturar os métodos das Models como async/await (mesmo usando localStorage) para que a futura migração para fetch() com a API/Supabase exija alterar apenas a camada Model.