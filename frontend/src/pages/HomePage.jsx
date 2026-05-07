import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Zap, Shield, Clock, TrendingUp, Search, Star, MapPin, Users } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import SpaceCard from '../components/spaces/SpaceCard';
import api from '../utils/api';

const STATS = [
  { value: '200+', label: 'Active Spaces' },
  { value: '15+',  label: 'Cities' },
  { value: '1.2K+',label: 'Teams Served' },
  { value: '4.8★', label: 'Avg Rating' },
];

const FEATURES = [
  { icon: Zap,       title: 'Real-Time Availability', desc: 'Live status updates via WebSocket. See exactly what\'s free right now, no refreshing needed.' },
  { icon: Search,    title: 'Smart Matching',         desc: 'Filter by team size, budget, area, amenities, and location. We surface the best matches first.' },
  { icon: Shield,    title: 'Verified Spaces',        desc: 'Every listing is reviewed for accuracy. Photos, pricing, and amenities — all confirmed.' },
  { icon: Clock,     title: 'Flexible Bookings',      desc: 'Hour, day, or month. Cancel with a click. No lock-in, no hidden fees.' },
];

const CITIES = ['Bangalore', 'Pune', 'Mumbai', 'Hyderabad', 'Chennai', 'Delhi'];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [popular,  setPopular]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/spaces/featured'), api.get('/spaces/popular')])
      .then(([f, p]) => { setFeatured(f.data.data || []); setPopular(p.data.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/spaces?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative grain-overlay min-h-screen flex items-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(217,119,6,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(217,119,6,0.06) 0%, transparent 60%), #0d0d11' }}>

        {/* Decorative blobs */}
        <div className="absolute top-32 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-amber-600/4 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
          <div className="max-w-3xl">

            {/* Eyebrow */}
            <div className="animate-fade-up inline-flex items-center gap-2 mb-7">
              <span className="w-8 h-px bg-amber-600" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">Smart Co-Working Platform</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up-d1 font-display text-5xl md:text-7xl font-bold leading-[1.08] text-white mb-6">
              The Workspace<br />
              <em className="not-italic text-amber-400">You Deserve</em>,<br />
              <span className="text-obsidian-400">Found Instantly.</span>
            </h1>

            <p className="animate-fade-up-d2 text-lg text-obsidian-400 mb-10 max-w-xl leading-relaxed">
              Discover and book premium co-working spaces tailored to your team — with real-time availability, smart filters, and instant confirmation.
            </p>

            {/* Hero search bar */}
            <form onSubmit={handleSearch} className="animate-fade-up-d3 flex gap-2 max-w-xl mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-500" />
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-obsidian-900 border border-obsidian-700 text-white placeholder:text-obsidian-500
                             focus:border-amber-600/60 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all text-base"
                  placeholder="Search by city or space name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary py-4 px-6 text-base shadow-glow-amber">
                Search <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* City quick-links */}
            <div className="animate-fade-up-d4 flex flex-wrap gap-2 items-center">
              <span className="text-obsidian-600 text-xs uppercase tracking-wider">Popular:</span>
              {CITIES.map((city) => (
                <Link key={city} to={`/spaces?city=${city}`}
                  className="text-xs text-obsidian-400 hover:text-amber-400 bg-obsidian-900 hover:bg-amber-600/10 px-3 py-1.5 rounded-full border border-obsidian-800 hover:border-amber-600/30 transition-all">
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-amber-600" />
          <span className="text-xs text-obsidian-500 uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="bg-obsidian-900 border-y border-obsidian-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label }, i) => (
              <div key={label} className="text-center" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="font-display text-4xl font-bold text-amber-400 mb-1">{value}</div>
                <div className="text-obsidian-500 text-sm uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Spaces ───────────────────────────────────────────────── */}
      <section className="py-20 bg-obsidian-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-px bg-amber-600" />
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.15em]">Hand-Picked</span>
              </div>
              <h2 className="section-title">Featured Spaces</h2>
            </div>
            <Link to="/spaces" className="btn-outline hidden sm:inline-flex">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map((i) => <div key={i} className="h-72 rounded-2xl skeleton" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.slice(0, 6).map((space, i) => (
                <SpaceCard key={space._id} space={space} delay={i * 80} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/spaces" className="btn-outline">View all spaces <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-obsidian-900 border-y border-obsidian-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-6 h-px bg-amber-600" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.15em]">Why CoWork</span>
              <span className="w-6 h-px bg-amber-600" />
            </div>
            <h2 className="section-title">Built for How You Actually Work</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="card p-6 group hover:border-amber-600/30 transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-11 h-11 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center mb-5 group-hover:bg-amber-600/20 transition-colors">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-display font-semibold text-white mb-2 text-base">{title}</h3>
                <p className="text-obsidian-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Spaces ─────────────────────────────────────────────────── */}
      {popular.length > 0 && (
        <section className="py-20 bg-obsidian-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-px bg-amber-600" />
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.15em] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Trending
                  </span>
                </div>
                <h2 className="section-title">Most Popular</h2>
              </div>
              <Link to="/spaces?sort=-totalBookings" className="btn-outline hidden sm:inline-flex">
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popular.slice(0, 4).map((space, i) => (
                <SpaceCard key={space._id} space={space} delay={i * 80} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(217,119,6,0.1) 0%, transparent 70%), #0d0d11' }}>
        <div className="absolute inset-0 border-y border-obsidian-800" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-px bg-amber-600" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">Get Started</span>
            <span className="w-8 h-px bg-amber-600" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Your Ideal Workspace<br />Is One Search Away
          </h2>
          <p className="text-obsidian-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of teams working smarter. Sign up free — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary px-8 py-4 text-base shadow-glow-amber">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/spaces" className="btn-ghost px-8 py-4 text-base">
              Browse Spaces
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
