export const ls = {
  get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } },
};
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export function timeAgo(iso) {
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
  for (const [n, l] of [[31536000, 'y'], [2592000, 'mo'], [86400, 'd'], [3600, 'h'], [60, 'm']]) if (s >= n) return `${Math.floor(s / n)}${l} ago`;
  return 'just now';
}
