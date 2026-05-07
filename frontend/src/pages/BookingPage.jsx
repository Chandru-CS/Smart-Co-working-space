import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [space, setSpace]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    bookingType: 'daily', startDate: '', endDate: '',
    startTime: '09:00', endTime: '18:00', numberOfPersons: 1, specialRequests: '',
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get(`/spaces/${spaceId}`)
      .then(({ data }) => setSpace(data.data))
      .catch(() => { toast.error('Space not found'); navigate('/spaces'); })
      .finally(() => setLoading(false));
  }, [spaceId]);

  // Live price calc
  useEffect(() => {
    if (!space || !form.startDate || !form.endDate) return;
    const s = new Date(form.startDate), e = new Date(form.endDate);
    if (e <= s) return;
    const ms = e - s;
    const hrs  = ms / 3600000;
    const days = Math.ceil(ms / 86400000);
    const mos  = Math.ceil(days / 30);
    let t = 0;
    if (form.bookingType === 'hourly')  t = (space.pricing?.hourly  || 0) * hrs;
    if (form.bookingType === 'daily')   t = (space.pricing?.daily   || 0) * days;
    if (form.bookingType === 'monthly') t = (space.pricing?.monthly || 0) * mos;
    setTotal(Math.round(t));
  }, [form, space]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) return toast.error('Select dates');
    if (new Date(form.endDate) <= new Date(form.startDate)) return toast.error('End must be after start');
    setSubmitting(true);
    try {
      await api.post('/bookings', { spaceId, ...form });
      toast.success('Booking request sent! Check your email for confirmation.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-obsidian-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-28 space-y-5 animate-pulse">
        <div className="h-10 w-1/2 rounded-xl skeleton" />
        <div className="h-64 rounded-2xl skeleton" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Link to={`/spaces/${spaceId}`} className="inline-flex items-center gap-1.5 text-sm text-obsidian-500 hover:text-amber-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to space
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-px bg-amber-600" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Reservation</span>
          </div>
          <h1 className="section-title">Book Your Space</h1>
        </div>

        {/* Space mini-card */}
        {space && (
          <div className="card p-4 mb-6 flex gap-4 items-center">
            <img src={space.images?.[0]?.url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200'}
              className="w-20 h-16 rounded-xl object-cover flex-shrink-0 border border-obsidian-700"
              alt={space.name}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200'; }} />
            <div>
              <h3 className="font-display font-semibold text-white">{space.name}</h3>
              <p className="text-sm text-obsidian-500">{space.location?.city}</p>
              <p className="text-sm text-amber-400 font-medium mt-0.5">
                ₹{space.pricing?.daily?.toLocaleString()}/day · {space.seatingCapacity} seats max
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Booking type */}
          <div className="card p-5">
            <label className="label mb-3">Booking Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'hourly',  label: 'Hourly',  price: space?.pricing?.hourly,  unit: '/hr' },
                { value: 'daily',   label: 'Daily',   price: space?.pricing?.daily,   unit: '/day' },
                { value: 'monthly', label: 'Monthly', price: space?.pricing?.monthly, unit: '/mo' },
              ].filter((t) => t.price).map((t) => (
                <button key={t.value} type="button" onClick={() => set('bookingType', t.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    form.bookingType === t.value
                      ? 'border-amber-600 bg-amber-600/10'
                      : 'border-obsidian-700 bg-obsidian-800/60 hover:border-obsidian-600'
                  }`}>
                  <div className="text-xs font-semibold text-obsidian-400 uppercase tracking-wider mb-1">{t.label}</div>
                  <div className="font-bold text-white text-lg">₹{t.price.toLocaleString()}</div>
                  <div className="text-xs text-obsidian-500">{t.unit}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="card p-5">
            <label className="label mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-600" /> Dates</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date</label>
                <input type="date" className="input" min={today} value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)} required />
              </div>
              <div>
                <label className="label">End Date</label>
                <input type="date" className="input" min={form.startDate || today} value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)} required />
              </div>
            </div>
            {form.bookingType === 'hourly' && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="label">Start Time</label>
                  <input type="time" className="input" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
                </div>
                <div>
                  <label className="label">End Time</label>
                  <input type="time" className="input" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Persons + requests */}
          <div className="card p-5 space-y-4">
            <div>
              <label className="label flex items-center gap-2"><Users className="w-4 h-4 text-amber-600" /> Number of Persons</label>
              <input type="number" className="input" min={1} max={space?.seatingCapacity}
                value={form.numberOfPersons} onChange={(e) => set('numberOfPersons', e.target.value)} required />
              <p className="text-xs text-obsidian-600 mt-1">Max: {space?.seatingCapacity} persons</p>
            </div>
            <div>
              <label className="label">Special Requests <span className="normal-case font-normal text-obsidian-600">(optional)</span></label>
              <textarea className="input resize-none h-24" placeholder="Any special requirements or questions…"
                value={form.specialRequests} onChange={(e) => set('specialRequests', e.target.value)} />
            </div>
          </div>

          {/* Price estimate */}
          {total > 0 && (
            <div className="card p-5 border-amber-600/30 bg-amber-600/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-obsidian-400 font-medium">Estimated Total</span>
                <span className="font-display text-3xl font-bold text-amber-400">₹{total.toLocaleString()}</span>
              </div>
              <p className="text-xs text-obsidian-600">Final amount confirmed by owner. No payment now.</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link to={`/spaces/${spaceId}`} className="btn-ghost flex-1 justify-center py-3.5">Cancel</Link>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center py-3.5 text-base shadow-glow-amber">
              {submitting ? 'Sending…' : <><CheckCircle className="w-5 h-5" /> Send Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
