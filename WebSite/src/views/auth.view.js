export class AuthView {
  static renderizarNavbar(sessao) {
    const login = document.getElementById('btn-login');
    const publicar = document.getElementById('btn-publicar');
    const admin = document.getElementById('btn-admin');
    const session = document.getElementById('user-session');
    const name = document.getElementById('user-name');
    if (sessao.token && sessao.user) {
      login?.classList.add('hidden');
      publicar?.classList.remove('hidden');
      if (sessao.user.perfil === 'admin') admin?.classList.remove('hidden');
      session?.classList.remove('hidden');
      if (name) name.textContent = sessao.user.nome;
    } else {
      login?.classList.remove('hidden');
      publicar?.classList.add('hidden');
      admin?.classList.add('hidden');
      session?.classList.add('hidden');
    }
  }
}
