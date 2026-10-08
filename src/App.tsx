/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MenuItem, OrderRecord } from './types';
import { StudentPortalView } from './components/StudentPortalView';
import { StaffPortalView } from './components/StaffPortalView';
import { CodeExplorer } from './components/CodeExplorer';
import { SyllabusMapping } from './components/SyllabusMapping';
import { TestStepRunner } from './components/TestStepRunner';
import { Download, RotateCcw } from 'lucide-react';
import { PROJECT_FILES } from './javaCodeFiles';

export default function App() {
  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'code' | 'syllabus' | 'test'>('student');
  
  // Real storage state: Starts 100% EMPTY as demanded ("Menu starts EMPTY. Do NOT use any default, dummy, or pre-filled data")
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('smart_canteen_menu');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem('smart_canteen_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeOrderNumber, setActiveOrderNumber] = useState<number | null>(null);

  // Sync with localStorage (simulating FileStorage persistence)
  useEffect(() => {
    localStorage.setItem('smart_canteen_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('smart_canteen_orders', JSON.stringify(orders));
  }, [orders]);

  // 1. Add menu item (Staff)
  const handleAddMenuItem = (
    name: string,
    price: number,
    category: 'Meal' | 'Snack' | 'Beverage'
  ): { success: boolean; error?: string } => {
    if (!name.trim()) return { success: false, error: 'Item name cannot be empty.' };
    if (price <= 0) return { success: false, error: 'Price must be greater than zero.' };

    const newId = menu.length > 0 ? Math.max(...menu.map(m => m.id)) + 1 : 1;
    const newItem: MenuItem = {
      id: newId,
      name: name.trim(),
      price: price,
      category: category,
      description: `[${category.toUpperCase()}] ${name.trim()} - ₹${price.toFixed(2)}`
    };

    setMenu(prev => [...prev, newItem]);
    return { success: true };
  };

  // 2. Delete menu item (Staff)
  const handleDeleteMenuItem = (id: number): { success: boolean; error?: string } => {
    setMenu(prev => prev.filter(item => item.id !== id));
    return { success: true };
  };

  // 3. Place order (Student)
  const handlePlaceOrder = (
    studentName: string,
    itemsSpec: string
  ): { success: boolean; order?: OrderRecord; error?: string } => {
    if (!studentName.trim()) {
      return { success: false, error: 'Student name cannot be empty.' };
    }
    if (!itemsSpec.trim()) {
      return { success: false, error: 'Your cart is empty. Please select at least one item.' };
    }

    const nextOrderNum = orders.length > 0 ? Math.max(...orders.map(o => o.orderNumber)) + 1 : 1;
    const tokens = itemsSpec.split(',');
    const orderItems: Array<{ id: number; name: string; category: string; price: number; quantity: number }> = [];

    let total = 0.0;

    for (const token of tokens) {
      if (!token.trim()) continue;
      const [idStr, qtyStr] = token.split(':');
      const id = parseInt(idStr, 10);
      const qty = parseInt(qtyStr, 10);

      if (isNaN(id) || isNaN(qty) || qty < 1) {
        return { success: false, error: 'Invalid item quantity specified.' };
      }

      const menuItem = menu.find(m => m.id === id);
      if (!menuItem) {
        return { success: false, error: `Item with ID ${id} is not found in the canteen menu.` };
      }

      total += menuItem.price * qty;
      orderItems.push({
        id: menuItem.id,
        name: menuItem.name,
        category: menuItem.category,
        price: menuItem.price,
        quantity: qty
      });
    }

    if (orderItems.length === 0) {
      return { success: false, error: 'Your cart is empty. Please select at least one item.' };
    }

    const newOrder: OrderRecord = {
      orderNumber: nextOrderNum,
      studentName: studentName.trim(),
      status: 'Placed',
      timestamp: Date.now(),
      total: total,
      items: orderItems
    };

    setOrders(prev => [...prev, newOrder]);
    return { success: true, order: newOrder };
  };

  // 4. Update order status (Staff: Placed -> Preparing -> Ready)
  const handleUpdateOrderStatus = (
    orderNumber: number,
    newStatus: 'Preparing' | 'Ready'
  ): { success: boolean; error?: string } => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.orderNumber === orderNumber) {
          return { ...ord, status: newStatus };
        }
        return ord;
      })
    );
    return { success: true };
  };

  // 5. Reset all data (back to fresh empty state)
  const handleResetData = () => {
    setMenu([]);
    setOrders([]);
    setActiveOrderNumber(null);
    localStorage.removeItem('smart_canteen_menu');
    localStorage.removeItem('smart_canteen_orders');
  };

  // 6. Download All Java & Web Project Files
  const handleDownloadAllFiles = () => {
    PROJECT_FILES.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Universal Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (4-6 Nav links) - Zone 3 (Action) */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Smart Canteen
            </span>
          </div>

          {/* Zone 2: Clean navigation links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
            <button
              onClick={() => setActiveTab('student')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'student'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'staff'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Portal
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Java Source Code
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'syllabus'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OOP Syllabus Guide
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'test'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Test Steps
            </button>
          </nav>

          {/* Zone 3: Primary Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              title="Reset data to empty state"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadAllFiles}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Files</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'student' && (
          <StudentPortalView
            menu={menu}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            onRefreshMenu={() => {}}
            activeOrderNumber={activeOrderNumber}
            setActiveOrderNumber={setActiveOrderNumber}
          />
        )}

        {activeTab === 'staff' && (
          <StaffPortalView
            menu={menu}
            orders={orders}
            onAddMenuItem={handleAddMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'code' && <CodeExplorer />}

        {activeTab === 'syllabus' && <SyllabusMapping />}

        {activeTab === 'test' && (
          <TestStepRunner
            menu={menu}
            orders={orders}
            onAddMenuItem={handleAddMenuItem}
            onPlaceOrder={handlePlaceOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onResetData={handleResetData}
            onSelectTab={setActiveTab}
          />
        )}
      </main>

      {/* Quiet, Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Smart Canteen Pre-Order System · College Java OOP Project (Units I–IV)
          </div>
          <div className="flex items-center gap-4">
            <span>Pure JDK 11+ HttpServer</span>
            <span>·</span>
            <span>CSV FileStorage</span>
            <span>·</span>
            <span>No External Dependencies</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
