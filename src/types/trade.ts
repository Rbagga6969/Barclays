export interface EquityTrade {
  tradeId: string;
  orderId: string;
  clientId: string;
  tradeType: 'Buy' | 'Sell';
  quantity: number;
  price: number;
  tradeValue: number;
  currency: string;
  tradeDate: string;
  settlementDate: string;
  counterparty: string;
  tradingVenue: string;
  traderName: string;
  confirmationStatus: 'Confirmed' | 'Pending' | 'Failed' | 'Settled';
  countryOfTrade: string;
  opsTeamNotes: string;
  // Enhanced fields
  failureReason?: string;
  documentStatus?: DocumentStatus;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface FXTrade {
  tradeId: string;
  tradeDate: string;
  valueDate: string;
  tradeTime: string;
  traderId: string;
  counterparty: string;
  currencyPair: string;
  buySell: 'Buy' | 'Sell';
  dealtCurrency: string;
  baseCurrency: string;
  termCurrency: string;
  tradeStatus: 'Booked' | 'Confirmed' | 'Settled' | 'Cancelled';
  productType: 'Spot' | 'Forward' | 'Swap';
  maturityDate: string;
  confirmationTimestamp: string;
  settlementDate: string;
  amendmentFlag: 'Yes' | 'No';
  confirmationMethod: 'SWIFT' | 'Email' | 'Electronic' | 'Manual';
  confirmationStatus: 'Confirmed' | 'Pending' | 'Disputed';
  // Enhanced fields
  failureReason?: string;
  documentStatus?: DocumentStatus;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface DocumentStatus {
  tradeConfirmation: DocumentInfo;
  clientAgreement: DocumentInfo;
  riskDisclosure: DocumentInfo;
  complianceChecklist: DocumentInfo;
}

export interface DocumentInfo {
  submitted: boolean;
  clientSigned: boolean;
  bankSigned: boolean;
  timestamp?: string;
  documentUrl?: string;
  version: number;
}

export type Trade = EquityTrade | FXTrade;

export interface TradeFilters {
  tradeType: 'all' | 'equity' | 'fx';
  status: string;
  counterparty: string;
  dateFrom: string;
  dateTo: string;
  currency: string;
  trader: string;
  riskLevel: string;
  documentStatus: string;
}

export interface FailureAnalysis {
  tradeId: string;
  failureType: 'Settlement' | 'Documentation' | 'Compliance' | 'Technical' | 'Client' | 'Counterparty';
  reason: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  suggestedSolution: string;
  estimatedResolutionTime: string;
  assignedTo: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  createdAt: string;
  resolvedAt?: string;
}