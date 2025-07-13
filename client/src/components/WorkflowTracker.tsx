import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  User, 
  Calendar,
  FileText,
  Send,
  Settings,
  Zap
} from 'lucide-react';
import { TradeWorkflow, WorkflowStep, WORKFLOW_STEPS } from '../types/workflow';

interface WorkflowTrackerProps {
  workflow: TradeWorkflow;
  onActionRequired?: (stepId: string) => void;
}

const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({ workflow, onActionRequired }) => {
  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case WORKFLOW_STEPS.TRADE_BOOKING:
        return FileText;
      case WORKFLOW_STEPS.CONFIRMATION_SYSTEM:
        return Settings;
      case WORKFLOW_STEPS.AMENDMENT_CHECK:
        return AlertTriangle;
      case WORKFLOW_STEPS.AFFIRMATION_TRIGGER:
        return Zap;
      case WORKFLOW_STEPS.CLIENT_AFFIRMATION:
        return User;
      case WORKFLOW_STEPS.SWIFT_PAPER_ROUTING:
        return Send;
      case WORKFLOW_STEPS.FIRST_LEVEL_DRAFTING:
      case WORKFLOW_STEPS.SECOND_LEVEL_DRAFTING:
        return FileText;
      case WORKFLOW_STEPS.CONFIRMATION_DISPATCH:
        return Send;
      case WORKFLOW_STEPS.FINAL_CONFIRMATION:
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'requires-action':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStepDescription = (stepId: string) => {
    switch (stepId) {
      case WORKFLOW_STEPS.TRADE_BOOKING:
        return 'Trade booked in system after execution';
      case WORKFLOW_STEPS.CONFIRMATION_SYSTEM:
        return 'Trade sent to confirmation system';
      case WORKFLOW_STEPS.AMENDMENT_CHECK:
        return 'Checking if amendment is needed';
      case WORKFLOW_STEPS.AFFIRMATION_TRIGGER:
        return 'Triggering affirmation on T+1';
      case WORKFLOW_STEPS.CLIENT_AFFIRMATION:
        return 'Client affirmation request sent';
      case WORKFLOW_STEPS.TRADE_BREAK_CHECK:
        return 'Checking for trade breaks/discrepancies';
      case WORKFLOW_STEPS.SWIFT_PAPER_ROUTING:
        return 'Routing to SWIFT/Paper confirmation';
      case WORKFLOW_STEPS.FIRST_LEVEL_DRAFTING:
        return 'First level drafting (STP/non-STP)';
      case WORKFLOW_STEPS.SECOND_LEVEL_DRAFTING:
        return 'Second level drafting (Electronic)';
      case WORKFLOW_STEPS.BOOKING_AMENDMENT:
        return 'Processing booking amendments';
      case WORKFLOW_STEPS.CONFIRMATION_DISPATCH:
        return 'Dispatching confirmations to client';
      case WORKFLOW_STEPS.FINAL_CONFIRMATION:
        return 'Awaiting final client confirmation';
      case WORKFLOW_STEPS.EXECUTION_COMPLETE:
        return 'Trade confirmation executed successfully';
      default:
        return 'Processing step';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Confirmation Workflow - {workflow.tradeId}
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            workflow.priority === 'urgent' ? 'bg-red-100 text-red-800' :
            workflow.priority === 'high' ? 'bg-orange-100 text-orange-800' :
            workflow.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {workflow.priority.toUpperCase()} PRIORITY
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {workflow.steps.map((step, index) => {
          const StepIcon = getStepIcon(step.id);
          const isCurrentStep = step.id === workflow.currentStep;
          const isCompleted = step.status === 'completed';
          const requiresAction = step.status === 'requires-action';
          
          return (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {index < workflow.steps.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
              )}
              
              <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all ${
                isCurrentStep ? 'border-blue-500 bg-blue-50' :
                isCompleted ? 'border-green-200 bg-green-50' :
                requiresAction ? 'border-orange-200 bg-orange-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  getStatusColor(step.status)
                }`}>
                  <StepIcon className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {step.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {step.timestamp && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(step.timestamp).toLocaleString()}
                        </div>
                      )}
                      {step.assignedTo && (
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          {step.assignedTo}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {getStepDescription(step.id)}
                  </p>
                  
                  {step.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Note: {step.notes}
                    </p>
                  )}
                  
                  {requiresAction && onActionRequired && (
                    <button
                      onClick={() => onActionRequired(step.id)}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Action Required
                    </button>
                  )}
                </div>
                
                {isCurrentStep && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Workflow created: {new Date(workflow.createdAt).toLocaleString()}</span>
          <span>Last updated: {new Date(workflow.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTracker;