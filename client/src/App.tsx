import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EnhancedAnalyticsDashboard from './components/EnhancedAnalyticsDashboard';
import TradeFiltersComponent from './components/TradeFilters';
import TradeTable from './components/TradeTable';

import WorkflowDashboard from './components/WorkflowDashboard';
import WorkflowTracker from './components/WorkflowTracker';
import EnhancedDocumentManagement from './components/EnhancedDocumentManagement';
import { EquityTrade, FXTrade, TradeFilters, FailureAnalysis, DocumentStatus } from './types/trade';
import { TradeWorkflow, WorkflowAction } from './types/workflow';
import { parseEquityCSV, parseFXCSV } from './utils/csvParser';
import { generateWorkflowForTrade, generateWorkflowActions } from './utils/workflowGenerator';
import { getRiskLevel } from './utils/failureAnalysis';
import { generateEnhancedFailureAnalysis, generateEnhancedDocumentStatus, enhanceTradeWithBreakInfo } from './utils/enhancedFailureAnalysis';

function App() {
  const [equityTrades, setEquityTrades] = useState<EquityTrade[]>([]);
  const [fxTrades, setFxTrades] = useState<FXTrade[]>([]);
  const [workflows, setWorkflows] = useState<TradeWorkflow[]>([]);
  const [workflowActions, setWorkflowActions] = useState<WorkflowAction[]>([]);
  const [failures, setFailures] = useState<FailureAnalysis[]>([]);
  const [documentStatuses, setDocumentStatuses] = useState<Record<string, DocumentStatus>>({});
  const [selectedWorkflow, setSelectedWorkflow] = useState<TradeWorkflow | null>(null);
  const [selectedTradeForDocs, setSelectedTradeForDocs] = useState<EquityTrade | FXTrade | null>(null);
  const [activeTab, setActiveTab] = useState<'trades' | 'workflows' | 'analytics' | 'documents'>('trades');
  const [filters, setFilters] = useState<TradeFilters>({
    tradeType: 'all',
    status: '',
    counterparty: '',
    dateFrom: '',
    dateTo: '',
    currency: '',
    trader: '',
    riskLevel: '',
    documentStatus: '',
    breakType: '',
    pendingWith: '',
    queueStatus: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load equity trades
        const equityResponse = await fetch('/data/equity_trade_lifecycle_dataset.csv');
        const equityText = await equityResponse.text();
        const parsedEquityTrades = parseEquityCSV(equityText);
        
        // Enhance equity trades with additional data
        const enhancedEquityTrades = parsedEquityTrades.map(trade => {
          const enhancedTrade = enhanceTradeWithBreakInfo({
            ...trade,
            riskLevel: getRiskLevel(trade),
            failureReason: ['Failed', 'Disputed'].includes(trade.confirmationStatus) 
              ? generateEnhancedFailureAnalysis(trade)?.reason 
              : undefined
          });
          return enhancedTrade as EquityTrade;
        });
        
        setEquityTrades(enhancedEquityTrades);

        // Load FX trades
        const fxResponse = await fetch('/data/fx_trade_lifecycle_full_dataset.csv');
        const fxText = await fxResponse.text();
        const parsedFxTrades = parseFXCSV(fxText);
        
        // Enhance FX trades with additional data
        const enhancedFxTrades = parsedFxTrades.map(trade => {
          const enhancedTrade = enhanceTradeWithBreakInfo({
            ...trade,
            riskLevel: getRiskLevel(trade),
            failureReason: ['Failed', 'Disputed'].includes(trade.confirmationStatus) 
              ? generateEnhancedFailureAnalysis(trade)?.reason 
              : undefined
          });
          return enhancedTrade as FXTrade;
        });
        
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
          .map(generateEnhancedFailureAnalysis)
          .filter(Boolean) as FailureAnalysis[];
        setFailures(failureAnalyses);

        // Generate document statuses
        const docStatuses = allTrades.reduce((acc, trade) => {
          acc[trade.tradeId] = generateEnhancedDocumentStatus(trade);
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

      // Break type filter
      if (filters.breakType && trade.breakType !== filters.breakType) {
        return false;
      }

      // Pending with filter
      if (filters.pendingWith && trade.pendingWith !== filters.pendingWith) {
        return false;
      }

      // Queue status filter
      if (filters.queueStatus && trade.queueStatus !== filters.queueStatus) {
        return false;
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
          doc.submitted && doc.clientSigned && doc.bankSigned && doc.qaStatus === 'Approved'
        );
        const hasPending = Object.values(docStatus).some(doc => 
          doc.makerStatus === 'Pending' || doc.checkerStatus === 'Pending' || doc.qaStatus === 'Pending'
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

  const handleChartClick = (dataType: string, filterData: any) => {
    // Apply filters based on chart click
    const newFilters = { ...filters };
    
    if (dataType === 'breakType' && filterData.breakType) {
      newFilters.breakType = filterData.breakType;
    } else if (dataType === 'queueStatus' && filterData.queueStatus) {
      newFilters.queueStatus = filterData.queueStatus;
    } else if (dataType === 'pendingWith' && filterData.pendingWith) {
      newFilters.pendingWith = filterData.pendingWith;
    }
    
    setFilters(newFilters);
    setActiveTab('trades'); // Switch to trades tab to show filtered results
  };

  const handleSendToSettlements = (tradeId: string) => {
    // Update trade status to indicate it's been sent to settlements
    setEquityTrades(prev => prev.map(trade => 
      trade.tradeId === tradeId 
        ? { ...trade, sentToSettlements: true, settlementsSentAt: new Date().toISOString() }
        : trade
    ));
    
    setFxTrades(prev => prev.map(trade => 
      trade.tradeId === tradeId 
        ? { ...trade, sentToSettlements: true, settlementsSentAt: new Date().toISOString() }
        : trade
    ));

    // Simulate sending email to settlements team
    const trade = [...equityTrades, ...fxTrades].find(t => t.tradeId === tradeId);
    if (trade) {
      alert(`Trade ${tradeId} has been successfully sent to the Settlements team via email. Excel data export completed.`);
    }
  };

  const handleManualDataAdd = (newTrade: EquityTrade | FXTrade | (EquityTrade | FXTrade)[]) => {
    const trades = Array.isArray(newTrade) ? newTrade : [newTrade];
    
    trades.forEach(trade => {
      const isEquityTrade = 'orderId' in trade;
    
      // Enhance the new trade with additional data
      const enhancedTrade = enhanceTradeWithBreakInfo({
        ...trade,
        riskLevel: getRiskLevel(trade),
        failureReason: ['Failed', 'Disputed'].includes(
          isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus
        ) ? generateEnhancedFailureAnalysis(trade)?.reason : undefined
      });

      if (isEquityTrade) {
        setEquityTrades(prev => [...prev, enhancedTrade as EquityTrade]);
      } else {
        setFxTrades(prev => [...prev, enhancedTrade as FXTrade]);
      }

      // Generate workflow for the new trade
      const newWorkflow = generateWorkflowForTrade(enhancedTrade);
      setWorkflows(prev => [...prev, newWorkflow]);

      // Generate workflow actions
      const newActions = generateWorkflowActions([newWorkflow]);
      setWorkflowActions(prev => [...prev, ...newActions]);

      // Generate failure analysis if needed
      const failureAnalysis = generateEnhancedFailureAnalysis(enhancedTrade);
      if (failureAnalysis) {
        setFailures(prev => [...prev, failureAnalysis]);
      }

      // Generate document status
      const docStatus = generateEnhancedDocumentStatus(enhancedTrade);
      setDocumentStatuses(prev => ({
        ...prev,
        [enhancedTrade.tradeId]: docStatus
      }));
    });


    const message = Array.isArray(newTrade) 
      ? `${newTrade.length} trades have been successfully imported from OneDrive.`
      : `Trade ${newTrade.tradeId} has been successfully added to the system.`;
    alert(message);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enhanced Trade Confirmation Management System
          </h2>
          <p className="text-gray-600">
            Comprehensive trade lifecycle management with real-time analytics and workflow automation
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { key: 'trades', label: 'Trade Confirmations' },
              { key: 'analytics', label: 'Enhanced Analytics' },
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
              failures={failures}
            />
          </>
        )}

        {activeTab === 'analytics' && (
          <EnhancedAnalyticsDashboard 
            equityTrades={equityTrades} 
            fxTrades={fxTrades}
            documentStatuses={documentStatuses}
            onChartClick={handleChartClick}
          />
        )}



        {activeTab === 'documents' && (
          <EnhancedDocumentManagement onDataImport={handleManualDataAdd} />
        )}

        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <WorkflowDashboard 
              workflows={workflows} 
              actions={workflowActions}
              trades={[...equityTrades, ...fxTrades]}
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