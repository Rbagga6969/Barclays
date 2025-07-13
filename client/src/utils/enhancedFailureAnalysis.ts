import { EquityTrade, FXTrade, FailureAnalysis, DocumentStatus, DocumentInfo } from '../types/trade';

export const generateEnhancedFailureAnalysis = (trade: EquityTrade | FXTrade): FailureAnalysis | null => {
  const isEquityTrade = 'orderId' in trade;
  const status = isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus;
  
  if (!['Failed', 'Disputed'].includes(status)) {
    return null;
  }

  const economicBreakReasons = [
    {
      type: 'Economic Break' as const,
      breakType: 'Economic' as const,
      reason: 'Price discrepancy between trade execution and confirmation',
      solution: 'Verify execution price with trading desk and adjust confirmation',
      time: '2-4 hours',
      assignedTo: 'Middle Office',
      pendingWith: 'Middle Office' as const,
      nextActionOwner: 'Senior Trade Support Analyst',
      classification: 'Price Mismatch - Critical',
      actionFields: {
        economicBreak: 'Reconcile execution price with market data and trading system records'
      }
    },
    {
      type: 'Economic Break' as const,
      breakType: 'Economic' as const,
      reason: 'Quantity mismatch affecting trade value',
      solution: 'Coordinate with Front Office to verify intended trade size',
      time: '1-3 hours',
      assignedTo: 'Front Office',
      pendingWith: 'Front Office' as const,
      nextActionOwner: 'Trading Desk Manager',
      classification: 'Quantity Discrepancy - High',
      actionFields: {
        economicBreak: 'Verify trade allocation and confirm correct quantity with trader'
      }
    },
    {
      type: 'Economic Break' as const,
      breakType: 'Economic' as const,
      reason: 'Currency conversion rate discrepancy',
      solution: 'Validate FX rates used in trade calculation',
      time: '1-2 hours',
      assignedTo: 'Middle Office',
      pendingWith: 'Middle Office' as const,
      nextActionOwner: 'FX Operations Specialist',
      classification: 'FX Rate Mismatch - Medium',
      actionFields: {
        economicBreak: 'Cross-reference FX rates with market data providers and trading system'
      }
    }
  ];

  const nonEconomicBreakReasons = [
    {
      type: 'Non-Economic Break' as const,
      breakType: 'Non-Economic' as const,
      reason: 'Client confirmation pending for trade details',
      solution: 'Contact client for trade confirmation and acknowledgment',
      time: '2-4 hours',
      assignedTo: 'Client Services Team',
      pendingWith: 'Client' as const,
      nextActionOwner: 'Client Relationship Manager',
      classification: 'Client Communication - Confirmation Pending',
      actionFields: {
        nonEconomicBreak: 'Follow up with client for trade confirmation and acknowledgment'
      }
    },
    {
      type: 'Non-Economic Break' as const,
      breakType: 'Non-Economic' as const,
      reason: 'Incorrect settlement instructions',
      solution: 'Update settlement details and reconfirm with counterparty',
      time: '2-4 hours',
      assignedTo: 'Operations Team',
      pendingWith: 'Client' as const,
      nextActionOwner: 'Settlement Operations Manager',
      classification: 'Settlement Instructions - Incorrect',
      actionFields: {
        nonEconomicBreak: 'Verify and update settlement instructions with client and counterparty'
      }
    },
    {
      type: 'Non-Economic Break' as const,
      breakType: 'Non-Economic' as const,
      reason: 'Compliance documentation incomplete',
      solution: 'Obtain missing compliance documents from client',
      time: '4-8 hours',
      assignedTo: 'Compliance Team',
      pendingWith: 'Legal' as const,
      nextActionOwner: 'Compliance Officer',
      classification: 'Compliance - Documentation Gap',
      actionFields: {
        nonEconomicBreak: 'Collect and verify all required compliance documentation'
      }
    },
    {
      type: 'Non-Economic Break' as const,
      breakType: 'Non-Economic' as const,
      reason: 'Trade confirmation format mismatch',
      solution: 'Regenerate confirmation in correct format per client requirements',
      time: '30 minutes - 1 hour',
      assignedTo: 'Documentation Team',
      pendingWith: 'Middle Office' as const,
      nextActionOwner: 'Document Processing Specialist',
      classification: 'Format - Template Mismatch',
      actionFields: {
        nonEconomicBreak: 'Regenerate document using client-specific template and format'
      }
    }
  ];

  const allReasons = [...economicBreakReasons, ...nonEconomicBreakReasons];
  const randomReason = allReasons[Math.floor(Math.random() * allReasons.length)];

  return {
    tradeId: trade.tradeId,
    failureType: randomReason.type,
    breakType: randomReason.breakType,
    reason: randomReason.reason,
    impact: getImpactLevel(trade),
    suggestedSolution: randomReason.solution,
    estimatedResolutionTime: randomReason.time,
    assignedTo: randomReason.assignedTo,
    pendingWith: randomReason.pendingWith,
    nextActionOwner: randomReason.nextActionOwner,
    breakClassification: randomReason.classification,
    actionFields: randomReason.actionFields,
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

export const generateEnhancedDocumentStatus = (trade: EquityTrade | FXTrade): DocumentStatus => {
  const isEquityTrade = 'orderId' in trade;
  const status = isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus;
  
  const createDocumentInfo = (
    submitted: boolean, 
    clientSigned: boolean, 
    bankSigned: boolean,
    makerStatus: 'Pending' | 'Created' | 'Approved' = 'Pending',
    checkerStatus: 'Pending' | 'Reviewed' | 'Approved' = 'Pending',
    qaStatus: 'Pending' | 'In Review' | 'Approved' | 'Rejected' = 'Pending',
    sentToClient: boolean = false,
    signatureType: 'Single' | 'Double' = 'Single'
  ): DocumentInfo => ({
    submitted,
    clientSigned,
    bankSigned,
    timestamp: submitted ? new Date().toISOString() : undefined,
    documentUrl: submitted ? `/documents/${trade.tradeId}` : undefined,
    version: 1,
    makerStatus,
    checkerStatus,
    qaStatus,
    sentToClient,
    signatureType
  });

  switch (status) {
    case 'Confirmed':
    case 'Settled':
      return {
        tradeConfirmation: createDocumentInfo(true, true, true, 'Approved', 'Approved', 'Approved', true, 'Double'),
        clientAgreement: createDocumentInfo(true, true, true, 'Approved', 'Approved', 'Approved', true, 'Single'),
        riskDisclosure: createDocumentInfo(true, true, true, 'Approved', 'Approved', 'Approved', true, 'Single'),
        complianceChecklist: createDocumentInfo(true, false, true, 'Approved', 'Approved', 'Approved', false, 'Single'),
        frontOfficeSalesApproval: createDocumentInfo(true, false, true, 'Approved', 'Approved', 'Approved', false, 'Single'),
        tradingSalesApproval: createDocumentInfo(true, false, true, 'Approved', 'Approved', 'Approved', false, 'Single')
      };
    case 'Pending':
      return {
        tradeConfirmation: createDocumentInfo(true, false, true, 'Approved', 'Approved', 'In Review', true, 'Double'),
        clientAgreement: createDocumentInfo(true, false, true, 'Approved', 'Reviewed', 'Pending', true, 'Single'),
        riskDisclosure: createDocumentInfo(true, true, true, 'Approved', 'Approved', 'Approved', true, 'Single'),
        complianceChecklist: createDocumentInfo(true, false, true, 'Created', 'Pending', 'Pending', false, 'Single'),
        frontOfficeSalesApproval: createDocumentInfo(false, false, false, 'Pending', 'Pending', 'Pending', false, 'Single'),
        tradingSalesApproval: createDocumentInfo(false, false, false, 'Pending', 'Pending', 'Pending', false, 'Single')
      };
    case 'Failed':
    case 'Disputed':
      return {
        tradeConfirmation: createDocumentInfo(true, false, false, 'Created', 'Reviewed', 'Rejected', false, 'Double'),
        clientAgreement: createDocumentInfo(false, false, false, 'Pending', 'Pending', 'Pending', false, 'Single'),
        riskDisclosure: createDocumentInfo(true, true, true, 'Approved', 'Approved', 'Approved', true, 'Single'),
        complianceChecklist: createDocumentInfo(false, false, false, 'Pending', 'Pending', 'Pending', false, 'Single'),
        frontOfficeSalesApproval: createDocumentInfo(false, false, false, 'Pending', 'Pending', 'Pending', false, 'Single'),
        tradingSalesApproval: createDocumentInfo(false, false, false, 'Pending', 'Pending', 'Pending', false, 'Single')
      };
    default:
      return {
        tradeConfirmation: createDocumentInfo(false, false, false),
        clientAgreement: createDocumentInfo(false, false, false),
        riskDisclosure: createDocumentInfo(false, false, false),
        complianceChecklist: createDocumentInfo(false, false, false),
        frontOfficeSalesApproval: createDocumentInfo(false, false, false),
        tradingSalesApproval: createDocumentInfo(false, false, false)
      };
  }
};

export const generateQueueStatus = (trade: EquityTrade | FXTrade): 'Matching' | 'Drafting' | 'Pending Client Confirmation' | 'CCNR' => {
  const isEquityTrade = 'orderId' in trade;
  const status = isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus;
  
  // Create a consistent distribution across all stages
  const random = Math.random();
  
  switch (status) {
    case 'Pending':
      if (random < 0.3) return 'Matching';
      if (random < 0.6) return 'Drafting';
      return 'Pending Client Confirmation';
    case 'Failed':
    case 'Disputed':
      if (random < 0.2) return 'Matching';
      if (random < 0.5) return 'Drafting';
      return 'Pending Client Confirmation';
    case 'Confirmed':
      if (random < 0.1) return 'Matching';
      if (random < 0.3) return 'Drafting';
      if (random < 0.7) return 'Pending Client Confirmation';
      return 'CCNR';
    case 'Settled':
      return 'CCNR';
    case 'Booked':
      if (random < 0.4) return 'Matching';
      if (random < 0.7) return 'Drafting';
      return 'Pending Client Confirmation';
    default:
      if (random < 0.25) return 'Matching';
      if (random < 0.5) return 'Drafting';
      if (random < 0.75) return 'Pending Client Confirmation';
      return 'CCNR';
  }
};

export const enhanceTradeWithBreakInfo = (trade: EquityTrade | FXTrade): EquityTrade | FXTrade => {
  const isEquityTrade = 'orderId' in trade;
  const status = isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus;
  
  let breakType: 'Economic' | 'Non-Economic' | undefined;
  let pendingWith: 'Legal' | 'Middle Office' | 'Client' | 'Front Office' | 'Trading Sales' | undefined;
  let nextActionOwner: string | undefined;
  let breakClassification: string | undefined;
  
  if (['Failed', 'Disputed'].includes(status)) {
    breakType = Math.random() > 0.6 ? 'Economic' : 'Non-Economic';
    
    if (breakType === 'Economic') {
      const economicOptions = ['Middle Office', 'Front Office'];
      pendingWith = economicOptions[Math.floor(Math.random() * economicOptions.length)] as any;
      nextActionOwner = pendingWith === 'Middle Office' ? 'Senior Trade Support Analyst' : 'Trading Desk Manager';
      breakClassification = 'Price/Quantity Discrepancy';
    } else {
      const nonEconomicOptions = ['Legal', 'Client', 'Trading Sales'];
      pendingWith = nonEconomicOptions[Math.floor(Math.random() * nonEconomicOptions.length)] as any;
      nextActionOwner = pendingWith === 'Legal' ? 'Compliance Officer' : 
                       pendingWith === 'Client' ? 'Client Relationship Manager' : 
                       'Sales Operations Manager';
      breakClassification = 'Documentation/Process Issue';
    }
  }
  
  return {
    ...trade,
    breakType,
    pendingWith,
    nextActionOwner,
    breakClassification,
    queueStatus: generateQueueStatus(trade)
  };
};