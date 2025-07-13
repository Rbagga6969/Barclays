export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'requires-action';
  timestamp?: string;
  assignedTo?: string;
  notes?: string;
}

export interface TradeWorkflow {
  tradeId: string;
  currentStep: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface WorkflowAction {
  id: string;
  type: 'amendment' | 'affirmation' | 'break-resolution' | 'drafting' | 'dispatch' | 'execution';
  description: string;
  requiredBy?: string;
  dueDate?: string;
  status: 'pending' | 'completed' | 'overdue';
}

export const WORKFLOW_STEPS = {
  TRADE_BOOKING: 'trade-booking',
  CONFIRMATION_SYSTEM: 'confirmation-system',
  AMENDMENT_CHECK: 'amendment-check',
  AFFIRMATION_TRIGGER: 'affirmation-trigger',
  CLIENT_AFFIRMATION: 'client-affirmation',
  TRADE_BREAK_CHECK: 'trade-break-check',
  SWIFT_PAPER_ROUTING: 'swift-paper-routing',
  FIRST_LEVEL_DRAFTING: 'first-level-drafting',
  SECOND_LEVEL_DRAFTING: 'second-level-drafting',
  BOOKING_AMENDMENT: 'booking-amendment',
  CONFIRMATION_DISPATCH: 'confirmation-dispatch',
  FINAL_CONFIRMATION: 'final-confirmation',
  EXECUTION_COMPLETE: 'execution-complete'
} as const;