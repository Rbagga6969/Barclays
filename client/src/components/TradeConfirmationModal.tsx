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
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Trade Confirmation - ${trade.tradeId}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Arial', sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background: #fff;
                margin: 20px;
              }
              .document-header {
                background: linear-gradient(135deg, var(--mocha-dark) 0%, var(--mocha) 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
                margin-bottom: 0;
              }
              .document-header h1 {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
                letter-spacing: 1px;
              }
              .document-header p {
                font-size: 16px;
                opacity: 0.9;
              }
              .content-wrapper {
                border: 2px solid #e5e7eb;
                border-radius: 0 0 10px 10px;
                overflow: hidden;
              }
              .trade-details {
                padding: 30px;
                background: #f8fafc;
              }
              .detail-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin-bottom: 25px;
              }
              .detail-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid var(--mocha);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .detail-label {
                font-weight: bold;
                color: #374151;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
              }
              .detail-value {
                font-size: 16px;
                color: #111827;
                font-weight: 600;
              }
              .status-badge {
                display: inline-block;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .status-confirmed { background: #d1fae5; color: #065f46; }
              .status-pending { background: #fef3c7; color: #92400e; }
              .status-failed { background: #fed7d7; color: #c53030; }
              .legal-section {
                background: #f1f5f9;
                padding: 25px;
                border-top: 1px solid #e5e7eb;
              }
              .legal-title {
                font-size: 14px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .legal-text {
                font-size: 11px;
                color: #4b5563;
                margin-bottom: 12px;
                line-height: 1.5;
              }
              .signature-section {
                background: white;
                padding: 30px;
                border-top: 2px solid #e5e7eb;
              }
              .signature-title {
                font-size: 18px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 25px;
                text-align: center;
              }
              .signature-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 40px;
              }
              .signature-box {
                border: 2px solid #d1d5db;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                background: #fafafa;
              }
              .signature-label {
                font-weight: bold;
                color: #374151;
                margin-bottom: 15px;
                font-size: 14px;
              }
              .signature-line {
                border-bottom: 2px solid #6b7280;
                height: 60px;
                margin-bottom: 15px;
                position: relative;
              }
              .signature-line::after {
                content: "Signature";
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                color: #9ca3af;
              }
              .date-line {
                border-bottom: 1px solid #6b7280;
                width: 120px;
                margin: 10px auto;
                height: 20px;
                position: relative;
              }
              .date-line::after {
                content: "Date";
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                color: #9ca3af;
              }
              .footer-info {
                background: #1f2937;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 0 0 10px 10px;
              }
              .footer-info p {
                font-size: 12px;
                margin-bottom: 5px;
              }
              .footer-info .ref-number {
                font-weight: bold;
                color: var(--mocha-accent);
              }
              @media print { 
                .no-print { display: none; } 
                body { margin: 0; }
                .document-header { border-radius: 0; }
                .content-wrapper { border-radius: 0; }
                .footer-info { border-radius: 0; }
              }
            </style>
          </head>
          <body>
            <div class="document-header">
              <h1>TRADE CONFIRMATION</h1>
              <p>Official Transaction Record - Barclays Bank PLC</p>
            </div>
            
            <div class="content-wrapper">
              <div class="trade-details">
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">Trade ID</div>
                    <div class="detail-value">${trade.tradeId}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">
                      <span class="status-badge status-${isEquityTrade(trade) ? trade.confirmationStatus.toLowerCase() : trade.confirmationStatus.toLowerCase()}">${isEquityTrade(trade) ? trade.confirmationStatus : trade.confirmationStatus}</span>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Trade Date</div>
                    <div class="detail-value">${trade.tradeDate}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Settlement Date</div>
                    <div class="detail-value">${trade.settlementDate}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Counterparty</div>
                    <div class="detail-value">${trade.counterparty}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Trade Time</div>
                    <div class="detail-value">${trade.tradeTime}</div>
                  </div>
                  ${isEquityTrade(trade) ? `
                    <div class="detail-item">
                      <div class="detail-label">Order ID</div>
                      <div class="detail-value">${trade.orderId}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Client ID</div>
                      <div class="detail-value">${trade.clientId || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Security</div>
                      <div class="detail-value">${trade.security}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Side</div>
                      <div class="detail-value">${trade.side}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Quantity</div>
                      <div class="detail-value">${trade.quantity.toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Price</div>
                      <div class="detail-value">$${trade.price.toFixed(2)}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Trade Value</div>
                      <div class="detail-value">$${trade.tradeValue.toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Currency</div>
                      <div class="detail-value">${trade.currency}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Trading Venue</div>
                      <div class="detail-value">${trade.tradingVenue || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Trader</div>
                      <div class="detail-value">${trade.trader}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Country of Trade</div>
                      <div class="detail-value">${trade.countryOfTrade || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Operations Notes</div>
                      <div class="detail-value">${trade.opsTeamNotes || 'N/A'}</div>
                    </div>
                  ` : `
                    <div class="detail-item">
                      <div class="detail-label">Currency Pair</div>
                      <div class="detail-value">${trade.currencyPair}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Transaction Type</div>
                      <div class="detail-value">${trade.transactionType}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Base Currency</div>
                      <div class="detail-value">${trade.baseCurrency}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Quote Currency</div>
                      <div class="detail-value">${trade.quoteCurrency}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Term Currency</div>
                      <div class="detail-value">${trade.termCurrency || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Dealt Currency</div>
                      <div class="detail-value">${trade.dealtCurrency || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Trader ID</div>
                      <div class="detail-value">${trade.traderId || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Value Date</div>
                      <div class="detail-value">${trade.valueDate || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Trade Status</div>
                      <div class="detail-value">${trade.tradeStatus || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Product Type</div>
                      <div class="detail-value">${trade.productType || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Maturity Date</div>
                      <div class="detail-value">${trade.maturityDate || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Confirmation Method</div>
                      <div class="detail-value">${trade.confirmationMethod || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Amendment Flag</div>
                      <div class="detail-value">${trade.amendmentFlag || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Confirmation Timestamp</div>
                      <div class="detail-value">${trade.confirmationTimestamp || 'N/A'}</div>
                    </div>
                  `}
                </div>
              </div>

              <div class="legal-section">
                <div class="legal-title">Important Legal Notice</div>
                <p class="legal-text">
                  This confirmation is issued in accordance with the terms and conditions governing 
                  trading relationships between Barclays Bank PLC and the counterparty. This document 
                  constitutes a legally binding confirmation of the trade details specified herein.
                </p>
                <p class="legal-text">
                  Any discrepancies must be reported immediately to the Trade Confirmation Department. 
                  Failure to object within 24 hours of receipt shall constitute acceptance of all terms.
                </p>
                <p class="legal-text">
                  This trade is subject to the standard terms and conditions of Barclays Bank PLC and 
                  applicable regulatory requirements including but not limited to MiFID II, EMIR, and 
                  relevant local regulations.
                </p>
              </div>

              <div class="signature-section">
                <div class="signature-title">Required Signatures</div>
                <div class="signature-grid">
                  <div class="signature-box">
                    <div class="signature-label">Client Authorization</div>
                    <div class="signature-line"></div>
                    <div class="date-line"></div>
                    <p style="font-size: 11px; color: #6b7280; margin-top: 25px;">
                      By signing above, the client confirms receipt and acceptance of this trade confirmation.
                    </p>
                  </div>
                  <div class="signature-box">
                    <div class="signature-label">Bank Representative</div>
                    <div class="signature-line"></div>
                    <div class="date-line"></div>
                    <p style="font-size: 11px; color: #6b7280; margin-top: 25px;">
                      Authorized representative of Barclays Bank PLC Trade Confirmation Department.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer-info">
              <p>Document Generated: ${currentDate} at ${currentTime}</p>
              <p class="ref-number">Reference: ${trade.tradeId}-CONF-${Date.now()}</p>
              <p>Barclays Bank PLC • Trade Confirmation Department • London, UK</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
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
              onClick={handleDownloadPDF}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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