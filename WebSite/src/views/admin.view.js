export class AdminView {
  static escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
  }

  static mostrarAlerta(message) {
    document.getElementById('alerta-texto').textContent = message;
    document.getElementById('alerta-admin').classList.remove('hidden');
  }

  static renderizarUsuarios(users) {
    document.getElementById('tabela-usuarios').innerHTML = users.map((user) => `<tr class="border-t border-slate-100"><td class="py-3"><span class="block font-bold text-slate-800">${this.escape(user.nome)}</span><span class="block text-[10px] text-slate-400">${this.escape(user.email)}</span></td><td class="py-3">${this.escape(user.perfil)}</td><td class="py-3 text-right"><button data-id="${this.escape(user.id)}" data-ativo="${user.ativo ? 'false' : 'true'}" class="toggle-user text-red-600 font-bold text-xs">${user.ativo ? 'Desativar' : 'Ativar'}</button></td></tr>`).join('');
  }

  static renderizarEventos(events) {
    document.getElementById('lista-eventos-admin').innerHTML = events.map((event) => `<div class="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between"><div><span class="block font-bold text-xs text-slate-800">${this.escape(event.titulo)}</span><span class="text-[10px] text-slate-500">${this.escape(event.data_inicio)} • ${this.escape(event.local)}</span></div><button data-id="${this.escape(event.id)}" class="delete-event text-red-600 font-bold text-xs">Excluir</button></div>`).join('') || '<p class="text-sm text-slate-500">Nenhum evento cadastrado.</p>';
  }

  static renderizarPendentes(articles) {
    const container = document.querySelector('#conteudo-moderacao > div');
    container.innerHTML = articles.map((article) => `<div class="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-4"><div><span class="text-[9px] font-bold uppercase">${this.escape(article.status)}</span><h3 class="font-bold text-xs">${this.escape(article.titulo)}</h3><p class="text-[11px] text-slate-500">${this.escape(article.autor_nome)} • ${this.escape(article.categoria)}</p></div><div class="flex gap-2"><button data-id="${this.escape(article.id)}" data-status="publicado" class="moderate bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Publicar</button><button data-id="${this.escape(article.id)}" data-status="recusado" class="moderate bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg">Recusar</button></div></div>`).join('') || '<p class="text-sm text-slate-500">Nenhuma publicação pendente.</p>';
  }
}
