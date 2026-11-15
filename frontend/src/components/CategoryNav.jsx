import React from 'react';

export const CategoryNav = ({ selectedCuisine, onSelectCuisine }) => {
  const categories = [
    {
      id: 'Biryani',
      name: 'Biryani',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'Indian',
      name: 'North Indian',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'Pizza',
      name: 'Pizzas',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'Chinese',
      name: 'Chinese',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'Burgers',
      name: 'Burgers',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'Italian',
      name: 'Italian & Pasta',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'Dessert',
      name: 'Desserts',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'South Indian',
      name: 'South Indian',
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            What's on your mind?
          </h2>
          <p className="text-xs text-slate-500 font-medium">Explore handpicked culinary favorites</p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCuisine === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCuisine(isSelected ? '' : cat.id)}
              className="flex flex-col items-center group flex-shrink-0 cursor-pointer focus:outline-hidden"
            >
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-1 transition-all duration-300 transform group-hover:scale-105 shadow-md ${
                  isSelected
                    ? 'ring-4 ring-orange-500 ring-offset-2 scale-105 bg-orange-100'
                    : 'bg-white hover:ring-2 hover:ring-orange-300'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                />
              </div>
              <span
                className={`mt-2 text-xs font-bold transition-colors text-center ${
                  isSelected ? 'text-orange-600' : 'text-slate-700 group-hover:text-orange-600'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
