module.exports = {
    secret: 'CFAC1998$M1ndefConferencia', // Cambia esto por una clave secreta segura
    getOptions: (rememberMe) => ({
        expiresIn: rememberMe ? '30d' : '10h', // 30 días si recuérdame está activado, 10 horas si no
    })
};
