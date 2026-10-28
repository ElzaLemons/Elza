import { getDatabase } from '../data/database.js';
import { isSupabaseConfigured } from '../config/supabaseClient.js';

export class UserModel {
  static async obterTodos() { return getDatabase().all('users'); }
  static async salvar(data) {
    if (isSupabaseConfigured) {
      throw new Error('A criação de usuários Supabase deve usar uma Edge Function administrativa; nunca exponha a service_role key no navegador.');
    }
    return getDatabase().insert('users', { ...data, ativo: true, created_at: new Date().toISOString() });
  }
  static async alternarAtivo(id, ativo) { return getDatabase().update('users', id, { ativo }); }
}
