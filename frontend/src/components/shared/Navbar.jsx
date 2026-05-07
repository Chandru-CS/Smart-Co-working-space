import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Menu, X, LogOut, LayoutDashboard, Search, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dashboardPath =
    user?.role === 'owner' ? '/owner/dashboard' :
    user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  const isActive = (path) => location.pathname === path;
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-obsidian-950/95 backdrop-blur-xl border-b border-obsidian-800/80'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-amber transition-shadow">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">CoWork</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[{ to: '/', label: 'Home' }, { to: '/spaces', label: 'Find Spaces' }].map(({ to, label }) => (
              <Link key={to} to={to} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(to) ? 'text-amber-400 bg-amber-600/10' : 'text-obsidian-300 hover:text-white hover:bg-obsidian-800/60'
              }`}>{label}</Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3" ref={profileRef}>
            {user ? (
              <>
                <Link to={dashboardPath} className="btn-ghost py-2 px-4">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-xl hover:bg-obsidian-800 transition-colors border border-transparent hover:border-obsidian-700">
                    {user.avatar ? (
                      <img src={user.avatar} className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-600/40" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-sm">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-obsidian-200 max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-obsidian-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-obsidian-900 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] border border-obsidian-700 py-1.5 animate-fade-in">
                      <div className="px-4 py-3 border-b border-obsidian-800">
                        <p className="text-xs text-obsidian-500">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate mt-0.5">{user.name}</p>
                        <span className={`badge text-xs mt-1 capitalize ${
                          user.role === 'admin' ? 'bg-red-900/40 text-red-400 border border-red-800/30' :
                          user.role === 'owner' ? 'bg-purple-900/40 text-purple-400 border border-purple-800/30' :
                          'badge-available'
                        }`}>{user.role}</span>
                      </div>
                      <Link to={dashboardPath} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-obsidian-300 hover:text-white hover:bg-obsidian-800 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost py-2 px-4">Sign in</Link>
                <Link to="/register" className="btn-primary py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-obsidian-800 text-obsidian-300">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-obsidian-950/98 backdrop-blur-xl border-t border-obsidian-800 px-4 py-4 space-y-1 animate-fade-in">
          <Link to="/" className="block px-3 py-2.5 rounded-xl text-sm text-obsidian-300 hover:text-white hover:bg-obsidian-800" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/spaces" className="block px-3 py-2.5 rounded-xl text-sm text-obsidian-300 hover:text-white hover:bg-obsidian-800" onClick={() => setMenuOpen(false)}>Find Spaces</Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="block px-3 py-2.5 rounded-xl text-sm text-amber-400 bg-amber-600/10" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/20">Sign out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-ghost flex-1 justify-center" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="btn-primary flex-1 justify-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
