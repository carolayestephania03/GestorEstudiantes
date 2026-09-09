const jwt = require('jsonwebtoken');
const { JWT_SECRET = 'SecretoEscuelaORM1234' } = process.env;

module.exports = function requireAuth(req, res, next) {
  const token = req.cookies?.access_token;
  if (!token) return res.redirect(302, '/');

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = payload;
    return next();
  } catch (e) {
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', path: '/' });
    return res.redirect(302, '/');
  }
};
