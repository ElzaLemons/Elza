import { AuthModel } from '../models/auth.model.js';
import { AuthView } from '../views/auth.view.js';

export async function initAuth() {
  const session = await AuthModel.obterSessaoAsync();
  AuthView.renderizarNavbar(session);
  document.getElementById('btn-logout')?.addEventListener('click', async () => { await AuthModel.logout(); window.location.href = location.pathname.includes('/pages/') ? '../index.html' : 'index.html'; });
}

export async function protegerPaginaRestrita(requerAdmin = false) {
  const session = await AuthModel.obterSessaoAsync();
  if (!session.token || !session.user) { window.location.href = 'login.html'; return false; }
  if (requerAdmin && session.user.perfil !== 'admin') { window.location.href = '../index.html'; return false; }
  return true;
}
