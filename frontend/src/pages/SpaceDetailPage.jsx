import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, Maximize, Star, Clock, ArrowLeft, CheckCircle, Calendar, Building2, Mail, AlertCircle } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const TYPE_LABELS = {
  private_cabin: 'Private Cabin', shared_desk: 'Shared Desk',
  meeting_room: 'Meeting Room', event_space: 'Event Space', virtual_office: 'Virtual Office',
};

export default function SpaceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [space, setSpace]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const { data } = await api.get(`/spaces/${id}`);
        setSpace(data.data);
      } catch { } finally { setLoading(false); }
    };
    fetchSpace();

    const socket = io('http://localhost:5000');
    socket.emit('join_space', id);
    socket.on('availability_update', ({ spaceId, isAvailable }) => {
      if (spaceId === id) setSpace((p) => p ? { ...p, availability: { ...p.availability, isAvailable } } : p);
    });
    socket.on('new_booking', fetchSpace);
    return () => socket.disconnect();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-obsidian-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 space-y-5">
        <div className="h-96 rounded-2xl skeleton" />
        <div className="h-8 w-1/2 rounded-xl skeleton" />
        <div className="h-4 w-1/3 rounded-xl skeleton" />
      </div>
    </div>
  );

  if (!space) return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-center px-4">
        <div>
          <AlertCircle className="w-16 h-16 text-obsidian-700 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-3">Space Not Found</h2>
          <Link to="/spaces" className="btn-primary">Browse Spaces</Link>
        </div>
      </div>
    </div>
  );

  const images = space.images?.length > 0
    ? space.images
    : [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', caption: space.name }];

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/spaces" className="inline-flex items-center gap-1.5 text-sm text-obsidian-500 hover:text-amber-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to spaces
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gallery */}
            <div className="card overflow-hidden">
              <div className="h-72 md:h-[420px] bg-obsidian-800">
                <img src={images[activeImg]?.url} alt={space.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200'; }} />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 border-t border-obsidian-800">
                  {images.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImg(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImg === idx ? 'border-amber-500' : 'border-obsidian-700 opacity-50 hover:opacity-75'}`}>
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Header info */}
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="badge bg-amber-900/40 text-amber-300 border border-amber-800/40">{TYPE_LABELS[space.type]}</span>
                    {space.isFeatured && <span className="badge bg-amber-600/20 text-amber-400 border border-amber-600/30">✦ Featured</span>}
                    <span className={`badge ${space.availability?.isAvailable ? 'badge-approved' : 'badge-rejected'} flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${space.availability?.isAvailable ? 'bg-jade-400 animate-pulse' : 'bg-red-400'}`} />
                      {space.availability?.isAvailable ? 'Available Now' : 'Unavailable'}
                    </span>
                  </div>
                  <h1 className="font-display text-3xl font-bold text-white">{space.name}</h1>
                </div>
                {space.rating?.count > 0 && (
                  <div className="flex items-center gap-1.5 bg-amber-900/30 text-amber-300 px-3 py-2 rounded-xl border border-amber-800/30">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{space.rating.average}</span>
                    <span className="text-obsidian-500 text-sm">({space.rating.count})</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-obsidian-500 text-sm mb-4">
                <MapPin className="w-4 h-4 text-amber-600" />
                {space.location?.address}, {space.location?.city}, {space.location?.state}
              </div>
              {space.description && <p className="text-obsidian-400 leading-relaxed">{space.description}</p>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Users,     label: 'Capacity',  value: `${space.seatingCapacity} persons` },
                { icon: Maximize,  label: 'Area',       value: `${space.areaSize?.value} sq ft` },
                { icon: Clock,     label: 'Hours',      value: `${space.availability?.openTime}–${space.availability?.closeTime}` },
                { icon: Building2, label: 'Bookings',   value: space.totalBookings },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="card p-4 text-center">
                  <Icon className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                  <p className="text-xs text-obsidian-500 mb-0.5 uppercase tracking-wider">{label}</p>
                  <p className="font-semibold text-white text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Working days */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-obsidian-400 uppercase tracking-widest mb-3">Working Days</h3>
              <div className="flex flex-wrap gap-2">
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day) => (
                  <span key={day} className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                    space.availability?.workingDays?.includes(day)
                      ? 'bg-amber-600/10 text-amber-400 border-amber-600/30'
                      : 'bg-obsidian-900 text-obsidian-700 border-obsidian-800 line-through'
                  }`}>{day.slice(0, 3)}</span>
                ))}
              </div>
            </div>

            {/* Amenities */}
            {space.amenities?.length > 0 && (
              <div className="card p-5">
                <h3 className="text-xs font-semibold text-obsidian-400 uppercase tracking-widest mb-4">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {space.amenities.map((a) => (
                    <div key={a._id} className="flex items-center gap-2.5 p-3 bg-obsidian-800/60 rounded-xl border border-obsidian-700">
                      <span className="text-xl">{a.icon}</span>
                      <span className="text-sm text-obsidian-300 font-medium">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner */}
            {space.owner && (
              <div className="card p-5">
                <h3 className="text-xs font-semibold text-obsidian-400 uppercase tracking-widest mb-4">Space Manager</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-lg shadow-glow-sm">
                    {space.owner.name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{space.owner.name}</p>
                    {space.owner.company && <p className="text-sm text-obsidian-500">{space.owner.company}</p>}
                    {space.owner.email && (
                      <a href={`mailto:${space.owner.email}`} className="text-xs text-amber-400 flex items-center gap-1 mt-1 hover:text-amber-300 transition-colors">
                        <Mail className="w-3 h-3" /> {space.owner.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Sticky booking panel */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-display text-xl font-bold text-white mb-5">Book This Space</h3>

              {/* Pricing */}
              <div className="space-y-2 mb-6">
                {space.pricing?.hourly && (
                  <div className="flex justify-between items-center p-3 bg-obsidian-800/60 rounded-xl border border-obsidian-700">
                    <span className="text-obsidian-400 text-sm">Per Hour</span>
                    <span className="font-bold text-white">₹{space.pricing.hourly.toLocaleString()}</span>
                  </div>
                )}
                {space.pricing?.daily && (
                  <div className="flex justify-between items-center p-3 bg-amber-600/10 rounded-xl border border-amber-600/30">
                    <span className="text-amber-400 text-sm font-medium">Per Day</span>
                    <span className="font-bold text-amber-400 text-xl">₹{space.pricing.daily.toLocaleString()}</span>
                  </div>
                )}
                {space.pricing?.monthly && (
                  <div className="flex justify-between items-center p-3 bg-obsidian-800/60 rounded-xl border border-obsidian-700">
                    <span className="text-obsidian-400 text-sm">Per Month</span>
                    <span className="font-bold text-white">₹{space.pricing.monthly.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              {space.availability?.isAvailable ? (
                user?.role === 'user' ? (
                  <Link to={`/book/${space._id}`} className="btn-primary w-full justify-center py-3.5 text-base shadow-glow-amber">
                    <Calendar className="w-5 h-5" /> Book Now
                  </Link>
                ) : !user ? (
                  <Link to={`/login?redirect=/spaces/${space._id}`} className="btn-primary w-full justify-center py-3.5 text-base">
                    Sign in to Book
                  </Link>
                ) : (
                  <div className="bg-obsidian-800 text-obsidian-400 text-sm text-center px-4 py-3 rounded-xl border border-obsidian-700">
                    Switch to a user account to book.
                  </div>
                )
              ) : (
                <div className="bg-red-900/20 text-red-400 text-sm text-center px-4 py-3 rounded-xl border border-red-800/30 font-medium">
                  ● Currently Unavailable
                </div>
              )}

              <p className="text-xs text-obsidian-600 text-center mt-3">No payment required until confirmed</p>

              {/* Assurances */}
              <div className="mt-5 pt-5 border-t border-obsidian-800 space-y-2.5">
                {['Instant booking request', 'Owner confirms within 24h', 'Free cancellation available'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-obsidian-500">
                    <CheckCircle className="w-4 h-4 text-jade-500 flex-shrink-0" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
