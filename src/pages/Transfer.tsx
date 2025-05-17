import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { Send, Search, User, AlertCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const Transfer: React.FC = () => {
  const { balance, transfer } = useWallet();
  const { getUsersByPartialName, currentUser, getUserById } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results = getUsersByPartialName(searchTerm).filter(user => user.id !== currentUser?.id);
      setRecipients(results);
    } else {
      setRecipients([]);
    }
  }, [searchTerm, getUsersByPartialName, currentUser]);
  
  const handleTransfer = async () => {
    if (!selectedRecipient) {
      toast.error('Please select a recipient');
      return;
    }
    
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (transferAmount > balance) {
      toast.error('Insufficient funds');
      return;
    }
    
    setIsProcessing(true);
    const success = await transfer(transferAmount, selectedRecipient.id, description);
    setIsProcessing(false);
    
    if (success) {
      toast.success(`Successfully transferred $${transferAmount.toFixed(2)} to ${selectedRecipient.name}`);
      setAmount('');
      setDescription('');
      setSelectedRecipient(null);
      setSearchTerm('');
    } else {
      toast.error('Transfer failed. Please check your limits and try again.');
    }
  };
  
  return (
    <div className="md:ml-64 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1 className="text-2xl font-bold mb-6">Transfer Funds</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Send Money</h2>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
              {selectedRecipient ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedRecipient.name}</p>
                      <p className="text-xs text-gray-500">{selectedRecipient.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedRecipient(null);
                      setSearchTerm('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name or email"
                  />
                </div>
              )}
              
              {!selectedRecipient && recipients.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                  <ul className="max-h-48 overflow-y-auto">
                    {recipients.map((recipient) => (
                      <motion.li
                        key={recipient.id}
                        className="p-3 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setSelectedRecipient(recipient);
                          setSearchTerm('');
                        }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-full mr-3">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{recipient.name}</p>
                            <p className="text-xs text-gray-500">{recipient.email}</p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
              
              {!selectedRecipient && searchTerm.length >= 2 && recipients.length === 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                  No users found matching "{searchTerm}"
                </div>
              )}
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  max={balance}
                  step="0.01"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Available balance: ${balance.toFixed(2)}</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="What's this transfer for?"
              />
            </div>
            
            <button
              onClick={handleTransfer}
              disabled={isProcessing || !selectedRecipient || !amount}
              className={`w-full flex items-center justify-center py-2 px-4 rounded-lg ${
                isProcessing || !selectedRecipient || !amount
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Send Money'}
            </button>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Transfer Information</h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium">Transfer Limits</h3>
                <ul className="mt-2 text-sm text-gray-600 space-y-1 pl-4">
                  <li>Maximum $10,000 per transaction</li>
                  <li>Maximum $5,000 daily transfers</li>
                  <li>Maximum 5 transactions per minute</li>
                </ul>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Security Tips</h3>
                    <ul className="mt-1 text-sm text-gray-600 space-y-1 pl-1">
                      <li>Only send money to people you know and trust</li>
                      <li>Verify recipient details before sending</li>
                      <li>Be cautious of requests to send money from unknown contacts</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-gray-200">
                <h3 className="font-medium">Processing Time</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Transfers are processed instantly between DigiWallet users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;