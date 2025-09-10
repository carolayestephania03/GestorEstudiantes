const socketIO = require('socket.io');

let io;

module.exports = {
    init: (server) => {
        io = socketIO(server, {
            cors: {
                /*Cambiar a conveniencia*/
                origin: 'http://172.168.43.24:3001',
                credentials: true,
            }
        });

        io.on('connection', (socket) => {
            console.log('New client connected');

            socket.on('login', (userId) => {
                console.log(`User ${userId} logged in`);
                socket.join(`user_${userId}`);
            });

            socket.on('logout', (userId) => {
                console.log(`User ${userId} logged out`);
                socket.leave(`user_${userId}`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};