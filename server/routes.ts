import { Router } from "express";
import { storage } from "./storage";
import { insertEquityTradeSchema, insertFxTradeSchema, insertTradeWorkflowSchema, insertWorkflowStepSchema } from "@shared/schema";

const router = Router();

// Trade routes
router.get("/api/trades/equity", async (req, res) => {
  try {
    const trades = await storage.getEquityTrades();
    res.json(trades);
  } catch (error) {
    console.error("Error fetching equity trades:", error);
    res.status(500).json({ error: "Failed to fetch equity trades" });
  }
});

router.get("/api/trades/fx", async (req, res) => {
  try {
    const trades = await storage.getFxTrades();
    res.json(trades);
  } catch (error) {
    console.error("Error fetching FX trades:", error);
    res.status(500).json({ error: "Failed to fetch FX trades" });
  }
});

router.get("/api/trades/equity/:tradeId", async (req, res) => {
  try {
    const trade = await storage.getEquityTradeById(req.params.tradeId);
    if (!trade) {
      return res.status(404).json({ error: "Equity trade not found" });
    }
    res.json(trade);
  } catch (error) {
    console.error("Error fetching equity trade:", error);
    res.status(500).json({ error: "Failed to fetch equity trade" });
  }
});

router.get("/api/trades/fx/:tradeId", async (req, res) => {
  try {
    const trade = await storage.getFxTradeById(req.params.tradeId);
    if (!trade) {
      return res.status(404).json({ error: "FX trade not found" });
    }
    res.json(trade);
  } catch (error) {
    console.error("Error fetching FX trade:", error);
    res.status(500).json({ error: "Failed to fetch FX trade" });
  }
});

router.post("/api/trades/equity", async (req, res) => {
  try {
    const validatedData = insertEquityTradeSchema.parse(req.body);
    const trade = await storage.createEquityTrade(validatedData);
    res.status(201).json(trade);
  } catch (error) {
    console.error("Error creating equity trade:", error);
    res.status(400).json({ error: "Failed to create equity trade" });
  }
});

router.post("/api/trades/fx", async (req, res) => {
  try {
    const validatedData = insertFxTradeSchema.parse(req.body);
    const trade = await storage.createFxTrade(validatedData);
    res.status(201).json(trade);
  } catch (error) {
    console.error("Error creating FX trade:", error);
    res.status(400).json({ error: "Failed to create FX trade" });
  }
});

router.patch("/api/trades/equity/:tradeId", async (req, res) => {
  try {
    const updates = req.body;
    const trade = await storage.updateEquityTrade(req.params.tradeId, updates);
    if (!trade) {
      return res.status(404).json({ error: "Equity trade not found" });
    }
    res.json(trade);
  } catch (error) {
    console.error("Error updating equity trade:", error);
    res.status(500).json({ error: "Failed to update equity trade" });
  }
});

router.patch("/api/trades/fx/:tradeId", async (req, res) => {
  try {
    const updates = req.body;
    const trade = await storage.updateFxTrade(req.params.tradeId, updates);
    if (!trade) {
      return res.status(404).json({ error: "FX trade not found" });
    }
    res.json(trade);
  } catch (error) {
    console.error("Error updating FX trade:", error);
    res.status(500).json({ error: "Failed to update FX trade" });
  }
});

// Workflow routes
router.get("/api/workflows", async (req, res) => {
  try {
    const workflows = await storage.getTradeWorkflows();
    res.json(workflows);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});

router.get("/api/workflow-steps", async (req, res) => {
  try {
    const steps = await storage.getWorkflowSteps();
    res.json(steps);
  } catch (error) {
    console.error("Error fetching workflow steps:", error);
    res.status(500).json({ error: "Failed to fetch workflow steps" });
  }
});

router.post("/api/workflows", async (req, res) => {
  try {
    const validatedData = insertTradeWorkflowSchema.parse(req.body);
    const workflow = await storage.createTradeWorkflow(validatedData);
    res.status(201).json(workflow);
  } catch (error) {
    console.error("Error creating workflow:", error);
    res.status(400).json({ error: "Failed to create workflow" });
  }
});

router.post("/api/workflow-steps", async (req, res) => {
  try {
    const validatedData = insertWorkflowStepSchema.parse(req.body);
    const step = await storage.createWorkflowStep(validatedData);
    res.status(201).json(step);
  } catch (error) {
    console.error("Error creating workflow step:", error);
    res.status(400).json({ error: "Failed to create workflow step" });
  }
});

export { router };