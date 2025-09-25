import React, { useState } from 'react';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import IndividualShiftCalendar from '../components/schedules/IndividualShiftCalendar';
import TeamShiftCalendar from '../components/schedules/TeamShiftCalendar';
import { appData } from '../data/mockData';

type SchedulingModel = 'individual' | 'team';

const ManageSchedulePage: React.FC = () => {
    const [schedulingModel, setSchedulingModel] = useState<SchedulingModel>(appData.systemSettings.schedulingModel);

    const handleModelChange = (isChecked: boolean) => {
        const newModel = isChecked ? 'team' : 'individual';
        setSchedulingModel(newModel);
        // Update the centralized "persistent" state
        appData.systemSettings.schedulingModel = newModel;
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
            {schedulingModel === 'individual' ? (
                <IndividualShiftCalendar />
            ) : (
                <TeamShiftCalendar />
            )}
        </div>
    );
};

export default ManageSchedulePage;