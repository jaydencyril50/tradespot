import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard';
import Profile from './pages/Profile';
import Team from './pages/Team';
import Market from './pages/Market';
import Settings from './pages/Settings';
import EditBasicSettings from './pages/EditBasicSettings';
import PrivacySettings from './pages/PrivacySettings';
import AdditionalSettings from './pages/AdditionalSettings';
import ProtectedRoute from './components/ProtectedRoute';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import TwoFASettings from './pages/TwoFASettings';
import { ThemeProvider } from './ThemeContext';
import TransactionHistory from './pages/TransactionHistory';
import NotificationsPage from './pages/NotificationsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminWithdrawals from './pages/AdminWithdrawals';
import AdminNotice from './pages/AdminNotice';
import AdminRecent from './pages/AdminRecent';
import AdminDeposit from './pages/AdminDeposit';
import AdminTeam from './pages/AdminTeam';
import Trash from './pages/Trash';
import { NetworkStatusProvider } from './NetworkStatusProvider';
import ProChat from './pages/ProChat';
import AdminStaking from './pages/AdminStaking';
import BuySpotPage from './pages/Buy';
import SellSpotPage from './pages/Sell';
import OrderPage from './pages/Order';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing in index.html');
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <NetworkStatusProvider>
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Admin login route */}
            <Route path="/admin/login" element={<AdminLogin />} />
            {/* Add more admin/protected routes here later */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            } />
            <Route path="/market" element={
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/settings/edit-basic" element={
              <ProtectedRoute>
                <EditBasicSettings />
              </ProtectedRoute>
            } />
            <Route path="/settings/privacy" element={
              <ProtectedRoute>
                <PrivacySettings />
              </ProtectedRoute>
            } />
            <Route path="/settings/additional" element={
              <ProtectedRoute>
                <AdditionalSettings />
              </ProtectedRoute>
            } />
            <Route path="/deposit" element={
              <ProtectedRoute>
                <Deposit />
              </ProtectedRoute>
            } />
            <Route path="/withdraw" element={
              <ProtectedRoute>
                <Withdraw />
              </ProtectedRoute>
            } />
            <Route path="/settings/2fa" element={
              <ProtectedRoute>
                <TwoFASettings />
              </ProtectedRoute>
            } />
            <Route path="/transaction-history" element={
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
            <Route path="/admin/notice" element={<AdminNotice />} />
            <Route path="/admin/recents" element={<AdminRecent />} />
            <Route path="/admin/deposit" element={<AdminDeposit />} />
            <Route path="/admin/team" element={<AdminTeam />} />
            <Route path="/admin/trash" element={<Trash />} />
            <Route path="/admin/staking" element={<AdminStaking />} />
            <Route path="/prochat" element={
              <ProtectedRoute>
                <ProChat />
              </ProtectedRoute>
            } />
            <Route path="/buy" element={
              <ProtectedRoute>
                <BuySpotPage />
              </ProtectedRoute>
            } />
            <Route path="/sell" element={
              <ProtectedRoute>
                <SellSpotPage />
              </ProtectedRoute>
            } />
            <Route path="/order" element={
              <ProtectedRoute>
                <OrderPage />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </NetworkStatusProvider>
  </React.StrictMode>
);
