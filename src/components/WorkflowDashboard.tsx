import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { TradeWorkflow, WorkflowAction } from '../types/workflow';

interface WorkflowDashboardProps {
  workflows: TradeWorkflow[];
  actions: WorkflowAction[];
}

const WorkflowDashboard: React.FC<WorkflowDashboardProps> = ({ workflows, actions }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    const total = workflows.length;
    const inProgress = workflows.filter(w => 
      w.steps.some(s => s.status === 'in-progress')
    ).length;
    const requiresAction = workflows.filter(w => 
      w.steps.some(s => s.status === 'requires-action')
    ).length;
    const completed = workflows.filter(w => 
      w.steps.every(s => s.status === 'completed')
    ).length;
    const overdue = actions.filter(a => a.status === 'overdue').length;

    return { total, inProgress, requiresAction, completed, overdue };
  }, [workflows, actions]);

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

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Requires Action</p>
              <p className="text-2xl font-bold text-gray-900">{stats.requiresAction}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Active Workflows</h3>
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
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          Current: {currentStep?.name || 'Unknown'}
                        </p>
                        
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
        </div>

        {/* Action Items */}
        <div className="space-y-6">
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

          {/* Process Flow Summary */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Process Flow</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>1. Trade Booking → Confirmation System</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>2. Amendment Check → FO/TCU/IBMO</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>3. Affirmation Trigger (T+1)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>4. Client Affirmation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>5. SWIFT/Paper Routing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>6. Drafting Process</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>7. Confirmation Dispatch</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>8. Final Execution</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboard;