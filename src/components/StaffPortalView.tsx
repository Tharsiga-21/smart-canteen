import React, { useState } from 'react';
import { MenuItem, OrderRecord } from '../types';
import { Plus, Trash2, ArrowRight, Check, Clock, AlertCircle } from 'lucide-react';

interface StaffPortalViewProps {
  menu: MenuItem[];
  orders: OrderRecord[];
  onAddMenuItem: (name: string, price: number, category: 'Meal' | 'Snack' | 'Beverage') => { success: boolean; error?: string };
  onDeleteMenuItem: (id: number) => { success: boolean; error?: string };
  onUpdateOrderStatus: (orderNumber: number, status: 'Preparing' | 'Ready') => { success: boolean; error?: string };
}

export const StaffPortalView: React.FC<StaffPortalViewProps> = ({
  menu,
  orders,
  onAddMenuItem,
  onDeleteMenuItem,
  onUpdateOrderStatus
}) => {
  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [category, setCategory] = useState<'Meal' | 'Snack' | 'Beverage'>('Meal');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      setFeedback({ type: 'error', message: 'Price must be a valid positive number.' });
      return;
    }

    const result = onAddMenuItem(name, price, category);
    if (result.success) {
      setFeedback({ type: 'success', message: `Added "${name}" to ${category}s.` });
      setName('');
      setPriceStr('');
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to add item.' });
    }
  };

  const handleDelete = (id: number, itemName: string) => {
    if (window.confirm(`Remove "${itemName}" from canteen menu?`)) {
      const res = onDeleteMenuItem(id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Removed "${itemName}" from catalog.` });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to remove item.' });
      }
    }
  };

  // Sort newest orders first
  const sortedOrders = [...orders].sort((a, b) => b.orderNumber - a.orderNumber);

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Menu Management */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Menu Management</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-5">
            Add items to the catalog or delete discontinued options.
          </p>

          {/* Add Item Form */}
          <form onSubmit={handleAddSubmit} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-6 space-y-3">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Add New Food Item
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Veg Fried Rice, Masala Dosa, Cold Coffee"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={priceStr}
                  onChange={e => setPriceStr(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as 'Meal' | 'Snack' | 'Beverage')}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Meal">Meal</option>
                  <option value="Snack">Snack</option>
                  <option value="Beverage">Beverage</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to Canteen Menu
            </button>
          </form>

          {/* Current Catalog Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Active Catalog ({menu.length})
              </span>
            </div>

            {menu.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500">
                Menu is empty. Add your first item using the form above.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2 px-3 font-semibold">ID</th>
                      <th className="py-2 px-3 font-semibold">Name</th>
                      <th className="py-2 px-3 font-semibold">Category</th>
                      <th className="py-2 px-3 font-semibold text-right">Price</th>
                      <th className="py-2 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {menu.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-slate-500">#{item.id}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{item.category}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.name)}
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Live Orders Queue */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Live Orders Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Process tickets through lifecycle: Placed → Preparing → Ready.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              {orders.length} total
            </span>
          </div>

          {/* Requirement: "If none, show 'No orders yet.'" */}
          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-800">No orders yet.</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Incoming student orders will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[620px] overflow-y-auto pr-1">
              {sortedOrders.map(ord => (
                <div
                  key={ord.orderNumber}
                  className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-base font-bold text-slate-900">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {ord.studentName}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-md uppercase tracking-wider ${
                        ord.status === 'Placed'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.status === 'Preparing'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mb-3 bg-slate-50 rounded-lg p-2.5">
                    <span className="font-medium text-slate-700">Items: </span>
                    {ord.items.map(it => `${it.name} × ${it.quantity}`).join(', ')}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-xs">
                      <span className="text-slate-500">Total: </span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{ord.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex items-center gap-2">
                      {ord.status === 'Placed' && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(ord.orderNumber, 'Preparing')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          Mark Preparing
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {ord.status === 'Preparing' && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(ord.orderNumber, 'Ready')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          Mark Ready
                          <Check className="w-3 h-3" />
                        </button>
                      )}

                      {ord.status === 'Ready' && (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Ready for Counter Pickup
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
