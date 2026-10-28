export function showToast(message, type = 'info') {
  let toast = document.getElementById('app-toast');
  if (!toast) { toast = document.createElement('div'); toast.id = 'app-toast'; document.body.appendChild(toast); }
  toast.className = `fixed right-4 top-4 z-[100] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`;
  toast.textContent = message;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.remove(), 4000);
}
