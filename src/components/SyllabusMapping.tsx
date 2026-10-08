import React from 'react';
import { BookOpen, HelpCircle, Layers } from 'lucide-react';

export const SyllabusMapping: React.FC = () => {
  const syllabusData = [
    {
      unit: 'UNIT I',
      concept: 'Variables & Primitive Types',
      file: 'FoodItem.java, Order.java, Main.java',
      className: 'FoodItem, Order, Main',
      evidence: 'int id, double price, long timestamp, boolean running',
      explanation: 'Used for primitive identification, monetary calculations, epoch timestamps, and thread control.'
    },
    {
      unit: 'UNIT I',
      concept: 'Arrays (1D Array)',
      file: 'Main.java, FileStorage.java',
      className: 'Main, FileStorage',
      evidence: 'String[] CATEGORIES = {"Meal", "Snack", "Beverage"}; String[] parts = line.split(",");',
      explanation: 'Fixed-size array for supported categories and arrays generated when tokenizing CSV lines.'
    },
    {
      unit: 'UNIT I',
      concept: 'Operators (Arithmetic, Relational, Logical)',
      file: 'Order.java, FoodItem.java',
      className: 'Order, FoodItem',
      evidence: 'total += item.getPrice() * qty; if (qty < 1 || item == null); price <= 0.0;',
      explanation: 'Arithmetic (+, *), Comparison (<, >, ==, !=), and Logical (&&, ||, !) operators.'
    },
    {
      unit: 'UNIT I',
      concept: 'Control Flow (if/else, switch, for, while)',
      file: 'Order.java, Main.java, FileStorage.java',
      className: 'Order, Main, FileStorage',
      evidence: 'switch (status.toLowerCase()) { ... }; for (int i = 0; ...); while ((line = reader.readLine()) != null)',
      explanation: 'Loops for iterating menus, orders, streams, and switch for valid status transitions.'
    },
    {
      unit: 'UNIT II',
      concept: 'Abstract Class & Normal Method',
      file: 'FoodItem.java',
      className: 'FoodItem (abstract)',
      evidence: 'public abstract class FoodItem; abstract String getCategory(); normal getDescription()',
      explanation: 'FoodItem cannot be instantiated directly; provides shared fields, getters, and concrete getDescription().'
    },
    {
      unit: 'UNIT II',
      concept: 'Subclasses & Inheritance (super keyword)',
      file: 'Meal.java, Snack.java, Beverage.java',
      className: 'Meal, Snack, Beverage',
      evidence: 'public class Meal extends FoodItem { super(id, name, price); }',
      explanation: 'Specialized food types inheriting common behavior while calling parent constructor via super().'
    },
    {
      unit: 'UNIT II',
      concept: 'Method Overriding & Polymorphism',
      file: 'Meal.java, Snack.java, Beverage.java',
      className: 'Meal, Snack, Beverage',
      evidence: '@Override public String getCategory() { return "Meal"; }',
      explanation: 'Subclasses provide unique implementations for the abstract getCategory() method.'
    },
    {
      unit: 'UNIT II',
      concept: 'Dynamic Method Dispatch',
      file: 'Order.java, Main.java',
      className: 'Order (getOrderSummary), Main',
      evidence: 'for (FoodItem item : items) { String cat = item.getCategory(); }',
      explanation: 'Calling getCategory() via FoodItem base reference dynamically resolves to Meal, Snack, or Beverage at runtime.'
    },
    {
      unit: 'UNIT II',
      concept: 'Method Overloading',
      file: 'Order.java',
      className: 'Order',
      evidence: 'calculateTotal() vs calculateTotal(FoodItem item, int quantity)',
      explanation: 'Two methods with the same name but distinct signatures: whole order total vs single item calculation.'
    },
    {
      unit: 'UNIT II',
      concept: 'Static Variable, Block, & Methods',
      file: 'Order.java',
      className: 'Order',
      evidence: 'private static int orderCounter; static { orderCounter = 0; } generateNextOrderNumber()',
      explanation: 'Class-level sequential order number counter shared across all Order instances and synced on startup.'
    },
    {
      unit: 'UNIT II',
      concept: 'Passing & Returning Objects',
      file: 'Order.java, Main.java, FileStorage.java',
      className: 'Order, Main, FileStorage',
      evidence: 'addItem(FoodItem item); findItemById(int id) returns FoodItem; createItem(...) returns FoodItem',
      explanation: 'Object references are passed into methods as arguments and returned as results.'
    },
    {
      unit: 'UNIT II',
      concept: 'Encapsulation & Access Modifiers',
      file: 'FoodItem.java, Order.java',
      className: 'FoodItem, Order',
      evidence: 'private int id; private String name; public int getId(); public void setName(...)',
      explanation: 'Fields are protected by private visibility and accessed solely via public getter/setter methods.'
    },
    {
      unit: 'UNIT II',
      concept: 'Final Keyword',
      file: 'Main.java',
      className: 'Main',
      evidence: 'public static final int PORT = 8080;',
      explanation: 'Declares an immutable constant for the web server network port.'
    },
    {
      unit: 'UNIT III',
      concept: 'Interfaces (implements keyword)',
      file: 'Trackable.java, Order.java',
      className: 'Trackable (interface), Order',
      evidence: 'public interface Trackable { String getStatus(); } Order implements Trackable',
      explanation: 'Decoupled tracking contract implemented by Order to guarantee status inspection.'
    },
    {
      unit: 'UNIT III',
      concept: 'Custom User-Defined Exception',
      file: 'InvalidOrderException.java',
      className: 'InvalidOrderException extends Exception',
      evidence: 'throw new InvalidOrderException("Student name cannot be empty.");',
      explanation: 'Thrown for empty carts, unknown item IDs, invalid quantities, negative prices, and invalid statuses.'
    },
    {
      unit: 'UNIT III',
      concept: 'Exception Handling (try-catch-finally)',
      file: 'Main.java, FileStorage.java',
      className: 'Main, FileStorage',
      evidence: 'catch (InvalidOrderException ioe) { ... } catch (NumberFormatException nfe) { ... } catch (IOException e)',
      explanation: 'Gracefully catches business exceptions and system parsing faults, returning clean JSON errors to clients.'
    },
    {
      unit: 'UNIT III',
      concept: 'String Methods',
      file: 'FoodItem.java, Order.java, Main.java',
      className: 'FoodItem, Order, Main',
      evidence: 'trim(), split(), equalsIgnoreCase(), toUpperCase(), length(), replace()',
      explanation: 'Extensive use of standard java.lang.String manipulation methods without external libraries.'
    },
    {
      unit: 'UNIT III',
      concept: 'StringBuilder / StringBuffer',
      file: 'Order.java, Main.java, FileStorage.java',
      className: 'Order, Main, FileStorage',
      evidence: 'StringBuilder sb = new StringBuilder(); sb.append("{...}");',
      explanation: 'Efficient manual JSON assembly and CSV string generation without 3rd party JSON libraries.'
    },
    {
      unit: 'UNIT IV',
      concept: 'File I/O (BufferedReader, BufferedWriter)',
      file: 'FileStorage.java',
      className: 'FileStorage',
      evidence: 'BufferedReader reader = new BufferedReader(new FileReader(file)); BufferedWriter writer = ...',
      explanation: 'Reads and writes plain-text CSV records (menu.csv and orders.csv) using character streams.'
    },
    {
      unit: 'UNIT IV',
      concept: 'Multithreading (Runnable interface)',
      file: 'Main.java',
      className: 'Main.AutoSaveTask implements Runnable',
      evidence: 'Thread autoSaveThread = new Thread(new AutoSaveTask()); autoSaveThread.start();',
      explanation: 'Independent background worker thread executing periodic auto-save to CSV storage every 30 seconds.'
    },
    {
      unit: 'UNIT IV',
      concept: 'Synchronization (synchronized keyword)',
      file: 'Order.java, FileStorage.java, Main.java',
      className: 'Order, FileStorage, Main',
      evidence: 'public static synchronized int generateNextOrderNumber(); synchronized (storage) { ... }',
      explanation: 'Prevents race conditions when multiple students place orders concurrently.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* "How It Works" 5-8 Lines Summary */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            How It Works: Architectural Overview (For Teacher & Viva)
          </h2>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 text-xs text-slate-700 leading-relaxed space-y-2">
          <p>
            <strong>1. Menu Module:</strong> The canteen staff configures available items through the Staff Portal. Items are instantiated as polymorphic <code className="text-blue-700">Meal</code>, <code className="text-blue-700">Snack</code>, or <code className="text-blue-700">Beverage</code> subclasses of <code className="text-blue-700">FoodItem</code> and stored in an in-memory <code className="text-blue-700">ArrayList&lt;FoodItem&gt;</code> synced to <code className="text-blue-700">data/menu.csv</code>.
          </p>
          <p>
            <strong>2. Order Placement:</strong> Students enter their name and select item quantities in the Student Portal. The frontend dispatches a form-encoded POST request to <code className="text-blue-700">/api/orders</code>. The backend verifies inputs with custom <code className="text-blue-700">InvalidOrderException</code>, increments the <code className="text-blue-700">synchronized</code> order counter, and stores the new <code className="text-blue-700">Order</code> object.
          </p>
          <p>
            <strong>3. Order Processing:</strong> Staff views all active orders in the Live Queue. Staff clicks action buttons to progress ticket states from <em>Placed</em> to <em>Preparing</em> and finally <em>Ready</em> via <code className="text-blue-700">/api/orders/status</code>.
          </p>
          <p>
            <strong>4. Status Tracking & Persistence:</strong> Students enter their order number to poll <code className="text-blue-700">/api/orders/status</code> every 5 seconds. When marked <em>Ready</em>, a highlighted green pickup banner alerts the student. Concurrently, a background <code className="text-blue-700">Runnable</code> thread auto-saves all records to disk every 30 seconds.
          </p>
        </div>
      </section>

      {/* Syllabus Mapping Table */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            OOP Syllabus Concept Mapping (Units I – IV)
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Every requirement from the syllabus is implemented naturally with clear in-code comments.
        </p>

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Unit</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Syllabus Concept</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap">File & Class</th>
                <th className="py-2.5 px-3 font-semibold">Code Evidence</th>
                <th className="py-2.5 px-3 font-semibold">OOP Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {syllabusData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {row.unit}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    {row.concept}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                    {row.file}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-blue-700">
                    {row.evidence}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 leading-normal">
                    {row.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Likely Viva Questions & Answers */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Likely Viva Questions & Simple Answers
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          First-year student defense notes for college lab examination.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-slate-900">
              Q1. Where is Dynamic Method Dispatch used in this project?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In <code className="text-blue-700">Order.getOrderSummary()</code> and <code className="text-blue-700">FileStorage.saveMenu()</code>. We store objects of <code className="text-blue-700">Meal</code>, <code className="text-blue-700">Snack</code>, and <code className="text-blue-700">Beverage</code> inside an <code className="text-blue-700">ArrayList&lt;FoodItem&gt;</code>. When we invoke <code className="text-blue-700">item.getCategory()</code> through the base reference, the Java Virtual Machine dynamically determines which subclass method to execute at runtime.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-slate-900">
              Q2. What is the difference between Method Overloading and Method Overriding here?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Overloading:</strong> In <code className="text-blue-700">Order</code>, we have two <code className="text-blue-700">calculateTotal()</code> methods with different parameter lists in the same class. <strong>Overriding:</strong> Subclasses <code className="text-blue-700">Meal</code>, <code className="text-blue-700">Snack</code>, and <code className="text-blue-700">Beverage</code> override the abstract <code className="text-blue-700">getCategory()</code> method inherited from parent <code className="text-blue-700">FoodItem</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-slate-900">
              Q3. Why is the order generation method marked <code className="text-blue-700">synchronized</code>?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Because the HTTP server can process requests from multiple student browsers concurrently. The <code className="text-blue-700">synchronized</code> keyword ensures only one thread accesses <code className="text-blue-700">generateNextOrderNumber()</code> at a time, preventing duplicate order numbers (race conditions).
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-slate-900">
              Q4. How does the application avoid using external JSON libraries?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inputs are received as standard form-urlencoded key-value pairs parsed with <code className="text-blue-700">URLDecoder</code>, and outgoing JSON payloads are constructed manually using <code className="text-blue-700">StringBuilder</code> with proper quote escaping. This satisfies the constraint of using only the standard JDK.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
