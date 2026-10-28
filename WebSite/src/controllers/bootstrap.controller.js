import { seedLocalStorage } from '../config/seed.js';
import { initAuth } from './auth.controller.js';
import { initPageController } from './page.controller.js';

seedLocalStorage();
const boot = () => { initAuth(); initPageController(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
