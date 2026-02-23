import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { db } from '../db';

const router = express.Router();

// GET /api/dashboard/admin
router.get('/admin', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const stats = await db.get<any>(`
      SELECT 
        (SELECT COUNT(*) FROM users) as "totalUsers",
        (SELECT COUNT(*) FROM drivers) as "totalDrivers",
        (SELECT COUNT(*) FROM patients) as "totalPatients",
        (SELECT COUNT(*) FROM rides) as "totalRides",
        (SELECT COUNT(*) FROM rides WHERE status IN ('ASSIGNED', 'IN_PROGRESS', 'PICKED_UP')) as "activeRides",
        (SELECT COUNT(*) FROM rides WHERE status = 'COMPLETED' AND DATE(appointment_time) = CURRENT_DATE) as "completedToday",
        (SELECT COUNT(*) FROM rides WHERE status = 'PENDING') as "pendingRides",
        (SELECT COUNT(*) FROM users WHERE DATE(date_created) >= CURRENT_DATE - INTERVAL '7 days') as "newUsers"
    `);

    const recentLogs = await db.all<any>(`
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

    const whereClauses: string[] = ['appointment_time IS NOT NULL AND appointment_time <> \'\''];
    const params: any[] = [];
    if (startDate || endDate) {
      const start = startDate || '1970-01-01';
      const end = endDate || new Date().toISOString();
      whereClauses.push('appointment_time::timestamp BETWEEN $1 AND $2');
      params.push(start, end);
    }
    const dateFilter = whereClauses.length ? ` WHERE ${whereClauses.join(' AND ')}` : '';

    // Monthly Ride Data
    const monthlyData = await db.all<any>(`
      SELECT 
        TO_CHAR(appointment_time::timestamp, 'MM') as month,
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
    const rawDistribution = await db.all<any>(`
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

    // Volunteer Distribution by Tambon/Village (derived from patients created by community volunteers)
    const rawVolunteerDistribution = await db.all<any>(`
      SELECT 
        COALESCE(NULLIF(TRIM(p.current_tambon), ''), 'เวียง') as tambon,
        COALESCE(p.current_village, 'ไม่ระบุหมู่บ้าน') as village,
        COUNT(DISTINCT u.id) as value
      FROM users u
      JOIN patients p ON p.created_by = u.id
      WHERE u.role = 'community'
        AND p.deleted_at IS NULL
      GROUP BY p.current_tambon, p.current_village
      ORDER BY value DESC
    `);

    const volunteerDistributionData = rawVolunteerDistribution.map((item, idx) => ({
      label: `${item.tambon} - ${item.village}`,
      value: item.value,
      color: colors[idx % colors.length]
    }));

    // Top Trip Types
    const rawTopTripTypes = await db.all<any>(`
      SELECT 
        COALESCE(trip_type, 'ทั่วไป') as label,
        COUNT(*) as value
      FROM rides
      ${dateFilter}
      GROUP BY trip_type
      ORDER BY value DESC
      LIMIT 5
    `, params);

    const topTripTypesData = rawTopTripTypes.map((item, idx) => ({
      ...item,
      color: colors[idx % colors.length]
    }));

    // Stats with basic trend window (last 30 days vs previous 30 days)
    const stats = await db.get<any>(`
      SELECT 
        COUNT(*) as "totalRides",
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as "completedRides",
        AVG(CASE WHEN distance_km IS NOT NULL THEN distance_km ELSE 0 END) as "avgDistance",
        (SELECT COUNT(*) FROM patients WHERE deleted_at IS NULL) as "totalPatients",
        (SELECT COUNT(*) FROM drivers) as "totalDrivers"
      FROM rides
      ${dateFilter}
    `, params);

    const efficiency = stats.totalRides > 0 ? Math.round((stats.completedRides / stats.totalRides) * 100) : 0;
    stats.efficiency = efficiency;
    stats.avgDistance = Math.round(stats.avgDistance || 0);

    const trendWindowDays = 30;
    const trendStats = await db.get<any>(`
      WITH current_period AS (
        SELECT 
          COUNT(*) AS rides,
          COUNT(DISTINCT patient_id) AS patients
        FROM rides
        WHERE appointment_time::date >= CURRENT_DATE - INTERVAL '${trendWindowDays} days'
      ),
      previous_period AS (
        SELECT 
          COUNT(*) AS rides,
          COUNT(DISTINCT patient_id) AS patients
        FROM rides
        WHERE appointment_time::date >= CURRENT_DATE - INTERVAL '${trendWindowDays * 2} days'
          AND appointment_time::date < CURRENT_DATE - INTERVAL '${trendWindowDays} days'
      )
      SELECT
        current_period.rides AS "currentRides",
        previous_period.rides AS "previousRides",
        current_period.patients AS "currentPatients",
        previous_period.patients AS "previousPatients"
      FROM current_period, previous_period
    `);

    const calcTrend = (current: number, previous: number) => {
      if (!previous || previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Math.round(((current - previous) / previous) * 100);
    };

    stats.ridesTrend = calcTrend(trendStats.currentRides || 0, trendStats.previousRides || 0);
    stats.patientsTrend = calcTrend(trendStats.currentPatients || 0, trendStats.previousPatients || 0);

    // Patient Locations
    const rawPatientLocations = await db.all<any>(`
      SELECT 
        id,
        full_name as name,
        COALESCE(current_village, 'ไม่ระบุ') as village,
        CAST(latitude AS REAL) as lat,
        CAST(longitude AS REAL) as lng,
        patient_types as type
      FROM patients
      WHERE deleted_at IS NULL
        AND latitude IS NOT NULL AND longitude IS NOT NULL
    `);

    const patientLocations = rawPatientLocations.map((p: any) => {
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
      volunteerDistributionData,
      topTripTypesData,
      patientLocations,
      stats
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
