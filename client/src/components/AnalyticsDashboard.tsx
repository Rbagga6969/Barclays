import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Activity } from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';

interface AnalyticsDashboardProps {
  equityTrades: EquityTrade[];
  fxTrades: FXTrade[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ equityTrades, fxTrades }) => {
  const allTrades = [...equityTrades, ...fxTrades];

  // Status distribution data
  const statusData = React.useMemo(() => {
    const statusCounts = allTrades.reduce((acc, trade) => {
      const status = 'confirmationStatus' in trade ? trade.confirmationStatus : trade.confirmationStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: ((count / allTrades.length) * 100).toFixed(1)
    }));
  }, [allTrades]);

  // Monthly trade volume
  const monthlyData = React.useMemo(() => {
    const monthlyTrades = allTrades.reduce((acc, trade) => {
      const month = new Date(trade.tradeDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!acc[month]) {
        acc[month] = { month, equity: 0, fx: 0, total: 0 };
      }
      
      if ('orderId' in trade) {
        acc[month].equity += 1;
      } else {
        acc[month].fx += 1;
      }
      acc[month].total += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyTrades).sort((a: any, b: any) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  }, [allTrades]);

  // Trade value distribution
  const valueDistribution = React.useMemo(() => {
    const ranges = [
      { name: '< $100K', min: 0, max: 100000 },
      { name: '$100K - $500K', min: 100000, max: 500000 },
      { name: '$500K - $1M', min: 500000, max: 1000000 },
      { name: '$1M - $5M', min: 1000000, max: 5000000 },
      { name: '> $5M', min: 5000000, max: Infinity }
    ];

    return ranges.map(range => {
      const count = equityTrades.filter(trade => 
        trade.tradeValue >= range.min && trade.tradeValue < range.max
      ).length;
      
      return {
        name: range.name,
        value: count,
        percentage: ((count / equityTrades.length) * 100).toFixed(1)
      };
    });
  }, [equityTrades]);

  // Counterparty performance
  const counterpartyData = React.useMemo(() => {
    const counterpartyStats = allTrades.reduce((acc, trade) => {
      const cp = trade.counterparty;
      if (!acc[cp]) {
        acc[cp] = { name: cp, total: 0, confirmed: 0, failed: 0, pending: 0 };
      }
      
      acc[cp].total += 1;
      const status = 'confirmationStatus' in trade ? trade.confirmationStatus : trade.confirmationStatus;
      
      if (status === 'Confirmed' || status === 'Settled') acc[cp].confirmed += 1;
      else if (status === 'Failed' || status === 'Disputed') acc[cp].failed += 1;
      else acc[cp].pending += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(counterpartyStats)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 6);
  }, [allTrades]);

  // Risk metrics
  const riskMetrics = React.useMemo(() => {
    const failedTrades = allTrades.filter(trade => {
      const status = 'confirmationStatus' in trade ? trade.confirmationStatus : trade.confirmationStatus;
      return ['Failed', 'Disputed'].includes(status);
    });

    const totalValue = equityTrades.reduce((sum, trade) => sum + trade.tradeValue, 0);
    const failedValue = equityTrades
      .filter(trade => ['Failed'].includes(trade.confirmationStatus))
      .reduce((sum, trade) => sum + trade.tradeValue, 0);

    return {
      failureRate: ((failedTrades.length / allTrades.length) * 100).toFixed(2),
      avgResolutionTime: '4.2 hours',
      riskExposure: ((failedValue / totalValue) * 100).toFixed(2),
      slaCompliance: '94.8%'
    };
  }, [allTrades, equityTrades]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failure Rate</p>
              <p className="text-2xl font-bold text-red-600">{riskMetrics.failureRate}%</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">↓ 2.1% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold text-blue-600">{riskMetrics.avgResolutionTime}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">↓ 0.8hrs from target</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Exposure</p>
              <p className="text-2xl font-bold text-orange-600">{riskMetrics.riskExposure}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Of total trade value</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
              <p className="text-2xl font-bold text-green-600">{riskMetrics.slaCompliance}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">↑ 1.2% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trade Volume */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trade Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="equity" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="fx" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trade Value Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Value Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Counterparty Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Counterparties Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={counterpartyData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="confirmed" stackId="a" fill="#10B981" />
                <Bar dataKey="pending" stackId="a" fill="#F59E0B" />
                <Bar dataKey="failed" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6' }} />
              <Line type="monotone" dataKey="equity" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
              <Line type="monotone" dataKey="fx" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;