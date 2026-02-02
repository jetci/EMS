import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sqliteDB } from '../db/sqliteDB';

const router = express.Router();

// GET /api/dashboard/admin
router.get('/admin', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const stats = sqliteDB.get<any>(`
      SELECT 
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM drivers) as totalDrivers,
        (SELECT COUNT(*) FROM patients) as totalPatients,
        (SELECT COUNT(*) FROM rides) as totalRides,
        (SELECT COUNT(*) FROM rides WHERE status IN ('ASSIGNED', 'IN_PROGRESS', 'PICKED_UP')) as activeRides,
        (SELECT COUNT(*) FROM rides WHERE status = 'COMPLETED' AND DATE(appointment_time) = DATE('now')) as completedToday,
        (SELECT COUNT(*) FROM rides WHERE status = 'PENDING') as pendingRides,
        (SELECT COUNT(*) FROM users WHERE DATE(date_created) >= DATE('now', '-7 days')) as newUsers
    `);

    const recentLogs = sqliteDB.all<any>(`
      SELECT timestamp as time, user_email as user, user_role as role, action
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    res.json({ ...stats, recentLogs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/executive
router.get('/executive', authenticateToken, requireRole(['EXECUTIVE', 'admin', 'DEVELOPER']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: any[] = [];
    if (startDate || endDate) {
      const start = startDate || '1970-01-01';
      const end = endDate || new Date().toISOString();
      dateFilter = ' WHERE appointment_time BETWEEN ? AND ?';
      params.push(start, end);
    }

    // Monthly Ride Data
    const monthlyData = sqliteDB.all<any>(`
      SELECT 
        strftime('%m', appointment_time) as month,
        COUNT(*) as value
      FROM rides
      ${dateFilter}
      GROUP BY month
      ORDER BY month
    `, params);

    const monthlyRideData = Array(12).fill(0).map((_, idx) => {
      const monthStr = String(idx + 1).padStart(2, '0');
      const found = monthlyData.find(m => m.month === monthStr);
      return {
        label: new Date(0, idx).toLocaleString('th-TH', { month: 'short' }),
        value: found ? found.value : 0
      };
    });

    // Patient Distribution by Village with Colors
    const rawDistribution = sqliteDB.all<any>(`
      SELECT 
        COALESCE(current_village, 'ไม่ระบุ') as label,
        COUNT(*) as value
      FROM patients
      GROUP BY current_village
      ORDER BY value DESC
    `);

    const colors = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const patientDistributionData = rawDistribution.map((item, idx) => ({
      ...item,
      color: colors[idx % colors.length]
    }));

    // Top Trip Types
    const topTripTypesData = sqliteDB.all<any>(`
      SELECT 
        COALESCE(trip_type, 'ทั่วไป') as label,
        COUNT(*) as value
      FROM rides
      ${dateFilter}
      GROUP BY trip_type
      ORDER BY value DESC
      LIMIT 5
    `, params);

    // Stats
    const stats = sqliteDB.get<any>(`
      SELECT 
        COUNT(*) as totalRides,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedRides,
        AVG(CASE WHEN distance_km IS NOT NULL THEN distance_km ELSE 0 END) as avgDistance,
        (SELECT COUNT(*) FROM patients) as totalPatients,
        (SELECT COUNT(*) FROM drivers) as totalDrivers
      FROM rides
      ${dateFilter}
    `, params);

    const efficiency = stats.totalRides > 0 ? Math.round((stats.completedRides / stats.totalRides) * 100) : 0;
    stats.efficiency = efficiency;
    stats.avgDistance = Math.round(stats.avgDistance || 0);

    // Patient Locations
    const patientLocations = sqliteDB.all<any>(`
      SELECT 
        id,
        full_name as name,
        COALESCE(current_village, 'ไม่ระบุ') as village,
        CAST(latitude AS REAL) as lat,
        CAST(longitude AS REAL) as lng,
        patient_types as type
      FROM patients
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `).map(p => {
      let typeLabel = 'ทั่วไป';
      try {
        if (p.type) {
          const parsed = JSON.parse(p.type);
          if (Array.isArray(parsed) && parsed.length > 0) {
            typeLabel = parsed[0];
          } else if (typeof parsed === 'string') {
            typeLabel = parsed;
          }
        }
      } catch (e) {
        // Fallback for non-JSON strings
        typeLabel = p.type || 'ทั่วไป';
      }
      return {
        ...p,
        type: typeLabel
      };
    });

    res.json({
      monthlyRideData,
      patientDistributionData,
      topTripTypesData,
      patientLocations,
      stats
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
