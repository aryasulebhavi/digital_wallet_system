import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  senderOrRecipient?: string;
  timestamp: Date;
  description?: string;
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  deposit: (amount: number, description?: string) => Promise<boolean>;
  withdraw: (amount: number, description?: string) => Promise<boolean>;
  transfer: (amount: number, recipientId: string, description?: string) => Promise<boolean>;
  getTransactionHistory: () => Transaction[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Rate limiting for fraud prevention
const TRANSACTION_LIMITS = {
  maxTransactionsPerMinute: 5,
  maxAmountPerTransaction: 10000,
  maxDailyWithdrawal: 5000,
  maxDailyTransfer: 5000
};

export const WalletProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  // Calculate balance based on transactions for the current user
  const balance = transactions
    .filter(t => t.userId === currentUser?.id)
    .reduce((total, t) => {
      switch (t.type) {
        case 'deposit':
        case 'transfer_in':
          return total + t.amount;
        case 'withdrawal':
        case 'transfer_out':
          return total - t.amount;
        default:
          return total;
      }
    }, 0);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Check rate limits for fraud prevention
  const checkRateLimits = (amount: number, type: 'withdrawal' | 'transfer'): boolean => {
    if (!currentUser) return false;

    // Check transaction amount limit
    if (amount > TRANSACTION_LIMITS.maxAmountPerTransaction) {
      return false;
    }

    // Check transactions per minute
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentTransactions = transactions.filter(t => 
      t.userId === currentUser.id && 
      new Date(t.timestamp) > oneMinuteAgo
    );
    
    if (recentTransactions.length >= TRANSACTION_LIMITS.maxTransactionsPerMinute) {
      return false;
    }

    // Check daily limits for withdrawals and transfers
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (type === 'withdrawal') {
      const dailyWithdrawals = transactions.filter(t => 
        t.userId === currentUser.id && 
        t.type === 'withdrawal' && 
        new Date(t.timestamp) >= today
      ).reduce((sum, t) => sum + t.amount, 0);
      
      if (dailyWithdrawals + amount > TRANSACTION_LIMITS.maxDailyWithdrawal) {
        return false;
      }
    }
    
    if (type === 'transfer') {
      const dailyTransfers = transactions.filter(t => 
        t.userId === currentUser.id && 
        t.type === 'transfer_out' && 
        new Date(t.timestamp) >= today
      ).reduce((sum, t) => sum + t.amount, 0);
      
      if (dailyTransfers + amount > TRANSACTION_LIMITS.maxDailyTransfer) {
        return false;
      }
    }
    
    return true;
  };

  const deposit = async (amount: number, description?: string): Promise<boolean> => {
    if (!currentUser || amount <= 0) return false;
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTransaction: Transaction = {
      id: uuidv4(),
      userId: currentUser.id,
      type: 'deposit',
      amount,
      timestamp: new Date(),
      description
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    return true;
  };

  const withdraw = async (amount: number, description?: string): Promise<boolean> => {
    if (!currentUser || amount <= 0 || amount > balance) return false;
    
    // Check rate limits
    if (!checkRateLimits(amount, 'withdrawal')) {
      return false;
    }
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTransaction: Transaction = {
      id: uuidv4(),
      userId: currentUser.id,
      type: 'withdrawal',
      amount,
      timestamp: new Date(),
      description
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    return true;
  };

  const transfer = async (amount: number, recipientId: string, description?: string): Promise<boolean> => {
    if (!currentUser || amount <= 0 || amount > balance || currentUser.id === recipientId) {
      return false;
    }
    
    // Check rate limits
    if (!checkRateLimits(amount, 'transfer')) {
      return false;
    }
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const outgoingTransaction: Transaction = {
      id: uuidv4(),
      userId: currentUser.id,
      type: 'transfer_out',
      amount,
      senderOrRecipient: recipientId,
      timestamp: new Date(),
      description
    };
    
    const incomingTransaction: Transaction = {
      id: uuidv4(),
      userId: recipientId,
      type: 'transfer_in',
      amount,
      senderOrRecipient: currentUser.id,
      timestamp: new Date(),
      description
    };
    
    setTransactions(prev => [...prev, outgoingTransaction, incomingTransaction]);
    return true;
  };

  const getTransactionHistory = () => {
    if (!currentUser) return [];
    
    return transactions
      .filter(t => t.userId === currentUser.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const value = {
    balance,
    transactions,
    deposit,
    withdraw,
    transfer,
    getTransactionHistory
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};