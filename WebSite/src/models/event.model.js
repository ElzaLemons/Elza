import { getDatabase } from '../data/database.js';

export class EventModel {
  static async obterTodos() { return (await getDatabase().all('events')).filter((item) => item.status !== 'arquivado'); }
  static async salvar(data, user) {
    return getDatabase().insert('events', { ...data, status: 'publicado', created_by: user?.id, created_at: new Date().toISOString() });
  }
  static async deletar(id) { return getDatabase().remove('events', (item) => String(item.id) === String(id)); }
}
