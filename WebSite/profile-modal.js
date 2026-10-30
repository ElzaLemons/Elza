(() => {
    const profileKey = 'portalElza.adminProfile';
    const themeKey = 'portalElza.theme';
    const defaultProfile = { name: 'Administrador', photo: '', role: 'admin' };
    const roleNames = { admin: 'Administrador', redator: 'Redator' };
    const savedTheme = localStorage.getItem(themeKey) === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = savedTheme;
    const readProfile = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(profileKey) || '{}') || {};
            const role = stored.role === 'redator' ? 'redator' : 'admin';
            const storedName = String(stored.name || defaultProfile.name).trim();
            const isRoleDefaultName = Object.values(roleNames).includes(storedName);
            return {
                ...defaultProfile,
                ...stored,
                name: isRoleDefaultName ? roleNames[role] : storedName,
                role
            };
        } catch {
            return { ...defaultProfile };
        }
    };
    const makeAvatar = (name, photo) => {
        if (photo) return photo;
        const initials = String(name || 'A').trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#4f46e5"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#fff">${initials}</text></svg>`;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };

    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    if (currentPage === 'admin.html' && readProfile().role !== 'admin') {
        window.location.replace('publicacao.html');
        return;
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes profile-pop-in { from { opacity: 0; transform: translateY(-7px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes profile-modal-in { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .profile-popover[data-open="true"] { animation: profile-pop-in 160ms ease-out both; }
        #perfil-modal[data-open="true"] > section { animation: profile-modal-in 180ms ease-out both; }
        @media (prefers-reduced-motion: reduce) { .profile-popover[data-open="true"], #perfil-modal[data-open="true"] > section { animation: none; } }

        html[data-theme="dark"] body { background-color: #0f172a !important; color: #e2e8f0 !important; }
        html[data-theme="light"] body table { border: 1px solid #64748b; border-collapse: separate; border-spacing: 0; border-radius: 12px; overflow: hidden; }
        html[data-theme="light"] body thead { background-color: #e2e8f0; }
        html[data-theme="light"] body thead th { color: #334155 !important; }
        html[data-theme="light"] body th,
        html[data-theme="light"] body td { padding: 0.75rem; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; }
        html[data-theme="light"] body th:last-child,
        html[data-theme="light"] body td:last-child { border-right: 0; }
        html[data-theme="light"] body tbody tr:nth-child(even) { background-color: #f1f5f9; }
        html[data-theme="light"] body tbody tr:hover { background-color: #e2e8f0; }
        html[data-theme="light"] body tbody tr:last-child td { border-bottom: 0; }
        html[data-theme="dark"] body [class~="bg-white"],
        html[data-theme="dark"] body [class~="bg-slate-50"],
        html[data-theme="dark"] body [class~="bg-slate-100"],
        html[data-theme="dark"] body [class~="bg-slate-200"],
        html[data-theme="dark"] body [class~="bg-escola-card"],
        html[data-theme="dark"] body [class~="bg-evt-card"],
        html[data-theme="dark"] body [class~="bg-nea-card"],
        html[data-theme="dark"] body [class~="bg-onu-card"],
        html[data-theme="dark"] body [class~="bg-pub-card"],
        html[data-theme="dark"] body [class~="bg-sug-card"],
        html[data-theme="dark"] body [class~="bg-vn-card"],
        html[data-theme="dark"] body [class~="bg-adm-fundo"],
        html[data-theme="dark"] body [class~="bg-escola-fundo"],
        html[data-theme="dark"] body [class~="bg-nea-fundo"],
        html[data-theme="dark"] body [class~="bg-pub-fundo"],
        html[data-theme="dark"] body [class~="bg-onu-fundo"],
        html[data-theme="dark"] body [class~="bg-vn-fundo"],
        html[data-theme="dark"] body [class~="bg-evt-fundo"],
        html[data-theme="dark"] body [class~="bg-sug-fundo"] { background-color: #1e293b !important; }
        html[data-theme="dark"] body [class~="bg-amber-50"], html[data-theme="dark"] body [class~="bg-amber-50/50"], html[data-theme="dark"] body [class~="bg-amber-100"], html[data-theme="dark"] body [class~="bg-amber-200"] { background-color: #33250f !important; border-color: #a16207 !important; box-shadow: inset 0 0 0 1px rgb(245 158 11 / .2), 0 0 14px rgb(245 158 11 / .12); }
        html[data-theme="dark"] body [class~="bg-emerald-100"] { background-color: #102d24 !important; border-color: #047857 !important; box-shadow: inset 0 0 0 1px rgb(16 185 129 / .18), 0 0 14px rgb(16 185 129 / .1); }
        html[data-theme="dark"] body [class~="bg-indigo-100"] { background-color: #202044 !important; border-color: #4f46e5 !important; box-shadow: inset 0 0 0 1px rgb(99 102 241 / .18), 0 0 14px rgb(99 102 241 / .1); }
        html[data-theme="dark"] body [class~="bg-orange-100"] { background-color: #382014 !important; border-color: #c2410c !important; box-shadow: inset 0 0 0 1px rgb(249 115 22 / .18), 0 0 14px rgb(249 115 22 / .1); }
        html[data-theme="dark"] body [class~="bg-purple-100"] { background-color: #2b1e42 !important; border-color: #7e22ce !important; box-shadow: inset 0 0 0 1px rgb(168 85 247 / .18), 0 0 14px rgb(168 85 247 / .1); }
        html[data-theme="dark"] body [class~="bg-red-50"], html[data-theme="dark"] body [class~="bg-red-100"], html[data-theme="dark"] body [class~="bg-red-200"], html[data-theme="dark"] body [class~="bg-rose-100"] { background-color: #351c25 !important; border-color: #9f1239 !important; box-shadow: inset 0 0 0 1px rgb(244 63 94 / .16), 0 0 14px rgb(244 63 94 / .09); }
        html[data-theme="dark"] body [class~="bg-sky-100"] { background-color: #142c3b !important; border-color: #0369a1 !important; box-shadow: inset 0 0 0 1px rgb(14 165 233 / .16), 0 0 14px rgb(14 165 233 / .09); }
        html[data-theme="dark"] body [class~="bg-teal-50"], html[data-theme="dark"] body [class~="bg-teal-100"] { background-color: #12302d !important; border-color: #0f766e !important; box-shadow: inset 0 0 0 1px rgb(20 184 166 / .16), 0 0 14px rgb(20 184 166 / .09); }
        html[data-theme="dark"] body [class~="text-slate-900"],
        html[data-theme="dark"] body [class~="text-slate-800"],
        html[data-theme="dark"] body [class~="text-slate-700"],
        html[data-theme="dark"] body [class~="text-slate-600"],
        html[data-theme="dark"] body [class~="text-slate-500"],
        html[data-theme="dark"] body [class~="text-escola-secundaria"],
        html[data-theme="dark"] body [class~="text-adm-escuro"],
        html[data-theme="dark"] body [class~="text-evt-escuro"],
        html[data-theme="dark"] body [class~="text-nea-escuro"],
        html[data-theme="dark"] body [class~="text-onu-escuro"],
        html[data-theme="dark"] body [class~="text-pub-escuro"],
        html[data-theme="dark"] body [class~="text-sug-escuro"],
        html[data-theme="dark"] body [class~="text-vn-escuro"] { color: #e2e8f0 !important; }
        html[data-theme="dark"] body [class~="text-amber-900"], html[data-theme="dark"] body [class~="text-amber-800"], html[data-theme="dark"] body [class~="text-amber-700"] { color: #fcd34d !important; text-shadow: 0 0 8px rgb(245 158 11 / .28); }
        html[data-theme="dark"] body [class~="text-teal-800"], html[data-theme="dark"] body [class~="text-teal-700"], html[data-theme="dark"] body [class~="text-teal-600"] { color: #5eead4 !important; text-shadow: 0 0 8px rgb(45 212 191 / .24); }
        html[data-theme="dark"] body [class~="text-purple-800"], html[data-theme="dark"] body [class~="text-purple-700"], html[data-theme="dark"] body [class~="text-purple-600"] { color: #d8b4fe !important; text-shadow: 0 0 8px rgb(192 132 252 / .23); }
        html[data-theme="dark"] body [class~="text-emerald-800"], html[data-theme="dark"] body [class~="text-emerald-700"], html[data-theme="dark"] body [class~="text-emerald-600"] { color: #6ee7b7 !important; text-shadow: 0 0 8px rgb(52 211 153 / .22); }
        html[data-theme="dark"] body [class~="text-red-800"], html[data-theme="dark"] body [class~="text-red-700"], html[data-theme="dark"] body [class~="text-red-600"], html[data-theme="dark"] body [class~="text-rose-700"] { color: #fda4af !important; text-shadow: 0 0 8px rgb(251 113 133 / .2); }
        html[data-theme="dark"] body [class~="text-sky-800"], html[data-theme="dark"] body [class~="text-sky-700"], html[data-theme="dark"] body [class~="text-blue-700"] { color: #7dd3fc !important; text-shadow: 0 0 8px rgb(56 189 248 / .22); }
        html[data-theme="dark"] body [class~="text-escola-primaria"], html[data-theme="dark"] body [class~="text-sug-principal"], html[data-theme="dark"] body [class~="text-vn-terracota"] { color: #fb923c !important; text-shadow: 0 0 8px rgb(249 115 22 / .3); }
        html[data-theme="dark"] body [class~="text-pub-principal"] { color: #5eead4 !important; text-shadow: 0 0 8px rgb(45 212 191 / .26); }
        html[data-theme="dark"] body [class~="text-evt-principal"], html[data-theme="dark"] body [class~="text-nea-principal"] { color: #c4b5fd !important; text-shadow: 0 0 8px rgb(167 139 250 / .25); }
        html[data-theme="dark"] body [class~="text-onu-azul"] { color: #7dd3fc !important; text-shadow: 0 0 8px rgb(56 189 248 / .25); }
        html[data-theme="dark"] body [class~="text-onu-ouro"] { color: #fbbf24 !important; text-shadow: 0 0 8px rgb(245 158 11 / .26); }
        html[data-theme="dark"] body [class~="text-amber-400"] { text-shadow: 0 0 8px rgb(245 158 11 / .26); }
        html[data-theme="dark"] body [class~="bg-escola-primaria"], html[data-theme="dark"] body [class~="bg-sug-principal"], html[data-theme="dark"] body [class~="bg-vn-terracota"], html[data-theme="dark"] body [class~="bg-orange-700"] { box-shadow: inset 0 0 0 1px rgb(255 255 255 / .12), 0 0 14px rgb(249 115 22 / .18); }
        html[data-theme="dark"] body [class~="bg-evt-principal"], html[data-theme="dark"] body [class~="bg-nea-principal"], html[data-theme="dark"] body [class~="bg-adm-principal"], html[data-theme="dark"] body [class~="bg-indigo-600"] { box-shadow: inset 0 0 0 1px rgb(255 255 255 / .12), 0 0 14px rgb(129 140 248 / .18); }
        html[data-theme="dark"] body [class~="bg-pub-principal"], html[data-theme="dark"] body [class~="bg-teal-700"] { box-shadow: inset 0 0 0 1px rgb(255 255 255 / .12), 0 0 14px rgb(45 212 191 / .17); }
        html[data-theme="dark"] body [class~="bg-amber-400"] { box-shadow: inset 0 0 0 1px rgb(255 255 255 / .16), 0 0 12px rgb(245 158 11 / .2); }
        html[data-theme="dark"] body [class~="border-slate-100"],
        html[data-theme="dark"] body [class~="border-slate-200"],
        html[data-theme="dark"] body [class~="border-slate-300"] { border-color: #475569 !important; }
        html[data-theme="dark"] body input,
        html[data-theme="dark"] body textarea,
        html[data-theme="dark"] body select { background-color: #0f172a; color: #f1f5f9; border-color: #475569; }
        html[data-theme="dark"] body input::placeholder,
        html[data-theme="dark"] body textarea::placeholder { color: #94a3b8; }
    `;
    document.head.append(style);

    document.querySelectorAll('a[data-profile-modal]').forEach((oldLink) => {
        const mobile = oldLink.classList.contains('block');
        const widget = document.createElement('div');
        widget.dataset.profileWidget = '';
        widget.className = `profile-widget relative ${mobile ? 'w-full' : 'shrink-0'}`;
        widget.innerHTML = `
            <div class="flex items-center gap-1 ${mobile ? 'w-full' : ''}">
                <a href="admin.html" data-profile-link aria-label="Abrir painel administrativo" class="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-2 py-1.5 text-white shadow-sm transition duration-200 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 ${mobile ? 'flex-1' : ''}">
                    <img data-profile-avatar alt="" class="h-8 w-8 shrink-0 rounded-full border-2 border-indigo-400 bg-indigo-600 object-cover shadow" />
                    <span data-profile-name class="max-w-28 truncate text-xs font-bold"></span>
                </a>
                <button type="button" data-profile-toggle aria-label="Abrir opções da conta" aria-expanded="false" class="grid h-9 w-8 shrink-0 place-items-center rounded-full text-slate-300 transition duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <svg data-chevron class="h-4 w-4 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.09 1.03l-4.25 4.3a.75.75 0 0 1-1.08 0l-4.25-4.3a.75.75 0 0 1 .01-1.05Z" clip-rule="evenodd"/></svg>
                </button>
            </div>
            <div data-profile-popover data-open="false" class="profile-popover invisible pointer-events-none absolute right-0 top-full z-[90] mt-3 w-64 origin-top-right rounded-2xl border border-slate-700 bg-slate-900 text-white opacity-0 shadow-2xl transition duration-150">
                <a href="admin.html" data-profile-link class="flex items-center gap-3 border-b border-slate-700/80 p-4 transition hover:bg-slate-800/80">
                    <img data-profile-avatar alt="" class="h-11 w-11 rounded-full border-2 border-indigo-400 object-cover" />
                    <span class="min-w-0"><strong data-profile-name class="block truncate text-sm"></strong><span data-profile-role-label class="mt-0.5 block text-[11px] text-slate-400"></span></span>
                </a>
                <div class="p-2">
                    <a href="admin.html" data-admin-panel-link class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"><span aria-hidden="true">▦</span> Painel Administrativo</a>
                    <a href="redator.html" data-writer-report-link class="hidden flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"><span aria-hidden="true">▤</span> Relatório do Redator</a>
                    <a href="publicacao.html" data-publication-link class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"><span aria-hidden="true">✎</span> Nova Publicação</a>
                    <button type="button" data-edit-profile class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"><span aria-hidden="true">✎</span> Editar perfil</button>
                    <button type="button" data-profile-logout class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"><span aria-hidden="true">↪</span> Sair</button>
                </div>
            </div>`;
        oldLink.replaceWith(widget);
        const themeButton = document.createElement('button');
        themeButton.type = 'button';
        themeButton.dataset.themeToggle = '';
        themeButton.className = 'theme-toggle grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-200 transition duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400';
        themeButton.innerHTML = '<svg data-theme-icon class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"></svg>';
        widget.parentElement.insertBefore(themeButton, widget);
    });

    function renderThemeControls() {
        const dark = document.documentElement.dataset.theme === 'dark';
        document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
            button.setAttribute('aria-label', dark ? 'Ativar tema claro' : 'Ativar tema escuro');
            button.title = dark ? 'Tema claro' : 'Tema escuro';
            button.querySelector('[data-theme-icon]').innerHTML = dark
                ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>'
                : '<path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z"/>';
        });
    }
    renderThemeControls();

    document.body.insertAdjacentHTML('beforeend', `
        <div id="perfil-modal" data-open="false" class="invisible pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 opacity-0 transition-opacity duration-150" aria-hidden="true">
            <section role="dialog" aria-modal="true" aria-labelledby="perfil-titulo" class="relative w-full max-w-md rounded-3xl bg-white p-6 text-slate-800 shadow-2xl sm:p-8">
                <button type="button" data-fechar-perfil aria-label="Fechar" class="absolute right-4 top-4 rounded-lg p-2 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700">&times;</button>
                <p class="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-600">Conta do portal</p>
                <h2 id="perfil-titulo" class="text-2xl font-extrabold text-slate-900">Editar perfil</h2>
                <form id="perfil-form" class="mt-6 space-y-5">
                    <div class="flex items-center gap-4">
                        <img id="perfil-foto-preview" alt="Foto de perfil" class="h-16 w-16 rounded-full border-2 border-indigo-100 bg-slate-100 object-cover" />
                        <label class="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Alterar foto<input id="perfil-foto" type="file" accept="image/*" class="sr-only" /></label>
                    </div>
                    <div><label for="perfil-nome" class="mb-2 block text-xs font-bold text-slate-700">Nome de usuário</label><input id="perfil-nome" maxlength="80" required class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></div>
                    <div><label for="perfil-papel" class="mb-2 block text-xs font-bold text-slate-700">Papel para visualizar o front-end</label><select id="perfil-papel" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"><option value="admin">Administrador</option><option value="redator">Redator</option></select><p class="mt-1.5 text-[11px] leading-relaxed text-slate-500">Prévia de interface. No login real, o papel virá da sessão validada pelo back-end.</p></div>
                    <p id="perfil-mensagem" class="hidden rounded-lg bg-red-50 p-3 text-xs text-red-700" role="status"></p>
                    <button type="submit" class="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">Salvar alterações</button>
                </form>
            </section>
        </div>
    `);

    const modal = document.getElementById('perfil-modal');
    const form = document.getElementById('perfil-form');
    const nameInput = document.getElementById('perfil-nome');
    const roleInput = document.getElementById('perfil-papel');
    const imageInput = document.getElementById('perfil-foto');
    const preview = document.getElementById('perfil-foto-preview');
    const message = document.getElementById('perfil-mensagem');
    let selectedPhoto = '';

    roleInput.addEventListener('change', () => {
        if (Object.values(roleNames).includes(nameInput.value.trim())) {
            nameInput.value = roleNames[roleInput.value === 'redator' ? 'redator' : 'admin'];
            preview.src = makeAvatar(nameInput.value, selectedPhoto);
        }
    });

    function renderProfile() {
        const profile = readProfile();
        document.querySelectorAll('[data-profile-name]').forEach((node) => { node.textContent = profile.name || defaultProfile.name; });
        document.querySelectorAll('[data-profile-avatar]').forEach((img) => { img.src = makeAvatar(profile.name || defaultProfile.name, profile.photo); });
        const isRedator = profile.role === 'redator';
        document.querySelectorAll('[data-publication-username]').forEach((node) => { node.textContent = profile.name || defaultProfile.name; });
        document.querySelectorAll('[data-publication-role]').forEach((node) => { node.textContent = isRedator ? 'Redator' : 'Administrador'; });
        document.querySelectorAll('[data-profile-link]').forEach((link) => {
            link.href = isRedator ? 'redator-relatorio.html' : 'admin.html';
            link.setAttribute('aria-label', isRedator ? 'Abrir relatório do redator' : 'Abrir painel administrativo');
        });
        document.querySelectorAll('[data-profile-role-label]').forEach((label) => { label.textContent = isRedator ? 'Acesso de redator' : 'Acesso administrativo'; });
        document.querySelectorAll('[data-admin-panel-link]').forEach((link) => { link.classList.toggle('hidden', isRedator); });
        document.querySelectorAll('[data-writer-report-link]').forEach((link) => { link.classList.toggle('hidden', !isRedator); });
        document.querySelectorAll('a[href="admin.html"]:not([data-profile-link]):not([data-admin-panel-link])').forEach((link) => {
            link.dataset.roleAdminRoute = 'true';
            link.dataset.roleAdminLabel ||= link.textContent.trim();
        });
        document.querySelectorAll('a[data-role-admin-route]').forEach((link) => {
            link.href = isRedator ? 'publicacao.html' : 'admin.html';
            link.textContent = isRedator && /painel administrativo/i.test(link.dataset.roleAdminLabel)
                ? 'Nova Publicação'
                : link.dataset.roleAdminLabel;
        });
        document.querySelectorAll('nav a[href="publicacao.html"]:not([data-profile-link]), #mobile-menu a[href="publicacao.html"]:not([data-profile-link])').forEach((link) => { link.textContent = 'Nova Publicação'; });
        nameInput.value = profile.name || defaultProfile.name;
        roleInput.value = profile.role;
        selectedPhoto = profile.photo || '';
        preview.src = makeAvatar(nameInput.value, selectedPhoto);
    }
    function closeMenus() {
        document.querySelectorAll('[data-profile-popover]').forEach((menu) => {
            menu.dataset.open = 'false';
            menu.classList.add('invisible', 'pointer-events-none', 'opacity-0');
            const toggle = menu.parentElement.querySelector('[data-profile-toggle]');
            toggle?.setAttribute('aria-expanded', 'false');
            toggle?.querySelector('[data-chevron]')?.classList.remove('rotate-180');
        });
    }
    function openModal() {
        closeMenus();
        renderProfile();
        message.classList.add('hidden');
        modal.dataset.open = 'true';
        modal.classList.remove('invisible', 'pointer-events-none', 'opacity-0');
        modal.setAttribute('aria-hidden', 'false');
        nameInput.focus();
    }
    function closeModal() {
        modal.dataset.open = 'false';
        modal.classList.add('opacity-0');
        modal.setAttribute('aria-hidden', 'true');
        window.setTimeout(() => {
            if (modal.dataset.open === 'false') modal.classList.add('invisible', 'pointer-events-none');
        }, 160);
    }

    document.addEventListener('click', (event) => {
        const themeToggle = event.target.closest('[data-theme-toggle]');
        if (themeToggle) {
            const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = nextTheme;
            localStorage.setItem(themeKey, nextTheme);
            renderThemeControls();
            return;
        }
        const toggle = event.target.closest('[data-profile-toggle]');
        if (toggle) {
            const widget = toggle.closest('[data-profile-widget]');
            const menu = widget?.querySelector('[data-profile-popover]');
            if (!menu) return;
            const opening = menu.dataset.open !== 'true';
            closeMenus();
            if (opening) {
                renderProfile();
                menu.dataset.open = 'true';
                menu.classList.remove('invisible', 'pointer-events-none', 'opacity-0');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.querySelector('[data-chevron]').classList.add('rotate-180');
            }
            return;
        }
        if (event.target.closest('[data-edit-profile]')) { openModal(); return; }
        if (event.target.closest('[data-profile-logout]')) {
            localStorage.removeItem(profileKey);
            window.location.href = 'index.html';
            return;
        }
        if (event.target === modal || event.target.closest('[data-fechar-perfil]')) closeModal();
        if (!event.target.closest('[data-profile-widget]')) closeMenus();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenus();
            if (modal.dataset.open === 'true') closeModal();
        }
    });

    imageInput.addEventListener('change', () => {
        const file = imageInput.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { imageInput.value = ''; return; }
        if (file.size > 2 * 1024 * 1024) {
            message.textContent = 'Escolha uma imagem de até 2 MB.';
            message.classList.remove('hidden');
            imageInput.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => { selectedPhoto = String(reader.result || ''); preview.src = selectedPhoto; message.classList.add('hidden'); };
        reader.readAsDataURL(file);
    });
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const profile = { name: nameInput.value.trim(), photo: selectedPhoto, role: roleInput.value === 'redator' ? 'redator' : 'admin' };
        if (!profile.name) return;
        try {
            localStorage.setItem(profileKey, JSON.stringify(profile));
            renderProfile();
            closeModal();
            if (currentPage === 'admin.html' && profile.role !== 'admin') window.location.replace('publicacao.html');
        } catch {
            message.textContent = 'Não foi possível salvar. Use uma imagem menor.';
            message.classList.remove('hidden');
        }
    });
    renderProfile();
})();
