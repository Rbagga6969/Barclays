import React, { useState } from 'react';
import { Upload, Download, Cloud, FileText, CheckCircle, AlertTriangle, X, Database, Send } from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';
import { parseEquityCSV, parseFXCSV } from '../utils/csvParser';

interface DataManagementProps {
  onDataImport: (trades: (EquityTrade | FXTrade)[]) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onDataImport }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [importedData, setImportedData] = useState<(EquityTrade | FXTrade)[]>([]);

  const handleConnectOneDrive = async () => {
    setIsConnecting(true);
    
    // Simulate OneDrive connection
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      alert('Successfully connected to Microsoft OneDrive! You can now import and export data.');
    }, 2000);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.csv,.xlsx,.xls';
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setSelectedFiles(files);
    };
    
    input.click();
  };

  const handleImportData = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select at least one file to import.');
      return;
    }

    setImportStatus('processing');
    setErrorMessage('');

    try {
      const allTrades: (EquityTrade | FXTrade)[] = [];

      for (const file of selectedFiles) {
        const text = await file.text();
        
        if (file.name.toLowerCase().includes('equity') || file.name.toLowerCase().includes('eq')) {
          const equityTrades = parseEquityCSV(text);
          allTrades.push(...equityTrades);
        } else if (file.name.toLowerCase().includes('fx') || file.name.toLowerCase().includes('foreign')) {
          const fxTrades = parseFXCSV(text);
          allTrades.push(...fxTrades);
        } else {
          try {
            const equityTrades = parseEquityCSV(text);
            if (equityTrades.length > 0) {
              allTrades.push(...equityTrades);
            }
          } catch {
            const fxTrades = parseFXCSV(text);
            allTrades.push(...fxTrades);
          }
        }
      }

      if (allTrades.length === 0) {
        throw new Error('No valid trade data found in the selected files.');
      }

      setImportedData(allTrades);
      setImportStatus('success');
      onDataImport(allTrades);
      
      setTimeout(() => {
        alert(`Successfully imported ${allTrades.length} trades from OneDrive!`);
      }, 1000);

    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process files');
    }
  };

  const handleExportData = async () => {
    if (!isConnected) {
      alert('Please connect to OneDrive first to export data.');
      return;
    }

    setExportStatus('processing');

    try {
      // Simulate data processing and export
      setTimeout(() => {
        // Generate CSV content for export
        const csvContent = generateExportCSV();
        
        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `trade_confirmations_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setExportStatus('success');
        alert('Trade data has been successfully exported to OneDrive and downloaded to your computer!');
        
        setTimeout(() => setExportStatus('idle'), 3000);
      }, 2000);

    } catch (error) {
      setExportStatus('error');
      setErrorMessage('Failed to export data to OneDrive');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const generateExportCSV = (): string => {
    const headers = [
      'Trade ID', 'Trade Type', 'Counterparty', 'Trade Date', 'Settlement Date',
      'Currency', 'Trade Value', 'Status', 'Risk Level', 'Break Type',
      'Pending With', 'Queue Status', 'Export Timestamp'
    ];

    const rows = importedData.map(trade => {
      const isEquityTrade = 'orderId' in trade;
      return [
        trade.tradeId,
        isEquityTrade ? 'Equity' : 'FX',
        trade.counterparty,
        trade.tradeDate,
        isEquityTrade ? trade.settlementDate : trade.settlementDate,
        isEquityTrade ? trade.currency : trade.baseCurrency + '/' + trade.termCurrency,
        isEquityTrade ? trade.tradeValue.toString() : 'N/A',
        isEquityTrade ? trade.confirmationStatus : trade.confirmationStatus,
        trade.riskLevel || 'N/A',
        trade.breakType || 'None',
        trade.pendingWith || 'N/A',
        trade.queueStatus || 'N/A',
        new Date().toISOString()
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Data Management Center</h2>
              <p className="text-gray-600">Import and export trade data with Microsoft OneDrive integration</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
              {isConnected ? 'OneDrive Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Data Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Upload className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Import Data from OneDrive</h3>
          </div>

          {!isConnected ? (
            <div className="text-center py-8">
              <Cloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Connect to Microsoft OneDrive to import trade data</p>
              <button
                onClick={handleConnectOneDrive}
                disabled={isConnecting}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center mx-auto"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 mr-2" />
                    Connect to OneDrive
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleFileSelect}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Select files from OneDrive</p>
                <p className="text-xs text-gray-500 mt-1">Supports CSV, XLSX, XLS files</p>
              </button>

              {selectedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Files ({selectedFiles.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm text-gray-900">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleImportData}
                disabled={selectedFiles.length === 0 || importStatus === 'processing'}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                {importStatus === 'processing' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </button>

              {importStatus === 'success' && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">Successfully imported {importedData.length} trades!</span>
                </div>
              )}

              {importStatus === 'error' && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">{errorMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Export Data Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Download className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Export Data to OneDrive</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Export Options</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-2" defaultChecked />
                  <span className="text-sm text-gray-700">Trade Confirmations</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-2" defaultChecked />
                  <span className="text-sm text-gray-700">Document Status</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-2" defaultChecked />
                  <span className="text-sm text-gray-700">Workflow Status</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">Analytics Data</span>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Export Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Total trades to export: {importedData.length || 'No data imported yet'}</p>
                <p>• Export format: CSV</p>
                <p>• Destination: Microsoft OneDrive + Local Download</p>
                <p>• Timestamp: {new Date().toLocaleString()}</p>
              </div>
            </div>

            <button
              onClick={handleExportData}
              disabled={!isConnected || exportStatus === 'processing'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {exportStatus === 'processing' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Export to OneDrive
                </>
              )}
            </button>

            {exportStatus === 'success' && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-800">Data successfully exported to OneDrive and downloaded!</span>
              </div>
            )}

            {exportStatus === 'error' && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-800">{errorMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Preview */}
      {importedData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Imported Data Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trade ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Counterparty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importedData.slice(0, 5).map((trade) => (
                  <tr key={trade.tradeId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trade.tradeId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {'orderId' in trade ? 'Equity' : 'FX'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.counterparty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {'orderId' in trade ? trade.confirmationStatus : trade.confirmationStatus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.tradeDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {importedData.length > 5 && (
              <p className="text-sm text-gray-500 text-center py-2">
                Showing 5 of {importedData.length} imported trades
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;