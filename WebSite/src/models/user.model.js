import { getDatabase } from '../data/database.js';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabaseClient.js';

export class UserModel {
  static async obterTodos() { return getDatabase().all('users'); }
  static async salvar(data) {
    if (isSupabaseConfigured) {
      const client = await getSupabaseClient();
      const { data: currentSession } = await client.auth.getSession();
      if (!currentSession.session?.user) throw new Error('A sessão administrativa expirou. Faça login novamente.');
      const { data: currentProfile, error: currentProfileError } = await client
        .from('users')
        .select('perfil')
        .eq('id', currentSession.session.user.id)
        .single();
      if (currentProfileError) throw currentProfileError;
      if (currentProfile.perfil !== 'admin') throw new Error('Apenas administradores podem cadastrar usuários.');

      const email = String(data.email || '').trim().toLowerCase();
      const password = String(data.senha || '');
      const nome = String(data.nome || '').trim();
      const perfil = String(data.perfil || 'estudante');
      if (!email || !password || !nome) throw new Error('Nome, e-mail e senha são obrigatórios.');

      const { data: created, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { nome, perfil } },
      });
      if (error) throw new Error(error.message || 'Não foi possível criar o usuário.');
      if (!created.user) throw new Error('O Supabase não retornou o usuário criado.');

      // signUp pode substituir temporariamente a sessão quando a confirmação
      // de e-mail está desativada. Restaura o administrador imediatamente.
      if (created.session) {
        const { error: restoreError } = await client.auth.setSession({
          access_token: currentSession.session.access_token,
          refresh_token: currentSession.session.refresh_token,
        });
        if (restoreError) throw restoreError;
      }

      const { data: profile, error: profileError } = await client
        .from('users')
        .select('*')
        .eq('id', created.user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      return profile || {
        id: created.user.id,
        nome,
        email,
        perfil,
        ativo: true,
      };
    }
    return getDatabase().insert('users', { ...data, ativo: true, created_at: new Date().toISOString() });
  }
  static async alternarAtivo(id, ativo) { return getDatabase().update('users', id, { ativo }); }
}
