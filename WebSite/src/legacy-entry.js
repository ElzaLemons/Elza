(function () {
  const keys = { users: 'elza_users', suggestions: 'elza_suggestions', articles: 'elza_articles', events: 'elza_events', token: 'elza_token', user: 'elza_user' };
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const id = (items) => items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  if (!localStorage.getItem(keys.users)) write(keys.users, [
    { id: 1, nome: 'Administrador Local', email: 'admin@elza.com', senha: '123', perfil: 'admin', ativo: true },
    { id: 2, nome: 'Publicador Local', email: 'publicador@elza.com', senha: '123', perfil: 'estudante', ativo: true },
  ]);
  ['suggestions', 'articles', 'events'].forEach((key) => { if (!localStorage.getItem(keys[key])) write(keys[key], []); });
  const response = (body, status = 200) => Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) });
  const modelsReady = Promise.all([
    import('./models/auth.model.js'),
    import('./models/article.model.js'),
    import('./models/event.model.js'),
    import('./models/suggestion.model.js'),
    import('./models/user.model.js'),
  ]).then(([auth, article, event, suggestion, user]) => ({ AuthModel: auth.AuthModel, ArticleModel: article.ArticleModel, EventModel: event.EventModel, SuggestionModel: suggestion.SuggestionModel, UserModel: user.UserModel }));
  const sessionReady = modelsReady.then(async (models) => {
    const activeSession = await models.AuthModel.obterSessaoAsync();
    if (activeSession.token && activeSession.user) {
      localStorage.setItem('token', activeSession.token);
      localStorage.setItem('user', JSON.stringify(activeSession.user));
    }
    return models;
  });
  const session = () => ({ token: localStorage.getItem(keys.token), user: read(keys.user, null) });
  const currentUser = () => session().user;
  const apiFetch = async (path, options = {}) => {
    const method = options.method || 'GET';
    let body = options.body;
    if (body instanceof FormData) body = Object.fromEntries(body.entries());
    else if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    if (path === '/api/auth/login' && method === 'POST') {
      const { AuthModel } = await modelsReady;
      try {
        const result = await AuthModel.login(String(body.email || ''), String(body.senha || ''));
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        return response(result);
      } catch (error) {
        const message = error?.message || 'Não foi possível autenticar no Supabase.';
        const invalidCredentials = /invalid login credentials|invalid password|email not confirmed|credenciais inválidas/i.test(message);
        return response({ error: invalidCredentials ? 'Credenciais inválidas.' : message }, invalidCredentials ? 401 : 502);
      }
    }
    if (path === '/api/auth/signup' && method === 'POST') {
      const { AuthModel } = await modelsReady;
      try { return response(await AuthModel.signup({ email: String(body.email || ''), senha: String(body.senha || ''), nome: String(body.nome || ''), perfil: String(body.perfil || 'estudante') }), 201); } catch (error) { return response({ error: error.message }, 400); }
    }
    const { ArticleModel, EventModel, SuggestionModel, UserModel } = await sessionReady;
    if (path === '/api/sugestoes' && method === 'POST') { const item = await SuggestionModel.salvar(body); return response({ id: item.id, status: item.status }, 201); }
    if (path === '/api/eventos' && method === 'GET') return response(await EventModel.obterTodos());
    if (path === '/api/artigos' && method === 'GET') return response(await ArticleModel.obterTodas());
    if (path.startsWith('/api/artigos/') && method === 'GET') { const item = await ArticleModel.obterPorId(path.split('/').pop()); return item ? response(item) : response({ error: 'Notícia não encontrada' }, 404); }
    if (path === '/api/artigos' && method === 'POST') { const item = await ArticleModel.salvar(body, currentUser()); return response({ id: item.id, status: item.status }, 201); }
    if (path === '/api/minhas-publicacoes' && method === 'GET') return response(await ArticleModel.obterDoAutor(currentUser()?.id));
    if (path === '/api/admin/usuarios' && method === 'GET') return response(await UserModel.obterTodos());
    if (path === '/api/admin/usuarios' && method === 'POST') return response(await UserModel.salvar(body), 201);
    if (path.match(/^\/api\/admin\/usuarios\/\d+\/ativo$/) && method === 'PATCH') { await UserModel.alternarAtivo(path.split('/')[4], Boolean(body.ativo)); return response({ ok: true }); }
    if (path === '/api/admin/eventos' && method === 'GET') return response(await EventModel.obterTodos());
    if (path === '/api/admin/eventos' && method === 'POST') return response(await EventModel.salvar(body, currentUser()), 201);
    if (path.match(/^\/api\/admin\/eventos\/\d+$/) && method === 'DELETE') { await EventModel.deletar(path.split('/').pop()); return response(null, 204); }
    if (path === '/api/admin/artigos/pendentes' && method === 'GET') return response((await ArticleModel.obterTodas(false)).filter((item) => item.status !== 'publicado'));
    if (path.match(/^\/api\/admin\/artigos\/\d+\/moderacao$/) && method === 'PATCH') return response(await ArticleModel.moderar(path.split('/')[4], body.status, body.comentario || ''));
    return response({ error: 'Rota não encontrada' }, 404);
  };
  const showToast = (message, type) => { let toast = document.getElementById('app-toast'); if (!toast) { toast = document.createElement('div'); toast.id = 'app-toast'; document.body.appendChild(toast); } toast.className = `fixed right-4 top-4 z-[100] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`; toast.textContent = message; setTimeout(() => toast.remove(), 4000); };
  window.auth = { apiFetch, getUser: currentUser, clearSession: () => { [keys.token, 'token'].forEach((key) => localStorage.removeItem(key)); [keys.user, 'user'].forEach((key) => localStorage.removeItem(key)); }, showToast, API_BASE: 'localStorage://elza' };
  document.addEventListener('DOMContentLoaded', () => {
    const page = location.pathname.split('/').pop() || 'index.html';
    const user = currentUser();
    const hasAdminProfile = document.body.dataset.adminShell === 'true';
    document.querySelectorAll('nav, #mobile-menu').forEach((nav) => {
      const adminLink = [...nav.querySelectorAll('a')].find((link) => /admin\.html/.test(link.getAttribute('href') || ''));
      const publishLink = [...nav.querySelectorAll('a')].find((link) => /publicacao\.html/.test(link.getAttribute('href') || ''));
      if (publishLink) { publishLink.id = 'btn-publicar'; publishLink.textContent = '+ Nova Publicação'; publishLink.classList.toggle('hidden', !user); }
      if (adminLink) {
        const loginHref = page === 'index.html' ? 'pages/login.html' : 'login.html';
        const adminHref = page === 'index.html' ? 'pages/admin.html' : 'admin.html';
        const isAdmin = Boolean(user && user.perfil === 'admin');
        adminLink.id = isAdmin ? 'btn-admin' : 'btn-login';
        adminLink.href = isAdmin ? adminHref : loginHref;
        adminLink.textContent = isAdmin ? 'Painel Admin' : 'Login';
        adminLink.classList.remove('hidden');
      }
      if (!nav.querySelector('#btn-login')) { const login = document.createElement('a'); login.id = 'btn-login'; login.href = page === 'index.html' ? 'pages/login.html' : 'login.html'; login.textContent = 'Login'; login.className = 'px-3 py-2 rounded-lg bg-slate-800 text-white'; login.classList.toggle('hidden', Boolean(user)); nav.appendChild(login); }
      if (user && !hasAdminProfile && !nav.querySelector('#user-session')) { const sessionNode = document.createElement('span'); sessionNode.id = 'user-session'; sessionNode.className = 'inline-flex items-center gap-2 text-xs font-semibold'; const name = document.createElement('span'); name.id = 'user-name'; name.textContent = user.nome; const logout = document.createElement('button'); logout.id = 'btn-logout'; logout.type = 'button'; logout.textContent = 'Sair'; logout.className = 'text-red-300'; sessionNode.append(name, logout); nav.appendChild(sessionNode); }
      if (user) document.querySelectorAll('#btn-login').forEach((link) => link.classList.add('hidden'));
    });
    // Admin e Publicador ficam acessíveis sem login enquanto o layout é ajustado.
    // O login continua sendo exigido no envio de publicações e nas operações
    // administrativas que dependem de uma sessão válida.
  });
  import('./controllers/bootstrap.controller.js').catch((error) => console.error('Falha ao iniciar MVC:', error));
}());
