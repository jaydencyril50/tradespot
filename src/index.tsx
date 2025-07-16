import React from 'react';
import './theme.css';
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
import AdminSignup from './pages/AdminSignup';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminWithdrawals from './pages/AdminWithdrawals';
import AdminNotice from './pages/AdminNotice';
import AdminRecent from './pages/AdminRecent';
import AdminDeposit from './pages/AdminDeposit';
import AdminTeam from './pages/AdminTeam';
import Trash from './pages/Trash';
import { NetworkStatusProvider } from './NetworkStatusProvider';
import BuySpotPage from './pages/Buy';
import SellSpotPage from './pages/Sell';
import OrderPage from './pages/Order';
import UserChat from './pages/UserChat';
import AdminChat from './pages/AdminChat';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import WebauthnManagement from './pages/WebauthnManagement';
import AdminFlexDrop from './pages/AdminFlexDrop';
import FlexDropClaim from './pages/FlexDropClaim';
import AdminPlatformStats from './pages/AdminPlatformStats';
import AdminSendFunds from './pages/AdminSendFunds';
import Rewards from './pages/Rewards';
import AdminRewards from './pages/AdminRewards';
import BotSettings from './components/BotSettings';

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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Admin login and signup routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
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
            <Route path="/settings/bot" element={
              <ProtectedRoute>
                <BotSettings />
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
            <Route path="/admin/platform-stats" element={<AdminPlatformStats />} />
            <Route path="/admin/send-funds" element={<AdminSendFunds />} />
            <Route path="/admin/awards" element={<AdminRewards />} />
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
            <Route path="/chat" element={
              <ProtectedRoute>
                <UserChat />
              </ProtectedRoute>
            } />
            <Route path="/admin/chat" element={<AdminChat />} />
            <Route path="/settings/webauthn" element={
              <ProtectedRoute>
                <WebauthnManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/flex-drop" element={<AdminFlexDrop />} />
            <Route path="/flex-drop/:linkId" element={<FlexDropClaim />} />
            <Route path="/rewards" element={<Rewards/>} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </NetworkStatusProvider>
  </React.StrictMode>
);
