const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
    },
  });

  // Function to broadcast booster count
  const broadcastBoosterCount = async () => {
    const sockets = await io.in('booster-hub').fetchSockets();
    const count = sockets.length;
    io.to('booster-hub').emit('booster-count', count);
    console.log('Active boosters in hub:', count);
  };

  io.on('connection', (socket) => {
    console.log('Booster connected:', socket.id);

    socket.on('join-booster-hub', async () => {
      socket.join('booster-hub');
      console.log('Booster joined hub room:', socket.id);

      // Broadcast updated count to all boosters
      await broadcastBoosterCount();
    });

    socket.on('disconnect', async () => {
      console.log('Booster disconnected:', socket.id);

      // Broadcast updated count to remaining boosters
      await broadcastBoosterCount();
    });
  });

  // Make io accessible globally
  global.io = io;

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> Socket.IO server running');
    });
});
