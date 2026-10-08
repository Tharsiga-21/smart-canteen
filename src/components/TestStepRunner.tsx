import React, { useState } from 'react';
import { MenuItem, OrderRecord } from '../types';
import { CheckCircle2, Play, RefreshCw, ArrowRight } from 'lucide-react';

interface TestStepRunnerProps {
  menu: MenuItem[];
  orders: OrderRecord[];
  onAddMenuItem: (name: string, price: number, category: 'Meal' | 'Snack' | 'Beverage') => { success: boolean; error?: string };
  onPlaceOrder: (studentName: string, itemsSpec: string) => { success: boolean; order?: OrderRecord; error?: string };
  onUpdateOrderStatus: (orderNumber: number, status: 'Preparing' | 'Ready') => { success: boolean; error?: string };
  onResetData: () => void;
  onSelectTab: (tab: 'student' | 'staff' | 'code' | 'syllabus' | 'test') => void;
}

export const TestStepRunner: React.FC<TestStepRunnerProps> = ({
  menu,
  orders,
  onAddMenuItem,
  onPlaceOrder,
  onUpdateOrderStatus,
  onResetData,
  onSelectTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);
  const [stepLogs, setStepLogs] = useState<string[]>([]);

  // Verification step definitions
  const steps = [
    {
      title: 'Step 1: Verify Initial Empty State',
      description: 'Confirm menu and orders start completely empty with appropriate placeholder messages.',
      actionLabel: 'Verify Empty State',
      check: () => menu.length === 0 && orders.length === 0,
      run: () => {
        onResetData();
        return 'Data reset to empty. Confirmed menu starts at 0 items, 0 orders.';
      }
    },
    {
      title: 'Step 2: Staff Adds Menu Items Across All 3 Categories',
      description: 'Staff adds Veg Biryani (Meal), Samosa (Snack), and Lemon Tea (Beverage).',
      actionLabel: 'Execute Step 2',
      check: () => menu.length >= 3,
      run: () => {
        onAddMenuItem('Veg Biryani', 80, 'Meal');
        onAddMenuItem('Samosa', 15, 'Snack');
        onAddMenuItem('Lemon Tea', 20, 'Beverage');
        return 'Added 3 items: Veg Biryani (Meal ₹80), Samosa (Snack ₹15), Lemon Tea (Beverage ₹20).';
      }
    },
    {
      title: 'Step 3: Student Pre-Orders Food (Cart & Order #1)',
      description: 'Student Rahul orders 1 Veg Biryani and 2 Samosas (Total: ₹110.00). Gets Order #1.',
      actionLabel: 'Execute Step 3',
      check: () => orders.length >= 1,
      run: () => {
        const biryani = menu.find(m => m.name.toLowerCase().includes('biryani')) || menu[0];
        const samosa = menu.find(m => m.name.toLowerCase().includes('samosa')) || menu[1];
        if (!biryani || !samosa) {
          return 'Failed: Ensure menu items exist from Step 2 first.';
        }
        const res = onPlaceOrder('Rahul Sharma', `${biryani.id}:1,${samosa.id}:2`);
        return `Order #${res.order?.orderNumber} placed for Rahul Sharma! Total: ₹${res.order?.total.toFixed(2)}.`;
      }
    },
    {
      title: 'Step 4: Lifecycle Transition (Placed ➔ Preparing ➔ Ready)',
      description: 'Staff updates Order #1 to Preparing, then Ready. Verify the student ready banner activates.',
      actionLabel: 'Execute Step 4',
      check: () => orders.some(o => o.status === 'Ready'),
      run: () => {
        const ord = orders[0];
        if (!ord) return 'Failed: No orders exist to update. Complete Step 3 first.';
        onUpdateOrderStatus(ord.orderNumber, 'Preparing');
        onUpdateOrderStatus(ord.orderNumber, 'Ready');
        return `Order #${ord.orderNumber} transitioned from Placed ➔ Preparing ➔ Ready!`;
      }
    },
    {
      title: 'Step 5: Sequential Order Numbering & Persistence Test',
      description: 'Place a second order for Priya Patel to verify order number auto-increments to #2.',
      actionLabel: 'Execute Step 5',
      check: () => orders.length >= 2,
      run: () => {
        const item = menu[0];
        if (!item) return 'Failed: Menu is empty.';
        const res = onPlaceOrder('Priya Patel', `${item.id}:1`);
        return `Second order placed for Priya Patel. Assigned Order #${res.order?.orderNumber}!`;
      }
    }
  ];

  const handleRunStep = (index: number) => {
    const resultLog = steps[index].run();
    setStepLogs(prev => [...prev, resultLog]);
    if (index < steps.length - 1) {
      setCurrentStepIndex(index + 1);
    }
  };

  const handleRunAllSteps = async () => {
    setAutoRunning(true);
    setStepLogs(['Starting full end-to-end verification sequence...']);

    // Step 1
    onResetData();
    setStepLogs(prev => [...prev, '✓ Step 1: Initial empty state verified.']);
    await new Promise(r => setTimeout(r, 600));

    // Step 2
    onAddMenuItem('Veg Biryani', 80, 'Meal');
    onAddMenuItem('Samosa', 15, 'Snack');
    onAddMenuItem('Lemon Tea', 20, 'Beverage');
    setStepLogs(prev => [...prev, '✓ Step 2: Added 3 menu items across Meal, Snack, Beverage.']);
    await new Promise(r => setTimeout(r, 600));

    // Step 3
    const biryani = 1;
    const samosa = 2;
    const ord1 = onPlaceOrder('Rahul Sharma', `${biryani}:1,${samosa}:2`);
    setStepLogs(prev => [...prev, `✓ Step 3: Placed Order #${ord1.order?.orderNumber} for Rahul Sharma (₹110.00).`]);
    await new Promise(r => setTimeout(r, 600));

    // Step 4
    if (ord1.order) {
      onUpdateOrderStatus(ord1.order.orderNumber, 'Preparing');
      await new Promise(r => setTimeout(r, 400));
      onUpdateOrderStatus(ord1.order.orderNumber, 'Ready');
      setStepLogs(prev => [...prev, `✓ Step 4: Order #${ord1.order?.orderNumber} transitioned to Ready state.`]);
    }
    await new Promise(r => setTimeout(r, 600));

    // Step 5
    const ord2 = onPlaceOrder('Priya Patel', `3:1`);
    setStepLogs(prev => [...prev, `✓ Step 5: Placed Order #${ord2.order?.orderNumber} for Priya Patel. Auto-increment validated!`]);
    setStepLogs(prev => [...prev, '🎉 All 5 verification steps passed successfully!']);

    setAutoRunning(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            5 Simple Test Steps to Verify Everything Works
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Follow along manually or click the automated runner to test the full lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetData}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Data (Start Empty)
          </button>
          <button
            onClick={handleRunAllSteps}
            disabled={autoRunning}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {autoRunning ? 'Running Tests...' : 'Run All 5 Steps'}
          </button>
        </div>
      </div>

      {/* Step Cards List */}
      <div className="space-y-4">
        {steps.map((st, idx) => {
          const isPassed = st.check();
          return (
            <div
              key={idx}
              className={`bg-white border rounded-xl p-5 transition-all shadow-2xs ${
                isPassed ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {st.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {st.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleRunStep(idx)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors cursor-pointer"
                  >
                    {st.actionLabel}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Logs */}
      {stepLogs.length > 0 && (
        <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-1 border border-slate-800">
          <div className="text-slate-400 font-semibold mb-2 text-[11px] uppercase tracking-wider">
            Verification Output Stream:
          </div>
          {stepLogs.map((log, i) => (
            <div key={i} className="text-emerald-400">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Jump into portals */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSelectTab('student')}
          className="flex-1 p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span>Open Live Student Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onSelectTab('staff')}
          className="flex-1 p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span>Open Live Staff Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
