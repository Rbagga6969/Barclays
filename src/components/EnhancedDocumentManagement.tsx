import React, { useState } from 'react';
import { FileText, Download, Upload, CheckCircle, XCircle, Clock, User, Shield, AlertTriangle, Eye, Users, Send } from 'lucide-react';
import { DocumentStatus, DocumentInfo, EquityTrade, FXTrade } from '../types/trade';

interface EnhancedDocumentManagementProps {
  trade: EquityTrade | FXTrade;
  documentStatus: DocumentStatus;
  onDocumentUpdate: (documentType: string, updates: Partial<DocumentInfo>) => void;
  onSendToSettlements: () => void;
}

const EnhancedDocumentManagement: React.FC<EnhancedDocumentManagementProps> = ({ 
  trade, 
  documentStatus, 
  onDocumentUpdate,
  onSendToSettlements
}) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const documentTypes = [
    {
      key: 'tradeConfirmation',
      name: 'Trade Confirmation',
      description: 'Official trade confirmation document with all trade details',
      required: true,
      icon: FileText,
      category: 'Core'
    },
    {
      key: 'clientAgreement',
      name: 'Client Agreement',
      description: 'Client acknowledgment and agreement to trade terms',
      required: true,
      icon: User,
      category: 'Core'
    },
    {
      key: 'riskDisclosure',
      name: 'Risk Disclosure',
      description: 'Risk disclosure statement and client acknowledgment',
      required: true,
      icon: AlertTriangle,
      category: 'Core'
    },
    {
      key: 'complianceChecklist',
      name: 'Compliance Checklist',
      description: 'Internal compliance verification checklist',
      required: false,
      icon: Shield,
      category: 'Internal'
    },
    {
      key: 'frontOfficeSalesApproval',
      name: 'Front Office Sales Approval',
      description: 'Front office sales team approval document',
      required: true,
      icon: Users,
      category: 'Approval'
    },
    {
      key: 'tradingSalesApproval',
      name: 'Trading Sales Approval',
      description: 'Trading sales team approval document',
      required: true,
      icon: Users,
      category: 'Approval'
    }
  ];

  const getStatusIcon = (doc: DocumentInfo) => {
    if (doc.submitted && doc.clientSigned && doc.bankSigned && doc.qaStatus === 'Approved') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (doc.qaStatus === 'Pending' || doc.makerStatus === 'Pending' || doc.checkerStatus === 'Pending') {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    } else if (doc.qaStatus === 'Rejected') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else if (doc.submitted && !doc.clientSigned) {
      return <Clock className="h-5 w-5 text-blue-500" />;
    } else if (!doc.submitted) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = (doc: DocumentInfo) => {
    if (doc.qaStatus === 'Rejected') return 'QA Rejected';
    if (doc.qaStatus === 'Pending') return 'QA Pending';
    if (doc.makerStatus === 'Pending') return 'Maker Pending';
    if (doc.checkerStatus === 'Pending') return 'Checker Pending';
    if (doc.submitted && doc.clientSigned && doc.bankSigned && doc.qaStatus === 'Approved') {
      return 'Fully Executed';
    } else if (doc.submitted && doc.clientSigned && !doc.bankSigned) {
      return 'Awaiting Bank Signature';
    } else if (doc.submitted && !doc.clientSigned) {
      return 'Awaiting Client Signature';
    } else if (!doc.submitted) {
      return 'Not Submitted';
    } else if (!doc.sentToClient) {
      return 'Not Sent to Client';
    }
    return 'In Progress';
  };

  const handleMakerAction = (documentType: string, action: 'create' | 'approve') => {
    const updates: Partial<DocumentInfo> = {
      makerStatus: action === 'create' ? 'Created' : 'Approved',
      timestamp: new Date().toISOString()
    };
    
    if (action === 'create') {
      updates.submitted = true;
      updates.documentUrl = `/documents/${trade.tradeId}/${documentType}`;
      updates.version = 1;
    }
    
    onDocumentUpdate(documentType, updates);
  };

  const handleCheckerAction = (documentType: string, action: 'review' | 'approve') => {
    const updates: Partial<DocumentInfo> = {
      checkerStatus: action === 'review' ? 'Reviewed' : 'Approved',
      timestamp: new Date().toISOString()
    };
    
    onDocumentUpdate(documentType, updates);
  };

  const handleQAAction = (documentType: string, action: 'approve' | 'reject') => {
    const updates: Partial<DocumentInfo> = {
      qaStatus: action === 'approve' ? 'Approved' : 'Rejected',
      timestamp: new Date().toISOString()
    };
    
    if (action === 'approve') {
      updates.sentToClient = true;
    }
    
    onDocumentUpdate(documentType, updates);
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

  const groupedDocuments = documentTypes.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof documentTypes>);

  // Check if all required documents are complete
  const allDocumentsComplete = documentTypes
    .filter(doc => doc.required)
    .every(doc => {
      const docStatus = documentStatus[doc.key as keyof DocumentStatus];
      return docStatus.submitted && docStatus.clientSigned && docStatus.bankSigned && docStatus.qaStatus === 'Approved';
    });

  const handleSendToSettlementsClick = () => {
    if (allDocumentsComplete) {
      onSendToSettlements();
      alert(`Trade ${trade.tradeId} has been successfully sent to the Settlements team. All required documents are complete and approved.`);
    } else {
      alert('Cannot send to Settlements: Not all required documents are complete and approved.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Enhanced Document Management - Trade {trade.tradeId}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Queue Status:</span> {trade.queueStatus || 'Unknown'}
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium">Last updated:</span> {new Date().toLocaleString()}
            </div>
            {allDocumentsComplete && (
              <button
                onClick={handleSendToSettlementsClick}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send to Settlements</span>
              </button>
            )}
          </div>
        </div>

        {/* Document Completion Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Document Completion Status</h4>
              <p className="text-sm text-gray-600">
                {documentTypes.filter(doc => doc.required).filter(doc => {
                  const docStatus = documentStatus[doc.key as keyof DocumentStatus];
                  return docStatus.submitted && docStatus.clientSigned && docStatus.bankSigned && docStatus.qaStatus === 'Approved';
                }).length} of {documentTypes.filter(doc => doc.required).length} required documents complete
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              allDocumentsComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {allDocumentsComplete ? 'Ready for Settlements' : 'Pending Documents'}
            </div>
          </div>
        </div>

        {Object.entries(groupedDocuments).map(([category, docs]) => (
          <div key={category} className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              {category} Documents
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {docs.map((docType) => {
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
                          doc.qaStatus === 'Approved' && doc.submitted && doc.clientSigned && doc.bankSigned
                            ? 'text-green-600'
                            : doc.qaStatus === 'Rejected'
                            ? 'text-red-600'
                            : doc.submitted
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {getStatusText(doc)}
                        </span>
                      </div>
                      
                      {/* Maker-Checker Status */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                            doc.makerStatus === 'Approved' ? 'bg-green-500' :
                            doc.makerStatus === 'Created' ? 'bg-yellow-500' :
                            'bg-gray-300'
                          }`}></div>
                          <span className="text-gray-600">Maker</span>
                        </div>
                        <div className="text-center">
                          <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                            doc.checkerStatus === 'Approved' ? 'bg-green-500' :
                            doc.checkerStatus === 'Reviewed' ? 'bg-yellow-500' :
                            'bg-gray-300'
                          }`}></div>
                          <span className="text-gray-600">Checker</span>
                        </div>
                        <div className="text-center">
                          <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                            doc.qaStatus === 'Approved' ? 'bg-green-500' :
                            doc.qaStatus === 'In Review' ? 'bg-yellow-500' :
                            doc.qaStatus === 'Rejected' ? 'bg-red-500' :
                            'bg-gray-300'
                          }`}></div>
                          <span className="text-gray-600">QA</span>
                        </div>
                      </div>

                      {/* Signature Status */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Signature Type:</span>
                        <span className="font-medium text-gray-900">
                          {doc.signatureType || 'Single'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Sent to Client:</span>
                        <span className={`font-medium ${doc.sentToClient ? 'text-green-600' : 'text-red-600'}`}>
                          {doc.sentToClient ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-4 space-y-2">
                      {doc.makerStatus === 'Pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMakerAction(docType.key, 'create');
                          }}
                          className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center space-x-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Create Document</span>
                        </button>
                      )}

                      {doc.makerStatus === 'Created' && doc.checkerStatus === 'Pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckerAction(docType.key, 'review');
                          }}
                          className="w-full bg-yellow-600 text-white py-2 px-3 rounded-md text-sm hover:bg-yellow-700 flex items-center justify-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Checker Review</span>
                        </button>
                      )}

                      {doc.checkerStatus === 'Reviewed' && doc.qaStatus === 'Pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQAAction(docType.key, 'approve');
                            }}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700"
                          >
                            QA Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQAAction(docType.key, 'reject');
                            }}
                            className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm hover:bg-red-700"
                          >
                            QA Reject
                          </button>
                        </div>
                      )}

                      {doc.qaStatus === 'Approved' && doc.sentToClient && !doc.clientSigned && (
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
                      
                      {doc.clientSigned && !doc.bankSigned && doc.signatureType === 'Double' && (
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
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Document Details */}
      {selectedDocument && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Document Workflow: {documentTypes.find(d => d.key === selectedDocument)?.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Maker-Checker-QA Workflow</h4>
              <div className="space-y-3">
                {['Maker', 'Checker', 'QA'].map((role, index) => {
                  const doc = documentStatus[selectedDocument as keyof DocumentStatus];
                  const statuses = [doc.makerStatus, doc.checkerStatus, doc.qaStatus];
                  const currentStatus = statuses[index];
                  
                  return (
                    <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          currentStatus === 'Approved' ? 'bg-green-500' :
                          currentStatus === 'Created' || currentStatus === 'Reviewed' || currentStatus === 'In Review' ? 'bg-yellow-500' :
                          currentStatus === 'Rejected' ? 'bg-red-500' :
                          'bg-gray-300'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">{role}</span>
                      </div>
                      <span className="text-sm text-gray-600">{currentStatus || 'Pending'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Signature & Delivery Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Document Type:</span>
                  <span className="font-medium text-gray-900">
                    {documentTypes.find(d => d.key === selectedDocument)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Signature Required:</span>
                  <span className="font-medium text-gray-900">
                    {documentStatus[selectedDocument as keyof DocumentStatus].signatureType || 'Single'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sent to Client:</span>
                  <span className={`font-medium ${
                    documentStatus[selectedDocument as keyof DocumentStatus].sentToClient ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {documentStatus[selectedDocument as keyof DocumentStatus].sentToClient ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client Signed:</span>
                  <span className={`font-medium ${
                    documentStatus[selectedDocument as keyof DocumentStatus].clientSigned ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {documentStatus[selectedDocument as keyof DocumentStatus].clientSigned ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Signed:</span>
                  <span className={`font-medium ${
                    documentStatus[selectedDocument as keyof DocumentStatus].bankSigned ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {documentStatus[selectedDocument as keyof DocumentStatus].bankSigned ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDocumentManagement;