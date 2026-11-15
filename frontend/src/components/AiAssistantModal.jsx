import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Utensils,
  Check,
  Star,
  Plus,
  ShoppingBag,
  Loader2,
  Bot
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const AiAssistantModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hi! I'm your Prime Platter Culinary Concierge. Tell me what you're craving, dietary preferences, or your budget!",
      recommendations: [],
    },
  ]);

  const { addToCart } = useCart();
  const { success } = useToast();

  if (!isOpen) return null;

  const quickPrompts = [
    '🌱 Suggest healthy vegetarian food',
    '💰 Recommend something delicious under ₹300',
    '🍕 Find popular pizza options',
    '👥 Feast for two people',
    '⭐ Top-rated North Indian curries',
  ];

  const handleSend = async (userText) => {
    const promptText = userText || query;
    if (!promptText.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: promptText }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    try {
      // Call backend AI recommendations endpoint
      const { data } = await api.post('/ai/recommend', { query: promptText });

      if (data.success) {
        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: data.reply || 'Here are some curated dishes matching your taste:',
            recommendations: data.items || [],
          },
        ]);
      } else {
        throw new Error(data.message || 'Could not fetch recommendations');
      }
    } catch (err) {
      // Fallback: search live menu using keywords directly
      try {
        const { data: menuData } = await api.get('/menu', {
          params: { search: promptText.split(' ')[0] },
        });
        const items = (menuData.data || []).slice(0, 3);
        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: `I discovered ${items.length} delicious option(s) from our live kitchen menus:`,
            recommendations: items,
          },
        ]);
      } catch (innerErr) {
        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: "I'm having trouble retrieving dishes right now. Please explore our homepage categories!",
            recommendations: [],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFromAi = (item) => {
    addToCart(item._id, 1);
    success(`${item.name} added to cart!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[650px] max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                Prime AI Food Assistant
                <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full uppercase">
                  Live
                </span>
              </h3>
              <p className="text-xs text-orange-100">Personalized dining recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat / Recommendation Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/70">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-orange-600 text-white font-medium rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                {m.sender === 'bot' && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 mb-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Prime Platter AI</span>
                  </div>
                )}
                <p className="leading-relaxed">{m.text}</p>
              </div>

              {/* Render verified recommended food cards */}
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="w-full mt-3 space-y-2.5">
                  {m.recommendations.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-orange-200/80 shadow-xs hover:border-orange-400 transition"
                    >
                      <img
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              item.type === 'Veg' ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                          <h5 className="font-bold text-sm text-slate-900 truncate">
                            {item.name}
                          </h5>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-bold text-slate-800">₹{item.price}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-emerald-700 font-bold">
                            <Star className="w-3 h-3 fill-emerald-600" />
                            {item.rating || 4.5}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddFromAi(item)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition transform active:scale-95 flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-2 rounded-xl w-max animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing fresh culinary options...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p.replace(/^[^\s]+\s/, ''))}
              className="px-3 py-1 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 text-xs font-semibold rounded-full border border-slate-200 transition whitespace-nowrap cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(query);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Vegetarian dinner for 2 under ₹500..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl transition shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
