import { STORAGE_KEYS, read, write } from './storage.js';

const now = new Date().toISOString();

export function seedLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) write(STORAGE_KEYS.users, [
    { id: 1, nome: 'Administrador Local', email: 'admin@elza.com', senha: '123', perfil: 'admin', ativo: true, created_at: now },
    { id: 2, nome: 'Publicador Local', email: 'publicador@elza.com', senha: '123', perfil: 'estudante', ativo: true, created_at: now },
  ]);
  if (!localStorage.getItem(STORAGE_KEYS.suggestions)) write(STORAGE_KEYS.suggestions, []);
  if (!localStorage.getItem(STORAGE_KEYS.articles)) write(STORAGE_KEYS.articles, []);
  if (!localStorage.getItem(STORAGE_KEYS.events)) write(STORAGE_KEYS.events, []);
  return { users: read(STORAGE_KEYS.users), articles: read(STORAGE_KEYS.articles), events: read(STORAGE_KEYS.events) };
}
