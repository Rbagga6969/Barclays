import React, { useState } from 'react';
import { FileText, Download, Upload, CheckCircle, XCircle, Clock, User, Shield, AlertTriangle } from 'lucide-react';
import { DocumentStatus, DocumentInfo, EquityTrade, FXTrade } from '../types/trade';

interface DocumentManagementProps {
  trade: EquityTrade | FXTrade;
  documentStatus: DocumentStatus;
  onDocumentUpdate: (documentType: string, updates: Partial<DocumentInfo>) => void;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ 
  trade, 
  documentStatus, 
  onDocumentUpdate 
}) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const documentTypes = [
    {
      key: 'tradeConfirmation',
      name: 'Trade Confirmation',
      description: 'Official trade confirmation document with all trade details',
      required: true,
      icon: FileText
    },
    {
      key: 'clientAgreement',
      name: 'Client Agreement',
      description: 'Client acknowledgment and agreement to trade terms',
      required: true,
      icon: User
    },
    {
      key: 'riskDisclosure',
      name: 'Risk Disclosure',
      description: 'Risk disclosure statement and client acknowledgment',
      required: true,
      icon: AlertTriangle
    },
    {
      key: 'complianceChecklist',
      name: 'Compliance Checklist',
      description: 'Internal compliance verification checklist',
      required: false,
      icon: Shield
    }
  ];

  const getStatusIcon = (doc: DocumentInfo) => {
    if (doc.submitted && doc.clientSigned && doc.bankSigned) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (doc.submitted && !doc.clientSigned) {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    } else if (!doc.submitted) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = (doc: DocumentInfo) => {
    if (doc.submitted && doc.clientSigned && doc.bankSigned) {
      return 'Fully Executed';
    } else if (doc.submitted && doc.clientSigned && !doc.bankSigned) {
      return 'Awaiting Bank Signature';
    } else if (doc.submitted && !doc.clientSigned) {
      return 'Awaiting Client Signature';
    } else if (!doc.submitted) {
      return 'Not Submitted';
    }
    return 'In Progress';
  };

  const handleSignDocument = (documentType: string, signatureType: 'client' | 'bank') => {
    const updates: Partial<DocumentInfo> = {};
    
    if (signatureType === 'client') {
      updates.clientSigned = true;
    } else {
      updates.bankSigned = true;
    }
    
    updates.timestamp = new Date().toISOString();
    onDocumentUpdate(documentType, updates);
  };

  const handleSubmitDocument = (documentType: string) => {
    const updates: Partial<DocumentInfo> = {
      submitted: true,
      timestamp: new Date().toISOString(),
      documentUrl: `/documents/${trade.tradeId}/${documentType}`,
      version: 1
    };
    
    onDocumentUpdate(documentType, updates);
  };

  const generateDocument = (documentType: string) => {
    // In a real application, this would generate the actual document
    console.log(`Generating ${documentType} for trade ${trade.tradeId}`);
    
    // Simulate document generation
    setTimeout(() => {
      handleSubmitDocument(documentType);
      alert(`${documentType} document generated and submitted successfully!`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Document Management - Trade {trade.tradeId}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Last updated:</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentTypes.map((docType) => {
            const doc = documentStatus[docType.key as keyof DocumentStatus];
            const Icon = docType.icon;
            
            return (
              <div
                key={docType.key}
                className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                  selectedDocument === docType.key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedDocument(docType.key)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{docType.name}</h4>
                      {docType.required && (
                        <span className="text-xs text-red-600 font-medium">Required</span>
                      )}
                    </div>
                  </div>
                  {getStatusIcon(doc)}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{docType.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      doc.submitted && doc.clientSigned && doc.bankSigned
                        ? 'text-green-600'
                        : doc.submitted
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {getStatusText(doc)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium text-gray-900">v{doc.version}</span>
                  </div>
                  
                  {doc.timestamp && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Modified:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(doc.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 space-y-2">
                  {!doc.submitted ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateDocument(docType.key);
                      }}
                      className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Generate & Submit</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {doc.submitted && !doc.clientSigned && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSignDocument(docType.key, 'client');
                          }}
                          className="w-full bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 flex items-center justify-center space-x-2"
                        >
                          <User className="h-4 w-4" />
                          <span>Client Sign</span>
                        </button>
                      )}
                      
                      {doc.submitted && doc.clientSigned && !doc.bankSigned && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSignDocument(docType.key, 'bank');
                          }}
                          className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center space-x-2"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Bank Sign</span>
                        </button>
                      )}
                      
                      {doc.documentUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(doc.documentUrl, '_blank');
                          }}
                          className="w-full bg-gray-600 text-white py-2 px-3 rounded-md text-sm hover:bg-gray-700 flex items-center justify-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Preview/Details */}
      {selectedDocument && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Document Details: {documentTypes.find(d => d.key === selectedDocument)?.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Signature Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Client Signature</span>
                  </div>
                  {documentStatus[selectedDocument as keyof DocumentStatus].clientSigned ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Bank Signature</span>
                  </div>
                  {documentStatus[selectedDocument as keyof DocumentStatus].bankSigned ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Document Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trade ID:</span>
                  <span className="font-medium text-gray-900">{trade.tradeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Document Type:</span>
                  <span className="font-medium text-gray-900">
                    {documentTypes.find(d => d.key === selectedDocument)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium text-gray-900">
                    v{documentStatus[selectedDocument as keyof DocumentStatus].version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Counterparty:</span>
                  <span className="font-medium text-gray-900">{trade.counterparty}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;