import { 
  users, 
  equityTrades, 
  fxTrades, 
  tradeWorkflows, 
  workflowSteps,
  type User, 
  type InsertUser,
  type EquityTrade,
  type InsertEquityTrade,
  type FxTrade,
  type InsertFxTrade,
  type TradeWorkflow,
  type InsertTradeWorkflow,
  type WorkflowStep,
  type InsertWorkflowStep
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Trade methods
  getEquityTrades(): Promise<EquityTrade[]>;
  getFxTrades(): Promise<FxTrade[]>;
  getEquityTradeById(tradeId: string): Promise<EquityTrade | undefined>;
  getFxTradeById(tradeId: string): Promise<FxTrade | undefined>;
  createEquityTrade(trade: InsertEquityTrade): Promise<EquityTrade>;
  createFxTrade(trade: InsertFxTrade): Promise<FxTrade>;
  updateEquityTrade(tradeId: string, updates: Partial<InsertEquityTrade>): Promise<EquityTrade | undefined>;
  updateFxTrade(tradeId: string, updates: Partial<InsertFxTrade>): Promise<FxTrade | undefined>;
  
  // Workflow methods
  getTradeWorkflows(): Promise<TradeWorkflow[]>;
  getWorkflowSteps(): Promise<WorkflowStep[]>;
  createTradeWorkflow(workflow: InsertTradeWorkflow): Promise<TradeWorkflow>;
  createWorkflowStep(step: InsertWorkflowStep): Promise<WorkflowStep>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getEquityTrades(): Promise<EquityTrade[]> {
    return await db.select().from(equityTrades);
  }

  async getFxTrades(): Promise<FxTrade[]> {
    return await db.select().from(fxTrades);
  }

  async getEquityTradeById(tradeId: string): Promise<EquityTrade | undefined> {
    const [trade] = await db.select().from(equityTrades).where(eq(equityTrades.tradeId, tradeId));
    return trade || undefined;
  }

  async getFxTradeById(tradeId: string): Promise<FxTrade | undefined> {
    const [trade] = await db.select().from(fxTrades).where(eq(fxTrades.tradeId, tradeId));
    return trade || undefined;
  }

  async createEquityTrade(trade: InsertEquityTrade): Promise<EquityTrade> {
    const [newTrade] = await db
      .insert(equityTrades)
      .values(trade)
      .returning();
    return newTrade;
  }

  async createFxTrade(trade: InsertFxTrade): Promise<FxTrade> {
    const [newTrade] = await db
      .insert(fxTrades)
      .values(trade)
      .returning();
    return newTrade;
  }

  async updateEquityTrade(tradeId: string, updates: Partial<InsertEquityTrade>): Promise<EquityTrade | undefined> {
    const [updatedTrade] = await db
      .update(equityTrades)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(equityTrades.tradeId, tradeId))
      .returning();
    return updatedTrade || undefined;
  }

  async updateFxTrade(tradeId: string, updates: Partial<InsertFxTrade>): Promise<FxTrade | undefined> {
    const [updatedTrade] = await db
      .update(fxTrades)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fxTrades.tradeId, tradeId))
      .returning();
    return updatedTrade || undefined;
  }

  async getTradeWorkflows(): Promise<TradeWorkflow[]> {
    return await db.select().from(tradeWorkflows);
  }

  async getWorkflowSteps(): Promise<WorkflowStep[]> {
    return await db.select().from(workflowSteps);
  }

  async createTradeWorkflow(workflow: InsertTradeWorkflow): Promise<TradeWorkflow> {
    const [newWorkflow] = await db
      .insert(tradeWorkflows)
      .values(workflow)
      .returning();
    return newWorkflow;
  }

  async createWorkflowStep(step: InsertWorkflowStep): Promise<WorkflowStep> {
    const [newStep] = await db
      .insert(workflowSteps)
      .values(step)
      .returning();
    return newStep;
  }
}

export const storage = new DatabaseStorage();
