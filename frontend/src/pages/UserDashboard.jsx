import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Bell, BellOff, Search, XCircle } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending:   'badge-pending',
  approved:  'badge-approved',
  rejected:  'badge-rejected',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
};
const STATUS_ICON = {
  pending:   <Clock className="w-3 h-3" />,
  approved:  <CheckCircle className="w-3 h-3" />,
  rejected:  <XCircle className="w-3 h-3" />,
  cancelled: <XCircle className="w-3 h-3" />,
  completed: <CheckCircle className="w-3 h-3" />,
};

const TABS = ['all','pending','approved','completed','cancelled'];

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings]           = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState('all');

  useEffect(() => {
    Promise.all([api.get('/bookings/my'), api.get('/users/notifications')])
      .then(([b, n]) => { setBookings(b.data.data); setNotifications(n.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'all' ? bookings : bookings.filter((b) => b.status === activeTab);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings((p) => p.map((b) => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const markRead = async () => {
    await api.put('/users/notifications/read-all');
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const stats = {
    total:    bookings.length,
    pending:  bookings.filter((b) => b.status === 'pending').length,
    approved: bookings.filter((b) => b.status === 'approved').length,
    unread:   notifications.filter((n) => !n.read).length,
  };

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-px bg-amber-600" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">My Account</span>
            </div>
            <h1 className="section-title">Dashboard</h1>
            <p className="text-obsidian-500 mt-1">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
          </div>
          <Link to="/spaces" className="btn-primary">
            <Search className="w-4 h-4" /> Find Spaces
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Calendar,      label: 'Total Bookings', value: stats.total,    color: 'text-amber-400 bg-amber-600/10 border-amber-600/20' },
            { icon: Clock,         label: 'Pending',        value: stats.pending,  color: 'text-orange-400 bg-orange-600/10 border-orange-600/20' },
            { icon: CheckCircle,   label: 'Approved',       value: stats.approved, color: 'text-jade-400 bg-jade-600/10 border-jade-600/20' },
            { icon: Bell,          label: 'Unread',         value: stats.unread,   color: 'text-purple-400 bg-purple-600/10 border-purple-600/20' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon border ${color}`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="font-display text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-obsidian-500 uppercase tracking-wider">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Bookings */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="p-5 border-b border-obsidian-800">
              <h2 className="font-display font-semibold text-white text-lg mb-3">My Bookings</h2>
              <div className="flex gap-1 flex-wrap">
                {TABS.map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                      activeTab === t ? 'bg-amber-600 text-white' : 'text-obsidian-500 hover:text-obsidian-200 hover:bg-obsidian-800'
                    }`}>{t}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-xl skeleton" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center">
                <Calendar className="w-12 h-12 text-obsidian-800 mx-auto mb-3" />
                <p className="text-obsidian-500 font-medium">No bookings found</p>
                <Link to="/spaces" className="btn-primary mt-4 text-sm">Browse Spaces</Link>
              </div>
            ) : (
              <div className="divide-y divide-obsidian-800">
                {filtered.map((b) => (
                  <div key={b._id} className="p-5 hover:bg-obsidian-900/50 transition-colors">
                    <div className="flex gap-4 items-start">
                      <img src={b.space?.images?.[0]?.url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200'}
                        className="w-16 h-14 rounded-xl object-cover flex-shrink-0 border border-obsidian-700"
                        alt="" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200'; }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-white truncate">{b.space?.name}</h3>
                          <span className={`badge ${STATUS_BADGE[b.status]} flex-shrink-0`}>
                            {STATUS_ICON[b.status]} {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-obsidian-500 mt-1">
                          {format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d, yyyy')}
                          &nbsp;·&nbsp; {b.numberOfPersons} person{b.numberOfPersons > 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-amber-400 font-semibold text-sm">₹{b.totalAmount?.toLocaleString()}</span>
                          {['pending','approved'].includes(b.status) && (
                            <button onClick={() => handleCancel(b._id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Cancel</button>
                          )}
                        </div>
                        {b.statusNote && <p className="text-xs text-obsidian-600 mt-1 italic">"{b.statusNote}"</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-obsidian-800 flex items-center justify-between">
              <h2 className="font-display font-semibold text-white text-lg flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" /> Notifications
                {stats.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center animate-pulse-amber">
                    {stats.unread}
                  </span>
                )}
              </h2>
              {stats.unread > 0 && (
                <button onClick={markRead} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Mark read</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <BellOff className="w-10 h-10 text-obsidian-800 mx-auto mb-2" />
                <p className="text-obsidian-600 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-obsidian-800 max-h-[500px] overflow-y-auto">
                {notifications.slice(0, 20).map((n, i) => (
                  <div key={i} className={`p-4 transition-colors ${!n.read ? 'bg-amber-600/5' : ''}`}>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mb-2" />}
                    <p className={`text-sm leading-relaxed ${!n.read ? 'text-obsidian-200' : 'text-obsidian-500'}`}>{n.message}</p>
                    <p className="text-xs text-obsidian-700 mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
