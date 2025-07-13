import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Filter,
  Search,
  Calendar,
  User,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { FailureAnalysis } from '../types/trade';

interface BreakAnalysisReportProps {
  failures: FailureAnalysis[];
  onResolve: (tradeId: string) => void;
  onEscalate: (tradeId: string) => void;
}

const BreakAnalysisReport: React.FC<BreakAnalysisReportProps> = ({ failures, onResolve, onEscalate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'escalated'>('all');
  const [impactFilter, setImpactFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [breakTypeFilter, setBreakTypeFilter] = useState<'all' | 'economic' | 'non-economic'>('all');

  const filteredFailures = failures.filter(failure => {
    const matchesSearch = failure.tradeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         failure.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         failure.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || failure.status.toLowerCase().replace(' ', '-') === statusFilter;
    const matchesImpact = impactFilter === 'all' || failure.impact.toLowerCase() === impactFilter;
    const matchesBreakType = breakTypeFilter === 'all' || failure.breakType.toLowerCase().replace('-', '') === breakTypeFilter.replace('-', '');
    
    return matchesSearch && matchesStatus && matchesImpact && matchesBreakType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Escalated':
        return <XCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      Critical: 'bg-red-100 text-red-800 border-red-200',
      High: 'bg-orange-100 text-orange-800 border-orange-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Low: 'bg-green-100 text-green-800 border-green-200'
    };
    return `px-2 py-1 text-xs font-medium rounded-md border ${colors[impact as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
  };

  const getBreakTypeBadge = (breakType: string) => {
    return breakType === 'Economic' 
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Open': 'bg-red-100 text-red-800 border-red-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Resolved': 'bg-green-100 text-green-800 border-green-200',
      'Escalated': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return `px-2 py-1 text-xs font-medium rounded-md border ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
  };

  const getSummaryStats = () => {
    const total = failures.length;
    const open = failures.filter(f => f.status === 'Open').length;
    const inProgress = failures.filter(f => f.status === 'In Progress').length;
    const resolved = failures.filter(f => f.status === 'Resolved').length;
    const critical = failures.filter(f => f.impact === 'Critical').length;
    const economic = failures.filter(f => f.breakType === 'Economic').length;
    
    return { total, open, inProgress, resolved, critical, economic };
  };

  const stats = getSummaryStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Break Analysis Report
            </h2>
            <p className="text-gray-600 mt-1">Comprehensive analysis of trade breaks and resolution status</p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Breaks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Open</p>
                <p className="text-2xl font-bold text-red-900">{stats.open}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
              </div>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
              </div>
              <Target className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Economic</p>
                <p className="text-2xl font-bold text-blue-900">{stats.economic}</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Trade ID, reason, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
          <select
            value={impactFilter}
            onChange={(e) => setImpactFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Impact</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={breakTypeFilter}
            onChange={(e) => setBreakTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="economic">Economic</option>
            <option value="non-economic">Non-Economic</option>
          </select>
        </div>
      </div>

      {/* Break Analysis Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trade ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Break Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending With
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Resolution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFailures.map((failure) => (
                <tr key={failure.tradeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{failure.tradeId}</div>
                    <div className="text-sm text-gray-500">{failure.breakClassification}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getBreakTypeBadge(failure.breakType)}`}>
                      {failure.breakType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(failure.status)}
                      <span className={`ml-2 ${getStatusBadge(failure.status)}`}>
                        {failure.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getImpactBadge(failure.impact)}>
                      {failure.impact}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={failure.reason}>
                      {failure.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{failure.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{failure.pendingWith}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{failure.estimatedResolutionTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {failure.status === 'Open' && (
                        <button
                          onClick={() => onResolve(failure.tradeId)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Resolve
                        </button>
                      )}
                      {failure.status !== 'Escalated' && (
                        <button
                          onClick={() => onEscalate(failure.tradeId)}
                          className="text-orange-600 hover:text-orange-800 font-medium"
                        >
                          Escalate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BreakAnalysisReport;