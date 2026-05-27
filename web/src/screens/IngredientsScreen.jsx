import React, { useState, useEffect } from 'react';
import { Refrigerator, Plus, Search, Calendar, Trash2, Clock, X, AlertTriangle } from 'lucide-react';
import { IngredientService } from '../services/ingredientService';
import { showAlert } from '../utils/alert';

export default function IngredientsScreen() {
  const [ingredients, setIngredients] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Creation State
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'vegetable',
    quantity: '1',
    unit: 'pcs',
    shelfLifeDays: '7'
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [ingredients, search, categoryFilter]);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const result = await IngredientService.getAllIngredients();
      if (result.success && result.data) {
        setIngredients(IngredientService.transformArrayToFrontend(result.data));
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to load stock.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const list = IngredientService.filterIngredients(ingredients, {
      category: categoryFilter,
      search: search
    });
    // Sort by expiration by default
    const sorted = IngredientService.sortIngredients(list, 'expiration');
    setFilteredList(sorted);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showAlert('Notice', 'Please fill in the ingredient name.');
      return;
    }

    try {
      const result = await IngredientService.createIngredient({
        ...form,
        source: 'my_ingredients'
      });
      if (result.success) {
        showAlert('Added', `Successfully added ${form.name} to stock!`);
        setModalVisible(false);
        setForm({
          name: '',
          category: 'vegetable',
          quantity: '1',
          unit: 'pcs',
          shelfLifeDays: '7'
        });
        loadIngredients();
      } else {
        showAlert('Error', result.error || 'Failed to add ingredient.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'An error occurred.');
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Remove "${name}" from stock?`)) {
      try {
        const result = await IngredientService.deleteIngredient(id);
        if (result.success) {
          showAlert('Removed', `Removed "${name}" from kitchen.`);
          loadIngredients();
        } else {
          showAlert('Error', 'Failed to remove item.');
        }
      } catch (err) {
        console.error(err);
        showAlert('Error', 'An error occurred.');
      }
    }
  };

  // Expiration Styling Utilities
  const getExpirationStatus = (expDateStr) => {
    if (!expDateStr) return { color: 'text-gray-500 bg-gray-50', text: 'Fresh', alert: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expDateStr + 'T00:00:00');
    
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { color: 'text-red-500 bg-red-50 border-red-200/60 shadow-red-100/10', text: 'Expired', alert: true };
    } else if (diffDays === 0) {
      return { color: 'text-orange-500 bg-orange-50 border-orange-200/60', text: 'Expires Today', alert: true };
    } else if (diffDays <= 3) {
      return { color: 'text-amber-600 bg-amber-50 border-amber-200/60', text: `Expires in ${diffDays} days`, alert: true };
    } else {
      return { color: 'text-[#38B000] bg-green-50/50 border-green-200/30', text: `Fresh (${diffDays}d)`, alert: false };
    }
  };

  const getCategoryEmoji = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'meat': return '🥩';
      case 'vegetable': return '🥦';
      case 'dairy': return '🧀';
      case 'grain': return '🌾';
      case 'seasoning': return '🧂';
      case 'protein': return '🍳';
      case 'fruit': return '🍎';
      default: return '🛒';
    }
  };

  return (
    <div className="space-y-8 select-none py-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline font-extrabold text-3xl tracking-tight text-brand-charcoal flex items-center gap-2">
            <Refrigerator className="text-brand-primary shrink-0" />
            <span>Kitchen Stock Inventory</span>
          </h2>
          <p className="font-body text-sm font-semibold text-[#A2A292] mt-1">
            Track fresh ingredients and expiration deadlines.
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={() => setModalVisible(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-brand font-body font-bold text-sm transition-all active:scale-95 shadow-md shadow-brand-primary/10"
          >
            <Plus size={16} />
            <span>Log Ingredient</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative bg-white border border-[#EBEBE2] rounded-brand shadow-premium flex items-center px-4">
          <Search size={18} className="text-[#A2A292] shrink-0" />
          <input
            type="text"
            placeholder="Search ingredients in stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 py-3.5 bg-transparent border-none text-sm font-body focus:ring-0 text-brand-charcoal placeholder:text-[#A2A292]"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3.5 bg-white border border-[#EBEBE2] rounded-brand font-body text-sm font-bold text-[#5E5E54] focus:ring-0 shadow-premium outline-none"
        >
          <option value="all">All Categories</option>
          <option value="meat">Meat 🥩</option>
          <option value="vegetable">Vegetables 🥦</option>
          <option value="dairy">Dairy 🧀</option>
          <option value="grain">Grains 🌾</option>
          <option value="seasoning">Seasoning 🧂</option>
          <option value="protein">Protein 🍳</option>
          <option value="fruit">Fruit 🍎</option>
          <option value="other">Other 🛒</option>
        </select>
      </div>

      {/* Ingredient Stock list */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Refrigerator size={32} className="animate-pulse text-brand-primary" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-[#EBEBE2] rounded-brand p-12 text-center shadow-premium">
          <Refrigerator size={40} className="text-[#A2A292] mb-3" />
          <h3 className="font-headline font-bold text-lg text-brand-charcoal">Your Fridge is Empty</h3>
          <p className="font-body text-sm text-[#A2A292] mt-2 max-w-xs mx-auto">
            Add fresh items you purchased to keep track of their freshness limits!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const status = getExpirationStatus(item.expirationDate);
            return (
              <div
                key={item.id}
                className={`group bg-white border rounded-brand p-5 flex flex-col justify-between transition-all duration-300 shadow-premium hover:shadow-premium-hover ${
                  status.alert ? 'border-amber-200 shadow-amber-50/10' : 'border-[#EBEBE2]'
                } paper-texture`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl shrink-0">{getCategoryEmoji(item.category)}</span>
                    <div className="min-w-0">
                      <h4 className="font-headline font-extrabold text-base text-brand-charcoal truncate">
                        {item.name}
                      </h4>
                      <p className="font-label text-[10px] uppercase font-bold tracking-wider text-[#A2A292] mt-0.5">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-[#A2A292] hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-[#EBEBE2]/40 pt-4 mt-6">
                  {/* Quantity */}
                  <div className="font-body font-bold text-sm text-brand-charcoal">
                    {item.quantity} <span className="text-xs text-[#9E9E8E] font-medium">{item.unit}</span>
                  </div>

                  {/* Expiration Stamp */}
                  <div className={`px-2.5 py-1 rounded-xl text-[10px] font-body font-bold border flex items-center gap-1 ${status.color}`}>
                    {status.alert && <AlertTriangle size={11} className="stroke-[3]" />}
                    <span>{status.text}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Ingredient Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#FAF9F5] border border-[#EBEBE2] rounded-brand shadow-2xl overflow-hidden paper-texture">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBE2]">
              <h3 className="font-headline font-bold text-lg text-brand-charcoal">
                Log Kitchen Ingredient
              </h3>
              <button
                onClick={() => setModalVisible(false)}
                className="text-[#A2A292] hover:text-brand-charcoal p-1 hover:bg-[#F2EFE6] rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="font-body text-[10px] font-bold text-brand-charcoal uppercase tracking-wider">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Eggs"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-[#EBEBE2] rounded-brand text-xs font-body focus:ring-0 text-brand-charcoal"
                />
              </div>

              {/* Grid 2 specs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-body text-[10px] font-bold text-brand-charcoal uppercase tracking-wider">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-[#EBEBE2] rounded-brand text-xs font-body focus:ring-0"
                  >
                    <option value="meat">Meat 🥩</option>
                    <option value="vegetable">Vegetable 🥦</option>
                    <option value="dairy">Dairy 🧀</option>
                    <option value="grain">Grain 🌾</option>
                    <option value="seasoning">Seasoning 🧂</option>
                    <option value="protein">Protein 🍳</option>
                    <option value="fruit">Fruit 🍎</option>
                    <option value="other">Other 🛒</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-body text-[10px] font-bold text-brand-charcoal uppercase tracking-wider">Fresh Days</label>
                  <input
                    type="number"
                    value={form.shelfLifeDays}
                    onChange={(e) => setForm(prev => ({ ...prev, shelfLifeDays: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-[#EBEBE2] rounded-brand text-xs font-body focus:ring-0"
                  />
                </div>
              </div>

              {/* Grid 2 qty/unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-body text-[10px] font-bold text-brand-charcoal uppercase tracking-wider">Quantity</label>
                  <input
                    type="number"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-[#EBEBE2] rounded-brand text-xs font-body focus:ring-0"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-body text-[10px] font-bold text-brand-charcoal uppercase tracking-wider">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="pcs/g/ml"
                    value={form.unit}
                    onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-[#EBEBE2] rounded-brand text-xs font-body focus:ring-0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#EBEBE2]">
                <button
                  type="button"
                  onClick={() => setModalVisible(false)}
                  className="flex-1 py-2.5 border border-[#EBEBE2] rounded-brand text-xs font-body font-bold text-[#5E5E54] hover:bg-[#F2EFE6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-primary text-white rounded-brand text-xs font-body font-extrabold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/90 transition-colors"
                >
                  Confirm Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
