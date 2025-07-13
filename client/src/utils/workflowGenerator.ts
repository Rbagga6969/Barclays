import { TradeWorkflow, WorkflowStep, WorkflowAction, WORKFLOW_STEPS } from '../types/workflow';
import { EquityTrade, FXTrade } from '../types/trade';

export const generateWorkflowForTrade = (trade: EquityTrade | FXTrade): TradeWorkflow => {
  const isEquityTrade = 'orderId' in trade;
  const tradeStatus = isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus;
  
  // Determine current step based on trade status
  let currentStep = WORKFLOW_STEPS.TRADE_BOOKING;
  
  switch (tradeStatus.toLowerCase()) {
    case 'pending':
      currentStep = WORKFLOW_STEPS.CLIENT_AFFIRMATION;
      break;
    case 'confirmed':
      currentStep = WORKFLOW_STEPS.CONFIRMATION_DISPATCH;
      break;
    case 'settled':
      currentStep = WORKFLOW_STEPS.EXECUTION_COMPLETE;
      break;
    case 'failed':
      currentStep = WORKFLOW_STEPS.TRADE_BREAK_CHECK;
      break;
    case 'disputed':
      currentStep = WORKFLOW_STEPS.TRADE_BREAK_CHECK;
      break;
    case 'booked':
      currentStep = WORKFLOW_STEPS.CONFIRMATION_SYSTEM;
      break;
    case 'cancelled':
      currentStep = WORKFLOW_STEPS.AMENDMENT_CHECK;
      break;
  }

  const steps: WorkflowStep[] = [
    {
      id: WORKFLOW_STEPS.TRADE_BOOKING,
      name: 'Trade Booking',
      status: 'completed',
      timestamp: trade.tradeDate,
      assignedTo: isEquityTrade ? trade.traderName : trade.traderId,
      notes: 'Trade successfully booked in system'
    },
    {
      id: WORKFLOW_STEPS.CONFIRMATION_SYSTEM,
      name: 'Confirmation System Entry',
      status: currentStep === WORKFLOW_STEPS.CONFIRMATION_SYSTEM ? 'in-progress' : 
             ['pending', 'confirmed', 'settled', 'failed', 'disputed'].includes(tradeStatus.toLowerCase()) ? 'completed' : 'pending',
      timestamp: currentStep === WORKFLOW_STEPS.CONFIRMATION_SYSTEM ? new Date().toISOString() : undefined,
      assignedTo: 'Confirmation System',
      notes: 'Trade routed to confirmation system'
    },
    {
      id: WORKFLOW_STEPS.AMENDMENT_CHECK,
      name: 'Amendment Check',
      status: tradeStatus.toLowerCase() === 'cancelled' ? 'requires-action' :
             ['pending', 'confirmed', 'settled', 'failed', 'disputed'].includes(tradeStatus.toLowerCase()) ? 'completed' : 'pending',
      assignedTo: 'FO/TCU/IBMO',
      notes: tradeStatus.toLowerCase() === 'cancelled' ? 'Amendment required - routed to Front Office' : undefined
    },
    {
      id: WORKFLOW_STEPS.AFFIRMATION_TRIGGER,
      name: 'Affirmation Trigger (T+1)',
      status: ['pending', 'confirmed', 'settled'].includes(tradeStatus.toLowerCase()) ? 'completed' : 
             ['failed', 'disputed'].includes(tradeStatus.toLowerCase()) ? 'failed' : 'pending',
      assignedTo: 'System Automated',
      notes: 'Automated trigger for client affirmation'
    },
    {
      id: WORKFLOW_STEPS.CLIENT_AFFIRMATION,
      name: 'Client Affirmation',
      status: tradeStatus.toLowerCase() === 'pending' ? 'in-progress' :
             ['confirmed', 'settled'].includes(tradeStatus.toLowerCase()) ? 'completed' :
             ['failed', 'disputed'].includes(tradeStatus.toLowerCase()) ? 'failed' : 'pending',
      assignedTo: trade.counterparty,
      notes: tradeStatus.toLowerCase() === 'pending' ? 'Awaiting client response' : undefined
    },
    {
      id: WORKFLOW_STEPS.TRADE_BREAK_CHECK,
      name: 'Trade Break Check',
      status: ['failed', 'disputed'].includes(tradeStatus.toLowerCase()) ? 'requires-action' :
             ['confirmed', 'settled'].includes(tradeStatus.toLowerCase()) ? 'completed' : 'pending',
      assignedTo: 'Operations Team',
      notes: ['failed', 'disputed'].includes(tradeStatus.toLowerCase()) ? 'Trade break detected - requires resolution' : undefined
    },
    {
      id: WORKFLOW_STEPS.SWIFT_PAPER_ROUTING,
      name: 'SWIFT/Paper Routing',
      status: !isEquityTrade && trade.confirmationMethod ? 'completed' : 'pending',
      assignedTo: 'Confirmation Team',
      notes: !isEquityTrade ? `Routed via ${trade.confirmationMethod}` : undefined
    },
    {
      id: WORKFLOW_STEPS.FIRST_LEVEL_DRAFTING,
      name: 'First Level Drafting',
      status: !isEquityTrade && ['Manual', 'Email'].includes(trade.confirmationMethod) ? 'completed' : 'pending',
      assignedTo: 'Drafting Team',
      notes: 'STP and non-STP paper/manual confirmations'
    },
    {
      id: WORKFLOW_STEPS.SECOND_LEVEL_DRAFTING,
      name: 'Second Level Drafting',
      status: !isEquityTrade && ['SWIFT', 'Electronic'].includes(trade.confirmationMethod) ? 'completed' : 'pending',
      assignedTo: 'Drafting Team',
      notes: 'Electronic confirmations (SWIFT/Markitwire)'
    },
    {
      id: WORKFLOW_STEPS.CONFIRMATION_DISPATCH,
      name: 'Confirmation Dispatch',
      status: ['confirmed', 'settled'].includes(tradeStatus.toLowerCase()) ? 'completed' :
             tradeStatus.toLowerCase() === 'pending' ? 'in-progress' : 'pending',
      assignedTo: 'Confirmation Team',
      notes: 'Confirmations sent to client'
    },
    {
      id: WORKFLOW_STEPS.FINAL_CONFIRMATION,
      name: 'Final Confirmation',
      status: tradeStatus.toLowerCase() === 'settled' ? 'completed' :
             ['confirmed'].includes(tradeStatus.toLowerCase()) ? 'in-progress' : 'pending',
      assignedTo: trade.counterparty,
      notes: 'Awaiting final client agreement'
    },
    {
      id: WORKFLOW_STEPS.EXECUTION_COMPLETE,
      name: 'Execution Complete',
      status: tradeStatus.toLowerCase() === 'settled' ? 'completed' : 'pending',
      timestamp: tradeStatus.toLowerCase() === 'settled' ? (isEquityTrade ? trade.settlementDate : trade.settlementDate) : undefined,
      assignedTo: 'System',
      notes: tradeStatus.toLowerCase() === 'settled' ? 'Trade confirmation successfully executed' : undefined
    }
  ];

  // Determine priority based on trade characteristics
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  
  if (isEquityTrade) {
    if (trade.tradeValue > 1000000) priority = 'high';
    if (trade.tradeValue > 5000000) priority = 'urgent';
    if (['Failed'].includes(trade.confirmationStatus)) priority = 'high';
  } else {
    if (['Disputed'].includes(trade.confirmationStatus)) priority = 'urgent';
    if (trade.amendmentFlag === 'Yes') priority = 'high';
  }

  return {
    tradeId: trade.tradeId,
    currentStep,
    steps,
    createdAt: trade.tradeDate,
    updatedAt: new Date().toISOString(),
    priority
  };
};

