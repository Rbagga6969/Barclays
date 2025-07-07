import React, { useState } from 'react';
import { AlertTriangle, Clock, User, CheckCircle, FileText, Building, Users, ArrowRight } from 'lucide-react';
import { FailureAnalysis } from '../types/trade';

interface EnhancedFailureAnalysisPanelProps {
  failures: FailureAnalysis[];
  onResolve: (tradeId: string) => void;
}

const EnhancedFailureAnalysisPanel: React.FC<EnhancedFailureAnalysisPanelProps> = ({ 
  failures, 
  onResolve
}) => {
  const [selectedFailure, setSelectedFailure] = useState<FailureAnalysis | null>(null);
  const [filter, setFilter] = useState<'all' | 'economic' | 'non-economic' | 'open' | 'in-progress'>('all');

  const filteredFailures = failures.filter(failure => {
    if (filter === 'all') return true;
    if (filter === 'economic') return failure.breakType === 'Economic';
    if (filter === 'non-economic') return failure.breakType === 'Non-Economic';
    return failure.status.toLowerCase().replace(' ', '-') === filter;
  });

  const getBreakTypeColor = (breakType: string) => {
    switch (breakType) {
      case 'Economic': return 'text-red-600 bg-red-100';
      case 'Non-Economic': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPendingWithIcon = (pendingWith: string) => {
    switch (pendingWith) {
      case 'Legal': return <Building className="h-4 w-4" />;
      case 'Middle Office': return <Users className="h-4 w-4" />;
      case 'Client': return <User className="h-4 w-4" />;
      case 'Front Office': return <Building className="h-4 w-4" />;
      case 'Trading Sales': return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleResolve = (tradeId: string) => {
    onResolve(tradeId);
    const resolvedFailure = failures.find(f => f.tradeId === tradeId);
    if (resolvedFailure) {
      alert(`Trade ${tradeId} has been marked as resolved. The issue "${resolvedFailure.reason}" has been successfully addressed.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Enhanced Break Management & Resolution</h2>
        <div className="flex space-x-2">
          {['all', 'economic', 'non-economic', 'open', 'in-progress'].map((status) => (
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
        {/* Enhanced Failure List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredFailures.map((failure) => (
            <div
              key={failure.tradeId}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 cursor-pointer transition-all ${
                failure.breakType === 'Economic' ? 'border-red-500' : 'border-orange-500'
              } ${selectedFailure?.tradeId === failure.tradeId ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedFailure(failure)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Trade {failure.tradeId}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBreakTypeColor(failure.breakType)}`}>
                      {failure.breakType} Break
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Classification:</span> {failure.breakClassification}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Reason:</span> {failure.reason}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Impact:</span> {failure.impact}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-600 mb-1">
                        {getPendingWithIcon(failure.pendingWith)}
                        <span className="font-medium ml-1">Pending With:</span> {failure.pendingWith}
                      </div>
                      <p className="text-gray-600">
                        <span className="font-medium">Next Action Owner:</span> {failure.nextActionOwner}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Est. Resolution:</span> {failure.estimatedResolutionTime}
                      </p>
                    </div>
                  </div>

                  {/* Action Fields */}
                  {(failure.actionFields.economicBreak || failure.actionFields.nonEconomicBreak) && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Action Fields:</h4>
                      {failure.actionFields.economicBreak && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Economic:</span> {failure.actionFields.economicBreak}
                        </p>
                      )}
                      {failure.actionFields.nonEconomicBreak && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Non-Economic:</span> {failure.actionFields.nonEconomicBreak}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2">
                  {failure.status === 'Open' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolve(failure.tradeId);
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                  {failure.status === 'Resolved' && (
                    <div className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded-md flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Resolved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredFailures.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No breaks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'All trades are processing successfully.' : `No ${filter.replace('-', ' ')} breaks at this time.`}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Detailed View */}
        <div className="space-y-6">
          {selectedFailure ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Break Analysis Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Break Classification
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800 font-medium">{selectedFailure.breakClassification}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Status & Ownership
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <span className="text-sm font-medium">Pending With:</span>
                        <div className="flex items-center">
                          {getPendingWithIcon(selectedFailure.pendingWith)}
                          <span className="ml-1 text-sm">{selectedFailure.pendingWith}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <span className="text-sm font-medium">Next Action Owner:</span>
                        <span className="text-sm">{selectedFailure.nextActionOwner}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suggested Solution
                    </label>
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-sm text-green-800">{selectedFailure.suggestedSolution}</p>
                    </div>
                  </div>

                  {/* Enhanced Action Fields */}
                  {(selectedFailure.actionFields.economicBreak || selectedFailure.actionFields.nonEconomicBreak) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specific Action Requirements
                      </label>
                      <div className="space-y-2">
                        {selectedFailure.actionFields.economicBreak && (
                          <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-xs font-medium text-red-700 mb-1">Economic Break Action:</p>
                            <p className="text-sm text-red-800">{selectedFailure.actionFields.economicBreak}</p>
                          </div>
                        )}
                        {selectedFailure.actionFields.nonEconomicBreak && (
                          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                            <p className="text-xs font-medium text-orange-700 mb-1">Non-Economic Break Action:</p>
                            <p className="text-sm text-orange-800">{selectedFailure.actionFields.nonEconomicBreak}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Timeline */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Break identified and classified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Assigned to {selectedFailure.pendingWith}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${selectedFailure.status === 'Resolved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      {selectedFailure.status === 'Resolved' ? 'Resolution completed' : `Awaiting action from ${selectedFailure.nextActionOwner}`}
                    </span>
                  </div>
                  {selectedFailure.status !== 'Resolved' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-400">Resolution verification</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Break</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a break from the list to view detailed analysis and resolution information.
                </p>
              </div>
            </div>
          )}
          
          {/* Enhanced Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Break Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Breaks</span>
                <span className="text-sm font-medium text-gray-900">{failures.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Economic Breaks</span>
                <span className="text-sm font-medium text-red-600">
                  {failures.filter(f => f.breakType === 'Economic').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Non-Economic Breaks</span>
                <span className="text-sm font-medium text-orange-600">
                  {failures.filter(f => f.breakType === 'Non-Economic').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Resolved</span>
                <span className="text-sm font-medium text-green-600">
                  {failures.filter(f => f.status === 'Resolved').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending with Legal</span>
                <span className="text-sm font-medium text-purple-600">
                  {failures.filter(f => f.pendingWith === 'Legal').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending with Middle Office</span>
                <span className="text-sm font-medium text-blue-600">
                  {failures.filter(f => f.pendingWith === 'Middle Office').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFailureAnalysisPanel;