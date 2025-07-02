import React from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { SystemConnectivity } from '../types/trade';

interface SystemConnectivityProps {
  connectivity: SystemConnectivity;
  onRefresh: () => void;
}

const SystemConnectivityComponent: React.FC<SystemConnectivityProps> = ({ connectivity, onRefresh }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'Error':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected':
        return 'bg-green-100 text-green-800';
      case 'Disconnected':
        return 'bg-red-100 text-red-800';
      case 'Error':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const systems = [
    { name: 'Booking System', status: connectivity.bookingSystem, key: 'bookingSystem' },
    { name: 'Confirmation System', status: connectivity.confirmationSystem, key: 'confirmationSystem' },
    { name: 'SWIFT System', status: connectivity.swiftSystem, key: 'swiftSystem' },
    { name: 'Middle Office Service', status: connectivity.middleOfficeService, key: 'middleOfficeService' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Wifi className="h-5 w-5 text-blue-600 mr-2" />
          System Connectivity
        </h3>
        <button
          onClick={onRefresh}
          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systems.map((system) => (
          <div key={system.key} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(system.status)}
              <span className="font-medium text-gray-900">{system.name}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system.status)}`}>
              {system.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Last Sync: {new Date(connectivity.lastSync).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default SystemConnectivityComponent;