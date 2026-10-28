import { AuthModel } from '../models/auth.model.js';
import { AuthView } from '../views/auth.view.js';

export function initAuth() {
  const session = AuthModel.obterSessao();
  AuthView.renderizarNavbar(session);
  document.getElementById('btn-logout')?.addEventListener('click', () => { AuthModel.logout(); window.location.href = location.pathname.includes('/pages/') ? '../index.html' : 'index.html'; });
}

export function protegerPaginaRestrita(requerAdmin = false) {
  const session = AuthModel.obterSessao();
  if (!session.token || !session.user) { window.location.href = 'login.html'; return false; }
  if (requerAdmin && session.user.perfil !== 'admin') { window.location.href = '../index.html'; return false; }
  return true;
}
