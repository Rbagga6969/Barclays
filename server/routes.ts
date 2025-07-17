import { Router } from 'express';
import { storage } from './storage';
import { insertEquityTradeSchema, insertFxTradeSchema } from '@shared/schema';

const router = Router();

// Trade routes
router.get('/api/trades/equity', async (req, res) => {
  try {
    const trades = await storage.getEquityTrades();
    res.json(trades);
  } catch (error) {
    console.error('Error fetching equity trades:', error);
    res.status(500).json({ error: 'Failed to fetch equity trades' });
  }
});

router.get('/api/trades/fx', async (req, res) => {
  try {
    const trades = await storage.getFxTrades();
    res.json(trades);
  } catch (error) {
    console.error('Error fetching FX trades:', error);
    res.status(500).json({ error: 'Failed to fetch FX trades' });
  }
});

// Workflow routes
router.get('/api/workflows', async (req, res) => {
  try {
    const workflows = await storage.getTradeWorkflows();
    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

router.get('/api/workflow-steps', async (req, res) => {
  try {
    const steps = await storage.getWorkflowSteps();
    res.json(steps);
  } catch (error) {
    console.error('Error fetching workflow steps:', error);
    res.status(500).json({ error: 'Failed to fetch workflow steps' });
  }
});

// Stats route
router.get('/api/stats', async (req, res) => {
  try {
    const equityTrades = await storage.getEquityTrades();
    const fxTrades = await storage.getFxTrades();
    const workflows = await storage.getTradeWorkflows();
    
    const stats = {
      totalTrades: equityTrades.length + fxTrades.length,
      totalEquityTrades: equityTrades.length,
      totalFxTrades: fxTrades.length,
      totalWorkflows: workflows.length,
      tradeConfirmations: equityTrades.length + fxTrades.length, // Same as total trades
      confirmedTrades: equityTrades.filter(t => t.confirmationStatus === 'Confirmed').length + 
                      fxTrades.filter(t => t.confirmationStatus === 'Confirmed').length,
      pendingTrades: equityTrades.filter(t => t.confirmationStatus === 'Pending').length + 
                    fxTrades.filter(t => t.confirmationStatus === 'Pending').length,
      failedTrades: equityTrades.filter(t => t.confirmationStatus === 'Failed').length + 
                   fxTrades.filter(t => t.confirmationStatus === 'Failed').length,
      settledTrades: equityTrades.filter(t => t.confirmationStatus === 'Settled').length + 
                    fxTrades.filter(t => t.confirmationStatus === 'Settled').length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;