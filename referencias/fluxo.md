# 🔐 Fluxos de Navegação, Autenticação e Regras de Acesso — Portal Escola Elza

Este documento especifica as regras de negócio para a gestão de sessões, perfis de utilizador, navegação dinâmica na Navbar e a estrutura em **MVC com JavaScript Vanilla**.

---

## 👥 1. Estrutura de Autenticação e Perfis

A sessão do utilizador é gerida no `localStorage` do navegador (gravando o token de autenticação e os dados do utilizador no objeto `elza_user` e `elza_token`).

### Perfis de Acesso:
- **Visitante (Sem Login):** Estudantes, encarregados de educação ou leitores normais. Podem visualizar notícias, agenda de eventos e enviar sugestões públicas.
- **Redator / Editor (`estudante` ou `professor`):** Acesso à criação e submissão de matérias/artigos.
- **Administrador (`admin`):** Controlo total da plataforma, moderação de publicações, gestão de eventos e utilizadores.

---

## 🔄 2. Fluxos de Navegação por Perfil

```text
A. VISITANTE
[Acessa o Portal] ──► [Home / Notícias / Eventos / Sugestões]
       │
       ├──► Lê Notícias e Visualiza Eventos
       ├──► Envia Sugestão/Feedback em sugestao.html (público / anónimo)
       └──► Clica em "Login" ──► [login.html]

B. REDATOR (Estudante / Professor)
[Login Válido] ──► [Grava elza_token e elza_user no localStorage]
                        │
                        ▼
┌───────────────────────┴────────────────────────────────────────┐
▼                                                                ▼
[Oculta botão "Login"]                        [Exibe na Navbar]
[Exibe Nome do Utilizador + "Sair"]           └──► "+ Nova Publicação" (publicacao.html)

Ação de Publicação:
- Preenche o formulário e envia via `NoticiaController` -> `NoticiaModel.salvar()`.
- O artigo é gravado com o estado `'aguardando_coordenacao'`.
- O redator não tem acesso ao painel `admin.html`.

C. ADMINISTRADOR (Admin)
[Login Válido (perfil: 'admin')] ──► [Exibe botão "Painel Admin" (admin.html)]
                                          │
       ┌──────────────────────────────────┼──────────────────────────────────┐
       ▼                                  ▼                                  ▼
[Aprova / Recusa Notícias]       [Gerencia Eventos]                 [Gerencia Utilizadores]


🎨 3. Alteração Visual e Dinâmica da Navbar
Estrutura HTML da Navbar nas Páginas (WebSite/ e WebSite/pages/)
<nav class="flex items-center gap-4">
  <!-- Visível para qualquer utilizador autenticado (Redator ou Admin) -->
  <a id="btn-publicar" href="publicacao.html" class="hidden bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all">
    + Nova Publicação
  </a>

  <!-- Visível apenas para perfil Admin -->
  <a id="btn-admin" href="admin.html" class="hidden bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all">
    Painel Admin
  </a>

  <!-- Estado Deslogado -->
  <a id="btn-login" href="login.html" class="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 transition-all">
    Login
  </a>

  <!-- Estado Logado (Nome + Sair) -->
  <div id="user-session" class="hidden flex items-center gap-3">
    <span id="user-name" class="text-sm font-semibold text-slate-200"></span>
    <button id="btn-logout" class="text-sm text-red-400 hover:text-red-300 transition-colors">Sair</button>
  </div>
</nav>

🛠️ 4. Implementação MVC para Autenticação no Front-end

A gestão de sessão e atualização do DOM é coordenada pelos módulos organizados em src/:
1. src/models/auth.model.js (Regras de Negócio e LocalStorage)

export class AuthModel {
  static obterSessao() {
    const token = localStorage.getItem('elza_token');
    const user = JSON.parse(localStorage.getItem('elza_user') || 'null');
    return { token, user };
  }

  static async login(email, senha) {
    // Na fase de testes locais, valida contra o array de utilizadores do localStorage
    const users = JSON.parse(localStorage.getItem('elza_users') || '[]');
    const usuarioEncontrado = users.find(u => u.email === email && u.senha === senha);

    if (!usuarioEncontrado) {
      throw new Error("Credenciais inválidas.");
    }

    const mockToken = "mock_jwt_token_" + Date.now();
    localStorage.setItem('elza_token', mockToken);
    localStorage.setItem('elza_user', JSON.stringify(usuarioEncontrado));

    return { token: mockToken, user: usuarioEncontrado };
  }

  static logout() {
    localStorage.removeItem('elza_token');
    localStorage.removeItem('elza_user');
  }
}

2. src/views/auth.view.js (Atualização da Interface)
export class AuthView {
  static renderizarNavbar(sessao) {
    const btnLogin = document.getElementById("btn-login");
    const btnPublicar = document.getElementById("btn-publicar");
    const btnAdmin = document.getElementById("btn-admin");
    const userSession = document.getElementById("user-session");
    const userName = document.getElementById("user-name");

    if (sessao.token && sessao.user) {
      if (btnLogin) btnLogin.classList.add("hidden");
      if (userSession) userSession.classList.remove("hidden");
      if (userName) userName.textContent = sessao.user.nome;

      if (btnPublicar) btnPublicar.classList.remove("hidden");

      if (btnAdmin && sessao.user.perfil === "admin") {
        btnAdmin.classList.remove("hidden");
      }
    }
  }
}

3. src/controllers/auth.controller.js (Inicialização e Proteção de Páginas)
import { AuthModel } from '../models/auth.model.js';
import { AuthView } from '../views/auth.view.js';

export function initAuth() {
  const sessao = AuthModel.obterSessao();
  AuthView.renderizarNavbar(sessao);

  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      AuthModel.logout();
      window.location.href = "index.html";
    });
  }
}

// Proteção de Páginas Privadas
export function protegerPaginaRestrita(requerAdmin = false) {
  const { token, user } = AuthModel.obterSessao();

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  if (requerAdmin && user.perfil !== 'admin') {
    window.location.href = "index.html";
  }
}

document.addEventListener("DOMContentLoaded", initAuth);

🛡️ 5. Proteção de Páginas Privadas

    Em publicacao.html: O controller executa protegerPaginaRestrita(false). Redireciona imediatamente para login.html se não houver sessão ativa.

    Em admin.html: O controller executa protegerPaginaRestrita(true). Redireciona para index.html caso o utilizador logado não possua perfil admin.
