import { AuthModel } from '../models/auth.model.js';
import { AdminView } from '../views/admin.view.js';

const api = () => window.auth.apiFetch;

async function request(path, options) {
  const response = await api()(path, options);
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'Operação não realizada.');
  return data;
}

async function carregarUsuarios() {
  AdminView.renderizarUsuarios(await request('/api/admin/usuarios'));
  document.querySelectorAll('.toggle-user').forEach((button) => button.addEventListener('click', async () => {
    try {
      await request(`/api/admin/usuarios/${button.dataset.id}/ativo`, { method: 'PATCH', body: JSON.stringify({ ativo: button.dataset.ativo === 'true' }) });
      await carregarUsuarios();
    } catch (error) { AdminView.mostrarAlerta(error.message); }
  }));
}

async function carregarEventos() {
  AdminView.renderizarEventos(await request('/api/admin/eventos'));
  document.querySelectorAll('.delete-event').forEach((button) => button.addEventListener('click', async () => {
    try {
      await request(`/api/admin/eventos/${button.dataset.id}`, { method: 'DELETE' });
      await carregarEventos();
    } catch (error) { AdminView.mostrarAlerta(error.message); }
  }));
}

async function carregarPendentes() {
  AdminView.renderizarPendentes(await request('/api/admin/artigos/pendentes'));
  document.querySelectorAll('.moderate').forEach((button) => button.addEventListener('click', async () => {
    try {
      await request(`/api/admin/artigos/${button.dataset.id}/moderacao`, { method: 'PATCH', body: JSON.stringify({ status: button.dataset.status }) });
      await carregarPendentes();
    } catch (error) { AdminView.mostrarAlerta(error.message); }
  }));
}

function mudarAba(nomeAba) {
  ['usuarios', 'eventos', 'materias', 'moderacao'].forEach((aba) => {
    document.getElementById(`conteudo-${aba}`).classList.toggle('hidden', aba !== nomeAba);
    document.getElementById(`tab-${aba}`).classList.toggle('bg-adm-principal', aba === nomeAba);
    document.getElementById(`tab-${aba}`).classList.toggle('text-white', aba === nomeAba);
  });
  if (nomeAba === 'usuarios') carregarUsuarios().catch((error) => AdminView.mostrarAlerta(error.message));
  if (nomeAba === 'eventos') carregarEventos().catch((error) => AdminView.mostrarAlerta(error.message));
  if (nomeAba === 'moderacao') carregarPendentes().catch((error) => AdminView.mostrarAlerta(error.message));
}

function inicializarPerfil(user) {
  const profile = document.getElementById('admin-profile');
  const trigger = document.getElementById('admin-profile-trigger');
  const menu = document.getElementById('admin-profile-menu');
  const context = document.getElementById('admin-context');
  const input = document.getElementById('admin-avatar-input');
  if (!profile || !trigger || !menu || !input) return;

  const name = user.nome || 'Administrador';
  document.getElementById('admin-profile-short-name').textContent = name;
  document.getElementById('admin-profile-name').textContent = name;
  document.getElementById('admin-profile-email').textContent = user.email || '';

  const setAvatar = (source) => {
    ['admin-avatar', 'admin-menu-avatar'].forEach((id) => {
      const image = document.getElementById(id);
      image.src = source;
      image.classList.remove('hidden');
    });
    ['admin-avatar-fallback', 'admin-menu-avatar-fallback'].forEach((id) => document.getElementById(id).classList.add('hidden'));
  };
  const savedAvatar = localStorage.getItem('elza_admin_avatar');
  if (savedAvatar) setAvatar(savedAvatar);

  const setExpanded = (expanded) => {
    context?.classList.toggle('profile-expanded', expanded);
    if (context) context.style.paddingBottom = expanded ? `${menu.scrollHeight + 24}px` : '';
  };

  const closeMenu = () => {
    menu.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
    setExpanded(false);
  };
  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = menu.classList.toggle('hidden');
    trigger.setAttribute('aria-expanded', String(!open));
    setExpanded(!open);
  });
  document.addEventListener('click', (event) => {
    if (!profile.contains(event.target)) closeMenu();
  });
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      input.value = '';
      AdminView.mostrarAlerta('Escolha uma imagem JPG, PNG ou WEBP de até 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem('elza_admin_avatar', reader.result);
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function initAdminPage() {
  const session = await AuthModel.obterSessaoAsync();
  if (!session.token || session.user?.perfil !== 'admin') {
    window.location.href = 'login.html?redirect=admin.html';
    return;
  }

  inicializarPerfil(session.user);
  document.getElementById('btn-menu')?.addEventListener('click', () => document.getElementById('mobile-menu').classList.toggle('hidden'));
  document.querySelectorAll('.aba-btn').forEach((button) => button.addEventListener('click', () => mudarAba(button.id.replace('tab-', ''))));
  document.getElementById('form-add-usuario').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/admin/usuarios', { method: 'POST', body: JSON.stringify({ nome: document.getElementById('usr-nome').value, email: document.getElementById('usr-email').value, senha: document.getElementById('usr-senha').value, perfil: document.getElementById('usr-cargo').value }) });
      event.target.reset();
      AdminView.mostrarAlerta('Usuário cadastrado com sucesso.');
      await carregarUsuarios();
    } catch (error) { AdminView.mostrarAlerta(error.message); }
  });
  document.getElementById('form-add-evento').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await request('/api/admin/eventos', { method: 'POST', body: JSON.stringify({ titulo: document.getElementById('evt-titulo').value, data_inicio: document.getElementById('evt-data').value, local: document.getElementById('evt-local').value || 'Escola Elza' }) });
      event.target.reset();
      AdminView.mostrarAlerta('Evento publicado com sucesso.');
      await carregarEventos();
    } catch (error) { AdminView.mostrarAlerta(error.message); }
  });
  await carregarUsuarios();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAdminPage().catch((error) => AdminView.mostrarAlerta(error.message)));
else initAdminPage().catch((error) => AdminView.mostrarAlerta(error.message));
