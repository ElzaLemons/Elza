import { STORAGE_KEYS } from '../config/storage.js';
import { LocalStorageDatabase, ExternalApiDatabase, setDatabase } from '../data/database.js';
import { ArticleModel } from '../models/article.model.js';
import { EventModel } from '../models/event.model.js';
import { SuggestionModel } from '../models/suggestion.model.js';

function assert(condition, message) { if (!condition) throw new Error(message); }

export async function runDatabaseTests() {
  const snapshot = Object.fromEntries(Object.values(STORAGE_KEYS).map((key) => [key, localStorage.getItem(key)]));
  try {
    const db = new LocalStorageDatabase();
    setDatabase(db);
    await db.replace('articles', []);
    await db.replace('events', []);
    await db.replace('suggestions', []);
    const user = { id: 77, nome: 'Teste', perfil: 'estudante' };
    const article = await ArticleModel.salvar({ categoria: 'noticia_geral', titulo: 'Artigo de teste', resumo: 'Resumo', conteudo: 'Conteúdo' }, user);
    assert(article.status === 'aguardando_coordenacao', 'artigo deve iniciar aguardando coordenação');
    assert((await ArticleModel.obterDoAutor(77)).length === 1, 'artigo deve ser recuperável pelo autor');
    await ArticleModel.moderar(article.id, 'publicado');
    assert((await ArticleModel.obterTodas()).length === 1, 'artigo publicado deve aparecer na listagem pública');
    const event = await EventModel.salvar({ titulo: 'Evento de teste', data_inicio: '2026-11-01', local: 'Auditório' }, user);
    assert((await EventModel.obterTodos()).some((item) => item.id === event.id), 'evento deve ser persistido');
    await EventModel.deletar(event.id);
    assert(!(await EventModel.obterTodos()).some((item) => item.id === event.id), 'evento deve ser removível');
    const suggestion = await SuggestionModel.salvar({ anonimo: true, categoria: 'outro', titulo: 'Sugestão', mensagem: 'Mensagem' });
    assert(suggestion.status === 'recebido', 'sugestão deve iniciar recebida');
    const external = new ExternalApiDatabase('https://example.test', async (url, options) => ({ ok: true, status: 200, json: async () => ({ url, options }) }));
    const externalResult = await external.insert('articles', { titulo: 'externo' });
    assert(externalResult.url === 'https://example.test/api/artigos' && externalResult.options.method === 'POST', 'adaptador externo deve mapear artigo para a API');
    const externalUpdate = await external.update('users', 1, { ativo: false });
    assert(externalUpdate.url === 'https://example.test/api/admin/usuarios/1/ativo', 'adaptador externo deve mapear atualização de usuário');
    return { passed: 9 };
  } finally {
    Object.entries(snapshot).forEach(([key, value]) => { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); });
  }
}
