import { storage } from './storage';
import { type InsertTradeWorkflow, type InsertWorkflowStep } from '@shared/schema';

// Workflow step definitions
const WORKFLOW_STEPS = {
  TRADE_BOOKING: 'trade-booking',
  CONFIRMATION_GENERATION: 'confirmation-generation',
  FIRST_LEVEL_DRAFTING: 'first-level-drafting',
  SECOND_LEVEL_DRAFTING: 'second-level-drafting',
  CONFIRMATION_DISPATCH: 'confirmation-dispatch',
  FINAL_CONFIRMATION: 'final-confirmation',
  EXECUTION_COMPLETE: 'execution-complete'
};

const getWorkflowSteps = (tradeStatus: string, isEquityTrade: boolean) => [
  {
    stepId: WORKFLOW_STEPS.TRADE_BOOKING,
    name: 'Trade Booking',
    description: 'Initial trade entry and validation',
    status: 'completed',
    order: 1
  },
  {
    stepId: WORKFLOW_STEPS.CONFIRMATION_GENERATION,
    name: 'Confirmation Generation',
    description: 'Generate trade confirmation documents',
    status: 'completed',
    order: 2
  },
  {
    stepId: WORKFLOW_STEPS.FIRST_LEVEL_DRAFTING,
    name: 'First Level Drafting',
    description: 'STP and non-STP paper/manual confirmations',
    status: 'completed',
    order: 3
  },
  {
    stepId: WORKFLOW_STEPS.SECOND_LEVEL_DRAFTING,
    name: 'Second Level Drafting',
    description: 'Electronic confirmations (SWIFT/Markitwire)',
    status: 'completed',
    order: 4
  },
  {
    stepId: WORKFLOW_STEPS.CONFIRMATION_DISPATCH,
    name: 'Confirmation Dispatch',
    description: 'Confirmations sent to client',
    status: ['confirmed', 'settled'].includes(tradeStatus.toLowerCase()) ? 'completed' :
           tradeStatus.toLowerCase() === 'pending' ? 'in-progress' : 'pending',
    order: 5
  },
  {
    stepId: WORKFLOW_STEPS.FINAL_CONFIRMATION,
    name: 'Final Confirmation',
    description: 'Awaiting final client agreement',
    status: tradeStatus.toLowerCase() === 'settled' ? 'completed' :
           ['confirmed'].includes(tradeStatus.toLowerCase()) ? 'in-progress' : 'pending',
    order: 6
  },
  {
    stepId: WORKFLOW_STEPS.EXECUTION_COMPLETE,
    name: 'Execution Complete',
    description: 'Trade settlement and completion',
    status: tradeStatus.toLowerCase() === 'settled' ? 'completed' : 'pending',
    order: 7
  }
];

async function generateWorkflows() {
  console.log('Generating workflows for all trades...');

  try {
    // Get all trades from database
    const equityTrades = await storage.getEquityTrades();
    const fxTrades = await storage.getFxTrades();
    
    console.log(`Found ${equityTrades.length} equity trades and ${fxTrades.length} FX trades`);
    
    let workflowsCreated = 0;
    let stepsCreated = 0;

    // Generate workflows for equity trades
    for (const trade of equityTrades) {
      const workflow: InsertTradeWorkflow = {
        tradeId: trade.tradeId,
        status: trade.confirmationStatus.toLowerCase() === 'settled' ? 'completed' : 
                trade.confirmationStatus.toLowerCase() === 'confirmed' ? 'in-progress' : 'pending',
        priority: trade.confirmationStatus.toLowerCase() === 'failed' ? 'high' : 'medium',
        assignedTo: trade.trader
      };

      const createdWorkflow = await storage.createTradeWorkflow(workflow);
      workflowsCreated++;

      // Generate workflow steps
      const steps = getWorkflowSteps(trade.confirmationStatus, true);
      for (const step of steps) {
        const workflowStep: InsertWorkflowStep = {
          workflowId: createdWorkflow.id,
          stepId: step.stepId,
          name: step.name,
          description: step.description,
          status: step.status,
          order: step.order
        };

        await storage.createWorkflowStep(workflowStep);
        stepsCreated++;
      }
    }

    // Generate workflows for FX trades
    for (const trade of fxTrades) {
      const workflow: InsertTradeWorkflow = {
        tradeId: trade.tradeId,
        status: trade.confirmationStatus.toLowerCase() === 'settled' ? 'completed' : 
                trade.confirmationStatus.toLowerCase() === 'confirmed' ? 'in-progress' : 'pending',
        priority: trade.confirmationStatus.toLowerCase() === 'failed' ? 'high' : 'medium',
        assignedTo: trade.traderId || 'Unknown'
      };

      const createdWorkflow = await storage.createTradeWorkflow(workflow);
      workflowsCreated++;

      // Generate workflow steps
      const steps = getWorkflowSteps(trade.confirmationStatus, false);
      for (const step of steps) {
        const workflowStep: InsertWorkflowStep = {
          workflowId: createdWorkflow.id,
          stepId: step.stepId,
          name: step.name,
          description: step.description,
          status: step.status,
          order: step.order
        };

        await storage.createWorkflowStep(workflowStep);
        stepsCreated++;
      }
    }

    console.log(`Successfully generated ${workflowsCreated} workflows and ${stepsCreated} workflow steps`);
  } catch (error) {
    console.error('Error generating workflows:', error);
  }
}

// Run workflow generation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateWorkflows().then(() => {
    console.log('Workflow generation script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Workflow generation failed:', error);
    process.exit(1);
  });
}

export { generateWorkflows };