import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Tag } from 'lucide-react';

export const RestaurantCard = ({ restaurant }) => {
  const {
    _id,
    name,
    image,
    cuisine,
    rating = 4.2,
    deliveryTime = '30 mins',
    minOrder = 150,
    location = 'Connaught Place',
    isOpen = true,
  } = restaurant;

  const fallbackImage =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';

  return (
    <Link
      to={`/restaurant/${_id}`}
      className={`group block bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 ${
        !isOpen ? 'opacity-75 grayscale-25' : ''
      }`}
    >
      {/* Restaurant Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={image || fallbackImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
          loading="lazy"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Offer Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
          <div className="flex items-center gap-1 bg-gradient-to-r from-orange-600 to-amber-600 px-2.5 py-1 rounded-lg shadow-md backdrop-blur-xs">
            <Tag className="w-3.5 h-3.5" />
            <span>₹50 OFF ABOVE ₹199</span>
          </div>

          <div className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>{deliveryTime}</span>
          </div>
        </div>

        {/* Closed Overlay Badge */}
        {!isOpen && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white font-extrabold text-xs uppercase px-3 py-1.5 rounded-full shadow-lg">
              Currently Closed
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-orange-600 transition-colors line-clamp-1">
            {name}
          </h3>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-white text-xs font-bold flex-shrink-0 shadow-xs ${
              rating >= 4.0 ? 'bg-emerald-600' : 'bg-amber-500'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-white" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Cuisine & Location */}
        <p className="text-xs font-medium text-slate-500 line-clamp-1 mb-2.5">{cuisine}</p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span className="flex items-center gap-1 truncate max-w-[150px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </span>
          <span className="font-semibold text-slate-700">Min: ₹{minOrder}</span>
        </div>
      </div>
    </Link>
  );
};
