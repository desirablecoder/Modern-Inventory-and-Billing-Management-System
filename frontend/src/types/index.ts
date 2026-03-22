// User types
export interface User {
  id: string;
  name: string;
  email: string;
  businessId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessId: string;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  minStockLevel: number;
  businessId: string;
  isActive: boolean;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  minStockLevel?: number;
}
 
// Customer types
export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  creditLimit: number;
  outstandingReceivable: number;
  isActive: boolean;
  notes?: string;
  fullAddress?: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  name: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  creditLimit?: number;
  notes?: string;
}

// Vendor types
export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  outstandingBalance: number;
  isActive: boolean;
  notes?: string;
  fullAddress?: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorData {
  name: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  notes?: string;
}

// Transaction types
export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  _id: string;
  customerId?: string;
  customerName?: string;
  products: TransactionItem[];
  totalAmount: number;
  date: string;
  businessId: string;
  status: "pending" | "completed";
  paymentMethod: "cash" | "credit";
  notes?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  _id: string;
  vendorId?: string;
  vendorName?: string;
  products: TransactionItem[];
  totalAmount: number;
  date: string;
  businessId: string;
  status: "pending" | "completed";
  paymentMethod: "cash" | "credit";
  notes?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreateSaleTransactionData {
  customerId?: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod?: string;
  notes?: string;
}

export interface CreatePurchaseTransactionData {
  vendorId?: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod?: string;
  notes?: string;
}

// Report types
export interface DashboardSummary {
  overview: {
    totalProducts: number;
    totalCustomers: number;
    totalVendors: number;
    lowStockProductsCount: number;
  };
  monthly: {
    sales: number;
    purchases: number;
    profit: number;
    transactionCount: number;
  };
  yearly: {
    sales: number;
    purchases: number;
    profit: number;
    transactionCount: number;
  };
  lowStockProducts: Product[];
  recentSales: Sale[];
  recentPurchases: Purchase[];
}

export interface InventoryReport {
  products: Product[];
  statistics: {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    categories: number;
  };
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  categoryBreakdown: Record<
    string,
    {
      count: number;
      totalStock: number;
      totalValue: number;
    }
  >;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}
