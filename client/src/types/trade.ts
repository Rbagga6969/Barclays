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
  breakType?: 'Economic' | 'Non-Economic';
  pendingWith?: 'Legal' | 'Middle Office' | 'Client' | 'Front Office' | 'Trading Sales';
  nextActionOwner?: string;
  breakClassification?: string;
  queueStatus?: 'Drafting' | 'Matching' | 'Pending Approval' | 'CCNR';
  sentToSettlements?: boolean;
  settlementsSentAt?: string;
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
  breakType?: 'Economic' | 'Non-Economic';
  pendingWith?: 'Legal' | 'Middle Office' | 'Client' | 'Front Office' | 'Trading Sales';
  nextActionOwner?: string;
  breakClassification?: string;
  queueStatus?: 'Drafting' | 'Matching' | 'Pending Approval' | 'CCNR';
  sentToSettlements?: boolean;
  settlementsSentAt?: string;
}

export interface DocumentStatus {
  tradeConfirmation: DocumentInfo;
  clientAgreement: DocumentInfo;
  riskDisclosure: DocumentInfo;
  complianceChecklist: DocumentInfo;
  frontOfficeSalesApproval: DocumentInfo;
  tradingSalesApproval: DocumentInfo;
}

export interface DocumentInfo {
  submitted: boolean;
  clientSigned: boolean;
  bankSigned: boolean;
  timestamp?: string;
  documentUrl?: string;
  version: number;
  makerStatus?: 'Pending' | 'Created' | 'Approved';
  checkerStatus?: 'Pending' | 'Reviewed' | 'Approved';
  qaStatus?: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  sentToClient?: boolean;
  signatureType?: 'Single' | 'Double';
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
  breakType: string;
  pendingWith: string;
  queueStatus: string;
}

export interface FailureAnalysis {
  tradeId: string;
  failureType: 'Economic Break' | 'Non-Economic Break' | 'Documentation' | 'Compliance' | 'Technical';
  breakType: 'Economic' | 'Non-Economic';
  reason: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  suggestedSolution: string;
  estimatedResolutionTime: string;
  assignedTo: string;
  pendingWith: 'Legal' | 'Middle Office' | 'Client' | 'Front Office' | 'Trading Sales';
  nextActionOwner: string;
  breakClassification: string;
  actionFields: {
    economicBreak?: string;
    nonEconomicBreak?: string;
  };
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  createdAt: string;
  resolvedAt?: string;
}

export interface QueueMetrics {
  drafting: number;
  matching: number;
  pendingApprovals: number;
  ccnr: number;
  pendingSingleSign: number;
  pendingDoubleSign: number;
  documentsNotSent: number;
}