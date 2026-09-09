// ./app/routes/authDev.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const {
  JWT_SECRET = 'SecretoEscuelaORM1234',
  NODE_ENV = 'development'
} = process.env;

const DEV = { id: 1, username: 'ccante', password: 'ccante', role: 'maestro' };
const ACCESS_EXPIRES = '8h';

function signAccess(payload) {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: ACCESS_EXPIRES });
}

router.post('/auth/login-dev', (req, res) => {
  const { username, password } = req.body || {};
  if (username !== DEV.username || password !== DEV.password) {
    return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
  }

  const base = { id: DEV.id, username: DEV.username, role: DEV.role };
  const token = signAccess(base);

  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie('access_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: NODE_ENV === 'production' && isHttps, // false en localhost HTTP
    path: '/',
    maxAge: 8 * 60 * 60 * 1000
  });

  return res.json({ ok: true, user: base });
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', path: '/' });
  return res.json({ ok: true });
});

module.exports = router;
