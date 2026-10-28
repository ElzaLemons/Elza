import { STORAGE_KEYS, read, write } from '../config/storage.js';
import { getDatabase } from '../data/database.js';

export class AuthModel {
  static obterSessao() {
    return { token: localStorage.getItem(STORAGE_KEYS.token), user: read(STORAGE_KEYS.user, null) };
  }

  static async login(email, senha) {
    const user = (await getDatabase().all('users')).find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.senha === senha && item.ativo !== false);
    if (!user) throw new Error('Credenciais inválidas.');
    const safeUser = { ...user };
    delete safeUser.senha;
    const token = `mock_jwt_token_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.token, token);
    write(STORAGE_KEYS.user, safeUser);
    return { token, user: safeUser };
  }

  static logout() {
    [STORAGE_KEYS.token, 'token'].forEach((key) => localStorage.removeItem(key));
    [STORAGE_KEYS.user, 'user'].forEach((key) => localStorage.removeItem(key));
  }
}
