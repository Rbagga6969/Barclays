import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TradeFiltersComponent from './components/TradeFilters';
import TradeTable from './components/TradeTable';
import WorkflowDashboard from './components/WorkflowDashboard';
import WorkflowTracker from './components/WorkflowTracker';
import { EquityTrade, FXTrade, TradeFilters } from './types/trade';
import { TradeWorkflow, WorkflowAction } from './types/workflow';
import { parseEquityCSV, parseFXCSV } from './utils/csvParser';
import { generateWorkflowForTrade, generateWorkflowActions } from './utils/workflowGenerator';

function App() {
  const [equityTrades, setEquityTrades] = useState<EquityTrade[]>([]);
  const [fxTrades, setFxTrades] = useState<FXTrade[]>([]);
  const [workflows, setWorkflows] = useState<TradeWorkflow[]>([]);
  const [workflowActions, setWorkflowActions] = useState<WorkflowAction[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<TradeWorkflow | null>(null);
  const [activeTab, setActiveTab] = useState<'trades' | 'workflows'>('trades');
  const [filters, setFilters] = useState<TradeFilters>({
    tradeType: 'all',
    status: '',
    counterparty: '',
    dateFrom: '',
    dateTo: '',
    currency: '',
    trader: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load equity trades
        const equityResponse = await fetch('/data/equity_trade_lifecycle_dataset.csv');
        const equityText = await equityResponse.text();
        const parsedEquityTrades = parseEquityCSV(equityText);
        setEquityTrades(parsedEquityTrades);

        // Load FX trades
        const fxResponse = await fetch('/data/fx_trade_lifecycle_full_dataset.csv');
        const fxText = await fxResponse.text();
        const parsedFxTrades = parseFXCSV(fxText);
        setFxTrades(parsedFxTrades);

        // Generate workflows for all trades
        const allTrades = [...parsedEquityTrades, ...parsedFxTrades];
        const generatedWorkflows = allTrades.map(generateWorkflowForTrade);
        setWorkflows(generatedWorkflows);

        // Generate workflow actions
        const actions = generateWorkflowActions(generatedWorkflows);
        setWorkflowActions(actions);
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

      return true;
    });
  }, [equityTrades, fxTrades, filters]);

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
    // Implement action handling logic here
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
            <button
              onClick={() => setActiveTab('trades')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trades'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Trade Confirmations
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workflows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Workflow Management
            </button>
          </nav>
        </div>

        {activeTab === 'trades' ? (
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
            />
          </>
        ) : (
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