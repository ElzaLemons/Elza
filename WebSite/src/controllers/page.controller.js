import { protegerPaginaRestrita } from './auth.controller.js';

export function initPageController() {
  const page = location.pathname.split('/').pop();
  if (page === 'publicacao.html') protegerPaginaRestrita(false);
  if (page === 'admin.html') protegerPaginaRestrita(true);
}
