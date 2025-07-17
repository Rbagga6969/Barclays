import React from 'react';
import { X, FileText, Download, Building2, Calendar, DollarSign, User } from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';

interface TradeConfirmationModalProps {
  trade: EquityTrade | FXTrade;
  isOpen: boolean;
  onClose: () => void;
}

const TradeConfirmationModal: React.FC<TradeConfirmationModalProps> = ({
  trade,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

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

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handleDownloadPDF = () => {
    // Simulate PDF generation and download
    const tradeData = {
      tradeId: trade.tradeId,
      counterparty: trade.counterparty,
      tradeDate: trade.tradeDate,
      status: isEquityTrade(trade) ? trade.confirmationStatus : trade.confirmationStatus,
      value: isEquityTrade(trade) ? trade.tradeValue : 'FX Trade',
      currency: isEquityTrade(trade) ? trade.currency : trade.baseCurrency + '/' + trade.termCurrency
    };

    // In a real application, this would generate and download a PDF
    console.log('Generating PDF for trade:', tradeData);
    alert(`PDF confirmation for trade ${trade.tradeId} has been generated and downloaded successfully.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Trade Confirmation Document
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Formal Legal Document */}
            <div className="bg-white border-2 border-gray-300 p-8 font-serif text-sm leading-relaxed">
              {/* Header */}
              <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                <div className="flex items-center justify-center mb-2">
                  <Building2 className="h-8 w-8 text-blue-900 mr-3" />
                  <h1 className="text-2xl font-bold text-blue-900">BARCLAYS BANK PLC</h1>
                </div>
                <p className="text-sm text-gray-600">Trade Confirmation Department</p>
                <p className="text-xs text-gray-500">1 Churchill Place, London E14 5HP, United Kingdom</p>
                <p className="text-xs text-gray-500">Authorized by the Prudential Regulation Authority</p>
              </div>

              {/* Document Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  TRADE CONFIRMATION NOTICE
                </h2>
                <p className="text-sm text-gray-600">
                  This document serves as formal confirmation of the trade executed as detailed below
                </p>
              </div>

              {/* Trade Details */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                    TRADE IDENTIFICATION
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Trade Reference:</span>
                      <span>{trade.tradeId}</span>
                    </div>
                    {isEquityTrade(trade) && (
                      <div className="flex justify-between">
                        <span className="font-medium">Order Reference:</span>
                        <span>{trade.orderId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Trade Date:</span>
                      <span>{trade.tradeDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Settlement Date:</span>
                      <span>{isEquityTrade(trade) ? trade.settlementDate : trade.settlementDate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                    COUNTERPARTY DETAILS
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Institution:</span>
                      <span>{trade.counterparty}</span>
                    </div>
                    {isEquityTrade(trade) && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Trading Venue:</span>
                          <span>{trade.tradingVenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Country:</span>
                          <span>{trade.countryOfTrade}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Trade Specifics */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                  TRADE SPECIFICATIONS
                </h3>
                
                {isEquityTrade(trade) ? (
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Transaction Type:</span>
                        <span className="font-bold">{trade.tradeType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Quantity:</span>
                        <span>{trade.quantity.toLocaleString()} shares</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Price per Share:</span>
                        <span>{formatCurrency(trade.price, trade.currency)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Currency:</span>
                        <span>{trade.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total Trade Value:</span>
                        <span className="font-bold text-lg">{formatCurrency(trade.tradeValue, trade.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Client ID:</span>
                        <span>{trade.clientId}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Currency Pair:</span>
                        <span className="font-bold">{trade.currencyPair}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Transaction Type:</span>
                        <span className="font-bold">{trade.buySell}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Dealt Currency:</span>
                        <span>{trade.dealtCurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Product Type:</span>
                        <span>{trade.productType}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Base Currency:</span>
                        <span>{trade.baseCurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Term Currency:</span>
                        <span>{trade.termCurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Value Date:</span>
                        <span>{trade.valueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Trade Time:</span>
                        <span>{trade.tradeTime}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status and Processing */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                  BANK APPROVAL & AUTHORIZATION
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    {!isEquityTrade(trade) && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Trade Status:</span>
                          <span>{trade.tradeStatus}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Confirmation Method:</span>
                          <span>{trade.confirmationMethod}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Bank Authorization:</span>
                      <span className="font-bold text-green-600">APPROVED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Authorized By:</span>
                      <span className="font-bold">Senior Trade Operations Manager</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Trader:</span>
                      <span>{isEquityTrade(trade) ? trade.traderName : trade.traderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Authorization Date:</span>
                      <span>{currentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Digital Signature:</span>
                      <span className="font-bold text-blue-600">VERIFIED</span>
                    </div>
                    {isEquityTrade(trade) && (
                      <div className="flex justify-between">
                        <span className="font-medium">Operations Notes:</span>
                        <span>{trade.opsTeamNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Footer */}
              <div className="border-t-2 border-gray-800 pt-4 mt-8">
                <div className="text-xs text-gray-600 space-y-2">
                  <p className="font-bold">IMPORTANT LEGAL NOTICE:</p>
                  <p>
                    This confirmation is issued in accordance with the terms and conditions governing 
                    trading relationships between Barclays Bank PLC and the counterparty. This document 
                    constitutes a legally binding confirmation of the trade details specified herein.
                  </p>
                  <p>
                    Any discrepancies must be reported immediately to the Trade Confirmation Department. 
                    Failure to object within 24 hours of receipt shall constitute acceptance of all terms.
                  </p>
                  <p>
                    This trade is subject to the standard terms and conditions of Barclays Bank PLC and 
                    applicable regulatory requirements including but not limited to MiFID II, EMIR, and 
                    relevant local regulations.
                  </p>
                </div>
                
                <div className="flex justify-between items-end mt-6">
                  <div>
                    <p className="text-xs text-gray-600">Document Generated: {currentDate}</p>
                    <p className="text-xs text-gray-600">Reference: {trade.tradeId}-CONF</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-800">BARCLAYS BANK PLC</p>
                    <p className="text-xs text-gray-600">Trade Confirmation Department</p>
                    <div className="mt-2 border-t border-gray-400 pt-1">
                      <p className="text-xs text-gray-600">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeConfirmationModal;