import React, { useState } from 'react';
import { Eye, AlertTriangle, CheckCircle, Clock, XCircle, Send, ExternalLink, Download } from 'lucide-react';
import { EquityTrade, FXTrade, FailureAnalysis } from '../types/trade';
import TradeConfirmationModal from './TradeConfirmationModal';

interface TradeTableProps {
  trades: (EquityTrade | FXTrade)[];
  tradeType: 'equity' | 'fx' | 'all';
  onSelectTradeForDocs?: (trade: EquityTrade | FXTrade) => void;
  failures: FailureAnalysis[];
}

const TradeTable: React.FC<TradeTableProps> = ({ 
  trades, 
  tradeType, 
  onSelectTradeForDocs,
  failures
}) => {
  const [selectedTrade, setSelectedTrade] = useState<EquityTrade | FXTrade | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFailure, setSelectedFailure] = useState<FailureAnalysis | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
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

  const handleViewBreakDetails = (tradeId: string) => {
    const failure = failures.find(f => f.tradeId === tradeId);
    if (failure) {
      setSelectedFailure(failure);
    }
  };

  const handleDownloadPDF = (trade: EquityTrade | FXTrade) => {
    // Generate PDF content
    const pdfContent = generateTradeConfirmationPDF(trade);
    
    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Trade_Confirmation_${trade.tradeId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    alert(`Trade Confirmation Notice for ${trade.tradeId} has been downloaded to your Downloads folder.`);
  };

  const generateTradeConfirmationPDF = (trade: EquityTrade | FXTrade): string => {
    const isEquityTrade = 'orderId' in trade;
    const currentDate = new Date().toLocaleDateString('en-GB');
    
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 800
>>
stream
BT
/F1 16 Tf
50 750 Td
(BARCLAYS BANK PLC - TRADE CONFIRMATION NOTICE) Tj
0 -30 Td
/F1 12 Tf
(Trade Confirmation Department) Tj
0 -15 Td
(1 Churchill Place, London E14 5HP, United Kingdom) Tj
0 -30 Td
(TRADE IDENTIFICATION) Tj
0 -20 Td
(Trade Reference: ${trade.tradeId}) Tj
${isEquityTrade ? `
0 -15 Td
(Order Reference: ${trade.orderId}) Tj
` : ''}
0 -15 Td
(Trade Date: ${trade.tradeDate}) Tj
0 -15 Td
(Settlement Date: ${isEquityTrade ? trade.settlementDate : trade.settlementDate}) Tj
0 -30 Td
(COUNTERPARTY DETAILS) Tj
0 -20 Td
(Institution: ${trade.counterparty}) Tj
${isEquityTrade ? `
0 -15 Td
(Trading Venue: ${trade.tradingVenue}) Tj
0 -15 Td
(Country: ${trade.countryOfTrade}) Tj
` : ''}
0 -30 Td
(TRADE SPECIFICATIONS) Tj
0 -20 Td
${isEquityTrade ? `
(Transaction Type: ${trade.tradeType}) Tj
0 -15 Td
(Quantity: ${trade.quantity.toLocaleString()} shares) Tj
0 -15 Td
(Price per Share: ${trade.price} ${trade.currency}) Tj
0 -15 Td
(Total Trade Value: ${trade.tradeValue.toLocaleString()} ${trade.currency}) Tj
` : `
(Currency Pair: ${trade.currencyPair}) Tj
0 -15 Td
(Transaction Type: ${trade.buySell}) Tj
0 -15 Td
(Product Type: ${trade.productType}) Tj
0 -15 Td
(Value Date: ${trade.valueDate}) Tj
`}
0 -30 Td
(BANK APPROVAL & AUTHORIZATION) Tj
0 -20 Td
(Bank Authorization: APPROVED) Tj
0 -15 Td
(Authorized By: Senior Trade Operations Manager) Tj
0 -15 Td
(Authorization Date: ${currentDate}) Tj
0 -15 Td
(Digital Signature: VERIFIED) Tj
0 -30 Td
(This confirmation is issued in accordance with the terms and conditions) Tj
0 -15 Td
(governing trading relationships between Barclays Bank PLC and the counterparty.) Tj
0 -30 Td
(Document Generated: ${currentDate}) Tj
0 -15 Td
(Reference: ${trade.tradeId}-CONF) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000271 00000 n 
0000001123 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
1201
%%EOF`;
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

  // Filter out settled trades
  const filteredTrades = trades.filter(trade => {
    const status = isEquityTrade(trade) ? trade.confirmationStatus : trade.confirmationStatus;
    return status !== 'Settled';
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
            Trade Confirmations ({filteredTrades.length} trades)
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
                  Break Details
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
              {filteredTrades.map((trade) => {
                const tradeFailure = failures.find(f => f.tradeId === trade.tradeId);
                return (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tradeFailure ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tradeFailure.breakType === 'Economic' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {tradeFailure.breakType}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Pending: {tradeFailure.pendingWith}
                        </div>
                        <div className="text-xs text-gray-600">
                          Owner: {tradeFailure.nextActionOwner}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No breaks</span>
                    )}
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
                      <button
                        onClick={() => handleDownloadPDF(trade)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </button>
                      {tradeFailure && (
                        <button
                          onClick={() => handleViewBreakDetails(trade.tradeId)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Break Details
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        
        {filteredTrades.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No trades found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}
      </div>

      {/* Break Details Modal */}
      {selectedFailure && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedFailure(null)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Break Analysis - {selectedFailure.tradeId}</h3>
                  <button
                    onClick={() => setSelectedFailure(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Break Type</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedFailure.breakType === 'Economic' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedFailure.breakType} Break
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                    <p className="text-sm text-gray-900">{selectedFailure.reason}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Suggested Solution</label>
                    <p className="text-sm text-gray-900">{selectedFailure.suggestedSolution}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pending With</label>
                      <p className="text-sm text-gray-900">{selectedFailure.pendingWith}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Next Action Owner</label>
                      <p className="text-sm text-gray-900">{selectedFailure.nextActionOwner}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estimated Resolution Time</label>
                    <p className="text-sm text-gray-900">{selectedFailure.estimatedResolutionTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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