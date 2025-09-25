import React from 'react';
import dayjs from 'dayjs';
import { Ride } from '../../types';

interface ScheduleTimelineProps {
  rides: Ride[];
}

const START_HOUR = 8;
const END_HOUR = 18;
const TOTAL_HOURS = END_HOUR - START_HOUR;

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ rides }) => {
  const timeSlots = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  // Lane placement logic
  const getRideLanes = (ridesForTimeline: Ride[]) => {
    if (!ridesForTimeline || ridesForTimeline.length === 0) return [];
    
    const sortedRides = [...ridesForTimeline].sort((a, b) =>
      dayjs(a.appointmentTime).diff(dayjs(b.appointmentTime))
    );

    const lanes: Ride[][] = [];

    sortedRides.forEach(ride => {
      let placed = false;
      for (const lane of lanes) {
        const lastRideInLane = lane[lane.length - 1];
        const rideStartTime = dayjs(ride.appointmentTime);
        // Assuming each ride is 1 hour long for collision detection
        const lastRideEndTime = dayjs(lastRideInLane.appointmentTime).add(1, 'hour');
        
        if (!rideStartTime.isBefore(lastRideEndTime)) {
          lane.push(ride);
          placed = true;
          break;
        }
      }
      if (!placed) {
        // Create a new lane
        lanes.push([ride]);
      }
    });

    return lanes;
  };
  
  const rideLanes = getRideLanes(rides);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">ตารางเวลาการเดินทางวันนี้</h2>
      <div className="relative">
        {/* Time markers and grid lines */}
        <div className="flex h-8 border-b border-gray-200">
          {timeSlots.slice(0, -1).map(hour => (
            <div key={hour} className="flex-1 border-r border-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-500">{`${String(hour).padStart(2, '0')}:00`}</span>
            </div>
          ))}
        </div>
        
        {/* Ride blocks container */}
        <div className="relative mt-2 space-y-1 min-h-[5rem]">
            {rideLanes.map((lane, laneIndex) => (
                 <div key={laneIndex} className="relative h-12">
                    {lane.map(ride => {
                        const appointment = dayjs(ride.appointmentTime);
                        // Skip rendering if outside the timeline view
                        if (appointment.hour() < START_HOUR || appointment.hour() >= END_HOUR) {
                            return null;
                        }

                        const startMinutes = appointment.hour() * 60 + appointment.minute();
                        const startOffsetMinutes = START_HOUR * 60;
                        const totalMinutesInTimeline = TOTAL_HOURS * 60;

                        const leftPercent = ((startMinutes - startOffsetMinutes) / totalMinutesInTimeline) * 100;
                        const widthPercent = (60 / totalMinutesInTimeline) * 100; // 1 hour block

                        return (
                            <div
                                key={ride.id}
                                className="absolute top-0 h-full bg-blue-100 border-l-4 border-blue-500 rounded-r-lg p-2 flex items-center shadow-sm hover:z-10 hover:scale-105 transition-transform duration-200"
                                style={{
                                    left: `calc(${leftPercent}% + 2px)`,
                                    width: `calc(${widthPercent}% - 4px)`,
                                }}
                                title={`${ride.patientName} @ ${appointment.format('HH:mm')}`}
                            >
                                <div className="truncate text-xs w-full">
                                    <p className="font-bold text-blue-800">{ride.patientName}</p>
                                    <p className="text-blue-600">{appointment.format('HH:mm')} - {appointment.add(1, 'hour').format('HH:mm')}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
             {rides.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    ไม่มีการเดินทางที่จ่ายงานแล้วสำหรับวันนี้
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleTimeline;
