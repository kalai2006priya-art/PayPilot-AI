import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import NewPaymentPage from './pages/NewPaymentPage';
import TransactionsPage from './pages/TransactionsPage';
import InsightsPage from './pages/InsightsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import SettingsPage from './pages/SettingsPage';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [paypalMode, setPaypalMode] = useState('DEMO_MODE');

  useEffect(() => {
    // Check initial system mode
    api.getHealth()
      .then((data) => {
        if (data.paypal_mode) {
          setPaypalMode(data.paypal_mode);
        }
      })
      .catch((err) => {
        console.warn('API health check offline or starting:', err);
      });
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'new-payment':
        return <NewPaymentPage setActiveTab={setActiveTab} />;
      case 'transactions':
        return <TransactionsPage />;
      case 'insights':
        return <InsightsPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        paypalMode={paypalMode}
      />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
