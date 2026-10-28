import { protegerPaginaRestrita } from './auth.controller.js';

export async function initPageController() {
  const page = location.pathname.split('/').pop();
  if (page === 'publicacao.html') await protegerPaginaRestrita(false);
  if (page === 'admin.html') await protegerPaginaRestrita(true);
}
