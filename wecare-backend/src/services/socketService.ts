import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { UserRole } from '../middleware/roleProtection';

interface SocketUser {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
}

declare module 'socket.io' {
    interface Socket {
        user?: SocketUser;
    }
}

class SocketService {
    private static instance: SocketService;
    private io: SocketIOServer | null = null;
    private readonly ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public initialize(httpServer: HttpServer): SocketIOServer {
        if (this.io) {
            return this.io;
        }

        console.log('🔌 Initializing WebSocket Service...');

        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: this.ALLOWED_ORIGINS,
                methods: ['GET', 'POST'],
                credentials: true
            },
            pingTimeout: 60000,
            pingInterval: 25000,
            transports: ['websocket', 'polling'] // Prefer websocket
        });

        // Authentication Middleware
        this.io.use(this.authenticateSocket);

        // Connection Handler
        this.io.on('connection', (socket) => this.handleConnection(socket));

        console.log('✅ WebSocket Service Initialized');
        return this.io;
    }

    public getIO(): SocketIOServer {
        if (!this.io) {
            throw new Error('Socket.io not initialized!');
        }
        return this.io;
    }

    private authenticateSocket = (socket: Socket, next: (err?: any) => void) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
            console.warn(`🛑 Socket connection rejected: No token provided (${socket.id})`);
            return next(new Error('Authentication error: Token required'));
        }

        try {
            const secret = process.env.JWT_SECRET || 'your-secret-key';
            const decoded = jwt.verify(token, secret) as any;
            socket.user = {
                id: decoded.userId || decoded.id, // Support both userId and id
                email: decoded.email,
                role: decoded.role,
                ...decoded
            };
            next();
        } catch (err) {
            console.warn(`🛑 Socket connection rejected: Invalid token (${socket.id})`);
            next(new Error('Authentication error: Invalid token'));
        }
    };

    private handleConnection(socket: Socket) {
        const user = socket.user!;
        console.log(`🔌 Client connected: ${user.email} (${user.role}) [ID: ${socket.id}]`);

        // Join default rooms
        this.joinDefaultRooms(socket, user);

        // Event Handlers
        socket.on('location:update', (data) => this.handleLocationUpdate(socket, data));
        socket.on('driver:status', (data) => this.handleDriverStatusUpdate(socket, data));

        socket.on('disconnect', (reason) => {
            console.log(`❌ Client disconnected: ${user.email} (${socket.id}) Reason: ${reason}`);
        });

        socket.on('error', (error) => {
            console.error(`⚠️ Socket error from ${user.email}:`, error);
        });
    }

    private joinDefaultRooms(socket: Socket, user: SocketUser) {
        // 1. Join user-specific room (e.g., 'user:123')
        const userRoom = `user:${user.id}`;
        socket.join(userRoom);
        console.log(`📥 ${user.email} joined room: ${userRoom}`);

        // 2. Join role-specific room (e.g., 'role:DRIVER')
        // Normalize role case
        const roleName = user.role.toUpperCase();
        const roleRoom = `role:${roleName}`;
        socket.join(roleRoom);
        console.log(`📥 ${user.email} joined room: ${roleRoom}`);

        // 3. Operational Room (for monitoring)
        const operationalRoles = [
            UserRole.ADMIN,
            UserRole.OFFICER,
            UserRole.RADIO_CENTER,
            UserRole.DEVELOPER,
            UserRole.EXECUTIVE
        ];

        // Check if user role matches any operational role (case-insensitive)
        // Note: roleName is already uppercased above
        const isOperational = operationalRoles.some(r => r.toUpperCase() === roleName);

        if (isOperational) {
            socket.join('room:operations');
            console.log(`📥 ${user.email} joined room: room:operations`);
        }
    }

    private handleLocationUpdate(socket: Socket, data: any) {
        const user = socket.user!;

        // Security check
        if (user.role.toUpperCase() !== UserRole.DRIVER && user.role !== 'driver') {
            socket.emit('error', { message: 'Unauthorized: Only drivers can update location' });
            return;
        }

        // Validate Payload
        if (!this.validateCoordinates(data.lat, data.lng)) {
            socket.emit('error', { message: 'Invalid coordinates' });
            return;
        }

        // Broadcast to Operational Room (Admins, Officers)
        // AND to specific tracking room if needed (future feature: room:ride:{rideId})
        this.io?.to('room:operations').emit('location:updated', {
            driverId: user.id,
            driverEmail: user.email,
            lat: Number(data.lat),
            lng: Number(data.lng),
            status: data.status || 'AVAILABLE',
            timestamp: new Date().toISOString()
        });

        // Also echo back to the driver for confirmation (optional)
        // socket.emit('location:ack', { timestamp: new Date().toISOString() });
    }

    private handleDriverStatusUpdate(socket: Socket, data: any) {
        const user = socket.user!;

        if (user.role.toUpperCase() !== UserRole.DRIVER && user.role !== 'driver') {
            socket.emit('error', { message: 'Unauthorized: Only drivers can update status' });
            return;
        }

        // Broadcast status change
        this.io?.to('room:operations').emit('driver:status:updated', {
            driverId: user.id,
            driverEmail: user.email,
            status: data.status,
            timestamp: new Date().toISOString()
        });
    }

    private validateCoordinates(lat: any, lng: any): boolean {
        const latitude = Number(lat);
        const longitude = Number(lng);

        return (
            !Number.isNaN(latitude) &&
            !Number.isNaN(longitude) &&
            Number.isFinite(latitude) &&
            Number.isFinite(longitude) &&
            latitude >= -90 && latitude <= 90 &&
            longitude >= -180 && longitude <= 180
        );
    }
}

export default SocketService.getInstance();
