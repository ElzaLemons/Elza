export const STORAGE_KEYS = Object.freeze({
  users: 'elza_users',
  suggestions: 'elza_suggestions',
  articles: 'elza_articles',
  events: 'elza_events',
  token: 'elza_token',
  user: 'elza_user',
});

export function read(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}
