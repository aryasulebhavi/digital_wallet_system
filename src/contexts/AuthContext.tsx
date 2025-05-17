import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getUserById: (id: string) => User | undefined;
  getUsersByPartialName: (searchTerm: string) => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return false;
    }
    
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      password,
      createdAt: new Date()
    };
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const getUserById = (id: string) => {
    return users.find(u => u.id === id);
  };

  const getUsersByPartialName = (searchTerm: string) => {
    if (!searchTerm) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(lowerSearchTerm) || 
      u.email.toLowerCase().includes(lowerSearchTerm)
    );
  };

  const value = {
    currentUser,
    users,
    login,
    register,
    logout,
    getUserById,
    getUsersByPartialName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};