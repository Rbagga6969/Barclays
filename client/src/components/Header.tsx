import React from 'react';
import { Building2, Shield } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Barclays Bank</h1>
              <p className="text-sm text-blue-200">Trade Confirmation Department</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-200" />
            <span className="text-sm text-blue-200">Secure Trading Platform</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;