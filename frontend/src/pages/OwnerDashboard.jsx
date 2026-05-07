import React, { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, Trash2, CheckCircle, XCircle, Calendar, TrendingUp, DollarSign, Upload, X } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending:'badge-pending', approved:'badge-approved', rejected:'badge-rejected', cancelled:'badge-cancelled', completed:'badge-completed' };

// ── Image Uploader inside modal ────────────────────────────────────────────────
function ImageUploader({ images, setImages }) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const { data } = await api.post('/upload/space-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImages((prev) => [...prev, ...data.images.map((img) => ({ url: img.url, caption: '' }))]);
      toast.success(`${data.images.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-20 h-16 rounded-lg overflow-hidden border border-obsidian-700 group">
            <img src={img.url} className="w-full h-full object-cover" alt="" />
            <button onClick={() => setImages((p) => p.filter((_, i) => i !== idx))}
              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-xs hidden group-hover:flex items-center justify-center">
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        <label className={`w-20 h-16 rounded-lg border-2 border-dashed border-obsidian-700 hover:border-amber-600/50 flex flex-col items-center justify-center cursor-pointer transition-colors text-obsidian-600 hover:text-amber-400 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-4 h-4 mb-1" />
          <span className="text-xs">{uploading ? '…' : 'Add'}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </label>
      </div>
      <p className="text-xs text-obsidian-600">Max 5 images · JPEG/PNG/WebP · 5MB each</p>
    </div>
  );
}

