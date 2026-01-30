import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import IndividualShiftCalendar from '../components/schedules/IndividualShiftCalendar';
import TeamShiftCalendar from '../components/schedules/TeamShiftCalendar';
import { driversAPI, teamsAPI, apiRequest } from '../services/api';

type SchedulingModel = 'individual' | 'team';

const ManageSchedulePage: React.FC = () => {
    // Read from localStorage or default to 'individual'
    const savedModel = (localStorage.getItem('wecare_schedulingModel') as SchedulingModel) || 'individual';
    const [schedulingModel, setSchedulingModel] = useState<SchedulingModel>(savedModel);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const [driversData, teamsData, vehiclesData] = await Promise.all([
                driversAPI.getDrivers(),
                teamsAPI.getTeams(),
                apiRequest('/vehicles'),
            ]);
            setDrivers(Array.isArray(driversData) ? driversData : (driversData?.drivers || []));
            setTeams(Array.isArray(teamsData) ? teamsData : (teamsData?.teams || []));
            setVehicles(Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData?.vehicles || []));
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleModelChange = (isChecked: boolean) => {
        const newModel = isChecked ? 'team' : 'individual';
        setSchedulingModel(newModel);
        localStorage.setItem('wecare_schedulingModel', newModel);
    };


    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">จัดการตารางเวร</h1>
                    <p className="mt-1 text-gray-600">กำหนดตารางเวรสำหรับคนขับหรือทีม</p>
                </div>
                {/* This toggle simulates the system setting for demonstration purposes */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
                    <span className={`font-semibold ${schedulingModel === 'individual' ? 'text-[#005A9C]' : 'text-gray-500'}`}>รายบุคคล</span>
                    <ToggleSwitch
                        name="schedulingModelToggle"
                        checked={schedulingModel === 'team'}
                        onChange={handleModelChange}
                    />
                    <span className={`font-semibold ${schedulingModel === 'team' ? 'text-[#005A9C]' : 'text-gray-500'}`}>แบบชุดเวร</span>
                </div>
            </div>

            {/* Conditional Rendering based on the model */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
                </div>
            ) : schedulingModel === 'individual' ? (
                <IndividualShiftCalendar drivers={drivers} />
            ) : (
                <TeamShiftCalendar teams={teams} vehicles={vehicles} />
            )}
        </div>
    );
};

export default ManageSchedulePage;
