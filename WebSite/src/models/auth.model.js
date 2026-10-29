import { STORAGE_KEYS, read, write } from '../config/storage.js';
import { getDatabase } from '../data/database.js';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabaseClient.js';

export class AuthModel {
  static obterSessao() {
    return { token: localStorage.getItem(STORAGE_KEYS.token), user: read(STORAGE_KEYS.user, null) };
  }

  static async obterSessaoAsync() {
    if (!isSupabaseConfigured) return this.obterSessao();
    const client = await getSupabaseClient();
    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) return { token: null, user: null };
    const { data: profile, error } = await client.from('users').select('*').eq('id', session.user.id).single();
    if (error) throw error;
    return this.persistSession(session, profile);
  }

  static persistSession(session, profile) {
    if (!session?.access_token || !profile) return { token: null, user: null };
    write(STORAGE_KEYS.user, profile);
    localStorage.setItem(STORAGE_KEYS.token, session.access_token);
    return { token: session.access_token, user: profile };
  }

  static async login(email, senha) {
    if (isSupabaseConfigured) {
      const client = await getSupabaseClient();
      const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) throw new Error(error.message || 'Credenciais inválidas.');
      if (!data.session || !data.user) throw new Error('O Supabase não retornou uma sessão válida.');
      const { data: profile, error: profileError } = await client.from('users').select('*').eq('id', data.user.id).single();
      if (profileError) throw profileError;
      if (profile.ativo === false) {
        await client.auth.signOut();
        throw new Error('Usuário inativo.');
      }
      return this.persistSession(data.session, profile);
    }
    const user = (await getDatabase().all('users')).find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.senha === senha && item.ativo !== false);
    if (!user) throw new Error('Credenciais inválidas.');
    const safeUser = { ...user };
    delete safeUser.senha;
    const token = `mock_jwt_token_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.token, token);
    write(STORAGE_KEYS.user, safeUser);
    return { token, user: safeUser };
  }

  static async signup({ email, senha, nome, perfil = 'estudante' }) {
    if (!isSupabaseConfigured) throw new Error('Cadastro externo exige a configuração do Supabase.');
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.signUp({ email: email.trim(), password: senha, options: { data: { nome, perfil } } });
    if (error) throw error;
    return data;
  }

  static async logout() {
    if (isSupabaseConfigured) {
      const client = await getSupabaseClient();
      const { error } = await client.auth.signOut();
      if (error) throw error;
    }
    [STORAGE_KEYS.token, 'token'].forEach((key) => localStorage.removeItem(key));
    [STORAGE_KEYS.user, 'user'].forEach((key) => localStorage.removeItem(key));
  }
}
