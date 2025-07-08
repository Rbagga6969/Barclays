import React, { useState } from 'react';
import { X, Save, FileText, DollarSign } from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';

interface ManualDataEntryProps {
  onClose: () => void;
  onSubmit: (trade: EquityTrade | FXTrade) => void;
}

const ManualDataEntry: React.FC<ManualDataEntryProps> = ({ onClose, onSubmit }) => {
  const [tradeType, setTradeType] = useState<'equity' | 'fx'>('equity');
  const [formData, setFormData] = useState({
    // Common fields
    tradeId: '',
    counterparty: '',
    tradeDate: new Date().toISOString().split('T')[0],
    settlementDate: '',
    
    // Equity specific
    orderId: '',
    clientId: '',
    equityTradeType: 'Buy' as 'Buy' | 'Sell',
    quantity: '',
    price: '',
    currency: 'USD',
    tradingVenue: '',
    traderName: '',
    confirmationStatus: 'Pending' as 'Confirmed' | 'Pending' | 'Failed' | 'Settled',
    countryOfTrade: '',
    opsTeamNotes: '',
    
    // FX specific
    valueDate: '',
    tradeTime: '',
    traderId: '',
    currencyPair: '',
    buySell: 'Buy' as 'Buy' | 'Sell',
    dealtCurrency: '',
    baseCurrency: '',
    termCurrency: '',
    fxTradeStatus: 'Booked' as 'Booked' | 'Confirmed' | 'Settled' | 'Cancelled',
    productType: 'Spot' as 'Spot' | 'Forward' | 'Swap',
    maturityDate: '',
    confirmationTimestamp: '',
    amendmentFlag: 'No' as 'Yes' | 'No',
    confirmationMethod: 'Electronic' as 'SWIFT' | 'Email' | 'Electronic' | 'Manual',
    fxConfirmationStatus: 'Pending' as 'Confirmed' | 'Pending' | 'Disputed'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateTradeId = () => {
    const prefix = tradeType === 'equity' ? 'TID' : 'FX';
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    return `${prefix}${randomNum.toString().padStart(5, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tradeId = formData.tradeId || generateTradeId();
    
    if (tradeType === 'equity') {
      const equityTrade: EquityTrade = {
        tradeId,
        orderId: formData.orderId || `OID${Math.floor(Math.random() * 90000) + 10000}`,
        clientId: formData.clientId || `CID${Math.floor(Math.random() * 9000) + 1000}`,
        tradeType: formData.equityTradeType,
        quantity: parseInt(formData.quantity) || 100,
        price: parseFloat(formData.price) || 100,
        tradeValue: (parseInt(formData.quantity) || 100) * (parseFloat(formData.price) || 100),
        currency: formData.currency,
        tradeDate: formData.tradeDate,
        settlementDate: formData.settlementDate || formData.tradeDate,
        counterparty: formData.counterparty,
        tradingVenue: formData.tradingVenue || 'NYSE',
        traderName: formData.traderName || 'Manual Entry',
        confirmationStatus: formData.confirmationStatus,
        countryOfTrade: formData.countryOfTrade || 'US',
        opsTeamNotes: formData.opsTeamNotes || 'Manual Entry'
      };
      onSubmit(equityTrade);
    } else {
      const fxTrade: FXTrade = {
        tradeId,
        tradeDate: formData.tradeDate,
        valueDate: formData.valueDate || formData.tradeDate,
        tradeTime: formData.tradeTime || new Date().toLocaleTimeString(),
        traderId: formData.traderId || 'Manual Entry',
        counterparty: formData.counterparty,
        currencyPair: formData.currencyPair || `${formData.baseCurrency}/${formData.termCurrency}`,
        buySell: formData.buySell,
        dealtCurrency: formData.dealtCurrency || formData.baseCurrency,
        baseCurrency: formData.baseCurrency || 'USD',
        termCurrency: formData.termCurrency || 'EUR',
        tradeStatus: formData.fxTradeStatus,
        productType: formData.productType,
        maturityDate: formData.maturityDate || formData.valueDate || formData.tradeDate,
        confirmationTimestamp: formData.confirmationTimestamp || new Date().toISOString(),
        settlementDate: formData.settlementDate || formData.valueDate || formData.tradeDate,
        amendmentFlag: formData.amendmentFlag,
        confirmationMethod: formData.confirmationMethod,
        confirmationStatus: formData.fxConfirmationStatus
      };
      onSubmit(fxTrade);
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
                  Add Manual Trade Entry
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trade Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trade Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="equity"
                      checked={tradeType === 'equity'}
                      onChange={(e) => setTradeType(e.target.value as 'equity' | 'fx')}
                      className="mr-2"
                    />
                    <span className="text-sm">Equity Trade</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="fx"
                      checked={tradeType === 'fx'}
                      onChange={(e) => setTradeType(e.target.value as 'equity' | 'fx')}
                      className="mr-2"
                    />
                    <span className="text-sm">FX Trade</span>
                  </label>
                </div>
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trade ID (optional - auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    value={formData.tradeId}
                    onChange={(e) => handleInputChange('tradeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Auto-generated: ${tradeType === 'equity' ? 'TID' : 'FX'}XXXXX`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Counterparty *
                  </label>
                  <select
                    value={formData.counterparty}
                    onChange={(e) => handleInputChange('counterparty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Counterparty</option>
                    <option value="JPMorgan">JPMorgan</option>
                    <option value="Goldman Sachs">Goldman Sachs</option>
                    <option value="Morgan Stanley">Morgan Stanley</option>
                    <option value="Citibank">Citibank</option>
                    <option value="Deutsche Bank">Deutsche Bank</option>
                    <option value="BNP Paribas">BNP Paribas</option>
                    <option value="HSBC">HSBC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trade Date *
                  </label>
                  <input
                    type="date"
                    value={formData.tradeDate}
                    onChange={(e) => handleInputChange('tradeDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Settlement Date
                  </label>
                  <input
                    type="date"
                    value={formData.settlementDate}
                    onChange={(e) => handleInputChange('settlementDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Equity Specific Fields */}
              {tradeType === 'equity' && (
                <>
                  <h4 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Equity Trade Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={formData.clientId}
                        onChange={(e) => handleInputChange('clientId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Auto-generated if empty"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trade Type *
                      </label>
                      <select
                        value={formData.equityTradeType}
                        onChange={(e) => handleInputChange('equityTradeType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Buy">Buy</option>
                        <option value="Sell">Sell</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency *
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="CHF">CHF</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trading Venue
                      </label>
                      <select
                        value={formData.tradingVenue}
                        onChange={(e) => handleInputChange('tradingVenue', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Venue</option>
                        <option value="NYSE">NYSE</option>
                        <option value="NASDAQ">NASDAQ</option>
                        <option value="BATS">BATS</option>
                        <option value="IEX">IEX</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trader Name
                      </label>
                      <input
                        type="text"
                        value={formData.traderName}
                        onChange={(e) => handleInputChange('traderName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Manual Entry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmation Status *
                      </label>
                      <select
                        value={formData.confirmationStatus}
                        onChange={(e) => handleInputChange('confirmationStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Failed">Failed</option>
                        <option value="Settled">Settled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country of Trade
                      </label>
                      <select
                        value={formData.countryOfTrade}
                        onChange={(e) => handleInputChange('countryOfTrade', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="JP">Japan</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operations Team Notes
                    </label>
                    <textarea
                      value={formData.opsTeamNotes}
                      onChange={(e) => handleInputChange('opsTeamNotes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>
                </>
              )}

              {/* FX Specific Fields */}
              {tradeType === 'fx' && (
                <>
                  <h4 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    FX Trade Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value Date
                      </label>
                      <input
                        type="date"
                        value={formData.valueDate}
                        onChange={(e) => handleInputChange('valueDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trader ID
                      </label>
                      <input
                        type="text"
                        value={formData.traderId}
                        onChange={(e) => handleInputChange('traderId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Manual Entry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buy/Sell *
                      </label>
                      <select
                        value={formData.buySell}
                        onChange={(e) => handleInputChange('buySell', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Buy">Buy</option>
                        <option value="Sell">Sell</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Currency *
                      </label>
                      <select
                        value={formData.baseCurrency}
                        onChange={(e) => {
                          handleInputChange('baseCurrency', e.target.value);
                          handleInputChange('currencyPair', `${e.target.value}/${formData.termCurrency}`);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Base</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="CHF">CHF</option>
                        <option value="AUD">AUD</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Term Currency *
                      </label>
                      <select
                        value={formData.termCurrency}
                        onChange={(e) => {
                          handleInputChange('termCurrency', e.target.value);
                          handleInputChange('currencyPair', `${formData.baseCurrency}/${e.target.value}`);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Term</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="CHF">CHF</option>
                        <option value="AUD">AUD</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Type *
                      </label>
                      <select
                        value={formData.productType}
                        onChange={(e) => handleInputChange('productType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Spot">Spot</option>
                        <option value="Forward">Forward</option>
                        <option value="Swap">Swap</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trade Status *
                      </label>
                      <select
                        value={formData.fxTradeStatus}
                        onChange={(e) => handleInputChange('fxTradeStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Booked">Booked</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Settled">Settled</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmation Method *
                      </label>
                      <select
                        value={formData.confirmationMethod}
                        onChange={(e) => handleInputChange('confirmationMethod', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Electronic">Electronic</option>
                        <option value="SWIFT">SWIFT</option>
                        <option value="Email">Email</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmation Status *
                      </label>
                      <select
                        value={formData.fxConfirmationStatus}
                        onChange={(e) => handleInputChange('fxConfirmationStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Disputed">Disputed</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Trade Value Display */}
              {tradeType === 'equity' && formData.quantity && formData.price && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      Calculated Trade Value: {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: formData.currency || 'USD'
                      }).format((parseInt(formData.quantity) || 0) * (parseFloat(formData.price) || 0))}
                    </span>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Add Trade
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualDataEntry;