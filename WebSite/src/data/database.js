import { STORAGE_KEYS, nextId, read, write } from '../config/storage.js';

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
  async update(collection, predicate, updater) {
    const records = await this.all(collection);
    let result;
    const updated = records.map((record) => {
      if (!predicate(record)) return record;
      result = typeof updater === 'function' ? updater(record) : { ...record, ...updater };
      return result;
    });
    await this.replace(collection, updated);
    return result;
  }
  async remove(collection, predicate) {
    const records = await this.all(collection);
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

let activeDatabase = new LocalStorageDatabase();
export const getDatabase = () => activeDatabase;
export const setDatabase = (database) => { activeDatabase = database; return activeDatabase; };
export const useExternalDatabase = (baseUrl) => setDatabase(new ExternalApiDatabase(baseUrl));
