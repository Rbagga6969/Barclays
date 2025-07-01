import { EquityTrade, FXTrade, FailureAnalysis, DocumentStatus, DocumentInfo } from '../types/trade';

export const generateFailureAnalysis = (trade: EquityTrade | FXTrade): FailureAnalysis | null => {
  const isEquityTrade = 'orderId' in trade;
  const status = isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus;
  
  if (!['Failed', 'Disputed'].includes(status)) {
    return null;
  }

  const failureReasons = {
    'Failed': [
      {
        type: 'Settlement' as const,
        reason: 'Insufficient funds in client account',
        solution: 'Contact client for additional funding or reduce trade size',
        time: '2-4 hours',
        assignedTo: 'Settlement Team'
      },
      {
        type: 'Documentation' as const,
        reason: 'Missing client signature on trade confirmation',
        solution: 'Resend documents for digital signature via DocuSign',
        time: '1-2 hours',
        assignedTo: 'Documentation Team'
      },
      {
        type: 'Compliance' as const,
        reason: 'Trade exceeds client risk limits',
        solution: 'Obtain risk override approval or modify trade parameters',
        time: '4-8 hours',
        assignedTo: 'Compliance Team'
      },
      {
        type: 'Technical' as const,
        reason: 'System connectivity issues with counterparty',
        solution: 'Switch to backup communication channel or manual processing',
        time: '30 minutes - 2 hours',
        assignedTo: 'IT Support'
      }
    ],
    'Disputed': [
      {
        type: 'Client' as const,
        reason: 'Price discrepancy reported by client',
        solution: 'Review trade execution logs and provide price justification',
        time: '2-6 hours',
        assignedTo: 'Trade Support'
      },
      {
        type: 'Counterparty' as const,
        reason: 'Settlement instruction mismatch',
        solution: 'Coordinate with counterparty to align settlement details',
        time: '4-12 hours',
        assignedTo: 'Operations Team'
      }
    ]
  };

  const reasons = failureReasons[status as keyof typeof failureReasons];
  const randomReason = reasons[Math.floor(Math.random() * reasons.length)];

  return {
    tradeId: trade.tradeId,
    failureType: randomReason.type,
    reason: randomReason.reason,
    impact: getImpactLevel(trade),
    suggestedSolution: randomReason.solution,
    estimatedResolutionTime: randomReason.time,
    assignedTo: randomReason.assignedTo,
    status: 'Open',
    createdAt: new Date().toISOString()
  };
};

const getImpactLevel = (trade: EquityTrade | FXTrade): 'Low' | 'Medium' | 'High' | 'Critical' => {
  const isEquityTrade = 'orderId' in trade;
  
  if (isEquityTrade) {
    if (trade.tradeValue > 5000000) return 'Critical';
    if (trade.tradeValue > 1000000) return 'High';
    if (trade.tradeValue > 100000) return 'Medium';
    return 'Low';
  } else {
    // For FX trades, consider currency pair and product type
    if (['EUR/USD', 'GBP/USD', 'USD/JPY'].includes(trade.currencyPair) && trade.productType === 'Forward') {
      return 'High';
    }
    return 'Medium';
  }
};

export const generateDocumentStatus = (trade: EquityTrade | FXTrade): DocumentStatus => {
  const isEquityTrade = 'orderId' in trade;
  const status = isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus;
  
  const createDocumentInfo = (submitted: boolean, clientSigned: boolean, bankSigned: boolean): DocumentInfo => ({
    submitted,
    clientSigned,
    bankSigned,
    timestamp: submitted ? new Date().toISOString() : undefined,
    documentUrl: submitted ? `/documents/${trade.tradeId}` : undefined,
    version: 1
  });

  switch (status) {
    case 'Confirmed':
    case 'Settled':
      return {
        tradeConfirmation: createDocumentInfo(true, true, true),
        clientAgreement: createDocumentInfo(true, true, true),
        riskDisclosure: createDocumentInfo(true, true, true),
        complianceChecklist: createDocumentInfo(true, false, true)
      };
    case 'Pending':
      return {
        tradeConfirmation: createDocumentInfo(true, false, true),
        clientAgreement: createDocumentInfo(true, false, true),
        riskDisclosure: createDocumentInfo(true, true, true),
        complianceChecklist: createDocumentInfo(true, false, true)
      };
    case 'Failed':
    case 'Disputed':
      return {
        tradeConfirmation: createDocumentInfo(true, false, false),
        clientAgreement: createDocumentInfo(false, false, false),
        riskDisclosure: createDocumentInfo(true, true, true),
        complianceChecklist: createDocumentInfo(false, false, false)
      };
    default:
      return {
        tradeConfirmation: createDocumentInfo(false, false, false),
        clientAgreement: createDocumentInfo(false, false, false),
        riskDisclosure: createDocumentInfo(false, false, false),
        complianceChecklist: createDocumentInfo(false, false, false)
      };
  }
};

export const getRiskLevel = (trade: EquityTrade | FXTrade): 'Low' | 'Medium' | 'High' | 'Critical' => {
  const isEquityTrade = 'orderId' in trade;
  const status = isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus;
  
  if (['Failed', 'Disputed'].includes(status)) {
    return getImpactLevel(trade);
  }
  
  if (isEquityTrade) {
    if (trade.tradeValue > 2000000) return 'High';
    if (trade.tradeValue > 500000) return 'Medium';
    return 'Low';
  } else {
    if (trade.amendmentFlag === 'Yes') return 'High';
    if (trade.productType === 'Forward') return 'Medium';
    return 'Low';
  }
};