const jwt = require('jsonwebtoken');
const config = require('../../config/jwt');

module.exports = (req, res, next) => {
    // Obtener el token desde los headers
    const token = req.headers['authorization']; // El nombre del header es 'authorization'

    if (!token) {
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    }

    // Si el token tiene el prefijo "Bearer ", se lo quitamos
    const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    jwt.verify(tokenWithoutBearer, config.secret, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }

        req.userId = decoded.id;
        next();
    });
};
