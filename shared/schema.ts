import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const equityTrades = pgTable("equity_trades", {
  id: serial("id").primaryKey(),
  tradeId: text("trade_id").notNull().unique(),
  orderId: text("order_id").notNull(),
  clientId: text("client_id"),
  security: text("security").notNull(),
  side: text("side").notNull(), // 'Buy' or 'Sell'
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  tradeValue: decimal("trade_value", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  counterparty: text("counterparty").notNull(),
  tradingVenue: text("trading_venue"),
  trader: text("trader").notNull(),
  tradeDate: text("trade_date").notNull(),
  settlementDate: text("settlement_date").notNull(),
  tradeTime: text("trade_time").notNull(),
  confirmationStatus: text("confirmation_status").notNull().default("Pending"),
  countryOfTrade: text("country_of_trade"),
  opsTeamNotes: text("ops_team_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fxTrades = pgTable("fx_trades", {
  id: serial("id").primaryKey(),
  tradeId: text("trade_id").notNull().unique(),
  currencyPair: text("currency_pair").notNull(),
  transactionType: text("transaction_type").notNull(), // 'Buy' or 'Sell'
  baseCurrency: text("base_currency").notNull(),
  quoteCurrency: text("quote_currency").notNull(),
  termCurrency: text("term_currency"),
  dealtCurrency: text("dealt_currency"),
  counterparty: text("counterparty").notNull(),
  traderId: text("trader_id"),
  tradeDate: text("trade_date").notNull(),
  valueDate: text("value_date"),
  settlementDate: text("settlement_date").notNull(),
  tradeTime: text("trade_time").notNull(),
  tradeStatus: text("trade_status"),
  productType: text("product_type"),
  maturityDate: text("maturity_date"),
  confirmationTimestamp: text("confirmation_timestamp"),
  amendmentFlag: text("amendment_flag"),
  confirmationMethod: text("confirmation_method"),
  confirmationStatus: text("confirmation_status").notNull().default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tradeWorkflows = pgTable("trade_workflows", {
  id: serial("id").primaryKey(),
  tradeId: text("trade_id").notNull(),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowSteps = pgTable("workflow_steps", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  stepId: text("step_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const workflowRelations = relations(tradeWorkflows, ({ many }) => ({
  steps: many(workflowSteps),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one }) => ({
  workflow: one(tradeWorkflows, {
    fields: [workflowSteps.workflowId],
    references: [tradeWorkflows.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEquityTradeSchema = createInsertSchema(equityTrades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFxTradeSchema = createInsertSchema(fxTrades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradeWorkflowSchema = createInsertSchema(tradeWorkflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowStepSchema = createInsertSchema(workflowSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEquityTrade = z.infer<typeof insertEquityTradeSchema>;
export type EquityTrade = typeof equityTrades.$inferSelect;
export type InsertFxTrade = z.infer<typeof insertFxTradeSchema>;
export type FxTrade = typeof fxTrades.$inferSelect;
export type InsertTradeWorkflow = z.infer<typeof insertTradeWorkflowSchema>;
export type TradeWorkflow = typeof tradeWorkflows.$inferSelect;
export type InsertWorkflowStep = z.infer<typeof insertWorkflowStepSchema>;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
