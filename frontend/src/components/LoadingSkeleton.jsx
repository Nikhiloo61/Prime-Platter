import React from 'react';

export const RestaurantSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-xs animate-pulse">
    <div className="h-48 bg-slate-200" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="h-4 bg-slate-200 rounded w-10" />
      </div>
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="pt-2 border-t border-slate-100 flex justify-between">
        <div className="h-3 bg-slate-200 rounded w-24" />
        <div className="h-3 bg-slate-200 rounded w-16" />
      </div>
    </div>
  </div>
);

export const FoodSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 border border-slate-200/60 flex gap-4 animate-pulse">
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-200 rounded w-16" />
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-20" />
      <div className="h-3 bg-slate-200 rounded w-full" />
    </div>
    <div className="w-24 h-24 bg-slate-200 rounded-2xl flex-shrink-0" />
  </div>
);
