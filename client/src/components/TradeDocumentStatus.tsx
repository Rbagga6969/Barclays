import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Download,
  User,
  Shield,
  FileCheck
} from 'lucide-react';
import { EquityTrade, FXTrade, DocumentStatus, DocumentInfo } from '../types/trade';

interface TradeDocumentStatusProps {
  equityTrades: EquityTrade[];
  fxTrades: FXTrade[];
  documentStatuses: Record<string, DocumentStatus>;
  onDocumentUpdate: (tradeId: string, documentType: string, updates: Partial<DocumentInfo>) => void;
}

const TradeDocumentStatus: React.FC<TradeDocumentStatusProps> = ({ 
  equityTrades, 
  fxTrades, 
  documentStatuses,
  onDocumentUpdate 
}) => {
  const [selectedTrade, setSelectedTrade] = useState<EquityTrade | FXTrade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'pending' | 'missing'>('all');

  const allTrades = [...equityTrades, ...fxTrades];

  const getDocumentCompletionStatus = (tradeId: string): string => {
    const docStatus = documentStatuses[tradeId];
    if (!docStatus) return 'missing';
    
    const docs = Object.values(docStatus);
    const completeCount = docs.filter(doc => 
      doc.submitted && doc.clientSigned && doc.bankSigned && doc.qaStatus === 'Approved'
    ).length;
    
    if (completeCount === docs.length) return 'complete';
    if (completeCount === 0) return 'missing';
    return 'pending';
  };

  const filteredTrades = allTrades.filter(trade => {
    const matchesSearch = trade.tradeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.counterparty.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (statusFilter === 'all') return true;
    
    const status = getDocumentCompletionStatus(trade.tradeId);
    return status === statusFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'missing':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'pending':
        return 'Pending';
      case 'missing':
        return 'Missing';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDocumentDetail = (doc: DocumentInfo, docType: string) => {
    const getDocumentIcon = (doc: DocumentInfo) => {
      if (doc.submitted && doc.clientSigned && doc.bankSigned && doc.qaStatus === 'Approved') {
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      } else if (doc.submitted) {
        return <Clock className="w-5 h-5 text-yellow-500" />;
      } else {
        return <XCircle className="w-5 h-5 text-red-500" />;
      }
    };

    const getStatusBadge = (status: string | undefined, type: string) => {
      const colorMap = {
        'Approved': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Created': 'bg-blue-100 text-blue-800',
        'Reviewed': 'bg-purple-100 text-purple-800',
        'Rejected': 'bg-red-100 text-red-800',
        'In Review': 'bg-orange-100 text-orange-800'
      };
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${colorMap[status || 'Pending'] || 'bg-gray-100 text-gray-800'}`}>
          {type}: {status || 'Pending'}
        </span>
      );
    };

    return (
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getDocumentIcon(doc)}
            <h4 className="font-medium text-gray-900 capitalize">
              {docType.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-blue-600 hover:text-blue-800">
              <Eye className="w-4 h-4" />
            </button>
            <button className="text-green-600 hover:text-green-800">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Submitted: {doc.submitted ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Client Signed: {doc.clientSigned ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Bank Signed: {doc.bankSigned ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">Version:</span> {doc.version}
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Signature Type:</span> {doc.signatureType || 'Single'}
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Sent to Client:</span> {doc.sentToClient ? 'Yes' : 'No'}
            </div>
          </div>
          
          <div className="space-y-2">
            {getStatusBadge(doc.makerStatus, 'Maker')}
            {getStatusBadge(doc.checkerStatus, 'Checker')}
            {getStatusBadge(doc.qaStatus, 'QA')}
          </div>
        </div>
        
        {doc.timestamp && (
          <div className="text-xs text-gray-500 mt-2">
            Last updated: {new Date(doc.timestamp).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Trade Document Status</h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="pending">Pending</option>
              <option value="missing">Missing</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trade ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Counterparty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trade Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrades.map((trade) => {
                const status = getDocumentCompletionStatus(trade.tradeId);
                const isEquity = 'orderId' in trade;
                
                return (
                  <tr key={trade.tradeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trade.tradeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isEquity ? 'Equity' : 'FX'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trade.counterparty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trade.tradeDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedTrade(trade)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTrade && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Document Details - Trade {selectedTrade.tradeId}
            </h3>
            <button
              onClick={() => setSelectedTrade(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Trade Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Trade ID:</span> {selectedTrade.tradeId}
              </div>
              <div>
                <span className="text-gray-600">Type:</span> {'orderId' in selectedTrade ? 'Equity' : 'FX'}
              </div>
              <div>
                <span className="text-gray-600">Counterparty:</span> {selectedTrade.counterparty}
              </div>
              <div>
                <span className="text-gray-600">Trade Date:</span> {selectedTrade.tradeDate}
              </div>
              <div>
                <span className="text-gray-600">Status:</span> {selectedTrade.confirmationStatus}
              </div>
              <div>
                <span className="text-gray-600">Risk Level:</span> {selectedTrade.riskLevel || 'N/A'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-4">Document Status Details</h4>
            {documentStatuses[selectedTrade.tradeId] && Object.entries(documentStatuses[selectedTrade.tradeId]).map(([docType, doc]) => (
              <div key={docType}>
                {renderDocumentDetail(doc, docType)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeDocumentStatus;