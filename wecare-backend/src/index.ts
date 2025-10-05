import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import driverRoutes from './routes/drivers';
import rideRoutes from './routes/rides';
import userRoutes from './routes/users';
import teamRoutes from './routes/teams';
import vehicleRoutes from './routes/vehicles';
import vehicleTypeRoutes from './routes/vehicle-types';
import newsRoutes from './routes/news';
import auditLogRoutes from './routes/audit-logs';
import dashboardRoutes from './routes/dashboard';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('EMS WeCare Backend is running!'));
app.use('/api', authRoutes);
// Protected routes
app.use('/api/patients', patientRoutes);
app.use('/api/office/patients', patientRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/rides', authenticateToken, rideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicle-types', vehicleTypeRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
