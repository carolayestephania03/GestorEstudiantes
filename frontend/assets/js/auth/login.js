// ./public/assets/js/login.js
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formAuthentication');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const identificador = (document.getElementById('email') || {}).value?.trim() || '';
    const contrasena = (document.getElementById('password') || {}).value || '';

    if (!identificador || !contrasena) {
      alert('Ingresa usuario y contraseña');
      return;
    }

    try {
      const r = await fetch(`${ENV.API_URL}/usuario/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Importante para que el navegador ACEPTE la cookie HttpOnly del backend
        credentials: 'include',   // envía/acepta cookies cross-site
        mode: 'cors',             // asumiendo front y API en puertos distintos
        body: JSON.stringify({ identificador, contrasena })
      });

      // Intenta parsear JSON siempre
      let payload = null;
      try { payload = await r.json(); } catch (_) { payload = null; }

      if (payload?.data) {
        sessionStorage.setItem('userData', JSON.stringify(payload.data));
      }

      if (!r.ok) {
        const msg = payload?.message || payload?.error || 'Login inválido';
        alert(msg);
        return;
      }

      location.href = './pages/dashboard.html';
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  });
});
