import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const SPACE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'shared_desk', label: 'Shared Desk' },
  { value: 'private_cabin', label: 'Private Cabin' },
  { value: 'meeting_room', label: 'Meeting Room' },
  { value: 'event_space', label: 'Event Space' },
  { value: 'virtual_office', label: 'Virtual Office' },
];

export default function SearchFilters({ onSearch, loading }) {
  const [filters, setFilters] = useState({ search: '', city: '', type: '', capacity: '', minPrice: '', maxPrice: '', area: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const hasActive = Object.values(filters).some(Boolean);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    onSearch(params);
  };

  const clear = () => {
    setFilters({ search: '', city: '', type: '', capacity: '', minPrice: '', maxPrice: '', area: '' });
    onSearch({});
  };

  return (
    <div className="card p-4">
      <form onSubmit={handleSubmit}>
        {/* Main row */}
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-500" />
            <input className="input pl-10" placeholder="Search by name or location…"
              value={filters.search} onChange={(e) => update('search', e.target.value)} />
          </div>
          <input className="input sm:w-40" placeholder="City" value={filters.city} onChange={(e) => update('city', e.target.value)} />
          <select className="input sm:w-40" value={filters.type} onChange={(e) => update('type', e.target.value)}>
            {SPACE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
            <Search className="w-4 h-4" /> {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center gap-4">
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-obsidian-400 hover:text-amber-400 transition-colors font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Advanced Filters
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
          {hasActive && (
            <button type="button" onClick={clear} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>

        {/* Advanced */}
        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-obsidian-800 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
            {[
              { key: 'capacity', label: 'Min Persons', placeholder: 'e.g. 5', type: 'number' },
              { key: 'area',     label: 'Min Area (sq ft)', placeholder: 'e.g. 500', type: 'number' },
              { key: 'minPrice', label: 'Min Price/Day (₹)', placeholder: 'e.g. 500', type: 'number' },
              { key: 'maxPrice', label: 'Max Price/Day (₹)', placeholder: 'e.g. 5000', type: 'number' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type={type} className="input text-sm py-2" placeholder={placeholder}
                  value={filters[key]} onChange={(e) => update(key, e.target.value)} />
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
