import React from 'react';
import { FileText, Users, Clock, CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { QueueMetrics } from '../types/trade';

interface QueueManagementProps {
  metrics: QueueMetrics;
  onQueueClick: (queueType: string) => void;
}

const QueueManagement: React.FC<QueueManagementProps> = ({ metrics, onQueueClick }) => {
  const queueItems = [
    {
      name: 'Drafting Queue',
      count: metrics.drafting,
      icon: FileText,
      color: 'bg-blue-100 text-blue-800',
      iconColor: 'text-blue-600',
      key: 'drafting'
    },
    {
      name: 'Matching Queue',
      count: metrics.matching,
      icon: Users,
      color: 'bg-yellow-100 text-yellow-800',
      iconColor: 'text-yellow-600',
      key: 'matching'
    },
    {
      name: 'Pending Approvals',
      count: metrics.pendingApprovals,
      icon: Clock,
      color: 'bg-orange-100 text-orange-800',
      iconColor: 'text-orange-600',
      key: 'pending-approvals'
    },
    {
      name: 'CCNR (Complete)',
      count: metrics.ccnr,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      iconColor: 'text-green-600',
      key: 'ccnr'
    }
  ];

  const signatureItems = [
    {
      name: 'Pending Single Sign',
      count: metrics.pendingSingleSign,
      icon: FileText,
      color: 'bg-purple-100 text-purple-800',
      iconColor: 'text-purple-600',
      key: 'single-sign'
    },
    {
      name: 'Pending Double Sign',
      count: metrics.pendingDoubleSign,
      icon: Users,
      color: 'bg-indigo-100 text-indigo-800',
      iconColor: 'text-indigo-600',
      key: 'double-sign'
    },
    {
      name: 'Documents Not Sent',
      count: metrics.documentsNotSent,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-800',
      iconColor: 'text-red-600',
      key: 'not-sent'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Queues */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 text-blue-600 mr-2" />
          Workflow Management Queues
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {queueItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                onClick={() => onQueueClick(item.key)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-6 w-6 ${item.iconColor}`} />
                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.color}`}>
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Signature Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 text-purple-600 mr-2" />
          Document Signature Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {signatureItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                onClick={() => onQueueClick(item.key)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-6 w-6 ${item.iconColor}`} />
                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.color}`}>
                    {item.count > 0 ? 'Pending' : 'Clear'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;