import React from 'react';
import { Filter, Calendar, DollarSign, User, Building, AlertTriangle, FileText, Users, Clock } from 'lucide-react';
import { TradeFilters } from '../types/trade';

interface TradeFiltersProps {
  filters: TradeFilters;
  onFiltersChange: (filters: TradeFilters) => void;
  counterparties: string[];
  currencies: string[];
  traders: string[];
}

const TradeFiltersComponent: React.FC<TradeFiltersProps> = ({
  filters,
  onFiltersChange,
  counterparties,
  currencies,
  traders
}) => {
  const handleFilterChange = (key: keyof TradeFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      tradeType: 'all',
      status: '',
      counterparty: '',
      dateFrom: '',
      dateTo: '',
      currency: '',
      trader: '',
      riskLevel: '',
      documentStatus: '',
      breakType: '',
      pendingWith: '',
      queueStatus: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Enhanced Trade Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trade Type
          </label>
          <select
            value={filters.tradeType}
            onChange={(e) => handleFilterChange('tradeType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Trades</option>
            <option value="equity">Equity</option>
            <option value="fx">FX</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Settled">Settled</option>
            <option value="Booked">Booked</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Disputed">Disputed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <AlertTriangle className="inline h-4 w-4 mr-1" />
            Break Type
          </label>
          <select
            value={filters.breakType}
            onChange={(e) => handleFilterChange('breakType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Break Types</option>
            <option value="Economic">Economic Break</option>
            <option value="Non-Economic">Non-Economic Break</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="inline h-4 w-4 mr-1" />
            Pending With
          </label>
          <select
            value={filters.pendingWith}
            onChange={(e) => handleFilterChange('pendingWith', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            <option value="Legal">Legal</option>
            <option value="Middle Office">Middle Office</option>
            <option value="Client">Client</option>
            <option value="Front Office">Front Office</option>
            <option value="Trading Sales">Trading Sales</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="inline h-4 w-4 mr-1" />
            Queue Status
          </label>
          <select
            value={filters.queueStatus}
            onChange={(e) => handleFilterChange('queueStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Queues</option>
            <option value="Drafting">Drafting</option>
            <option value="Matching">Matching</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="CCNR">CCNR (Complete)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Building className="inline h-4 w-4 mr-1" />
            Counterparty
          </label>
          <select
            value={filters.counterparty}
            onChange={(e) => handleFilterChange('counterparty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Counterparties</option>
            {counterparties.map(cp => (
              <option key={cp} value={cp}>{cp}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Currency
          </label>
          <select
            value={filters.currency}
            onChange={(e) => handleFilterChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Currencies</option>
            {currencies.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="inline h-4 w-4 mr-1" />
            Trader
          </label>
          <select
            value={filters.trader}
            onChange={(e) => handleFilterChange('trader', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Traders</option>
            {traders.map(trader => (
              <option key={trader} value={trader}>{trader}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <AlertTriangle className="inline h-4 w-4 mr-1" />
            Risk Level
          </label>
          <select
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Risk Levels</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="inline h-4 w-4 mr-1" />
            Document Status
          </label>
          <select
            value={filters.documentStatus}
            onChange={(e) => handleFilterChange('documentStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Documents</option>
            <option value="complete">Fully Executed</option>
            <option value="pending">Pending Signatures</option>
            <option value="missing">Missing Documents</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (value && value !== 'all') {
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {key}: {value}
                    <button
                      onClick={() => handleFilterChange(key as keyof TradeFilters, key === 'tradeType' ? 'all' : '')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeFiltersComponent;