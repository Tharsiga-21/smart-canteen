import React, { useState, useEffect } from 'react';
import { MenuItem, OrderRecord } from '../types';
import { ShoppingBag, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

interface StudentPortalViewProps {
  menu: MenuItem[];
  orders: OrderRecord[];
  onPlaceOrder: (studentName: string, itemsSpec: string) => { success: boolean; order?: OrderRecord; error?: string };
  onRefreshMenu: () => void;
  activeOrderNumber: number | null;
  setActiveOrderNumber: (num: number | null) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  menu,
  orders,
  onPlaceOrder,
  onRefreshMenu,
  activeOrderNumber,
  setActiveOrderNumber
}) => {
  const [studentName, setStudentName] = useState('');
  const [cart, setCart] = useState<{ [id: number]: number }>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [placedOrder, setPlacedOrder] = useState<OrderRecord | null>(null);
  
  // Tracking section state
  const [trackInput, setTrackInput] = useState<string>('');
  const [trackResult, setTrackResult] = useState<OrderRecord | null>(null);
  const [trackError, setTrackError] = useState('');

  // Sync tracked order when orders change or when activeOrderNumber changes
  useEffect(() => {
    if (activeOrderNumber !== null) {
      const found = orders.find(o => o.orderNumber === activeOrderNumber);
      if (found) {
        setTrackResult(found);
        setTrackInput(activeOrderNumber.toString());
        setTrackError('');
      }
    }
  }, [orders, activeOrderNumber]);

  // Adjust item quantity
  const handleQtyChange = (itemId: number, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      const updated = { ...prev };
      if (next <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = next;
      }
      return updated;
    });
  };

  // Calculate live total
  const calculateTotal = (): number => {
    return Object.entries(cart).reduce((sum, [idStr, qty]) => {
      const item = menu.find(m => m.id === Number(idStr));
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  // Handle placing an order
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName.trim()) {
      setErrorMsg('Please enter your student name.');
      return;
    }

    const itemEntries = Object.entries(cart);
    if (itemEntries.length === 0) {
      setErrorMsg('Your cart is empty. Please select at least one item from the menu.');
      return;
    }

    const itemsSpec = itemEntries.map(([id, qty]) => `${id}:${qty}`).join(',');
    const result = onPlaceOrder(studentName, itemsSpec);

    if (result.success && result.order) {
      setPlacedOrder(result.order);
      setActiveOrderNumber(result.order.orderNumber);
      setCart({});
      setStudentName('');
    } else {
      setErrorMsg(result.error || 'Failed to place order.');
    }
  };

  // Handle tracking an order
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    const num = parseInt(trackInput.trim(), 10);
    if (isNaN(num) || num < 1) {
      setTrackError('Please enter a valid order number.');
      setTrackResult(null);
      return;
    }

    const found = orders.find(o => o.orderNumber === num);
    if (!found) {
      setTrackError(`Order #${num} not found. Please check your order number.`);
      setTrackResult(null);
    } else {
      setTrackResult(found);
      setActiveOrderNumber(found.orderNumber);
      setTrackError('');
    }
  };

  const categories: Array<'Meal' | 'Snack' | 'Beverage'> = ['Meal', 'Snack', 'Beverage'];
  const totalPayable = calculateTotal();
  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Prominent Success Callout if an order was placed */}
      {placedOrder && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-6 text-center shadow-xs">
          <p className="text-emerald-800 font-semibold text-sm">Order Placed Successfully!</p>
          <div className="font-mono text-5xl font-extrabold text-emerald-700 my-2 tracking-tight">
            #{placedOrder.orderNumber}
          </div>
          <p className="text-emerald-900 font-medium text-base">
            Show this number when collecting your food at the canteen counter.
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Student: {placedOrder.studentName} · Total: ₹{placedOrder.total.toFixed(2)} · Current Status:{' '}
            <span className="font-semibold">{placedOrder.status}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Menu Display */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Canteen Menu</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select quantities from the fresh items below.</p>
            </div>
            <button
              onClick={onRefreshMenu}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Empty state requirement: "If empty, show 'Menu not available yet. Please check back later.'" */}
          {menu.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-800">
                Menu not available yet. Please check back later.
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Canteen staff has not added items to the menu yet. Switch to the Staff Portal to add meals, snacks, and beverages.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map(cat => {
                const catItems = menu.filter(item => item.category.toLowerCase() === cat.toLowerCase());
                if (catItems.length === 0) return null;

                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 mb-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {cat}s
                      </span>
                      <span className="text-xs text-slate-400">· {catItems.length} items</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {catItems.map(item => {
                        const qty = cart[item.id] || 0;
                        return (
                          <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5 font-mono">
                                ₹{item.price.toFixed(2)}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(item.id, -1)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-sm transition-colors"
                                disabled={qty === 0}
                              >
                                -
                              </button>
                              <span className="w-7 text-center font-mono text-sm font-semibold text-slate-900">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(item.id, 1)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-sm transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Checkout & Tracking */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Order Placement Box */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Place Pre-Order</h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">Enter student details and verify order summary.</p>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Live Cart Items */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Selected Items ({cartItemCount})
                </div>

                {cartItemCount === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
                    No items selected. Tap (+) on any menu item.
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(cart).map(([idStr, qty]) => {
                      const item = menu.find(m => m.id === Number(idStr));
                      if (!item) return null;
                      return (
                        <div key={idStr} className="flex items-center justify-between text-xs">
                          <span className="text-slate-800 font-medium">
                            {item.name} × {qty}
                          </span>
                          <span className="font-mono text-slate-600">
                            ₹{(item.price * qty).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Total Payable */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Total Payable</span>
                <span className="font-mono text-lg font-bold text-slate-900">
                  ₹{totalPayable.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={cartItemCount === 0 || !studentName.trim()}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                Place Order
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </section>

          {/* Track Order Section */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Track Order Status</h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Enter order number to check real-time canteen status (Auto-refreshes every 5s).
            </p>

            {trackError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 mb-4">
                {trackError}
              </div>
            )}

            <form onSubmit={handleTrackSubmit} className="flex gap-2 mb-4">
              <input
                type="number"
                min="1"
                value={trackInput}
                onChange={e => setTrackInput(e.target.value)}
                placeholder="e.g. 1"
                className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Track
              </button>
            </form>

            {trackResult && (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500">Order</span>{' '}
                    <span className="font-mono text-sm font-bold text-slate-900">
                      #{trackResult.orderNumber}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${
                      trackResult.status === 'Placed'
                        ? 'bg-amber-100 text-amber-800'
                        : trackResult.status === 'Preparing'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500'
                    }`}
                  >
                    {trackResult.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{trackResult.studentName}</span> · Total:{' '}
                  <span className="font-mono font-semibold">₹{trackResult.total.toFixed(2)}</span>
                </div>

                <div className="text-xs text-slate-500">
                  Items: {trackResult.items.map(it => `${it.name} × ${it.quantity}`).join(', ')}
                </div>

                {/* Highlighted message when order is Ready */}
                {trackResult.status === 'Ready' && (
                  <div className="bg-emerald-600 text-white p-3 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2 animate-pulse">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Your order is READY! Please proceed to the canteen counter.</span>
                  </div>
                )}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};
