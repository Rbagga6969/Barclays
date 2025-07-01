import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TradeFiltersComponent from './components/TradeFilters';
import TradeTable from './components/TradeTable';
import WorkflowDashboard from './components/WorkflowDashboard';
import WorkflowTracker from './components/WorkflowTracker';
import FailureAnalysisPanel from './components/FailureAnalysisPanel';
import DocumentManagement from './components/DocumentManagement';
import { EquityTrade, FXTrade, TradeFilters, FailureAnalysis, DocumentStatus } from './types/trade';
import { TradeWorkflow, WorkflowAction } from './types/workflow';
import { parseEquityCSV, parseFXCSV } from './utils/csvParser';
import { generateWorkflowForTrade, generateWorkflowActions } from './utils/workflowGenerator';
import { generateFailureAnalysis, generateDocumentStatus, getRiskLevel } from './utils/failureAnalysis';

function App() {
  const [equityTrades, setEquityTrades] = useState<EquityTrade[]>([]);
  const [fxTrades, setFxTrades] = useState<FXTrade[]>([]);
  const [workflows, setWorkflows] = useState<TradeWorkflow[]>([]);
  const [workflowActions, setWorkflowActions] = useState<WorkflowAction[]>([]);
  const [failures, setFailures] = useState<FailureAnalysis[]>([]);
  const [documentStatuses, setDocumentStatuses] = useState<Record<string, DocumentStatus>>({});
  const [selectedWorkflow, setSelectedWorkflow] = useState<TradeWorkflow | null>(null);
  const [selectedTradeForDocs, setSelectedTradeForDocs] = useState<EquityTrade | FXTrade | null>(null);
  const [activeTab, setActiveTab] = useState<'trades' | 'workflows' | 'analytics' | 'failures' | 'documents'>('trades');
  const [filters, setFilters] = useState<TradeFilters>({
    tradeType: 'all',
    status: '',
    counterparty: '',
    dateFrom: '',
    dateTo: '',
    currency: '',
    trader: '',
    riskLevel: '',
    documentStatus: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load equity trades
        const equityResponse = await fetch('/data/equity_trade_lifecycle_dataset.csv');
        const equityText = await equityResponse.text();
        const parsedEquityTrades = parseEquityCSV(equityText);
        
        // Enhance equity trades with additional data
        const enhancedEquityTrades = parsedEquityTrades.map(trade => ({
          ...trade,
          riskLevel: getRiskLevel(trade),
          failureReason: ['Failed', 'Disputed'].includes(trade.confirmationStatus) 
            ? generateFailureAnalysis(trade)?.reason 
            : undefined
        }));
        
        setEquityTrades(enhancedEquityTrades);

        // Load FX trades
        const fxResponse = await fetch('/data/fx_trade_lifecycle_full_dataset.csv');
        const fxText = await fxResponse.text();
        const parsedFxTrades = parseFXCSV(fxText);
        
        // Enhance FX trades with additional data
        const enhancedFxTrades = parsedFxTrades.map(trade => ({
          ...trade,
          riskLevel: getRiskLevel(trade),
          failureReason: ['Failed', 'Disputed'].includes(trade.confirmationStatus) 
            ? generateFailureAnalysis(trade)?.reason 
            : undefined
        }));
        
        setFxTrades(enhancedFxTrades);

        // Generate workflows for all trades
        const allTrades = [...enhancedEquityTrades, ...enhancedFxTrades];
        const generatedWorkflows = allTrades.map(generateWorkflowForTrade);
        setWorkflows(generatedWorkflows);

        // Generate workflow actions
        const actions = generateWorkflowActions(generatedWorkflows);
        setWorkflowActions(actions);

        // Generate failure analyses
        const failureAnalyses = allTrades
          .map(generateFailureAnalysis)
          .filter(Boolean) as FailureAnalysis[];
        setFailures(failureAnalyses);

        // Generate document statuses
        const docStatuses = allTrades.reduce((acc, trade) => {
          acc[trade.tradeId] = generateDocumentStatus(trade);
          return acc;
        }, {} as Record<string, DocumentStatus>);
        setDocumentStatuses(docStatuses);

      } catch (error) {
        console.error('Error loading trade data:', error);
      }
    };

    loadData();
  }, []);

  const filteredTrades = useMemo(() => {
    let trades: (EquityTrade | FXTrade)[] = [];

    // Filter by trade type
    if (filters.tradeType === 'equity') {
      trades = [...equityTrades];
    } else if (filters.tradeType === 'fx') {
      trades = [...fxTrades];
    } else {
      trades = [...equityTrades, ...fxTrades];
    }

    // Apply filters
    return trades.filter(trade => {
      // Status filter
      if (filters.status) {
        const tradeStatus = 'confirmationStatus' in trade ? trade.confirmationStatus : trade.confirmationStatus;
        if (tradeStatus !== filters.status) return false;
      }

      // Counterparty filter
      if (filters.counterparty && trade.counterparty !== filters.counterparty) {
        return false;
      }

      // Date filters
      if (filters.dateFrom) {
        const tradeDate = new Date(trade.tradeDate);
        const fromDate = new Date(filters.dateFrom);
        if (tradeDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const tradeDate = new Date(trade.tradeDate);
        const toDate = new Date(filters.dateTo);
        if (tradeDate > toDate) return false;
      }

      // Currency filter
      if (filters.currency) {
        if ('currency' in trade && trade.currency !== filters.currency) {
          return false;
        }
        if ('baseCurrency' in trade && 
            trade.baseCurrency !== filters.currency && 
            trade.termCurrency !== filters.currency) {
          return false;
        }
      }

      // Trader filter
      if (filters.trader) {
        const traderName = 'traderName' in trade ? trade.traderName : trade.traderId;
        if (traderName !== filters.trader) return false;
      }

      // Risk level filter
      if (filters.riskLevel && trade.riskLevel !== filters.riskLevel) {
        return false;
      }

      // Document status filter
      if (filters.documentStatus) {
        const docStatus = documentStatuses[trade.tradeId];
        if (!docStatus) return false;
        
        const isComplete = Object.values(docStatus).every(doc => 
          doc.submitted && doc.clientSigned && doc.bankSigned
        );
        const hasPending = Object.values(docStatus).some(doc => 
          doc.submitted && (!doc.clientSigned || !doc.bankSigned)
        );
        const hasMissing = Object.values(docStatus).some(doc => !doc.submitted);
        
        if (filters.documentStatus === 'complete' && !isComplete) return false;
        if (filters.documentStatus === 'pending' && !hasPending) return false;
        if (filters.documentStatus === 'missing' && !hasMissing) return false;
      }

      return true;
    });
  }, [equityTrades, fxTrades, filters, documentStatuses]);

  // Extract unique values for filter dropdowns
  const counterparties = useMemo(() => {
    const allCounterparties = [...equityTrades, ...fxTrades].map(trade => trade.counterparty);
    return [...new Set(allCounterparties)].sort();
  }, [equityTrades, fxTrades]);

  const currencies = useMemo(() => {
    const equityCurrencies = equityTrades.map(trade => trade.currency);
    const fxCurrencies = fxTrades.flatMap(trade => [trade.baseCurrency, trade.termCurrency]);
    return [...new Set([...equityCurrencies, ...fxCurrencies])].sort();
  }, [equityTrades, fxTrades]);

  const traders = useMemo(() => {
    const equityTraders = equityTrades.map(trade => trade.traderName);
    const fxTraders = fxTrades.map(trade => trade.traderId);
    return [...new Set([...equityTraders, ...fxTraders])].sort();
  }, [equityTrades, fxTrades]);

  const handleWorkflowAction = (stepId: string) => {
    console.log('Action required for step:', stepId);
  };

  const handleFailureResolve = (tradeId: string) => {
    setFailures(prev => prev.map(failure => 
      failure.tradeId === tradeId 
        ? { ...failure, status: 'Resolved', resolvedAt: new Date().toISOString() }
        : failure
    ));
  };

  const handleFailureEscalate = (tradeId: string) => {
    setFailures(prev => prev.map(failure => 
      failure.tradeId === tradeId 
        ? { ...failure, status: 'Escalated' }
        : failure
    ));
  };

  const handleDocumentUpdate = (tradeId: string, documentType: string, updates: any) => {
    setDocumentStatuses(prev => ({
      ...prev,
      [tradeId]: {
        ...prev[tradeId],
        [documentType]: {
          ...prev[tradeId][documentType as keyof DocumentStatus],
          ...updates
        }
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Trade Confirmation Management System
          </h2>
          <p className="text-gray-600">
            Monitor and manage trade confirmations across equity and foreign exchange transactions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { key: 'trades', label: 'Trade Confirmations' },
              { key: 'analytics', label: 'Analytics Dashboard' },
              { key: 'failures', label: 'Failure Analysis' },
              { key: 'documents', label: 'Document Management' },
              { key: 'workflows', label: 'Workflow Management' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'trades' && (
          <>
            <Dashboard equityTrades={equityTrades} fxTrades={fxTrades} />
            <TradeFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              counterparties={counterparties}
              currencies={currencies}
              traders={traders}
            />
            <TradeTable 
              trades={filteredTrades} 
              tradeType={filters.tradeType as 'equity' | 'fx' | 'all'}
              onSelectTradeForDocs={setSelectedTradeForDocs}
            />
          </>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard equityTrades={equityTrades} fxTrades={fxTrades} />
        )}

        {activeTab === 'failures' && (
          <FailureAnalysisPanel
            failures={failures}
            onResolve={handleFailureResolve}
            onEscalate={handleFailureEscalate}
          />
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {selectedTradeForDocs ? (
              <DocumentManagement
                trade={selectedTradeForDocs}
                documentStatus={documentStatuses[selectedTradeForDocs.tradeId]}
                onDocumentUpdate={(docType, updates) => 
                  handleDocumentUpdate(selectedTradeForDocs.tradeId, docType, updates)
                }
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Trade</h3>
                <p className="text-gray-500 mb-4">
                  Choose a trade from the Trade Confirmations tab to manage its documents
                </p>
                <button
                  onClick={() => setActiveTab('trades')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Go to Trade Confirmations
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <WorkflowDashboard 
              workflows={workflows} 
              actions={workflowActions}
            />
            
            {selectedWorkflow && (
              <WorkflowTracker
                workflow={selectedWorkflow}
                onActionRequired={handleWorkflowAction}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;