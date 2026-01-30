import React from 'react';
import { AuditLog } from '../../types';
import XIcon from '../icons/XIcon';
import RoleBadge from '../ui/RoleBadge';
import { formatDateTimeToThai } from '../../utils/dateUtils';

interface LogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog;
}

const LogDetailsModal: React.FC<LogDetailsModalProps> = ({ isOpen, onClose, log }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="log-details-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 id="log-details-modal-title" className="text-xl font-bold text-gray-800">รายละเอียด Log - ID: <span className="font-mono">{log.id}</span></h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-md"><strong>Timestamp:</strong><br/>{formatDateTimeToThai(log.timestamp)}</div>
                <div className="bg-gray-50 p-3 rounded-md"><strong>User:</strong><br/>{log.userEmail}</div>
                <div className="bg-gray-50 p-3 rounded-md"><strong>Role:</strong><br/><RoleBadge role={log.userRole} /></div>
                <div className="bg-gray-50 p-3 rounded-md"><strong>Action:</strong><br/>{log.action}</div>
                <div className="bg-gray-50 p-3 rounded-md"><strong>Target ID:</strong><br/>{log.targetId || 'N/A'}</div>
                <div className="bg-gray-50 p-3 rounded-md"><strong>IP Address:</strong><br/>{log.ipAddress}</div>
            </div>

            {log.dataPayload && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Data Payload</h3>
                    <div className="bg-gray-800 text-white p-4 rounded-md text-xs font-mono overflow-x-auto">
                        <pre><code>{JSON.stringify(log.dataPayload, null, 2)}</code></pre>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailsModal;
