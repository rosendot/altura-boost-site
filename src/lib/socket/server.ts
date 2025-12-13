import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | undefined;

export function initSocketServer(server: HTTPServer) {
  if (!io) {
    io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_APP_URL
          : 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Booster connected:', socket.id);

      // Join the booster hub room
      socket.on('join-booster-hub', () => {
        socket.join('booster-hub');
        console.log('Booster joined hub room:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Booster disconnected:', socket.id);
      });
    });

    console.log('Socket.IO server initialized');
  }

  return io;
}

export function getIO(): SocketIOServer | undefined {
  return io;
}
