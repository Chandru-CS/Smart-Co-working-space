import React, { useEffect, useState } from 'react';
import { Users, Building2, Calendar, DollarSign, Shield, Star, TrendingUp } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import api from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending:'badge-pending', approved:'badge-approved', rejected:'badge-rejected', cancelled:'badge-cancelled', completed:'badge-completed' };

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [spaces, setSpaces]   = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('overview');

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/bookings'), api.get('/admin/spaces')])
      .then(([s, u, b, sp]) => { setStats(s.data.data); setUsers(u.data.data); setBookings(b.data.data); setSpaces(sp.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id, isActive) => {
    await api.put(`/admin/users/${id}`, { isActive: !isActive });
    setUsers((p) => p.map((u) => u._id === id ? { ...u, isActive: !isActive } : u));
    toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
  };

  const toggleFeatured = async (id) => {
    const { data } = await api.put(`/admin/spaces/${id}/feature`);
    setSpaces((p) => p.map((s) => s._id === id ? { ...s, isFeatured: data.data.isFeatured } : s));
    toast.success('Featured status updated');
  };

  const TABS = [
    ['overview', 'Overview'],
    ['users', `Users (${users.length})`],
    ['spaces', `Spaces (${spaces.length})`],
    ['bookings', `Bookings (${bookings.length})`],
  ];

  const TH = ({ children }) => (
    <th className="text-left px-4 py-3 text-xs font-semibold text-obsidian-500 uppercase tracking-wider">{children}</th>
  );

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-red-900/40 rounded-xl border border-red-800/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="text-obsidian-500 text-sm mt-0.5">Platform management & oversight</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: Users,      label: 'Total Users',  value: stats.totalUsers + stats.totalOwners, c: 'text-amber-400 bg-amber-600/10 border-amber-600/20' },
              { icon: Building2,  label: 'Active Spaces', value: stats.totalSpaces,  c: 'text-purple-400 bg-purple-600/10 border-purple-600/20' },
              { icon: Calendar,   label: 'Bookings',     value: stats.totalBookings, c: 'text-blue-400 bg-blue-600/10 border-blue-600/20' },
              { icon: DollarSign, label: 'Est. Revenue',  value: `₹${(stats.estimatedRevenue/1000).toFixed(0)}K`, c: 'text-jade-400 bg-jade-600/10 border-jade-600/20' },
            ].map(({ icon: Icon, label, value, c }) => (
              <div key={label} className="stat-card">
                <div className={`stat-icon border ${c}`}><Icon className="w-5 h-5" /></div>
                <div><p className="font-display text-2xl font-bold text-white">{value}</p><p className="text-xs text-obsidian-500 uppercase tracking-wider">{label}</p></div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-obsidian-800">
          {TABS.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${tab === k ? 'border-amber-600 text-amber-400' : 'border-transparent text-obsidian-500 hover:text-obsidian-200'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-obsidian-400 uppercase tracking-widest mb-4">Booking Status</h3>
              {[
                { label: 'Pending',  value: stats.pendingBookings,  bg: 'bg-amber-600' },
                { label: 'Approved', value: stats.approvedBookings, bg: 'bg-jade-500' },
                { label: 'Total',    value: stats.totalBookings,    bg: 'bg-amber-600/40' },
              ].map(({ label, value, bg }) => (
                <div key={label} className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${bg}`} />
                    <span className="text-sm text-obsidian-400">{label}</span>
                  </div>
                  <span className="font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-obsidian-400 uppercase tracking-widest mb-4">User Breakdown</h3>
              {[
                { label: 'Regular Users', value: stats.totalUsers,  Icon: Users },
                { label: 'Space Owners',  value: stats.totalOwners, Icon: Building2 },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-obsidian-800/60 rounded-xl border border-obsidian-700 mb-2">
                  <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-amber-600" /><span className="text-sm text-obsidian-300">{label}</span></div>
                  <span className="font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-obsidian-400 uppercase tracking-widest mb-4">Recent Signups</h3>
              {stats.recentUsers?.map((u) => (
                <div key={u._id} className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{u.name}</p>
                    <p className="text-xs text-obsidian-600 capitalize">{u.role}</p>
                  </div>
                  <span className="text-xs text-obsidian-700">{format(new Date(u.createdAt), 'MMM d')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users table */}
        {tab === 'users' && (
          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-obsidian-800/60 border-b border-obsidian-700">
                <tr>{['Name','Email','Role','Joined','Status','Action'].map((h) => <TH key={h}>{h}</TH>)}</tr>
              </thead>
              <tbody className="divide-y divide-obsidian-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-obsidian-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u.name?.[0]}</div>
                        <span className="font-medium text-white truncate max-w-[120px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-obsidian-500 truncate max-w-[160px]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs capitalize ${u.role==='admin'?'bg-red-900/40 text-red-400 border border-red-800/30':u.role==='owner'?'bg-purple-900/40 text-purple-400 border border-purple-800/30':'badge-available'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-obsidian-500 text-xs">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${u.isActive ? 'badge-approved' : 'badge-rejected'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleUser(u._id, u.isActive)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${u.isActive ? 'bg-red-900/20 text-red-400 border-red-800/30 hover:bg-red-900/40' : 'bg-jade-600/20 text-jade-400 border-jade-600/30 hover:bg-jade-600/30'}`}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Spaces table */}
        {tab === 'spaces' && (
          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-obsidian-800/60 border-b border-obsidian-700">
                <tr>{['Space','Owner','City','Rating','Status','Featured'].map((h) => <TH key={h}>{h}</TH>)}</tr>
              </thead>
              <tbody className="divide-y divide-obsidian-800">
                {spaces.map((s) => (
                  <tr key={s._id} className="hover:bg-obsidian-900/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white max-w-[160px] truncate">{s.name}</td>
                    <td className="px-4 py-3 text-obsidian-400">{s.owner?.name}</td>
                    <td className="px-4 py-3 text-obsidian-500">{s.location?.city}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {s.rating?.average || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${s.isActive ? 'badge-approved' : 'badge-rejected'}`}>{s.isActive ? 'Active' : 'Off'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFeatured(s._id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${s.isFeatured ? 'bg-amber-600/20 text-amber-400 border-amber-600/30' : 'bg-obsidian-800 text-obsidian-500 border-obsidian-700 hover:border-amber-600/30 hover:text-amber-400'}`}>
                        {s.isFeatured ? '✦ Featured' : 'Set Featured'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bookings table */}
        {tab === 'bookings' && (
          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-obsidian-800/60 border-b border-obsidian-700">
                <tr>{['Space','User','Dates','Amount','Type','Status'].map((h) => <TH key={h}>{h}</TH>)}</tr>
              </thead>
              <tbody className="divide-y divide-obsidian-800">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-obsidian-900/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white max-w-[150px] truncate">{b.space?.name}</td>
                    <td className="px-4 py-3 text-obsidian-400 max-w-[120px] truncate">{b.user?.name}</td>
                    <td className="px-4 py-3 text-obsidian-500 text-xs whitespace-nowrap">
                      {format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d')}
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-400">₹{b.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-obsidian-500 capitalize text-xs">{b.bookingType}</td>
                    <td className="px-4 py-3"><span className={`badge text-xs ${STATUS_BADGE[b.status]}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
