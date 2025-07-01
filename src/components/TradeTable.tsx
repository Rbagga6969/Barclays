import React, { useState } from 'react';
import { Eye, FileText, Download, AlertTriangle, CheckCircle, Clock, XCircle, Shield, User } from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';
import TradeConfirmationModal from './TradeConfirmationModal';

interface TradeTableProps {
  trades: (EquityTrade | FXTrade)[];
  tradeType: 'equity' | 'fx' | 'all';
  onSelectTradeForDocs?: (trade: EquityTrade | FXTrade) => void;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, tradeType, onSelectTradeForDocs }) => {
  const [selectedTrade, setSelectedTrade] = useState<EquityTrade | FXTrade | null>(null);
  const [showModal, setShowModal] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'settled':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'booked':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'disputed':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'settled':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'booked':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'disputed':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  };

  const getRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;
    
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (riskLevel.toLowerCase()) {
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  };

  const handleViewConfirmation = (trade: EquityTrade | FXTrade) => {
    setSelectedTrade(trade);
    setShowModal(true);
  };

  const isEquityTrade = (trade: EquityTrade | FXTrade): trade is EquityTrade => {
    return 'orderId' in trade;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            Trade Confirmations ({trades.length} trades)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trade ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Counterparty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trade Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trade Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.map((trade) => (
                <tr key={trade.tradeId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {trade.tradeId}
                    {trade.failureReason && (
                      <div className="text-xs text-red-600 mt-1" title={trade.failureReason}>
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        Issue Detected
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isEquityTrade(trade) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Equity
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        FX
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trade.counterparty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isEquityTrade(trade) ? (
                      <div>
                        <div className="font-medium">{trade.tradeType} {trade.quantity.toLocaleString()}</div>
                        <div className="text-gray-400">@ {trade.price}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{trade.currencyPair}</div>
                        <div className="text-gray-400">{trade.buySell} {trade.dealtCurrency}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isEquityTrade(trade) ? (
                      formatCurrency(trade.tradeValue, trade.currency)
                    ) : (
                      <span className="text-gray-500">FX Trade</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(isEquityTrade(trade) ? trade.confirmationStatus : trade.confirmationStatus)}
                      <span className={getStatusBadge(isEquityTrade(trade) ? trade.confirmationStatus : trade.confirmationStatus)}>
                        {isEquityTrade(trade) ? trade.confirmationStatus : trade.confirmationStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trade.riskLevel && (
                      <span className={getRiskBadge(trade.riskLevel)}>
                        {trade.riskLevel}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trade.tradeDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewConfirmation(trade)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </button>
                      {onSelectTradeForDocs && (
                        <button
                          onClick={() => onSelectTradeForDocs(trade)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Docs
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {trades.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No trades found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}
      </div>

      {showModal && selectedTrade && (
        <TradeConfirmationModal
          trade={selectedTrade}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedTrade(null);
          }}
        />
      )}
    </>
  );
};

export default TradeTable;