// ── Space Modal ────────────────────────────────────────────────────────────────
function SpaceModal({ space, amenitiesList, onClose, onSave }) {
  const isEdit = !!space?._id;
  const [form, setForm] = useState(space || {
    name:'', description:'', type:'shared_desk',
    location:{ address:'', city:'', state:'', pincode:'' },
    areaSize:{ value:'' }, seatingCapacity:'',
    pricing:{ hourly:'', daily:'', monthly:'' },
    amenities:[], images:[],
    availability:{ isAvailable:true, openTime:'08:00', closeTime:'22:00' },
  });
  const [saving, setSaving] = useState(false);

  const upd = (path, val) => {
    const keys = path.split('.');
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = val;
      return next;
    });
  };
  const toggleAmenity = (id) => setForm((f) => ({
    ...f, amenities: f.amenities.includes(id) ? f.amenities.filter((a) => a !== id) : [...f.amenities, id]
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = isEdit
        ? await api.put(`/spaces/${space._id}`, form)
        : await api.post('/spaces', form);
      onSave(data.data, isEdit ? 'edit' : 'add');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-950/90 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] w-full max-w-2xl animate-fade-in">
        <div className="p-6 border-b border-obsidian-800 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">{isEdit ? 'Edit Space' : 'Add New Space'}</h2>
          <button onClick={onClose} className="text-obsidian-600 hover:text-white transition-colors p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Space Name</label>
              <input className="input" value={form.name} onChange={(e) => upd('name', e.target.value)} placeholder="e.g. The Innovation Hub" />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="input h-20 resize-none" value={form.description} onChange={(e) => upd('description', e.target.value)} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => upd('type', e.target.value)}>
                {['shared_desk','private_cabin','meeting_room','event_space','virtual_office'].map((t) => (
                  <option key={t} value={t} className="bg-obsidian-900">{t.replace(/_/g,' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Seating Capacity</label>
              <input className="input" type="number" value={form.seatingCapacity} onChange={(e) => upd('seatingCapacity', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Location</label>
            <div className="grid grid-cols-2 gap-3">
              <input className="input col-span-2" placeholder="Address" value={form.location.address} onChange={(e) => upd('location.address', e.target.value)} />
              <input className="input" placeholder="City" value={form.location.city} onChange={(e) => upd('location.city', e.target.value)} />
              <input className="input" placeholder="State" value={form.location.state} onChange={(e) => upd('location.state', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Pricing (₹)</label>
            <div className="grid grid-cols-3 gap-3">
              {['hourly','daily','monthly'].map((p) => (
                <div key={p}>
                  <label className="text-xs text-obsidian-600 capitalize block mb-1">{p}</label>
                  <input className="input" type="number" value={form.pricing[p]} onChange={(e) => upd(`pricing.${p}`, e.target.value)} placeholder="0" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Area (sq ft)</label>
            <input className="input" type="number" value={form.areaSize.value} onChange={(e) => upd('areaSize.value', e.target.value)} />
          </div>

          <div>
            <label className="label mb-2">Space Images</label>
            <ImageUploader images={form.images || []} setImages={(imgs) => upd('images', typeof imgs === 'function' ? imgs(form.images) : imgs)} />
          </div>

          <div>
            <label className="label mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((a) => (
                <button key={a._id} type="button" onClick={() => toggleAmenity(a._id)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    form.amenities.includes(a._id)
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-obsidian-800 text-obsidian-400 border-obsidian-700 hover:border-amber-600/40 hover:text-amber-400'
                  }`}>{a.icon} {a.name}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="label mb-0">Available for Booking</label>
            <button type="button" onClick={() => upd('availability.isAvailable', !form.availability.isAvailable)}
              className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${form.availability.isAvailable ? 'bg-amber-600' : 'bg-obsidian-700'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.availability.isAvailable ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-obsidian-800 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary shadow-glow-sm">
            {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Space')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Owner Dashboard ────────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const { user } = useAuth();
  const [spaces, setSpaces]             = useState([]);
  const [bookings, setBookings]         = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState(null);
  const [activeTab, setActiveTab]       = useState('bookings');

  useEffect(() => {
    Promise.all([api.get('/spaces/owner/my-spaces'), api.get('/bookings/owner'), api.get('/amenities')])
      .then(([s, b, a]) => { setSpaces(s.data.data); setBookings(b.data.data); setAmenitiesList(a.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    const note = status === 'rejected' ? window.prompt('Reason (optional):') : '';
    try {
      await api.put(`/bookings/${id}/status`, { status, statusNote: note || '' });
      setBookings((p) => p.map((b) => b._id === id ? { ...b, status } : b));
      toast.success(`Booking ${status}`);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this space?')) return;
    await api.delete(`/spaces/${id}`);
    setSpaces((p) => p.filter((s) => s._id !== id));
    toast.success('Space deleted');
  };

  const handleSave = (saved, type) => {
    if (type === 'add') setSpaces((p) => [saved, ...p]);
    else setSpaces((p) => p.map((s) => s._id === saved._id ? saved : s));
    toast.success(type === 'add' ? 'Space created!' : 'Space updated!');
  };

  const pending = bookings.filter((b) => b.status === 'pending');
  const revenue = bookings.filter((b) => ['approved','completed'].includes(b.status)).reduce((s, b) => s + (b.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Navbar />
      {modal !== null && <SpaceModal space={modal === 'add' ? null : modal} amenitiesList={amenitiesList} onClose={() => setModal(null)} onSave={handleSave} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="w-5 h-px bg-amber-600" /><span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Owner Portal</span></div>
            <h1 className="section-title">Owner Dashboard</h1>
            <p className="text-obsidian-500 mt-1">{user?.name} · {user?.company || 'Space Owner'}</p>
          </div>
          <button onClick={() => setModal('add')} className="btn-primary shadow-glow-sm">
            <Plus className="w-4 h-4" /> Add Space
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Building2, label: 'My Spaces',    value: spaces.length,  c: 'text-amber-400 bg-amber-600/10 border-amber-600/20' },
            { icon: Calendar,  label: 'Bookings',     value: bookings.length, c: 'text-purple-400 bg-purple-600/10 border-purple-600/20' },
            { icon: TrendingUp,label: 'Pending',      value: pending.length, c: 'text-orange-400 bg-orange-600/10 border-orange-600/20' },
            { icon: DollarSign,label: 'Est. Revenue', value: `₹${(revenue/1000).toFixed(0)}K`, c: 'text-jade-400 bg-jade-600/10 border-jade-600/20' },
          ].map(({ icon: Icon, label, value, c }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon border ${c}`}><Icon className="w-5 h-5" /></div>
              <div><p className="font-display text-2xl font-bold text-white">{value}</p><p className="text-xs text-obsidian-500 uppercase tracking-wider">{label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-obsidian-800">
          {[['bookings',`Requests${pending.length ? ` (${pending.length})`:''}`],['spaces','My Spaces']].map(([k,l]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab===k ? 'border-amber-600 text-amber-400' : 'border-transparent text-obsidian-500 hover:text-obsidian-200'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="card overflow-hidden">
            {bookings.length === 0 ? (
              <div className="p-16 text-center"><Calendar className="w-12 h-12 text-obsidian-800 mx-auto mb-3" /><p className="text-obsidian-500">No bookings yet.</p></div>
            ) : (
              <div className="divide-y divide-obsidian-800">
                {bookings.map((b) => (
                  <div key={b._id} className="p-5 hover:bg-obsidian-900/50 transition-colors">
                    <div className="flex flex-wrap gap-4 items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-white truncate">{b.space?.name}</p>
                          <span className={`badge ${STATUS_BADGE[b.status]} flex-shrink-0`}>{b.status}</span>
                        </div>
                        <p className="text-sm text-obsidian-500">
                          <span className="text-obsidian-300 font-medium">{b.user?.name}</span>
                          {b.user?.company && <span> · {b.user.company}</span>}
                          <span> · {b.numberOfPersons} persons</span>
                        </p>
                        <p className="text-xs text-obsidian-600 mt-0.5">
                          {format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d, yyyy')}
                          <span className="ml-2 text-amber-400 font-semibold">₹{b.totalAmount?.toLocaleString()}</span>
                        </p>
                        {b.specialRequests && <p className="text-xs text-obsidian-600 mt-1 italic">"{b.specialRequests}"</p>}
                      </div>
                      {b.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleStatus(b._id, 'approved')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-jade-600/20 hover:bg-jade-600/30 text-jade-400 rounded-xl text-xs font-semibold border border-jade-600/30 transition-all">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => handleStatus(b._id, 'rejected')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-xl text-xs font-semibold border border-red-800/30 transition-all">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Spaces */}
        {activeTab === 'spaces' && (
          spaces.length === 0 ? (
            <div className="card p-16 text-center">
              <Building2 className="w-12 h-12 text-obsidian-800 mx-auto mb-3" />
              <p className="text-obsidian-500 mb-5">No spaces listed yet.</p>
              <button onClick={() => setModal('add')} className="btn-primary"><Plus className="w-4 h-4" /> Add First Space</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {spaces.map((space) => (
                <div key={space._id} className="card overflow-hidden group">
                  <div className="h-40 bg-obsidian-800 relative overflow-hidden">
                    <img src={space.images?.[0]?.url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={space.name} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/60 to-transparent" />
                    <div className={`absolute top-3 right-3 badge ${space.availability?.isAvailable ? 'badge-approved' : 'badge-rejected'}`}>
                      {space.availability?.isAvailable ? '● Available' : '● Unavailable'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-white mb-0.5">{space.name}</h3>
                    <p className="text-xs text-obsidian-500 mb-3">{space.location?.city} · {space.seatingCapacity} seats</p>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold">₹{space.pricing?.daily?.toLocaleString()}<span className="text-obsidian-600 font-normal text-xs">/day</span></span>
                      <div className="flex gap-1">
                        <button onClick={() => setModal(space)} className="p-2 hover:bg-amber-600/10 text-amber-600 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(space._id)} className="p-2 hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
