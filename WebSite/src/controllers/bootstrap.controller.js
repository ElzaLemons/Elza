import { seedLocalStorage } from '../config/seed.js';
import { initAuth } from './auth.controller.js';
import { initPageController } from './page.controller.js';

seedLocalStorage();
const boot = async () => {
  try {
    await initAuth();
    await initPageController();
  } catch (error) {
    console.error('Falha ao inicializar a integração com o Supabase:', error);
  }
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
