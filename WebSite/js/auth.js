(function () {
    const localHosts = ['localhost', '127.0.0.1', '[::1]'];
    const isLocalDevelopment = window.location.protocol === 'file:' || localHosts.includes(window.location.hostname);
    const API_BASE = window.API_URL || (isLocalDevelopment ? 'http://localhost:5000' : window.location.origin);
    window.API_BASE = API_BASE;

    function getUser() {
        try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
    }

    function clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('portal_token');
    }

    function showToast(message, type = 'info') {
        let toast = document.getElementById('app-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'app-toast';
            toast.className = 'fixed right-4 top-4 z-[100] max-w-sm rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-opacity';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = `fixed right-4 top-4 z-[100] max-w-sm rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${type === 'error' ? 'bg-red-600 text-white' : type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`;
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.remove(), 4500);
    }

    async function apiFetch(path, options = {}) {
        const headers = new Headers(options.headers || {});
        const token = localStorage.getItem('token');
        if (token) headers.set('Authorization', `Bearer ${token}`);
        if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
        const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
        if (response.status === 401 && token) {
            clearSession();
            if (/admin|publicacao/.test(location.pathname)) location.href = 'login.html';
        }
        return response;
    }

    function isWriter(user) {
        return user && ['estudante', 'professor', 'coordenador', 'diretor', 'admin'].includes(user.perfil);
    }

    function normalizeNavbar() {
        const user = getUser();
        const navs = document.querySelectorAll('nav, #mobile-menu');
        navs.forEach((nav) => {
            const adminLink = [...nav.querySelectorAll('a')].find((link) => /admin\.html(?:[?#].*)?$/.test(link.getAttribute('href') || ''));
            const publishLink = [...nav.querySelectorAll('a')].find((link) => /publicacao\.html(?:[?#].*)?$/.test(link.getAttribute('href') || ''));
            if (publishLink) {
                publishLink.dataset.authPublish = 'true';
                publishLink.id = 'btn-publicar';
                publishLink.textContent = '+ Nova Publicação';
                publishLink.classList.add('hidden');
            }
            if (adminLink) {
                adminLink.dataset.authAdmin = 'true';
                adminLink.id = 'btn-admin';
                adminLink.textContent = 'Painel Admin';
                adminLink.classList.add('hidden');
                const login = document.createElement('a');
                login.id = 'btn-login';
                login.href = location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
                login.textContent = 'Login';
                login.className = adminLink.className.replace(/bg-[^ ]+|text-amber-400/g, '').trim();
                login.classList.remove('hidden');
                adminLink.replaceWith(login);
            }
        });

        // Em telas pequenas a navegação fica recolhida; mantenha o Login sempre acessível.
        const menuButton = document.getElementById('btn-menu');
        if (menuButton && !document.querySelector('[data-auth-mobile-login]')) {
            const mobileLogin = document.createElement('a');
            mobileLogin.dataset.authMobileLogin = 'true';
            mobileLogin.href = location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
            mobileLogin.textContent = 'Login';
            mobileLogin.className = 'lg:hidden mr-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white border border-slate-700';
            menuButton.insertAdjacentElement('beforebegin', mobileLogin);
        }

        if (user && localStorage.getItem('token')) {
            document.querySelectorAll('[data-auth-publish]').forEach((link) => { if (isWriter(user)) link.classList.remove('hidden'); });
            if (user.perfil === 'admin') document.querySelectorAll('[data-auth-admin]').forEach((link) => link.classList.remove('hidden'));
            document.querySelectorAll('#btn-login').forEach((link) => link.classList.add('hidden'));
            document.querySelectorAll('[data-auth-mobile-login]').forEach((link) => link.classList.add('hidden'));
            document.querySelectorAll('nav, #mobile-menu').forEach((nav) => {
                if (!nav.querySelector('[data-user-session]')) {
                    const session = document.createElement('span');
                    session.dataset.userSession = 'true';
                    session.className = 'inline-flex items-center gap-2 text-xs font-semibold';
                    session.innerHTML = `<span>${user.nome}</span><button type="button" data-logout class="text-red-300 hover:text-red-100">Sair</button>`;
                    nav.appendChild(session);
                }
            });
        }
        document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', () => { clearSession(); location.href = location.pathname.includes('/pages/') ? '../index.html' : 'index.html'; }));
    }

    function protectPage() {
        const page = location.pathname.split('/').pop();
        const user = getUser();
        const token = localStorage.getItem('token');
        if ((page === 'publicacao.html' && (!token || !isWriter(user))) || (page === 'admin.html' && (!token || !user || user.perfil !== 'admin'))) {
            location.href = location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        protectPage();
        normalizeNavbar();
    });

    window.auth = { apiFetch, clearSession, getUser, showToast, API_BASE };
}());
