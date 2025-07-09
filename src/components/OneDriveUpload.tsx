import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, Cloud } from 'lucide-react';
import { EquityTrade, FXTrade } from '../types/trade';
import { parseEquityCSV, parseFXCSV } from '../utils/csvParser';

interface OneDriveUploadProps {
  onClose: () => void;
  onUpload: (trades: (EquityTrade | FXTrade)[]) => void;
}

const OneDriveUpload: React.FC<OneDriveUploadProps> = ({ onClose, onUpload }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnectOneDrive = async () => {
    setIsConnecting(true);
    
    // Simulate OneDrive connection
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      alert('Successfully connected to Microsoft OneDrive! You can now select files to import.');
    }, 2000);
  };

  const handleFileSelect = () => {
    // Create a file input element
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

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select at least one file to upload.');
      return;
    }

    setUploadStatus('processing');
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
          // Try to parse as equity first, then FX
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

      setUploadStatus('success');
      setTimeout(() => {
        onUpload(allTrades);
      }, 1000);

    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process files');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Cloud className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Import from Microsoft OneDrive
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Connection Status */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      isConnected ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">
                      OneDrive Connection Status
                    </span>
                  </div>
                  <span className={`text-sm ${
                    isConnected ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                
                {!isConnected && (
                  <div className="mt-3">
                    <button
                      onClick={handleConnectOneDrive}
                      disabled={isConnecting}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
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
                )}
              </div>

              {/* File Selection */}
              {isConnected && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Select Trade Files</h4>
                  
                  <button
                    onClick={handleFileSelect}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                  >
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to select CSV or Excel files from OneDrive
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports: .csv, .xlsx, .xls files
                    </p>
                  </button>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        Selected Files ({selectedFiles.length})
                      </h5>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-sm text-gray-900">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
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
                </div>
              )}

              {/* Upload Status */}
              {uploadStatus !== 'idle' && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center">
                    {uploadStatus === 'processing' && (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-sm text-gray-900">Processing files...</span>
                      </>
                    )}
                    {uploadStatus === 'success' && (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-600">Files processed successfully!</span>
                      </>
                    )}
                    {uploadStatus === 'error' && (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-sm text-red-600">Error processing files</span>
                      </>
                    )}
                  </div>
                  {errorMessage && (
                    <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">File Format Requirements</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Equity files should contain columns: Trade ID, Order ID, Client ID, Trade Type, Quantity, Price, etc.</li>
                  <li>• FX files should contain columns: Trade ID, Currency Pair, Buy/Sell, Product Type, etc.</li>
                  <li>• Files should be in CSV format or Excel format (.xlsx, .xls)</li>
                  <li>• First row should contain column headers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!isConnected || selectedFiles.length === 0 || uploadStatus === 'processing'}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Trades
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

export default OneDriveUpload;