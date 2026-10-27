🔐 1. Estrutura de Autenticação e Perfis

O sistema utilizará JWT (JSON Web Token) armazenado no localStorage do navegador para controle de sessão, alinhado às tabelas do banco de dados (users e articles):
Tipos de Usuários:

    Visitante (Usuário Normal): Alunos, pais ou visitantes sem login.

    Redator / Editor (perfil: 'estudante' ou 'professor'): Usuário com autorização de criação de notícias.

    Administrador (perfil: 'admin'): Controle total da plataforma, moderação, eventos e usuários.

    🔄 2. Fluxos de Navegação por Perfil
A. Fluxo do Usuário Normal (Visitante)
[Acessa o Site] ──► [Home / Notícias / Eventos / Projetos]
       │
       ├──► Lê Notícias e Visualiza Agenda de Eventos
       ├──► Envia Sugestão / Feedback em sugestao.html (público / anônimo)
       └──► Clica em "Login" na Navbar ──► [Modal/Página de Login]

B. Fluxo do Redator (Responsável por Publicar Notícias)
[Clica em "Login"] ──► [Digita Credenciais] ──► [POST /api/auth/login]
                                                        │
                                                        ▼
                                       [Sucesso: Salva Token e Perfil]
                                                        │
┌───────────────────────────────────────────────────────┴───────────────────────────────────────────────────────┐
▼                                                                                                               ▼
[Oculta botão "Login"]                                                      [Exibe Botões Restritos na Navbar]
[Exibe o nome do usuário e "Sair"]                                            ├──► "Criar Publicação" (publicacao.html)
                                                                             └──► "Minhas Publicações" (status do envio)

                                                                             Ação de Publicação (publicacao.html):

    O redator preenche o formulário com título, resumo, conteúdo, categoria e imagem.

    Envia via POST /api/artigos com o token no cabeçalho (Authorization: Bearer <token>).

    O artigo entra com status = 'aguardando_coordenacao'.

    O redator visualiza o status da sua submissão, mas não possui acesso ao painel admin.html.

    C. Fluxo do Administrador
    [Acessa Login] ──► [Autentica como 'admin'] ──► [Liberado acesso a "Painel Admin" (admin.html)]
                                                              │
    ┌─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┐
    ▼                                                         ▼                                                         ▼
[Aprova / Recusa Notícias]                          [Gerencia Eventos]                                        [Gerencia Usuários]
(PATCH /api/admin/artigos/:id/moderacao)            (POST /api/admin/eventos)                                 (Aprova / Remove contas)

🎨 3. Alteração Visual da Interface (Navbar & Visibilidade)
Mudança na Barra de Navegação:

    Antes: Botão fixo de "Admin".

    Depois (Deslogado): Apenas o botão "Login". O botão de "Criar Publicação" permanece completamente invisível/oculto via CSS (display: none).

    Depois (Logado como Redator): O botão "Login" é substituído pelo nome/perfil do usuário + botão "Sair", e o botão "Nova Publicação" passa a ser visível.

    Depois (Logado como Admin): Aparecem os botões "Painel Admin" e "Nova Publicação".

    # 🛠️ Especificação de Autenticação e Controle de Acesso Front-end / Back-end

## 1. Alteração da Navbar em todas as páginas HTML (`WebSite/`)

Substituir o link atual de "Admin" pela seguinte estrutura dinâmica:

```html
<nav class="flex items-center gap-4">
  <!-- Botão visível apenas quando logado como Redator ou Admin -->
  <a id="btn-publicar" href="publicacao.html" class="hidden bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
    + Nova Publicação
  </a>

  <!-- Botão visível apenas para perfil Admin -->
  <a id="btn-admin" href="admin.html" class="hidden bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700">
    Painel Admin
  </a>

  <!-- Estado Deslogado -->
  <a id="btn-login" href="login.html" class="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900">
    Login
  </a>

  <!-- Estado Logado (Nome + Sair) -->
  <div id="user-session" class="hidden flex items-center gap-2">
    <span id="user-name" class="text-sm font-semibold text-gray-700"></span>
    <button id="btn-logout" class="text-sm text-red-600 hover:underline">Sair</button>
  </div>
</nav>

2. Script do Front-end (WebSite/js/auth.js)

Criar o gerenciador de sessão que será importado em todas as páginas:

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const btnLogin = document.getElementById("btn-login");
  const btnPublicar = document.getElementById("btn-publicar");
  const btnAdmin = document.getElementById("btn-admin");
  const userSession = document.getElementById("user-session");
  const userName = document.getElementById("user-name");
  const btnLogout = document.getElementById("btn-logout");

  if (token && user) {
    if (btnLogin) btnLogin.classList.add("hidden");
    if (userSession) userSession.classList.remove("hidden");
    if (userName) userName.textContent = user.nome;

    // Exibe o botão de publicação para qualquer usuário logado (redator ou admin)
    if (btnPublicar) btnPublicar.classList.remove("hidden");

    // Exibe o botão de admin apenas se o perfil for 'admin'
    if (btnAdmin && user.perfil === "admin") {
      btnAdmin.classList.remove("hidden");
    }
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });
  }
});

3. Proteção de Rotas no Back-end (backend/src/middleware/authMiddleware.js)

Middlewares JWT para validar requisições e níveis de permissão:

const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Acesso negado. Faça login." });

  jwt.verify(token, process.env.JWT_SECRET || "secreta_elza", (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido ou expirado." });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.perfil !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores." });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin };

4. Proteção de Páginas (publicacao.html e admin.html)

    Em publicacao.html: Se o visitante tentar acessar sem o token, redireciona imediatamente para login.html.

    Em admin.html: Se o usuário tentar acessar sem token ou com perfil !== 'admin', redireciona para index.html.