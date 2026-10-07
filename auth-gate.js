/* Porta de entrada da intranet Rocha Silva.
   - index.html define window.RS_LOGIN_PAGE = true e mostra o formulário de login.
   - dashboard.html e calculadora.html ficam ocultos até confirmar o login; sem login, voltam ao index.
   O login (Firebase Auth) é compartilhado entre as páginas do mesmo site. */
(function(){
  const cfg = window.FIREBASE_CONFIG;
  const isLogin = !!window.RS_LOGIN_PAGE;
  const api = window.RS_AUTH = {
    user:null, ready:false, open:false, error:null, _l:[],
    onChange(f){ api._l.push(f); if(api.ready) f(api.user); },
    _emit(){ api._l.forEach(f=>{ try{ f(api.user); }catch(e){} }); },
    signIn: async()=>{ throw new Error('indisponível'); },
    signOut: async()=>{}
  };
  if(!cfg){ api.ready = true; api.open = true; api._emit(); return; }   // sem configuração: sem proteção

  const root = document.documentElement;
  if(!isLogin) root.style.visibility = 'hidden';

  function addBar(user){
    if(isLogin || document.getElementById('rs-userbar')) return;
    const b = document.createElement('div');
    b.id = 'rs-userbar';
    b.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;background:#05244F;color:#fff;font:600 12px Inter,system-ui,sans-serif;padding:7px 12px;border-radius:999px;box-shadow:0 4px 14px rgba(5,36,79,.35);display:flex;gap:10px;align-items:center';
    b.innerHTML = '<a href="index.html" style="color:#aebbd6;text-decoration:none">Início</a><span style="opacity:.4">|</span><span id="rs-u"></span><button style="all:unset;cursor:pointer;color:#FF8A4C">Sair</button>';
    b.querySelector('#rs-u').textContent = user.email || '';
    b.querySelector('button').onclick = ()=>api.signOut();
    document.body.appendChild(b);
  }

  const base = 'https://www.gstatic.com/firebasejs/10.12.2/';
  Promise.all([import(base+'firebase-app.js'), import(base+'firebase-auth.js')]).then(([app, au])=>{
    const auth = au.getAuth(app.initializeApp(cfg));
    api.signIn = (e,p)=>au.signInWithEmailAndPassword(auth,e,p);
    api.signOut = ()=>au.signOut(auth);
    au.onAuthStateChanged(auth, user=>{
      api.user = user; api.ready = true;
      if(!isLogin){
        if(!user){ location.replace('index.html'); return; }
        root.style.visibility = 'visible';
        if(document.body) addBar(user); else document.addEventListener('DOMContentLoaded', ()=>addBar(user));
      }
      api._emit();
    });
  }).catch(e=>{
    api.error = e.message || String(e); api.ready = true;
    if(!isLogin){
      root.style.visibility = 'visible';
      document.addEventListener('DOMContentLoaded', ()=>{
        document.body.innerHTML = '<div style="font:15px Inter,system-ui,sans-serif;max-width:480px;margin:80px auto;padding:0 20px"><b>Não foi possível verificar o login.</b><br>Confira a conexão com a internet e <a href="index.html">volte ao início</a>.</div>';
      });
    }
    api._emit();
  });
})();
