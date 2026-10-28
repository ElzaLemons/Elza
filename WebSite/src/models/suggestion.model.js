import { getDatabase } from '../data/database.js';

export class SuggestionModel {
  static async salvar(data) {
    return getDatabase().insert('suggestions', { ...data, status: 'recebido', created_at: new Date().toISOString() });
  }
}
