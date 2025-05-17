import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TransactionHistory from './pages/TransactionHistory';
import Transfer from './pages/Transfer';
import Navigation from './components/Navigation';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 text-gray-900">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Navigation />
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/transfers" 
                element={
                  <PrivateRoute>
                    <Navigation />
                    <Transfer />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <PrivateRoute>
                    <Navigation />
                    <TransactionHistory />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute>
                    <Navigation />
                    <Settings />
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;