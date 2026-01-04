
import React, { useState } from 'react';
import { UserRole, User } from './types';
import LandingPage from './components/LandingPage';
import ConsumerDashboard from './components/ConsumerDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import RecyclerDashboard from './components/RecyclerDashboard';
import NGODashboard from './components/NGODashboard';
import NetworkView from './components/NetworkView';
import Navigation from './components/Navigation';
import AuthPage from './components/AuthPage';
import VerificationGate from './components/VerificationGate';
import ProfileSettings from './components/ProfileSettings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<UserRole>(UserRole.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setShowAuth(false);
    setCurrentView(newUser.role);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(UserRole.LANDING);
    setShowProfile(false);
  };

  const updateVerification = (status: boolean) => {
    if (user) setUser({ ...user, isVerified: status });
  };

  const renderContent = () => {
    if (showProfile && user) {
      return <ProfileSettings user={user} onUpdate={(updated) => setUser(updated)} onBack={() => setShowProfile(false)} />;
    }

    // Professionals must pass verification gate
    if (user && !user.isVerified && [UserRole.TECHNICIAN, UserRole.RECYCLER, UserRole.NGO_GOV].includes(user.role)) {
      return <VerificationGate user={user} onVerify={() => updateVerification(true)} />;
    }

    switch (currentView) {
      case UserRole.NETWORK:
        return <NetworkView />;
      case UserRole.CONSUMER:
        return <ConsumerDashboard />;
      case UserRole.TECHNICIAN:
        return <TechnicianDashboard />;
      case UserRole.RECYCLER:
        return <RecyclerDashboard />;
      case UserRole.NGO_GOV:
        return <NGODashboard />;
      case UserRole.LANDING:
      default:
        return <LandingPage user={user} onRoleSelect={(role) => {
          if (user && user.role === role) {
             setCurrentView(role);
          } else {
             setShowAuth(true);
          }
        }} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation 
        currentView={currentView} 
        user={user}
        onNavigate={(role) => {
          setShowProfile(false);
          setCurrentView(role);
        }} 
        onAuthClick={() => setShowAuth(true)}
        onProfileClick={() => setShowProfile(true)}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow pt-20">
        {renderContent()}
      </main>

      {showAuth && (
        <AuthPage 
          onClose={() => setShowAuth(false)} 
          onLogin={handleLogin} 
        />
      )}

      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-white text-xl font-bold mb-2">GreenLink</h2>
            <p className="text-sm max-w-xs text-center md:text-left">
              A government-aligned digital initiative for traceable and responsible e-waste management.
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Policy & Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Help Desk</a>
          </div>
          <div className="text-sm text-center md:text-right">
            <p>© 2026 GreenLink India. All Rights Reserved.</p>
            <p className="text-emerald-500 font-medium">National Circular Economy Framework</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
