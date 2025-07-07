import React, { useMemo } from 'react';
import { Send, CheckCircle, Clock, FileText, Download, Building, Calendar } from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';

interface SettlementsPageProps {
  equityTrades: EquityTrade[];
  fxTrades: FXTrade[];
}

const SettlementsPage: React.FC<SettlementsPageProps> = ({ equityTrades, fxTrades }) => {
  const allTrades = [...equityTrades, ...fxTrades];

  // Filter trades that have been sent to settlements
  const sentToSettlements = useMemo(() => {
    return allTrades.filter(trade => 
      'sentToSettlements' in trade && trade.sentToSettlements
    );
  }, [allTrades]);

  // Filter trades ready to be sent to settlements
  const readyForSettlements = useMemo(() => {
    return allTrades.filter(trade => {
      const isEquityTrade = 'orderId' in trade;
      const status = isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus;
      const alreadySent = 'sentToSettlements' in trade && trade.sentToSettlements;
      return ['Confirmed', 'Settled'].includes(status) && !alreadySent;
    });
  }, [allTrades]);

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

  const handleExportToSettlements = () => {
    // Simulate API call or file export
    const exportData = sentToSettlements.map(trade => ({
      tradeId: trade.tradeId,
      counterparty: trade.counterparty,
      tradeDate: trade.tradeDate,
      settlementDate: isEquityTrade(trade) ? trade.settlementDate : trade.settlementDate,
      status: isEquityTrade(trade) ? trade.confirmationStatus : trade.confirmationStatus,
      sentAt: 'settlementsSentAt' in trade ? trade.settlementsSentAt : new Date().toISOString()
    }));

    // In a real application, this would trigger an API call or file download
    console.log('Exporting to settlements:', exportData);
    
    // Simulate email notification
    alert(`Settlement data for ${sentToSettlements.length} trades has been exported and sent to the Settlements team via automated email.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Settlements Integration</h2>
          <p className="text-gray-600">
            Trade flow: Middle Office → Confirmations → Settlements Team
          </p>
        </div>
        {sentToSettlements.length > 0 && (
          <button
            onClick={handleExportToSettlements}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Export to Settlements</span>
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Send className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Sent to Settlements</p>
              <p className="text-2xl font-bold text-gray-900">{sentToSettlements.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ready for Settlements</p>
              <p className="text-2xl font-bold text-gray-900">{readyForSettlements.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Value Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  sentToSettlements
                    .filter(isEquityTrade)
                    .reduce((sum, trade) => sum + trade.tradeValue, 0),
                  'USD'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sent to Settlements */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Sent to Settlements ({sentToSettlements.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {sentToSettlements.map((trade) => (
              <div key={trade.tradeId} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{trade.tradeId}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isEquityTrade(trade) ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isEquityTrade(trade) ? 'Equity' : 'FX'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{trade.counterparty}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Sent: {'settlementsSentAt' in trade && trade.settlementsSentAt 
                        ? new Date(trade.settlementsSentAt).toLocaleString()
                        : 'Recently'
                      }
                    </div>
                  </div>
                  <div className="text-right">
                    {isEquityTrade(trade) && (
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(trade.tradeValue, trade.currency)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">{trade.tradeDate}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {sentToSettlements.length === 0 && (
              <div className="p-8 text-center">
                <Send className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">No trades sent to settlements yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Ready for Settlements */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              Ready for Settlements ({readyForSettlements.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {readyForSettlements.map((trade) => (
              <div key={trade.tradeId} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{trade.tradeId}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isEquityTrade(trade) ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isEquityTrade(trade) ? 'Equity' : 'FX'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{trade.counterparty}</p>
                    <p className="text-xs text-gray-500">
                      Status: {isEquityTrade(trade) ? trade.confirmationStatus : trade.confirmationStatus}
                    </p>
                  </div>
                  <div className="text-right">
                    {isEquityTrade(trade) && (
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(trade.tradeValue, trade.currency)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">{trade.tradeDate}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {readyForSettlements.length === 0 && (
              <div className="p-8 text-center">
                <Clock className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">No trades ready for settlements</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Integration Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="h-5 w-5 text-blue-600 mr-2" />
          Settlement Integration Process
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Data Reception</h4>
            <p className="text-sm text-gray-600">
              Receive trade data from Middle Office via manual uploads or automated feeds
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Processing & Approval</h4>
            <p className="text-sm text-gray-600">
              Process confirmations through drafting, matching, and approval stages
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Settlement Delivery</h4>
            <p className="text-sm text-gray-600">
              Automatically send final confirmed trades to Settlements team via API or email
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Integration Methods Available:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• API push to Settlements system (preferred)</li>
            <li>• Automated file export to shared location (SFTP/MQ)</li>
            <li>• Email notifications with trade data attachments</li>
            <li>• Direct system integration using message queues</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettlementsPage;