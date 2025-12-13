import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_APP_URL || ''
      : 'http://localhost:3000';

    socketRef.current = io(socketUrl, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const joinBoosterHub = () => {
    if (socketRef.current) {
      socketRef.current.emit('join-booster-hub');
    }
  };

  const onJobUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('job-update', callback);
    }
  };

  const onJobAccepted = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('job-accepted', callback);
    }
  };

  const onNewJob = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-job', callback);
    }
  };

  const offJobUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off('job-update', callback);
    }
  };

  const offJobAccepted = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off('job-accepted', callback);
    }
  };

  const offNewJob = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off('new-job', callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinBoosterHub,
    onJobUpdate,
    onJobAccepted,
    onNewJob,
    offJobUpdate,
    offJobAccepted,
    offNewJob,
  };
}
