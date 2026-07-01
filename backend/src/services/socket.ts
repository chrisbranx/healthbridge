import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function initSocketIO(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Auth required'));
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`Socket connected: ${user?.userId} (${user?.role})`);

    socket.join(`user:${user?.userId}`);
    if (user?.role === 'doctor') socket.join('doctors');
    if (user?.role === 'chw') socket.join('chws');
    if (user?.role === 'patient') socket.join('patients');

    socket.on('join-consultation', (consultationId: string) => {
      socket.join(`consultation:${consultationId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${user?.userId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function emitToUser(userId: string, event: string, data: any) {
  if (io) io.to(`user:${userId}`).emit(event, data);
}

export function emitToDoctors(event: string, data: any) {
  if (io) io.to('doctors').emit(event, data);
}

export function emitToChws(event: string, data: any) {
  if (io) io.to('chws').emit(event, data);
}

export function emitToConsultation(consultationId: string, event: string, data: any) {
  if (io) io.to(`consultation:${consultationId}`).emit(event, data);
}
