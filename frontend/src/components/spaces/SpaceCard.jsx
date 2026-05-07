import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Maximize, Star, Clock } from 'lucide-react';

const TYPE_LABELS = {
  private_cabin: 'Private Cabin', shared_desk: 'Shared Desk',
  meeting_room: 'Meeting Room', event_space: 'Event Space', virtual_office: 'Virtual Office',
};

const TYPE_COLORS = {
  private_cabin:  'bg-purple-900/40 text-purple-300 border-purple-800/40',
  shared_desk:    'bg-blue-900/40 text-blue-300 border-blue-800/40',
  meeting_room:   'bg-amber-900/40 text-amber-300 border-amber-800/40',
  event_space:    'bg-pink-900/40 text-pink-300 border-pink-800/40',
  virtual_office: 'bg-teal-900/40 text-teal-300 border-teal-800/40',
};

export default function SpaceCard({ space, delay = 0 }) {
  const image = space.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format';

  return (
    <Link
      to={`/spaces/${space._id}`}
      className="card-hover group block overflow-hidden animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-obsidian-800">
        <img
          src={image}
          alt={space.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600'; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge border text-xs ${TYPE_COLORS[space.type] || 'bg-obsidian-800 text-obsidian-300'}`}>
            {TYPE_LABELS[space.type] || space.type}
          </span>
        </div>

        {/* Featured */}
        {space.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-amber-600/90 text-white border-0 text-xs backdrop-blur-sm">✦ Featured</span>
          </div>
        )}

        {/* Availability dot */}
        <div className="absolute bottom-3 right-3">
          <span className={`badge text-xs backdrop-blur-sm border ${
            space.availability?.isAvailable
              ? 'bg-jade-600/20 text-jade-400 border-jade-600/30'
              : 'bg-red-900/40 text-red-400 border-red-800/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${
              space.availability?.isAvailable ? 'bg-jade-400 animate-pulse' : 'bg-red-400'
            }`} />
            {space.availability?.isAvailable ? 'Available' : 'Booked'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors line-clamp-1 text-base">
          {space.name}
        </h3>
        <div className="flex items-center gap-1 text-obsidian-400 text-xs mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="line-clamp-1">{space.location?.address}, {space.location?.city}</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-obsidian-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-obsidian-500 text-xs mb-0.5">
              <Users className="w-3 h-3" />
            </div>
            <p className="font-semibold text-obsidian-200 text-sm">{space.seatingCapacity}</p>
            <p className="text-obsidian-600 text-xs">seats</p>
          </div>
          <div className="text-center border-x border-obsidian-800">
            <div className="flex items-center justify-center gap-1 text-obsidian-500 text-xs mb-0.5">
              <Maximize className="w-3 h-3" />
            </div>
            <p className="font-semibold text-obsidian-200 text-sm">{space.areaSize?.value}</p>
            <p className="text-obsidian-600 text-xs">sq ft</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-obsidian-500 text-xs mb-0.5">
              <Star className="w-3 h-3" />
            </div>
            <p className="font-semibold text-obsidian-200 text-sm">
              {space.rating?.average > 0 ? space.rating.average : '—'}
            </p>
            <p className="text-obsidian-600 text-xs">rating</p>
          </div>
        </div>

        {/* Amenities */}
        {space.amenities?.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-4">
            {space.amenities.slice(0, 3).map((a) => (
              <span key={a._id} className="text-xs bg-obsidian-800 text-obsidian-400 px-2 py-0.5 rounded-full border border-obsidian-700">
                {a.icon} {a.name}
              </span>
            ))}
            {space.amenities.length > 3 && (
              <span className="text-xs bg-obsidian-800 text-obsidian-500 px-2 py-0.5 rounded-full border border-obsidian-700">
                +{space.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {space.pricing?.daily ? (
              <span className="text-amber-400 font-bold text-lg">
                ₹{space.pricing.daily.toLocaleString()}
                <span className="text-obsidian-500 font-normal text-xs">/day</span>
              </span>
            ) : (
              <span className="text-obsidian-500 text-sm">Price on request</span>
            )}
          </div>
          <span className="text-xs text-obsidian-600 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {space.totalBookings} bookings
          </span>
        </div>
      </div>
    </Link>
  );
}
