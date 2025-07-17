import React, { useState } from 'react';
import { AlertTriangle, Clock, User, CheckCircle, XCircle, ArrowRight, FileText, Download } from 'lucide-react';
import { FailureAnalysis } from '../types/trade';

interface FailureAnalysisPanelProps {
  failures: FailureAnalysis[];
  onResolve: (tradeId: string) => void;
  onEscalate: (tradeId: string) => void;
}

const FailureAnalysisPanel: React.FC<FailureAnalysisPanelProps> = ({ failures, onResolve, onEscalate }) => {
  const [selectedFailure, setSelectedFailure] = useState<FailureAnalysis | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'escalated'>('all');

  const filteredFailures = failures.filter(failure => {
    if (filter === 'all') return true;
    return failure.status.toLowerCase().replace(' ', '-') === filter;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'text-orange-600 bg-orange-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertTriangle className="h-4 w-4" style={{ color: 'var(--mocha)' }} />;
      case 'In Progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Escalated': return <XCircle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const generateResolutionDocument = (failure: FailureAnalysis) => {
    const doc = {
      tradeId: failure.tradeId,
      failureType: failure.failureType,
      resolution: failure.suggestedSolution,
      timestamp: new Date().toISOString(),
      approvedBy: 'System Administrator'
    };
    
    // In a real application, this would generate and download a PDF
    console.log('Generated resolution document:', doc);
    alert('Resolution document generated and ready for download');
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Failure Analysis & Resolution</h2>
        <div className="flex space-x-2">
          {['all', 'open', 'in-progress', 'escalated'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium capitalize ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Failure List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredFailures.map((failure) => (
            <div
              key={failure.tradeId}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 cursor-pointer transition-all ${
                failure.impact === 'Critical' ? 'border-red-500' :
                failure.impact === 'High' ? 'border-orange-500' :
                failure.impact === 'Medium' ? 'border-yellow-500' :
                'border-green-500'
              } ${selectedFailure?.tradeId === failure.tradeId ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedFailure(failure)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(failure.status)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      Trade {failure.tradeId}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(failure.impact)}`}>
                      {failure.impact} Impact
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {failure.failureType}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reason:</span> {failure.reason}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Assigned to:</span> {failure.assignedTo}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Est. Resolution:</span> {failure.estimatedResolutionTime}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  {failure.status === 'Open' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResolve(failure.tradeId);
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEscalate(failure.tradeId);
                        }}
                        className="px-3 py-1 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700"
                      >
                        Escalate
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateResolutionDocument(failure);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 flex items-center space-x-1"
                  >
                    <Download className="h-3 w-3" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredFailures.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No failures found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'All trades are processing successfully.' : `No ${filter.replace('-', ' ')} failures at this time.`}
              </p>
            </div>
          )}
        </div>

        {/* Detailed View */}
        <div className="space-y-6">
          {selectedFailure ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suggested Solution
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">{selectedFailure.suggestedSolution}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution Steps
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Identify root cause</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Contact relevant parties</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Implement corrective action</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-400">Verify resolution</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeline
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-sm text-gray-600">
                      Created: {new Date(selectedFailure.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expected Resolution: {selectedFailure.estimatedResolutionTime}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Generate Resolution Report</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Failure</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a failure from the list to view detailed resolution information.
                </p>
              </div>
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Failures</span>
                <span className="text-sm font-medium text-gray-900">{failures.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Open</span>
                <span className="text-sm font-medium text-red-600">
                  {failures.filter(f => f.status === 'Open').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-medium text-yellow-600">
                  {failures.filter(f => f.status === 'In Progress').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Resolved</span>
                <span className="text-sm font-medium text-green-600">
                  {failures.filter(f => f.status === 'Resolved').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailureAnalysisPanel;