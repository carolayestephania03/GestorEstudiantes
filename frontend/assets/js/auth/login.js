document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formAuthentication');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = (document.getElementById('email') || {}).value?.trim() || '';
    const password = (document.getElementById('password') || {}).value || '';
    if (!username || !password) { alert('Ingresa usuario y contraseña'); return; }

    try {
      const r = await fetch('/auth/login-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!r.ok) {
        const err = await r.json().catch(()=>({message:'Login inválido'}));
        alert(err.message || 'Login inválido');
        return;
      }
      // Aquí el backend YA dejó la cookie HttpOnly.
      // Redirige a la página real:
      location.href = './pages/dashboard.html';
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  });
});