export interface MenuItem {
  id: number;
  name: string;
  category: 'Meal' | 'Snack' | 'Beverage';
  price: number;
  description: string;
}

export interface OrderItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface OrderRecord {
  orderNumber: number;
  studentName: string;
  status: 'Placed' | 'Preparing' | 'Ready';
  timestamp: number;
  total: number;
  items: OrderItem[];
}

export interface SyllabusItem {
  unit: 'Unit I' | 'Unit II' | 'Unit III' | 'Unit IV';
  concept: string;
  file: string;
  className: string;
  explanation: string;
  codeSnippet: string;
}
