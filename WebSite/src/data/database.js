import { STORAGE_KEYS, nextId, read, write } from '../config/storage.js';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabaseClient.js';

export class LocalStorageDatabase {
  async all(collection) { return read(STORAGE_KEYS[collection] || collection, []); }
  async replace(collection, records) { return write(STORAGE_KEYS[collection] || collection, records); }
  async find(collection, predicate) { return (await this.all(collection)).find(predicate); }
  async insert(collection, record) {
    const records = await this.all(collection);
    const item = { id: record.id ?? nextId(records), ...record };
    await this.replace(collection, [...records, item]);
    return item;
  }
  async update(collection, idOrPredicate, updater) {
    const records = await this.all(collection);
    const predicate = typeof idOrPredicate === 'function'
      ? idOrPredicate
      : (record) => String(record.id) === String(idOrPredicate);
    let result;
    const updated = records.map((record) => {
      if (!predicate(record)) return record;
      result = typeof updater === 'function' ? updater(record) : { ...record, ...updater };
      return result;
    });
    await this.replace(collection, updated);
    return result;
  }
  async remove(collection, idOrPredicate) {
    const records = await this.all(collection);
    const predicate = typeof idOrPredicate === 'function'
      ? idOrPredicate
      : (record) => String(record.id) === String(idOrPredicate);
    await this.replace(collection, records.filter((record) => !predicate(record)));
  }
}

export class ExternalApiDatabase {
  constructor(baseUrl, fetchImpl = fetch) { this.baseUrl = baseUrl.replace(/\/$/, ''); this.fetchImpl = fetchImpl; }
  pathFor(collection) {
    return { users: '/api/admin/usuarios', suggestions: '/api/sugestoes', articles: '/api/artigos', events: '/api/eventos' }[collection] || `/api/${collection}`;
  }
  async request(path, options = {}) {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, { ...options, headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
    if (!response.ok) throw new Error((await response.json()).error || `Falha na API (${response.status})`);
    return response.status === 204 ? null : response.json();
  }
  all(collection) { return this.request(this.pathFor(collection)); }
  insert(collection, record) { return this.request(this.pathFor(collection), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) }); }
  update(collection, id, record) {
    const path = collection === 'users' ? `${this.pathFor(collection)}/${id}/ativo` : `${this.pathFor(collection)}/${id}/moderacao`;
    return this.request(path, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) });
  }
  remove(collection, id) { return this.request(`${this.pathFor(collection)}/${id}`, { method: 'DELETE' }); }
}

export class SupabaseDatabase {
  async table(collection) {
    const client = await getSupabaseClient();
    if (!client) throw new Error('Supabase não está configurado. Preencha o arquivo .env.');
    return client.from(collection);
  }

  async all(collection) {
    const { data, error } = await (await this.table(collection)).select('*');
    if (error) throw error;
    return data || [];
  }

  async find(collection, predicate) {
    return (await this.all(collection)).find(predicate);
  }

  async insert(collection, record) {
    const payload = { ...record };
    delete payload.id;
    const { data, error } = await (await this.table(collection)).insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async update(collection, id, changes) {
    const { data, error } = await (await this.table(collection)).update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async remove(collection, id) {
    const { error } = await (await this.table(collection)).delete().eq('id', id);
    if (error) throw error;
  }

  async uploadMedia(file, ownerId) {
    const client = await getSupabaseClient();
    const safeName = String(file.name || 'imagem').replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `articles/${ownerId}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await client.storage.from('article-media').upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicData } = client.storage.from('article-media').getPublicUrl(path);
    return this.insert('media_files', {
      owner_id: ownerId,
      file_name: safeName,
      original_name: file.name || safeName,
      storage_path: path,
      public_url: publicData.publicUrl,
      mime_type: file.type || 'application/octet-stream',
      size_bytes: file.size || 0,
    });
  }
}

let activeDatabase = isSupabaseConfigured ? new SupabaseDatabase() : new LocalStorageDatabase();
export const getDatabase = () => activeDatabase;
export const setDatabase = (database) => { activeDatabase = database; return activeDatabase; };
export const useExternalDatabase = (baseUrl) => setDatabase(new ExternalApiDatabase(baseUrl));
export const useSupabaseDatabase = () => setDatabase(new SupabaseDatabase());