export const generateWorkflowActions = (workflows: TradeWorkflow[]): WorkflowAction[] => {
  const actions: WorkflowAction[] = [];
  
  workflows.forEach(workflow => {
    workflow.steps.forEach(step => {
      if (step.status === 'requires-action') {
        actions.push({
          id: `${workflow.tradeId}-${step.id}`,
          type: getActionType(step.id),
          description: `${step.name} requires attention for trade ${workflow.tradeId}`,
          requiredBy: step.assignedTo,
          dueDate: getDueDate(step.id),
          status: 'pending'
        });
      }
      
      if (step.status === 'failed') {
        actions.push({
          id: `${workflow.tradeId}-${step.id}-resolution`,
          type: 'break-resolution',
          description: `Resolve trade break for ${workflow.tradeId} at ${step.name}`,
          requiredBy: 'FO/TCU/IBMO',
          dueDate: getUrgentDueDate(),
          status: 'pending'
        });
      }
    });
  });
  
  return actions;
};

const getActionType = (stepId: string): WorkflowAction['type'] => {
  switch (stepId) {
    case WORKFLOW_STEPS.AMENDMENT_CHECK:
      return 'amendment';
    case WORKFLOW_STEPS.CLIENT_AFFIRMATION:
      return 'affirmation';
    case WORKFLOW_STEPS.TRADE_BREAK_CHECK:
      return 'break-resolution';
    case WORKFLOW_STEPS.FIRST_LEVEL_DRAFTING:
    case WORKFLOW_STEPS.SECOND_LEVEL_DRAFTING:
      return 'drafting';
    case WORKFLOW_STEPS.CONFIRMATION_DISPATCH:
      return 'dispatch';
    case WORKFLOW_STEPS.FINAL_CONFIRMATION:
      return 'execution';
    default:
      return 'amendment';
  }
};

const getDueDate = (stepId: string): string => {
  const now = new Date();
  const dueDate = new Date(now);
  
  // Set due dates based on step urgency
  switch (stepId) {
    case WORKFLOW_STEPS.TRADE_BREAK_CHECK:
      dueDate.setHours(now.getHours() + 4); // 4 hours for trade breaks
      break;
    case WORKFLOW_STEPS.AMENDMENT_CHECK:
      dueDate.setHours(now.getHours() + 8); // 8 hours for amendments
      break;
    case WORKFLOW_STEPS.CLIENT_AFFIRMATION:
      dueDate.setDate(now.getDate() + 1); // 1 day for client affirmation
      break;
    default:
      dueDate.setDate(now.getDate() + 2); // 2 days default
  }
  
  return dueDate.toISOString();
};

const getUrgentDueDate = (): string => {
  const now = new Date();
  now.setHours(now.getHours() + 2); // 2 hours for urgent issues
  return now.toISOString();
};