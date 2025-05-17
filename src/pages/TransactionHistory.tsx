import React, { useState, useMemo } from 'react';
import { useWallet, Transaction, TransactionType } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowUp, ArrowDown, Plus, Minus, Filter, Download, Calendar, Search } from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const { getTransactionHistory } = useWallet();
  const { getUserById } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([]);
  const [dateRange, setDateRange] = useState<{ from: string, to: string }>({ from: '', to: '' });
  
  const transactions = getTransactionHistory();
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filter by type
      if (selectedTypes.length > 0 && !selectedTypes.includes(transaction.type)) {
        return false;
      }
      
      // Filter by date range
      if (dateRange.from && new Date(transaction.timestamp) < new Date(dateRange.from)) {
        return false;
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (new Date(transaction.timestamp) > toDate) {
          return false;
        }
      }
      
      // Filter by search term (description or sender/recipient)
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const description = transaction.description?.toLowerCase() || '';
        
        // For transfers, also search in sender/recipient name
        if (transaction.senderOrRecipient) {
          const user = getUserById(transaction.senderOrRecipient);
          const userName = user?.name.toLowerCase() || '';
          
          return description.includes(lowerSearchTerm) || userName.includes(lowerSearchTerm);
        }
        
        return description.includes(lowerSearchTerm);
      }
      
      return true;
    });
  }, [transactions, selectedTypes, dateRange, searchTerm, getUserById]);
  
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'transfer_in':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'transfer_out':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
    }
  };
  
  const getTransactionLabel = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'transfer_in':
        const sender = getUserById(transaction.senderOrRecipient || '');
        return `Transfer from ${sender?.name || 'Unknown'}`;
      case 'transfer_out':
        const recipient = getUserById(transaction.senderOrRecipient || '');
        return `Transfer to ${recipient?.name || 'Unknown'}`;
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const toggleTransactionType = (type: TransactionType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  return (
    <div className="md:ml-64 p-6">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      
      <div className="bg-white rounded-xl shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow md:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search transactions"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative inline-block">
                <button 
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10 hidden">
                  <h3 className="text-sm font-semibold mb-2">Filter by Type</h3>
                  <div className="space-y-2">
                    {['deposit', 'withdrawal', 'transfer_in', 'transfer_out'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type as TransactionType)}
                          onChange={() => toggleTransactionType(type as TransactionType)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative inline-block">
                <button 
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Date
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10 hidden">
                  <h3 className="text-sm font-semibold mb-2">Date Range</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500">From</label>
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        className="w-full mt-1 text-sm border border-gray-300 rounded px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">To</label>
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        className="w-full mt-1 text-sm border border-gray-300 rounded px-2 py-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
          
          {(selectedTypes.length > 0 || dateRange.from || dateRange.to) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTypes.map(type => (
                <div key={type} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center">
                  <span>
                    {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                  </span>
                  <button 
                    onClick={() => toggleTransactionType(type)}
                    className="ml-1 text-blue-700 hover:text-blue-900"
                  >
                    &times;
                  </button>
                </div>
              ))}
              
              {dateRange.from && (
                <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center">
                  <span>From: {new Date(dateRange.from).toLocaleDateString()}</span>
                  <button 
                    onClick={() => setDateRange(prev => ({ ...prev, from: '' }))}
                    className="ml-1 text-blue-700 hover:text-blue-900"
                  >
                    &times;
                  </button>
                </div>
              )}
              
              {dateRange.to && (
                <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center">
                  <span>To: {new Date(dateRange.to).toLocaleDateString()}</span>
                  <button 
                    onClick={() => setDateRange(prev => ({ ...prev, to: '' }))}
                    className="ml-1 text-blue-700 hover:text-blue-900"
                  >
                    &times;
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => {
                  setSelectedTypes([]);
                  setDateRange({ from: '', to: '' });
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-1 bg-gray-100 rounded-full mr-3">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {getTransactionLabel(transaction)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.timestamp)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === 'deposit' || transaction.type === 'transfer_in' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'transfer_in' 
                        ? '+' 
                        : '-'
                      }${transaction.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-sm text-gray-500 text-center">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;