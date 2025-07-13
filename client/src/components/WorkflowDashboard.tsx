import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Filter,
  Search,
  FileText,
  UserCheck
} from 'lucide-react';
import { TradeWorkflow, WorkflowAction } from '../types/workflow';
import { EquityTrade, FXTrade } from '../types/trade';

interface WorkflowDashboardProps {
  workflows: TradeWorkflow[];
  actions: WorkflowAction[];
  trades: (EquityTrade | FXTrade)[];
}

const WorkflowDashboard: React.FC<WorkflowDashboardProps> = ({ workflows, actions, trades }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Categorize workflows by stage
  const workflowsByStage = useMemo(() => {
    const stages = {
      drafting: workflows.filter(w => 
        w.steps.some(s => s.id.includes('drafting') && s.status === 'in-progress')
      ),
      matching: workflows.filter(w => 
        w.steps.some(s => s.id.includes('affirmation') && s.status === 'in-progress')
      ),
      pendingApprovals: workflows.filter(w => 
        w.steps.some(s => s.status === 'requires-action')
      ),
      ccnr: workflows.filter(w => 
        w.steps.every(s => s.status === 'completed')
      )
    };

    return stages;
  }, [workflows]);

  const stats = useMemo(() => {
    const total = workflows.length;
    const drafting = 67; // Fixed value as requested
    const matching = 133; // Fixed value as requested  
    const pendingApprovals = 116; // Fixed value as requested
    const ccnr = 84; // Calculated: 400 - 67 - 133 - 116 = 84
    const overdue = actions.filter(a => a.status === 'overdue').length;

    return { total, drafting, matching, pendingApprovals, ccnr, overdue };
  }, [workflows, actions, workflowsByStage]);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      // Status filter
      if (filterStatus !== 'all') {
        const hasStatus = workflow.steps.some(s => s.status === filterStatus);
        if (!hasStatus) return false;
      }

      // Priority filter
      if (filterPriority !== 'all' && workflow.priority !== filterPriority) {
        return false;
      }

      // Search filter
      if (searchTerm && !workflow.tradeId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [workflows, filterStatus, filterPriority, searchTerm]);

  const urgentActions = useMemo(() => {
    return actions.filter(action => 
      action.status === 'pending' || action.status === 'overdue'
    ).slice(0, 5);
  }, [actions]);

  const renderStageSection = (stageName: string, stageWorkflows: TradeWorkflow[], icon: React.ElementType) => {
    const Icon = icon;
    
    // For Drafting and CCNR, show all active trades
    let displayWorkflows = stageWorkflows;
    if (stageName === 'Drafting') {
      // Show all trades that are not settled
      displayWorkflows = workflows.filter(w => {
        const trade = trades.find(t => t.tradeId === w.tradeId);
        const status = trade ? ('orderId' in trade ? trade.confirmationStatus : trade.confirmationStatus) : '';
        return status !== 'Settled';
      }).slice(0, 67); // Show 67 as specified
    } else if (stageName === 'CCNR (Complete)') {
      // Show all completed trades
      displayWorkflows = workflows.filter(w => {
        const trade = trades.find(t => t.tradeId === w.tradeId);
        const status = trade ? ('orderId' in trade ? trade.confirmationStatus : trade.confirmationStatus) : '';
        return ['Confirmed', 'Settled'].includes(status);
      }).slice(0, 84); // Show 84 as specified
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Icon className="h-5 w-5 text-blue-600 mr-2" />
            {stageName} ({displayWorkflows.length})
          </h3>
        </div>
        
        <div className="space-y-3">
          {displayWorkflows.map((workflow) => {
            const currentStep = workflow.steps.find(s => s.id === workflow.currentStep);
            const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
            const totalSteps = workflow.steps.length;
            const progress = (completedSteps / totalSteps) * 100;
            
            // Get corresponding trade for additional info
            const correspondingTrade = trades.find(t => t.tradeId === workflow.tradeId);
            const tradeStatus = correspondingTrade 
              ? ('orderId' in correspondingTrade ? correspondingTrade.confirmationStatus : correspondingTrade.confirmationStatus)
              : 'Unknown';

            return (
              <div key={workflow.tradeId} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{workflow.tradeId}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workflow.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        workflow.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        workflow.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tradeStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        tradeStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        tradeStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                        tradeStatus === 'Settled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tradeStatus}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {currentStep?.name || 'Unknown Step'}
                    </p>
                    
                    {correspondingTrade && (
                      <p className="text-xs text-gray-500 mt-1">
                        Counterparty: {correspondingTrade.counterparty}
                      </p>
                    )}
                    
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{completedSteps}/{totalSteps} steps</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {displayWorkflows.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No trades in {stageName.toLowerCase()} stage
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">400</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Drafting</p>
              <p className="text-2xl font-bold text-gray-900">67</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Matching</p>
              <p className="text-2xl font-bold text-gray-900">133</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">116</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">CCNR</p>
              <p className="text-2xl font-bold text-gray-900">84</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {renderStageSection('Drafting', workflowsByStage.drafting, FileText)}
        {renderStageSection('Matching', workflowsByStage.matching, Users)}
        {renderStageSection('Pending Approvals', workflowsByStage.pendingApprovals, AlertTriangle)}
        {renderStageSection('CCNR (Complete)', workflowsByStage.ccnr, CheckCircle)}
      </div>

      {/* Detailed Workflow List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">All Workflows (400 total trades, {filteredWorkflows.length} filtered)</h3>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trade ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="requires-action">Requires Action</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredWorkflows.map((workflow) => {
            const currentStep = workflow.steps.find(s => s.id === workflow.currentStep);
            const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
            const totalSteps = workflow.steps.length;
            const progress = (completedSteps / totalSteps) * 100;
            
            // Find corresponding trade for status
            const correspondingTrade = trades.find(t => t.tradeId === workflow.tradeId);
            const tradeStatus = correspondingTrade 
              ? ('orderId' in correspondingTrade ? correspondingTrade.confirmationStatus : correspondingTrade.confirmationStatus)
              : 'Unknown';
            const tradeType = correspondingTrade && 'orderId' in correspondingTrade ? 'Equity' : 'FX';

            return (
              <div key={workflow.tradeId} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        {workflow.tradeId}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workflow.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        workflow.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        workflow.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tradeType === 'Equity' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {tradeType}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      Current: {currentStep?.name || 'Unknown'}
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      Trade Status: <span className={`font-medium ${
                        tradeStatus === 'Confirmed' ? 'text-green-600' :
                        tradeStatus === 'Pending' ? 'text-yellow-600' :
                        tradeStatus === 'Failed' ? 'text-red-600' :
                        tradeStatus === 'Settled' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>{tradeStatus}</span>
                    </p>
                    
                    {correspondingTrade && (
                      <p className="text-sm text-gray-600">
                        Counterparty: <span className="font-medium">{correspondingTrade.counterparty}</span>
                      </p>
                    )}
                    
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{completedSteps}/{totalSteps} steps</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Updated: {new Date(workflow.updatedAt).toLocaleDateString()}
                    </p>
                    {workflow.steps.some(s => s.status === 'requires-action') && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            Urgent Actions
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {urgentActions.map((action) => (
              <div key={action.id} className="border-l-4 border-orange-400 pl-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {action.description}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    action.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {action.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Type: {action.type}
                </p>
                {action.dueDate && (
                  <p className="text-xs text-gray-500">
                    Due: {new Date(action.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
            
            {urgentActions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No urgent actions at this time
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboard;