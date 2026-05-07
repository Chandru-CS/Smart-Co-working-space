import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-obsidian-950 border-t border-obsidian-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-glow-sm">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">CoWork</span>
            </Link>
            <p className="text-sm text-obsidian-500 leading-relaxed">
              Premium co-working space discovery and booking for teams that demand the best.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-obsidian-400 uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Find Spaces', '/spaces'], ['Sign Up', '/register'], ['List Your Space', '/register'], ['Sign In', '/login']].map(([l, h]) => (
                <li key={l}><Link to={h} className="text-obsidian-500 hover:text-amber-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-obsidian-400 uppercase tracking-widest mb-4">Space Types</h4>
            <ul className="space-y-2.5 text-sm">
              {['Shared Desks', 'Private Cabins', 'Meeting Rooms', 'Event Spaces'].map((t) => (
                <li key={t}><Link to="/spaces" className="text-obsidian-500 hover:text-amber-400 transition-colors">{t}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-obsidian-400 uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-obsidian-500"><Mail className="w-4 h-4 text-amber-600" /> hello@cowork.com</li>
              <li className="flex items-center gap-2 text-obsidian-500"><MapPin className="w-4 h-4 text-amber-600" /> Bangalore, India</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-obsidian-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-obsidian-600">© {new Date().getFullYear()} CoWork Platform. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-obsidian-600">
            <a href="#" className="hover:text-obsidian-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-obsidian-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
