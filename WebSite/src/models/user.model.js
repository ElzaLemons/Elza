import { getDatabase } from '../data/database.js';

export class UserModel {
  static async obterTodos() { return getDatabase().all('users'); }
  static async salvar(data) {
    return getDatabase().insert('users', { ...data, ativo: true, created_at: new Date().toISOString() });
  }
  static async alternarAtivo(id, ativo) { return getDatabase().update('users', (item) => String(item.id) === String(id), { ativo }); }
}
