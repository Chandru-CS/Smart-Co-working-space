import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Shared layout ─────────────────────────────────────────────────────────────
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-obsidian-950 flex"
      style={{ background: 'radial-gradient(ellipse 60% 50% at 30% 0%, rgba(217,119,6,0.08) 0%, transparent 60%), #0d0d11' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-obsidian-900 border-r border-obsidian-800 p-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center shadow-glow-amber">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">CoWork</span>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-px bg-amber-600" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Premium Platform</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Work where<br />
            <em className="not-italic text-amber-400">inspiration lives.</em>
          </h2>
          <p className="text-obsidian-500 text-sm leading-relaxed max-w-xs">
            Discover curated co-working spaces for teams that refuse to settle for ordinary.
          </p>
        </div>
        <div className="flex gap-6 text-xs text-obsidian-600">
          <span>200+ Spaces</span>
          <span>·</span>
          <span>15+ Cities</span>
          <span>·</span>
          <span>4.8★ Avg</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">CoWork</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-obsidian-500 text-sm">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
      if (result.user.role === 'owner') navigate('/owner/dashboard');
      else if (result.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your CoWork account">
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <input className="input" type="email" placeholder="you@example.com" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input className="input pr-12" type={show ? 'text' : 'password'} placeholder="••••••••" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-obsidian-600 hover:text-obsidian-300 transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full justify-center py-3.5 text-base mt-2 shadow-glow-amber">
          {loading ? 'Signing in…' : <><span>Sign In</span> <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 pt-6 border-t border-obsidian-800">
        <p className="text-xs text-obsidian-600 uppercase tracking-wider text-center mb-3">Demo Accounts</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'User',  email: 'arjun@example.com', pwd: 'user123' },
            { label: 'Owner', email: 'priya@spaces.com',  pwd: 'owner123' },
            { label: 'Admin', email: 'admin@cowork.com',  pwd: 'admin123' },
          ].map((d) => (
            <button key={d.label} type="button" onClick={() => setForm({ email: d.email, password: d.pwd })}
              className="text-xs bg-obsidian-900 hover:bg-amber-600/10 hover:text-amber-400 hover:border-amber-600/30 text-obsidian-400 px-2 py-2.5 rounded-xl border border-obsidian-800 transition-all">
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-obsidian-500 mt-6">
        No account?{' '}
        <Link to="/register" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">Create one free</Link>
      </p>
    </AuthLayout>
  );
}

// ── Register ──────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', phone: '', company: '' });
  const [show, setShow] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      toast.success('Account created! Welcome to CoWork.');
      navigate(result.user.role === 'owner' ? '/owner/dashboard' : '/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join thousands of teams on CoWork">
      <form onSubmit={handle} className="space-y-4">
        {/* Role selector */}
        <div>
          <label className="label">I am a…</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'user',  label: '👤 Space User',  desc: 'Looking to book' },
              { value: 'owner', label: '🏢 Space Owner', desc: 'Listing spaces' },
            ].map((r) => (
              <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.role === r.value
                    ? 'border-amber-600 bg-amber-600/10'
                    : 'border-obsidian-700 hover:border-obsidian-600 bg-obsidian-900'
                }`}>
                <div className="font-semibold text-sm text-white">{r.label}</div>
                <div className="text-xs text-obsidian-500 mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Full Name</label>
          <input className="input" placeholder="Your full name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@example.com" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="Mobile number"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" placeholder="Optional"
              value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input className="input pr-12" type={show ? 'text' : 'password'} placeholder="Min. 6 characters" required minLength={6}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-obsidian-600 hover:text-obsidian-300 transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full justify-center py-3.5 text-base shadow-glow-amber mt-1">
          {loading ? 'Creating account…' : <><span>Create Account</span> <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>

      <p className="text-center text-sm text-obsidian-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
