import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(217,119,6,0.06) 0%, transparent 60%), #0d0d11' }}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-obsidian-900 border border-obsidian-800 flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-obsidian-700" />
        </div>
        <div className="font-display text-8xl font-bold text-amber-600/30 mb-2">404</div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-obsidian-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist. Maybe that workspace was already fully booked!
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-ghost"><Home className="w-4 h-4" /> Go Home</Link>
          <Link to="/spaces" className="btn-primary shadow-glow-sm"><Search className="w-4 h-4" /> Browse Spaces</Link>
        </div>
      </div>
    </div>
  );
}
