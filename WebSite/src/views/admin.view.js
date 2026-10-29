export class AdminView {
  static escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
  }

  static mostrarAlerta(message) {
    document.getElementById('alerta-texto').textContent = message;
    document.getElementById('alerta-admin').classList.remove('hidden');
  }

  static renderizarUsuarios(users) {
    const badge = { estudante: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', professor: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300', coordenador: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300', diretor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', admin: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' };
    const label = { estudante: 'Redator', professor: 'Editor', coordenador: 'Coordenador', diretor: 'Diretor', admin: 'Administrador' };
    document.getElementById('tabela-usuarios').innerHTML = users.map((user) => `<tr class="border-t border-slate-200 dark:border-slate-700"><td class="px-4 py-4"><span class="block font-semibold">${this.escape(user.nome)}</span><span class="block text-xs text-slate-500">${this.escape(user.email)}</span></td><td class="px-4 py-4 text-slate-500">${this.escape(user.turma || user.serie || '—')}</td><td class="px-4 py-4"><span class="rounded-full px-2.5 py-1 text-[10px] font-bold ${badge[user.perfil] || badge.estudante}">${this.escape(label[user.perfil] || user.perfil)}</span></td><td class="px-4 py-4"><span class="rounded-full px-2.5 py-1 text-[10px] font-bold ${user.ativo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}">${user.ativo ? 'Ativo' : 'Inativo'}</span></td><td class="px-4 py-4 text-right"><button data-id="${this.escape(user.id)}" data-ativo="${user.ativo ? 'false' : 'true'}" class="toggle-user text-xs font-semibold text-blue-600 hover:text-blue-800">${user.ativo ? 'Desativar' : 'Ativar'}</button></td></tr>`).join('') || '<tr><td colspan="5" class="px-4 py-10 text-center text-sm text-slate-500">Nenhum usuário cadastrado.</td></tr>';
  }

  static renderizarEventos(events) {
    document.getElementById('lista-eventos-admin').innerHTML = events.map((event) => `<div class="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between"><div><span class="block font-bold text-xs text-slate-800">${this.escape(event.titulo)}</span><span class="text-[10px] text-slate-500">${this.escape(event.data_inicio)} • ${this.escape(event.local)}</span></div><button data-id="${this.escape(event.id)}" class="delete-event text-red-600 font-bold text-xs">Excluir</button></div>`).join('') || '<p class="text-sm text-slate-500">Nenhum evento cadastrado.</p>';
  }

  static renderizarPendentes(articles) {
    const container = document.querySelector('#conteudo-moderacao > div');
    container.innerHTML = articles.map((article) => `<div class="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-4"><div><span class="text-[9px] font-bold uppercase">${this.escape(article.status)}</span><h3 class="font-bold text-xs">${this.escape(article.titulo)}</h3><p class="text-[11px] text-slate-500">${this.escape(article.autor_nome)} • ${this.escape(article.categoria)}</p></div><div class="flex gap-2"><button data-id="${this.escape(article.id)}" data-status="publicado" class="moderate bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Publicar</button><button data-id="${this.escape(article.id)}" data-status="recusado" class="moderate bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg">Recusar</button></div></div>`).join('') || '<p class="text-sm text-slate-500">Nenhuma publicação pendente.</p>';
  }
}
