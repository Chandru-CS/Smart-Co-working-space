import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import SpaceCard from '../components/spaces/SpaceCard';
import SearchFilters from '../components/spaces/SearchFilters';
import api from '../utils/api';

const SORT_OPTIONS = [
  { value: '-createdAt',       label: 'Newest First' },
  { value: '-totalBookings',   label: 'Most Popular' },
  { value: '-rating.average',  label: 'Top Rated' },
  { value: 'pricing.daily',    label: 'Price: Low → High' },
  { value: '-pricing.daily',   label: 'Price: High → Low' },
];

export default function SpacesPage() {
  const [searchParams] = useSearchParams();
  const [spaces, setSpaces]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);
  const [pages, setPages]             = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort]               = useState('-createdAt');
  const [activeFilters, setActiveFilters] = useState({});

  const fetchSpaces = useCallback(async (filters = {}, page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/spaces', { params: { ...filters, page, limit: 12, sort } });
      setSpaces(data.data);
      setTotal(data.total);
      setPages(data.pages);
      setCurrentPage(data.currentPage);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [sort]);

  useEffect(() => {
    const urlFilters = {};
    const city   = searchParams.get('city');
    const search = searchParams.get('search');
    if (city)   urlFilters.city   = city;
    if (search) urlFilters.search = search;
    setActiveFilters(urlFilters);
    fetchSpaces(urlFilters);
  }, [sort]);

  const handleSearch = (filters) => {
    setActiveFilters(filters);
    fetchSpaces(filters, 1);
  };

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Navbar />

      {/* Page header */}
      <div className="pt-24 pb-8 bg-obsidian-900 border-b border-obsidian-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-px bg-amber-600" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Discover</span>
          </div>
          <h1 className="section-title">Find Your Space</h1>
          <p className="text-obsidian-500 mt-1 text-sm">
            {loading ? 'Searching…' : `${total} space${total !== 1 ? 's' : ''} available`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6">
          <SearchFilters onSearch={handleSearch} loading={loading} />
        </div>

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-sm text-obsidian-500">
            <span className="font-semibold text-obsidian-200">{spaces.length}</span> of{' '}
            <span className="font-semibold text-obsidian-200">{total}</span> spaces
          </p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-obsidian-600" />
            <select className="text-sm bg-transparent border-0 outline-none text-obsidian-400 hover:text-white transition-colors cursor-pointer"
              value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-obsidian-900">{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-72 rounded-2xl skeleton" />)}
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-28">
            <div className="w-16 h-16 rounded-2xl bg-obsidian-900 border border-obsidian-800 flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-8 h-8 text-obsidian-600" />
            </div>
            <h3 className="font-display text-xl font-semibold text-obsidian-300 mb-2">No spaces found</h3>
            <p className="text-obsidian-600 mb-6">Try adjusting your filters or searching a different city.</p>
            <button onClick={() => handleSearch({})} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {spaces.map((space, i) => <SpaceCard key={space._id} space={space} delay={i * 50} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => fetchSpaces(activeFilters, p)}
                    className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                      p === currentPage
                        ? 'bg-amber-600 text-white shadow-glow-sm'
                        : 'bg-obsidian-900 border border-obsidian-700 text-obsidian-400 hover:border-amber-600/40 hover:text-amber-400'
                    }`}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
