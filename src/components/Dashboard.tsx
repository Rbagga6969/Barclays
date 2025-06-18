import React from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';

interface DashboardProps {
  equityTrades: EquityTrade[];
  fxTrades: FXTrade[];
}

const Dashboard: React.FC<DashboardProps> = ({ equityTrades, fxTrades }) => {
  const allTrades = [...equityTrades, ...fxTrades];
  
  const getStatusCounts = () => {
    const statusCounts = {
      confirmed: 0,
      pending: 0,
      failed: 0,
      settled: 0,
      disputed: 0,
      cancelled: 0,
      booked: 0
    };

    allTrades.forEach(trade => {
      const status = ('confirmationStatus' in trade ? trade.confirmationStatus : trade.confirmationStatus).toLowerCase();
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++;
      }
    });

    return statusCounts;
  };

  const getTotalTradeValue = () => {
    return equityTrades.reduce((sum, trade) => sum + trade.tradeValue, 0);
  };

  const statusCounts = getStatusCounts();
  const totalValue = getTotalTradeValue();

  const stats = [
    {
      name: 'Total Trades',
      value: allTrades.length.toLocaleString(),
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Confirmed',
      value: statusCounts.confirmed.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Pending',
      value: statusCounts.pending.toLocaleString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Failed/Disputed',
      value: (statusCounts.failed + statusCounts.disputed).toLocaleString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Equity Trades</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{equityTrades.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">FX Trades</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{fxTrades.length}</span>
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
            {Object.entries(statusCounts).map(([status, count]) => {
              if (count === 0) return null;
              const percentage = (count / allTrades.length) * 100;
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 capitalize">{status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
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