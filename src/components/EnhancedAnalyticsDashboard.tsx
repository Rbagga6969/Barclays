import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Activity, Filter, FileText, Users } from 'lucide-react';
import { EquityTrade, FXTrade, DocumentStatus } from '../types/trade';

interface EnhancedAnalyticsDashboardProps {
  equityTrades: EquityTrade[];
  fxTrades: FXTrade[];
  documentStatuses: Record<string, DocumentStatus>;
  onChartClick: (dataType: string, filters: any) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

const EnhancedAnalyticsDashboard: React.FC<EnhancedAnalyticsDashboardProps> = ({ 
  equityTrades, 
  fxTrades, 
  documentStatuses,
  onChartClick 
}) => {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const allTrades = [...equityTrades, ...fxTrades];

  // Break Type Analysis
  const breakTypeData = React.useMemo(() => {
    const breakCounts = allTrades.reduce((acc, trade) => {
      if (trade.breakType) {
        acc[trade.breakType] = (acc[trade.breakType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakCounts).map(([type, count]) => ({
      name: type,
      value: count,
      percentage: ((count / allTrades.length) * 100).toFixed(1)
    }));
  }, [allTrades]);

  // Queue Status Distribution
  const queueStatusData = React.useMemo(() => {
    const queueCounts = allTrades.reduce((acc, trade) => {
      const status = trade.queueStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(queueCounts).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: ((count / allTrades.length) * 100).toFixed(1)
    }));
  }, [allTrades]);

  // Pending With Analysis
  const pendingWithData = React.useMemo(() => {
    const pendingCounts = allTrades.reduce((acc, trade) => {
      if (trade.pendingWith) {
        acc[trade.pendingWith] = (acc[trade.pendingWith] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(pendingCounts)
      .map(([entity, count]) => ({
        name: entity,
        value: count,
        percentage: ((count / allTrades.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);
  }, [allTrades]);

  // Document Status Metrics
  const documentMetrics = React.useMemo(() => {
    let singleSignPending = 0;
    let doubleSignPending = 0;
    let notSentToClient = 0;
    let makerCheckerPending = 0;
    let frontOfficePending = 0;
    let tradingSalesPending = 0;

    Object.values(documentStatuses).forEach(docStatus => {
      Object.values(docStatus).forEach(doc => {
        if (doc.signatureType === 'Single' && !doc.clientSigned) singleSignPending++;
        if (doc.signatureType === 'Double' && (!doc.clientSigned || !doc.bankSigned)) doubleSignPending++;
        if (!doc.sentToClient) notSentToClient++;
        if (doc.makerStatus === 'Pending' || doc.checkerStatus === 'Pending' || doc.qaStatus === 'Pending') makerCheckerPending++;
      });
      
      // Check for front office and trading sales approvals
      if (docStatus.frontOfficeSalesApproval && docStatus.frontOfficeSalesApproval.makerStatus === 'Pending') {
        frontOfficePending++;
      }
      if (docStatus.tradingSalesApproval && docStatus.tradingSalesApproval.makerStatus === 'Pending') {
        tradingSalesPending++;
      }
    });

    return {
      singleSignPending,
      doubleSignPending,
      notSentToClient,
      makerCheckerPending,
      frontOfficePending,
      tradingSalesPending
    };
  }, [documentStatuses]);

  // Document Signature Status Data for Chart
  const documentSignatureData = React.useMemo(() => {
    return [
      { name: 'Single Sign Pending', value: documentMetrics.singleSignPending },
      { name: 'Double Sign Pending', value: documentMetrics.doubleSignPending },
      { name: 'Not Sent to Client', value: documentMetrics.notSentToClient },
      { name: 'QA Pending', value: documentMetrics.makerCheckerPending },
      { name: 'Front Office Pending', value: documentMetrics.frontOfficePending },
      { name: 'Trading Sales Pending', value: documentMetrics.tradingSalesPending }
    ].filter(item => item.value > 0);
  }, [documentMetrics]);

  const handleChartClick = (dataType: string, data?: any) => {
    setSelectedChart(dataType);
    onChartClick(dataType, data);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-600">Click to filter trades</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{`${data.name}: ${data.value}`}</p>
          <p className="text-sm text-gray-600">{`${data.percentage}% of total`}</p>
          <p className="text-sm text-gray-600">Click to filter trades</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Economic Breaks</p>
              <p className="text-2xl font-bold text-red-600">
                {breakTypeData.find(d => d.name === 'Economic')?.value || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Requires immediate attention</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non-Economic Breaks</p>
              <p className="text-2xl font-bold text-orange-600">
                {breakTypeData.find(d => d.name === 'Non-Economic')?.value || 0}
              </p>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Documentation issues</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maker-Checker Pending</p>
              <p className="text-2xl font-bold text-blue-600">{documentMetrics.makerCheckerPending}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Awaiting QA approval</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents Not Sent</p>
              <p className="text-2xl font-bold text-purple-600">{documentMetrics.notSentToClient}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Pending client delivery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Break Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="h-5 w-5 text-blue-600 mr-2" />
            Break Type Distribution
            {selectedChart === 'breakType' && <span className="ml-2 text-sm text-blue-600">(Filtered)</span>}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percentage }) => `${name}: ${value} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handleChartClick('breakType', { breakType: data.name })}
                  style={{ cursor: 'pointer' }}
                >
                  {breakTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Queue Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 text-green-600 mr-2" />
            Queue Status Distribution
            {selectedChart === 'queueStatus' && <span className="ml-2 text-sm text-green-600">(Filtered)</span>}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queueStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="#10B981"
                  onClick={(data) => handleChartClick('queueStatus', { queueStatus: data.name })}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              Total: {queueStatusData.reduce((sum, item) => sum + item.value, 0)} trades
            </p>
          </div>
        </div>

        {/* Pending With Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            Issues Pending With
            {selectedChart === 'pendingWith' && <span className="ml-2 text-sm text-orange-600">(Filtered)</span>}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pendingWithData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="#F59E0B"
                  onClick={(data) => handleChartClick('pendingWith', { pendingWith: data.name })}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              Total: {pendingWithData.reduce((sum, item) => sum + item.value, 0)} pending issues
            </p>
          </div>
        </div>

        {/* Document Signature Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            Document & Approval Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={documentSignatureData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handleChartClick('documentStatus', { type: data.name })}
                  style={{ cursor: 'pointer' }}
                >
                  {documentSignatureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              Total pending items: {documentSignatureData.reduce((sum, item) => sum + item.value, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Document Status Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 text-indigo-600 mr-2" />
          Document Processing Status Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div 
            className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => handleChartClick('signatures', { signatureType: 'Single' })}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{documentMetrics.singleSignPending}</p>
              <p className="text-sm text-purple-800">Single Sign Pending</p>
            </div>
          </div>
          <div 
            className="p-4 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
            onClick={() => handleChartClick('signatures', { signatureType: 'Double' })}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{documentMetrics.doubleSignPending}</p>
              <p className="text-sm text-indigo-800">Double Sign Pending</p>
            </div>
          </div>
          <div 
            className="p-4 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => handleChartClick('documents', { sentToClient: false })}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{documentMetrics.notSentToClient}</p>
              <p className="text-sm text-red-800">Not Sent to Client</p>
            </div>
          </div>
          <div 
            className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => handleChartClick('makerChecker', { status: 'Pending' })}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{documentMetrics.makerCheckerPending}</p>
              <p className="text-sm text-blue-800">QA Pending</p>
            </div>
          </div>
          <div 
            className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => handleChartClick('frontOffice', { status: 'Pending' })}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{documentMetrics.frontOfficePending}</p>
              <p className="text-sm text-green-800">Front Office Pending</p>
            </div>
          </div>
          <div 
            className="p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
            onClick={() => handleChartClick('tradingSales', { status: 'Pending' })}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{documentMetrics.tradingSalesPending}</p>
              <p className="text-sm text-orange-800">Trading Sales Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Information */}
      {selectedChart && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">
                Active Filter: {selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)}
              </span>
            </div>
            <button
              onClick={() => setSelectedChart(null)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filter
            </button>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Click on any chart element to filter the trade data and get a detailed view. Charts are interconnected for holistic analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedAnalyticsDashboard;