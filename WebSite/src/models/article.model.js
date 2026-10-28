import { getDatabase } from '../data/database.js';

export class ArticleModel {
  static async obterTodas(apenasPublicadas = true) {
    const items = await getDatabase().all('articles');
    return apenasPublicadas ? items.filter((item) => item.status === 'publicado' || item.status === 'aprovado') : items;
  }

  static async obterPorId(id) { return (await this.obterTodas()).find((item) => String(item.id) === String(id)); }

  static async obterDoAutor(authorId) { return (await getDatabase().all('articles')).filter((item) => String(item.author_id) === String(authorId)); }

  static async salvar(data, user) {
    return getDatabase().insert('articles', { author_id: user.id, autor_nome: user.nome, ...data, status: 'aguardando_coordenacao', created_at: new Date().toISOString() });
  }

  static async moderar(id, status, comentario = '') {
    return getDatabase().update('articles', (item) => String(item.id) === String(id), (item) => ({ ...item, status, motivo_recusa: comentario, updated_at: new Date().toISOString() }));
  }
}
