import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, BarChart3, FileText, Users } from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';

interface DashboardProps {
  equityTrades: EquityTrade[];
  fxTrades: FXTrade[];
}

interface APIStats {
  totalTrades: number;
  totalEquityTrades: number;
  totalFxTrades: number;
  totalWorkflows: number;
  tradeConfirmations: number;
  confirmedTrades: number;
  pendingTrades: number;
  failedTrades: number;
  settledTrades: number;
}

const Dashboard: React.FC<DashboardProps> = ({ equityTrades, fxTrades }) => {
  const [apiStats, setApiStats] = useState<APIStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        setApiStats(stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getTotalTradeValue = () => {
    return equityTrades.reduce((sum, trade) => sum + trade.tradeValue, 0);
  };

  const totalValue = getTotalTradeValue();

  if (loading) {
    return (
      <div className="mb-6 flex items-center justify-center h-32">
        <div className="text-saddlebrown">Loading dashboard...</div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Trades',
      value: apiStats?.totalTrades.toLocaleString() || '0',
      icon: BarChart3,
      color: 'text-saddlebrown',
      bgColor: 'bg-saddlebrown/10'
    },
    {
      name: 'Total Workflows',
      value: apiStats?.totalWorkflows.toLocaleString() || '0',
      icon: Users,
      color: 'text-saddlebrown',
      bgColor: 'bg-saddlebrown/10'
    },
    {
      name: 'Trade Confirmations',
      value: apiStats?.tradeConfirmations.toLocaleString() || '0',
      icon: FileText,
      color: 'text-saddlebrown',
      bgColor: 'bg-saddlebrown/10'
    },
    {
      name: 'Confirmed',
      value: apiStats?.confirmedTrades.toLocaleString() || '0',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Pending',
      value: apiStats?.pendingTrades.toLocaleString() || '0',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Failed',
      value: apiStats?.failedTrades.toLocaleString() || '0',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${stat.bgColor} rounded-lg p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Volume</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-saddlebrown mr-2" />
                <span className="text-sm font-medium text-gray-600">Equity Trades</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{apiStats?.totalEquityTrades || equityTrades.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 text-saddlebrown mr-2" />
                <span className="text-sm font-medium text-gray-600">FX Trades</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{apiStats?.totalFxTrades || fxTrades.length}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Equity Value</span>
                <span className="text-lg font-bold text-blue-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(totalValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmation Status</h3>
          <div className="space-y-3">
            {apiStats && [
              { name: 'Confirmed', count: apiStats.confirmedTrades },
              { name: 'Pending', count: apiStats.pendingTrades },
              { name: 'Failed', count: apiStats.failedTrades },
              { name: 'Settled', count: apiStats.settledTrades }
            ].map(({ name, count }) => {
              if (count === 0) return null;
              const percentage = (count / apiStats.totalTrades) * 100;
              return (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-saddlebrown h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;