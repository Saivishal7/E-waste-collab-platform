
import React, { useState } from 'react';
import { UserRole, User, Notification } from '../types';

interface NavigationProps {
  currentView: UserRole;
  user: User | null;
  onNavigate: (role: UserRole) => void;
  onAuthClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, user, onNavigate, onAuthClick, onProfileClick, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  // Mock Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Handover Complete', message: 'Asset-42 signed by Node-HYD.', time: '2h ago', type: 'SUCCESS', isRead: false },
    { id: '2', title: 'Reward Credited', message: '+50 XP added to your profile.', time: '1d ago', type: 'INFO', isRead: false },
    { id: '3', title: 'Policy Update', message: 'New Li-ion battery rules published.', time: '2d ago', type: 'WARNING', isRead: true },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-[100] px-6">
      <div className="max-w-7xl mx-auto h-full flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onNavigate(UserRole.LANDING)}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-emerald-600 transition-colors">GreenLink</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 opacity-70">Eco-Tech Network</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-8 mr-4">
            <NavButton active={currentView === UserRole.LANDING} onClick={() => onNavigate(UserRole.LANDING)}>Home</NavButton>
            <NavButton active={currentView === UserRole.NETWORK} onClick={() => onNavigate(UserRole.NETWORK)}>Network</NavButton>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              {/* INBOX / NOTIFICATIONS */}
              <div className="relative">
                <button 
                  onClick={() => { setShowInbox(!showInbox); setShowUserMenu(false); }}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative ${showInbox ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showInbox && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-[200]">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Grid Intel</h3>
                      <button onClick={markAllAsRead} className="text-[9px] font-black uppercase text-blue-600 hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center space-y-2">
                           <span className="text-2xl">🛰️</span>
                           <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Inbox clear</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors flex gap-4 ${!n.isRead ? 'bg-blue-50/20' : ''}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'SUCCESS' ? 'bg-emerald-500' : n.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{n.title}</p>
                                <span className="text-[8px] font-bold text-slate-400">{n.time}</span>
                              </div>
                              <p className="text-[11px] font-medium text-slate-500 leading-tight">{n.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-slate-50/80 border-t border-slate-50">
                      <button 
                        onClick={() => { onNavigate(user.role); setShowInbox(false); }}
                        className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                      >
                        View System Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* USER MENU */}
              <div className="relative">
                <button 
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowInbox(false); }}
                  className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl hover:bg-white transition-all group"
                >
                  <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                    {user.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-slate-900 leading-none mb-0.5">{user.name.split(' ')[0]}</p>
                    <p className="text-[8px] opacity-60 leading-none uppercase">{user.role.replace('_', ' ')}</p>
                  </div>
                  <svg className={`w-3 h-3 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-slate-100 shadow-2xl rounded-3xl p-3 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                    <button 
                      onClick={() => { onNavigate(user.role); setShowUserMenu(false); }}
                      className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl transition-colors font-black text-slate-900 flex items-center gap-3"
                    >
                      <span className="text-base">📊</span> Dashboard
                    </button>
                    <button 
                      onClick={() => { onProfileClick(); setShowUserMenu(false); }}
                      className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl transition-colors font-black text-slate-900 flex items-center gap-3"
                    >
                      <span className="text-base">⚙️</span> Profile Settings
                    </button>
                    <div className="h-px bg-slate-50 my-2"></div>
                    <button 
                      onClick={() => { onLogout(); setShowUserMenu(false); }}
                      className="w-full text-left p-4 hover:bg-red-50 rounded-2xl transition-colors font-black text-red-600 flex items-center gap-3"
                    >
                      <span className="text-base">🚪</span> Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl hover:bg-emerald-600 transition-all font-black shadow-xl shadow-slate-900/10 active:scale-95"
            >
              Log In
            </button>
          )}
        </div>

        <div className="md:hidden flex items-center gap-4">
           {user && unreadCount > 0 && (
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
           )}
           <button className="p-3 bg-slate-100 rounded-xl text-slate-600">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16m-7 6h7" />
             </svg>
           </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </nav>
  );
};

const NavButton: React.FC<{ active: boolean, children: React.ReactNode, onClick: () => void }> = ({ active, children, onClick }) => (
  <button 
    onClick={onClick}
    className={`hover:text-emerald-600 transition-all pb-1 border-b-2 font-black ${active ? 'text-emerald-600 border-emerald-500' : 'border-transparent'}`}
  >
    {children}
  </button>
);

export default Navigation;
