import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wallet, History, Send, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Wallet className="w-5 h-5" /> },
    { path: '/transfers', label: 'Transfer', icon: <Send className="w-5 h-5" /> },
    { path: '/history', label: 'History', icon: <History className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Wallet className="text-blue-500 w-6 h-6 mr-2" />
          <h1 className="text-xl font-semibold">DigiWallet</h1>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-gray-600 focus:outline-none"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200"
          >
            <nav className="flex flex-col">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 flex items-center ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="px-4 py-3 flex items-center text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Logout</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Navigation */}
      <div className="hidden md:flex">
        <div className="w-64 min-h-screen bg-white border-r border-gray-200">
          <div className="p-6">
            <div className="flex items-center">
              <Wallet className="text-blue-500 w-6 h-6 mr-2" />
              <h1 className="text-xl font-semibold">DigiWallet</h1>
            </div>
            <div className="mt-6 text-sm">
              <p className="text-gray-500">Welcome back,</p>
              <p className="font-medium">{currentUser?.name}</p>
            </div>
          </div>
          <nav className="mt-6">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-3 flex items-center ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
            <div className="mt-auto pt-6">
              <button
                onClick={handleLogout}
                className="px-6 py-3 flex items-center text-gray-600 hover:bg-gray-50 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navigation;