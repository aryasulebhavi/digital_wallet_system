import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Plus, Minus, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { balance, deposit, withdraw, getTransactionHistory } = useWallet();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recentTransactions = getTransactionHistory().slice(0, 5);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    const success = await deposit(amount, 'Manual deposit');
    setIsProcessing(false);
    
    if (success) {
      toast.success(`Successfully deposited $${amount.toFixed(2)}`);
      setDepositAmount('');
      setIsDepositModalOpen(false);
    } else {
      toast.error('Deposit failed. Please try again.');
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient funds');
      return;
    }

    setIsProcessing(true);
    const success = await withdraw(amount, 'Manual withdrawal');
    setIsProcessing(false);
    
    if (success) {
      toast.success(`Successfully withdrew $${amount.toFixed(2)}`);
      setWithdrawAmount('');
      setIsWithdrawModalOpen(false);
    } else {
      toast.error('Withdrawal failed. Please check your limits and try again.');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'transfer_in':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'transfer_out':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="md:ml-64 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-8">
        <motion.div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium opacity-90">Current Balance</h2>
            <ShieldCheck className="h-6 w-6 opacity-80" />
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">${balance.toFixed(2)}</span>
            <span className="ml-2 text-sm opacity-80">USD</span>
          </div>
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Deposit
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg flex items-center justify-center transition-colors"
            >
              <Minus className="h-4 w-4 mr-2" />
              Withdraw
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-full mr-3">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.type.replace('_', ' ').charAt(0).toUpperCase() + 
                          transaction.type.replace('_', ' ').slice(1)}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.timestamp)}</p>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.type === 'deposit' || transaction.type === 'transfer_in' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' || transaction.type === 'transfer_in' 
                      ? '+' 
                      : '-'
                    }${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent transactions</p>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Limits & Security</h2>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-medium">Transaction Limits</h3>
              </div>
              <ul className="mt-2 text-sm text-gray-600 space-y-1 pl-7">
                <li>Maximum $10,000 per transaction</li>
                <li>Maximum $5,000 daily withdrawal</li>
                <li>Maximum $5,000 daily transfers</li>
              </ul>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className="font-medium">Fraud Protection</h3>
              </div>
              <p className="mt-2 text-sm text-gray-600 pl-7">
                We monitor your account for suspicious activity and limit to 5 transactions per minute for your security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Deposit Funds</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={isProcessing}
                className={`flex-1 py-2 px-4 bg-blue-600 rounded-lg text-white ${
                  isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  max={balance}
                  step="0.01"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Available balance: ${balance.toFixed(2)}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isProcessing}
                className={`flex-1 py-2 px-4 bg-blue-600 rounded-lg text-white ${
                  isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;