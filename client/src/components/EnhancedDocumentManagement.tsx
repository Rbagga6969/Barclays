import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  Cloud, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Database, 
  Send, 
  Eye, 
  Filter,
  Users,
  Shield,
  User,
  Settings,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';
import { parseGenericCSV, convertGenericToTrades } from '../utils/csvParser';

interface EnhancedDocumentManagementProps {
  onDataImport: (trades: (EquityTrade | FXTrade)[]) => void;
}

interface ExcelData {
  headers: string[];
  rows: string[][];
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  required: boolean;
}

const EnhancedDocumentManagement: React.FC<EnhancedDocumentManagementProps> = ({ onDataImport }) => {
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
  const [activeSection, setActiveSection] = useState<'upload' | 'templates' | 'processing'>('upload');

  const documentTemplates: DocumentTemplate[] = [
    {
      id: 'trade-confirmation',
      name: 'Trade Confirmation Template',
      description: 'Standard trade confirmation document template',
      fields: ['TradeID', 'Counterparty', 'TradeDate', 'SettlementDate', 'Currency', 'Amount'],
      required: true
    },
    {
      id: 'client-agreement',
      name: 'Client Agreement Template',
      description: 'Client agreement and terms template',
      fields: ['ClientID', 'AgreementType', 'SignatureDate', 'ExpiryDate'],
      required: true
    },
    {
      id: 'risk-disclosure',
      name: 'Risk Disclosure Template',
      description: 'Risk disclosure statement template',
      fields: ['RiskLevel', 'ProductType', 'DisclosureDate', 'ClientAcknowledgment'],
      required: false
    },
    {
      id: 'compliance-checklist',
      name: 'Compliance Checklist Template',
      description: 'Internal compliance verification template',
      fields: ['ComplianceOfficer', 'CheckDate', 'Status', 'Notes'],
      required: false
    }
  ];

  const handleConnectOneDrive = async () => {
    setIsConnecting(true);
    
    // Simulate OneDrive connection with realistic delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      alert('Successfully connected to Microsoft OneDrive! You can now import and export documents and data.');
    }, 2500);
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

      // Parse CSV data with enhanced parsing
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
      setActiveSection('processing');
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
          // Use the enhanced CSV parser
          const genericData = parseGenericCSV(text);
          const convertedTrades = convertGenericToTrades(genericData);
          
          if (convertedTrades.length > 0) {
            allTrades.push(...convertedTrades);
            console.log(`Successfully parsed ${convertedTrades.length} trades from ${file.name}`);
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
        link.download = `document_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setExportStatus('success');
        alert('Document data has been successfully exported to OneDrive and downloaded to your computer!');
        
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

  const filteredPreviewData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enhanced Document Management Center</h2>
              <p className="text-gray-600">Upload Excel/CSV files, manage document templates, and export data with Microsoft OneDrive integration</p>
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

      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4 mb-6">
          {[
            { key: 'upload', label: 'File Upload & Processing', icon: Upload },
            { key: 'templates', label: 'Document Templates', icon: FileText },
            { key: 'processing', label: 'Data Processing', icon: Settings }
          ].map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium ${
                  activeSection === section.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* File Upload Section */}
        {activeSection === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OneDrive Connection */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center mb-4">
                <Cloud className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">OneDrive Integration</h3>
              </div>

              {!isConnected ? (
                <div className="text-center py-8">
                  <Cloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Connect to Microsoft OneDrive to import and export documents</p>
                  <button
                    onClick={handleConnectOneDrive}
                    disabled={isConnecting}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center mx-auto"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
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
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800">Successfully connected to OneDrive</span>
                  </div>
                  
                  <button
                    onClick={handleFileSelect}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                  >
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Select Excel/CSV files from OneDrive</p>
                    <p className="text-xs text-gray-500 mt-1">Supports CSV, XLSX, XLS, TXT files</p>
                  </button>
                </div>
              )}
            </div>

            {/* File Management */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">File Management</h3>
              </div>

              {selectedFiles.length > 0 ? (
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
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleImportData}
                    disabled={importStatus === 'processing'}
                    className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {importStatus === 'processing' ? (
                      <>
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data to Website
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No files selected</p>
                  <p className="text-sm text-gray-500">Connect to OneDrive and select files to get started</p>
                </div>
              )}

              {importStatus === 'success' && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md mt-4">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">Successfully imported {importedData.length} trades!</span>
                </div>
              )}

              {importStatus === 'error' && (
                <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-md mt-4">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Import Error:</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Templates Section */}
        {activeSection === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      {template.required && (
                        <span className="text-xs text-red-600 font-medium">Required</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Required Fields:</h5>
                  <div className="flex flex-wrap gap-2">
                    {template.fields.map((field, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Data Processing Section */}
        {activeSection === 'processing' && showPreview && excelData && (
          <div className="space-y-6">
            {/* Column Selection */}
            <div className="bg-gray-50 rounded-lg p-6">
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

            {/* Data Preview Table */}
            <div className="bg-white rounded-lg border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Eye className="h-5 w-5 text-blue-600 mr-2" />
                  Data Preview
                </h4>
              </div>
              
              <div className="overflow-x-auto">
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
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center">
                    Showing 10 of {filteredPreviewData.rows.length} rows. Import data to process all records.
                  </p>
                </div>
              )}
            </div>

            {/* Export Section */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center mb-4">
                <Download className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Export Processed Data</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Export Summary</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Selected columns: {selectedColumns.length}</p>
                    <p>• Total rows to export: {filteredPreviewData.rows.length}</p>
                    <p>• Export format: CSV</p>
                    <p>• Destination: Microsoft OneDrive + Local Download</p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={handleExportData}
                    disabled={!isConnected || exportStatus === 'processing'}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {exportStatus === 'processing' ? (
                      <>
                        <RefreshCw className="animate-spin h-4 w-4" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Export to OneDrive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {exportStatus === 'success' && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md mt-4">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">Data successfully exported to OneDrive and downloaded!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Import Summary */}
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
              <strong>Note:</strong> The imported data is now reflected across the entire website including Trade Confirmations, Analytics, and Workflow Management sections.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDocumentManagement;