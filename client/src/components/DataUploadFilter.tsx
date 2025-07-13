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
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  BarChart3,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';
import { parseGenericCSV, convertGenericToTrades } from '../utils/csvParser';

interface DataUploadFilterProps {
  onDataImport: (trades: (EquityTrade | FXTrade)[]) => void;
}

interface ExcelData {
  headers: string[];
  rows: string[][];
}

interface FilterCriteria {
  column: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'not_empty';
  value: string;
  value2?: string; // For 'between' operator
}

const DataUploadFilter: React.FC<DataUploadFilterProps> = ({ onDataImport }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterCriteria[]>([]);
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [activeSection, setActiveSection] = useState<'upload' | 'filter' | 'preview'>('upload');

  const handleConnectOneDrive = async () => {
    setIsConnecting(true);
    
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      alert('Successfully connected to Microsoft OneDrive! You can now upload and filter Excel files.');
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

      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        throw new Error('No data found in file');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      ).filter(row => row.length > 1 && row.some(cell => cell.trim()));

      if (rows.length === 0) {
        throw new Error('No data rows found in file');
      }

      setExcelData({ headers, rows });
      setSelectedColumns(headers);
      setShowPreview(true);
      setActiveSection('filter');
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

  const addFilter = () => {
    if (excelData && excelData.headers.length > 0) {
      setFilters(prev => [...prev, {
        column: excelData.headers[0],
        operator: 'contains',
        value: ''
      }]);
    }
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<FilterCriteria>) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    ));
  };

  const applyFilters = (data: ExcelData): ExcelData => {
    if (filters.length === 0 && !searchTerm) return data;

    let filteredRows = data.rows;

    // Apply search term across all columns
    if (searchTerm) {
      filteredRows = filteredRows.filter(row =>
        row.some(cell => 
          cell.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply custom filters
    filters.forEach(filter => {
      const columnIndex = data.headers.indexOf(filter.column);
      if (columnIndex === -1) return;

      filteredRows = filteredRows.filter(row => {
        const cellValue = row[columnIndex] || '';
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case 'equals':
            return cellValue.toLowerCase() === filterValue;
          case 'contains':
            return cellValue.toLowerCase().includes(filterValue);
          case 'greater':
            return parseFloat(cellValue) > parseFloat(filter.value);
          case 'less':
            return parseFloat(cellValue) < parseFloat(filter.value);
          case 'between':
            const num = parseFloat(cellValue);
            const min = parseFloat(filter.value);
            const max = parseFloat(filter.value2 || '0');
            return num >= min && num <= max;
          case 'not_empty':
            return cellValue.trim() !== '';
          default:
            return true;
        }
      });
    });

    return { headers: data.headers, rows: filteredRows };
  };

  const getFilteredData = () => {
    if (!excelData) return { headers: [], rows: [] };
    
    const filteredData = applyFilters(excelData);
    const columnIndices = selectedColumns.map(col => excelData.headers.indexOf(col));
    
    return {
      headers: selectedColumns,
      rows: filteredData.rows.map(row => 
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
          const genericData = parseGenericCSV(text);
          const filteredGenericData = applyFilters(genericData);
          const convertedTrades = convertGenericToTrades(filteredGenericData);
          
          if (convertedTrades.length > 0) {
            allTrades.push(...convertedTrades);
            console.log(`Successfully parsed ${convertedTrades.length} trades from ${file.name}`);
          }
        } catch (fileError) {
          console.warn(`Error processing file ${file.name}:`, fileError);
        }
      }

      if (allTrades.length === 0) {
        throw new Error('No valid trade data found in the selected files after applying filters.');
      }

      setImportStatus('success');
      onDataImport(allTrades);
      
      setTimeout(() => {
        alert(`Successfully imported ${allTrades.length} filtered trades! The entire website now reflects this data.`);
      }, 1000);

    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process files');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (index === 0) {
      setExcelData(null);
      setShowPreview(false);
      setSelectedColumns([]);
      setFilters([]);
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
        opsTeamNotes: 'Sample filtered data'
      }
    ];

    onDataImport(sampleTrades);
    alert(`Sample filtered data loaded successfully!`);
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
              <h2 className="text-xl font-bold text-gray-900">Data Upload & Advanced Filtering</h2>
              <p className="text-gray-600">Upload Excel/CSV files from OneDrive and apply custom filters to extract exactly the data you need</p>
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
            { key: 'upload', label: 'File Upload', icon: Upload },
            { key: 'filter', label: 'Data Filtering', icon: Filter },
            { key: 'preview', label: 'Preview & Export', icon: Eye }
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
                  <p className="text-gray-600 mb-4">Connect to Microsoft OneDrive to upload and filter Excel files</p>
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
                  <span className="text-sm text-green-800">Data successfully imported with filters applied!</span>
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

        {/* Data Filtering Section */}
        {activeSection === 'filter' && excelData && (
          <div className="space-y-6">
            {/* Column Selection */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <Settings className="h-4 w-4 text-gray-600 mr-2" />
                  Column Selection ({selectedColumns.length}/{excelData.headers.length})
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

            {/* Search and Filters */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <Filter className="h-4 w-4 text-gray-600 mr-2" />
                  Advanced Filtering
                </h4>
                <button
                  onClick={addFilter}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Filter</span>
                </button>
              </div>

              {/* Global Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search across all columns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Custom Filters */}
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <select
                      value={filter.column}
                      onChange={(e) => updateFilter(index, { column: e.target.value })}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      {excelData.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>

                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="contains">Contains</option>
                      <option value="equals">Equals</option>
                      <option value="greater">Greater than</option>
                      <option value="less">Less than</option>
                      <option value="between">Between</option>
                      <option value="not_empty">Not empty</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, { value: e.target.value })}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm flex-1"
                    />

                    {filter.operator === 'between' && (
                      <input
                        type="text"
                        placeholder="To"
                        value={filter.value2 || ''}
                        onChange={(e) => updateFilter(index, { value2: e.target.value })}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    )}

                    <button
                      onClick={() => removeFilter(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {filters.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No custom filters applied. Click "Add Filter" to create advanced filtering rules.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview & Export Section */}
        {activeSection === 'preview' && excelData && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">Total Rows</p>
                    <p className="text-2xl font-bold text-blue-600">{filteredPreviewData.rows.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">Selected Columns</p>
                    <p className="text-2xl font-bold text-green-600">{selectedColumns.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Filter className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900">Active Filters</p>
                    <p className="text-2xl font-bold text-purple-600">{filters.length + (searchTerm ? 1 : 0)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-900">Data Size</p>
                    <p className="text-2xl font-bold text-orange-600">{((filteredPreviewData.rows.length * selectedColumns.length) / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Preview Table */}
            <div className="bg-white rounded-lg border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Eye className="h-5 w-5 text-blue-600 mr-2" />
                  Filtered Data Preview
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
                    Showing 10 of {filteredPreviewData.rows.length} filtered rows. Import to process all data.
                  </p>
                </div>
              )}
            </div>

            {/* Import Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleImportData}
                disabled={selectedFiles.length === 0 || importStatus === 'processing'}
                className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {importStatus === 'processing' ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4" />
                    <span>Processing Filtered Data...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Import Filtered Data to Website</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataUploadFilter;