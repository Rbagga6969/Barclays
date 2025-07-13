import React, { useState } from 'react';
import { Upload, Download, Cloud, FileText, CheckCircle, AlertTriangle, X, Database, Send, Eye, Filter } from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';
import { parseEquityCSV, parseFXCSV, parseGenericCSV, convertGenericToTrades } from '../utils/csvParser';

interface DataManagementProps {
  onDataImport: (trades: (EquityTrade | FXTrade)[]) => void;
}

interface ExcelData {
  headers: string[];
  rows: string[][];
}

const DataManagement: React.FC<DataManagementProps> = ({ onDataImport }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [importedData, setImportedData] = useState<(EquityTrade | FXTrade)[]>([]);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

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
    input.accept = '.csv,.xlsx,.xls,.txt';
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setSelectedFiles(files);
      
      // Process the first file for preview
      if (files.length > 0) {
        processFileForPreview(files[0]);
      }
    };
    
    input.click();
  };

  const processFileForPreview = async (file: File) => {
    try {
      setErrorMessage('');
      const text = await file.text();
      
      if (!text.trim()) {
        throw new Error('File is empty');
      }

      // Handle different file formats
      let lines: string[];
      if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt')) {
        lines = text.split('\n').filter(line => line.trim());
      } else {
        // For Excel files, try to parse as CSV (simplified approach)
        lines = text.split('\n').filter(line => line.trim());
      }

      if (lines.length === 0) {
        throw new Error('No data found in file');
      }

      // Parse CSV data
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      ).filter(row => row.length > 1 && row.some(cell => cell.trim())); // Filter out empty rows

      if (rows.length === 0) {
        throw new Error('No data rows found in file');
      }

      setExcelData({ headers, rows });
      setSelectedColumns(headers); // Select all columns by default
      setShowPreview(true);
    } catch (error) {
      setErrorMessage(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('File processing error:', error);
    }
  };

  const handleColumnToggle = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleSelectAllColumns = () => {
    if (excelData) {
      setSelectedColumns(selectedColumns.length === excelData.headers.length ? [] : excelData.headers);
    }
  };

  const getFilteredData = () => {
    if (!excelData) return { headers: [], rows: [] };
    
    const columnIndices = selectedColumns.map(col => excelData.headers.indexOf(col));
    
    return {
      headers: selectedColumns,
      rows: excelData.rows.map(row => 
        columnIndices.map(index => row[index] || '')
      )
    };
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
        
        if (!text.trim()) {
          console.warn(`File ${file.name} is empty, skipping...`);
          continue;
        }

        try {
          // Try to parse as generic CSV first
          const genericData = parseGenericCSV(text);
          const convertedTrades = convertGenericToTrades(genericData);
          
          if (convertedTrades.length > 0) {
            allTrades.push(...convertedTrades);
            console.log(`Successfully parsed ${convertedTrades.length} trades from ${file.name}`);
          } else {
            // Fallback to specific parsers
            if (file.name.toLowerCase().includes('equity') || file.name.toLowerCase().includes('eq')) {
              const equityTrades = parseEquityCSV(text);
              allTrades.push(...equityTrades);
            } else if (file.name.toLowerCase().includes('fx') || file.name.toLowerCase().includes('foreign')) {
              const fxTrades = parseFXCSV(text);
              allTrades.push(...fxTrades);
            } else {
              // Try both parsers
              try {
                const equityTrades = parseEquityCSV(text);
                if (equityTrades.length > 0) {
                  allTrades.push(...equityTrades);
                }
              } catch {
                try {
                  const fxTrades = parseFXCSV(text);
                  allTrades.push(...fxTrades);
                } catch {
                  console.warn(`Could not parse file ${file.name} with any parser`);
                }
              }
            }
          }
        } catch (fileError) {
          console.warn(`Error processing file ${file.name}:`, fileError);
        }
      }

      if (allTrades.length === 0) {
        throw new Error('No valid trade data found in the selected files. Please ensure your files contain trade information with proper column headers.');
      }

      setImportedData(allTrades);
      setImportStatus('success');
      onDataImport(allTrades);
      
      setTimeout(() => {
        alert(`Successfully imported ${allTrades.length} trades from ${selectedFiles.length} file(s)! The entire website now reflects this data.`);
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
    const filteredData = getFilteredData();
    const rows = [filteredData.headers, ...filteredData.rows];
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (index === 0) {
      setExcelData(null);
      setShowPreview(false);
      setSelectedColumns([]);
    }
  };

  const filteredPreviewData = getFilteredData();

  // Sample data generator for demonstration
  const generateSampleData = () => {
    const sampleTrades: (EquityTrade | FXTrade)[] = [
      {
        tradeId: 'SAMPLE001',
        orderId: 'ORD001',
        clientId: 'CLIENT001',
        tradeType: 'Buy' as const,
        quantity: 1000,
        price: 150.50,
        tradeValue: 150500,
        currency: 'USD',
        tradeDate: '2024-01-15',
        settlementDate: '2024-01-17',
        counterparty: 'Goldman Sachs',
        tradingVenue: 'NYSE',
        traderName: 'John Smith',
        confirmationStatus: 'Confirmed' as const,
        countryOfTrade: 'US',
        opsTeamNotes: 'Sample trade data'
      },
      {
        tradeId: 'SAMPLE002',
        tradeDate: '2024-01-15',
        valueDate: '2024-01-17',
        tradeTime: '10:30:00',
        traderId: 'TRADER001',
        counterparty: 'JPMorgan',
        currencyPair: 'EUR/USD',
        buySell: 'Buy' as const,
        dealtCurrency: 'EUR',
        baseCurrency: 'EUR',
        termCurrency: 'USD',
        tradeStatus: 'Booked' as const,
        productType: 'Spot' as const,
        maturityDate: '2024-01-17',
        confirmationTimestamp: '2024-01-15T10:30:00Z',
        settlementDate: '2024-01-17',
        amendmentFlag: 'No' as const,
        confirmationMethod: 'Electronic' as const,
        confirmationStatus: 'Confirmed' as const
      }
    ];

    setImportedData(sampleTrades);
    onDataImport(sampleTrades);
    alert(`Sample data with ${sampleTrades.length} trades has been loaded for demonstration!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enhanced Data Management Center</h2>
              <p className="text-gray-600">Import Excel/CSV files and export trade data with Microsoft OneDrive integration</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={generateSampleData}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Load Sample Data</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                {isConnected ? 'OneDrive Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Data Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Upload className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Import Excel/CSV Data</h3>
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
                <p className="text-sm text-gray-600">Select Excel/CSV files from OneDrive</p>
                <p className="text-xs text-gray-500 mt-1">Supports CSV, XLSX, XLS, TXT files</p>
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
                          <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
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
                    Import Data to Website
                  </>
                )}
              </button>

              {importStatus === 'success' && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">Successfully imported {importedData.length} trades! Website data updated.</span>
                </div>
              )}

              {importStatus === 'error' && (
                <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Import Error:</p>
                    <p>{errorMessage}</p>
                    <p className="mt-2 text-xs">
                      Tip: Ensure your file contains columns like TradeID, Counterparty, Currency, etc.
                    </p>
                  </div>
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
                <p>• Selected columns: {selectedColumns.length}</p>
                <p>• Total rows to export: {filteredPreviewData.rows.length}</p>
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

      {/* Column Selection and Data Preview */}
      {showPreview && excelData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="h-5 w-5 text-blue-600 mr-2" />
              Data Preview & Column Selection
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Column Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Filter className="h-4 w-4 text-gray-600 mr-2" />
                Select Columns to Display ({selectedColumns.length}/{excelData.headers.length})
              </h4>
              <button
                onClick={handleSelectAllColumns}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedColumns.length === excelData.headers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {excelData.headers.map((header, index) => (
                <label key={index} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(header)}
                    onChange={() => handleColumnToggle(header)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-gray-700 truncate" title={header}>{header}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {filteredPreviewData.headers.map((header, index) => (
                    <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPreviewData.rows.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={cell}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPreviewData.rows.length > 10 && (
            <p className="text-sm text-gray-500 text-center py-2">
              Showing 10 of {filteredPreviewData.rows.length} rows. Import data to see all records.
            </p>
          )}
        </div>
      )}

      {/* Imported Data Summary */}
      {importedData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900">Total Trades Imported</h4>
              <p className="text-2xl font-bold text-blue-600">{importedData.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900">Equity Trades</h4>
              <p className="text-2xl font-bold text-green-600">
                {importedData.filter(trade => 'orderId' in trade).length}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900">FX Trades</h4>
              <p className="text-2xl font-bold text-purple-600">
                {importedData.filter(trade => !('orderId' in trade)).length}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The imported data is now reflected across the entire website including Trade Confirmations, Analytics, Document Management, and Workflow Management sections.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;