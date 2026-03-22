import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiResponse } from "@/types";

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.removeToken();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  private removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.instance.post("/auth/login", {
      email,
      password,
    });
    if (response.data.success && response.data.data.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async register(
    name: string,
    email: string,
    password: string,
    businessId: string,
  ): Promise<ApiResponse> {
    const response = await this.instance.post("/auth/register", {
      name,
      email,
      password,
      businessId,
    });
    if (response.data.success && response.data.data.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.instance.get("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.error(error);
    } finally {
      this.removeToken();
    }
  }

  async getProfile(): Promise<ApiResponse> {
    const response = await this.instance.get("/auth/profile");
    return response.data;
  }

  // Product methods
  async getProducts(params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const response = await this.instance.get("/products", { params });
    return response.data;
  }

  async getProduct(id: string): Promise<ApiResponse> {
    const response = await this.instance.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: any): Promise<ApiResponse> {
    const response = await this.instance.post("/products", data);
    return response.data;
  }

  async updateProduct(id: string, data: any): Promise<ApiResponse> {
    const response = await this.instance.put(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/products/${id}`);
    return response.data;
  }

  async getCategories(): Promise<ApiResponse> {
    const response = await this.instance.get("/products/categories");
    return response.data;
  }

  async getLowStockProducts(): Promise<ApiResponse> {
    const response = await this.instance.get("/products/low-stock");
    return response.data;
  }

  // Contact methods
  async getContacts(params?: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const response = await this.instance.get("/contacts", { params });
    return response.data;
  }

  async getContact(id: string): Promise<ApiResponse> {
    const response = await this.instance.get(`/contacts/${id}`);
    return response.data;
  }

  async createContact(data: any): Promise<ApiResponse> {
    const response = await this.instance.post("/contacts", data);
    return response.data;
  }

  async updateContact(id: string, data: any): Promise<ApiResponse> {
    const response = await this.instance.put(`/contacts/${id}`, data);
    return response.data;
  }

  async deleteContact(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/contacts/${id}`);
    return response.data;
  }

  async getCustomers(params?: any): Promise<ApiResponse> {
    const response = await this.instance.get("/customers", { params });
    return response.data;
  }

  async getVendors(params?: any): Promise<ApiResponse> {
    const response = await this.instance.get("/vendors", { params });
    return response.data;
  }

  // Customer methods
  async getAllCustomers(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const response = await this.instance.get("/customers", { params });
    return response.data;
  }

  //   async getAllCustomersNoLimit(): Promise<ApiResponse> {
  //   const response = await this.instance.get("/customers" );
  //   return response.data;
  // }

  async getCustomer(id: string): Promise<ApiResponse> {
    const response = await this.instance.get(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(data: any): Promise<ApiResponse> {
    const response = await this.instance.post("/customers", data);
    return response.data;
  }

  async updateCustomer(id: string, data: any): Promise<ApiResponse> {
    const response = await this.instance.put(`/customers/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/customers/${id}`);
    return response.data;
  }

  // Vendor methods
  async getAllVendors(params?: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const response = await this.instance.get("/vendors", { params });
    return response.data;
  }

  async getVendor(id: string): Promise<ApiResponse> {
    const response = await this.instance.get(`/vendors/${id}`);
    return response.data;
  }

  async createVendor(data: any): Promise<ApiResponse> {
    const response = await this.instance.post("/vendors", data);
    return response.data;
  }

  async updateVendor(id: string, data: any): Promise<ApiResponse> {
    const response = await this.instance.put(`/vendors/${id}`, data);
    return response.data;
  }

  async deleteVendor(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/vendors/${id}`);
    return response.data;
  }

  // Transaction methods
  async getTransactions(params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const response = await this.instance.get("/transactions", { params });
    return response.data;
  }

  async getTransaction(id: string): Promise<ApiResponse> {
    const response = await this.instance.get(`/transactions/${id}`);
    return response.data;
  }

  async createTransaction(data: any): Promise<ApiResponse> {
    const response = await this.instance.post("/transactions", data);
    return response.data;
  }

  async getTransactionSummary(params?: any): Promise<ApiResponse> {
    const response = await this.instance.get("/transactions/summary", {
      params,
    });
    return response.data;
  }

  // Sales Transaction methods
  async getSales(params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const response = await this.instance.get("/sales", { params });
    return response.data;
  }

  async getSale(id: string): Promise<ApiResponse> {
    const response = await this.instance.get(`/sales/${id}`);
    return response.data;
  }

  async createSale(data: any): Promise<ApiResponse> {
    const response = await this.instance.post("/sales", data);
    return response.data;
  }

  async getSaleSummary(params?: any): Promise<ApiResponse> {
    const response = await this.instance.get("/sales/summary", {
      params,
    });
    return response.data;
  }

  // Purchases Transaction methods
  async getPurchases(params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const response = await this.instance.get("/purchases", {
      params,
    });
    console.log("API Response for getPurchases:", response.data);
    return response.data;
  }

  async getPurchase(id: string): Promise<ApiResponse> {
    const response = await this.instance.get(`/purchases/${id}`);
    return response.data;
  }

  async createPurchase(data: any): Promise<ApiResponse> {
    const response = await this.instance.post("/purchases", data);
    return response.data;
  }

  async getPurchaseSummary(params?: any): Promise<ApiResponse> {
    const response = await this.instance.get("/purchases/summary", {
      params,
    });
    return response.data;
  }

  // Report methods
  async getDashboard(): Promise<ApiResponse> {
    const response = await this.instance.get("/reports/dashboard");
    return response.data;
  }

  async getInventoryReport(params?: any): Promise<ApiResponse> {
    const response = await this.instance.get("/reports/inventory", { params });
    return response.data;
  }

  async getTransactionReport(params?: any): Promise<ApiResponse> {
    const response = await this.instance.get("/reports/transactions", {
      params,
    });
    return response.data;
  }

  async getSalesTransactionReport(params?: any): Promise<ApiResponse> {
    const response = await this.instance.get("/reports/salestransactions", {
      params,
    });
    return response.data;
  }
  async getPurchaseTransactionReport(params?: any): Promise<ApiResponse> {
    const response = await this.instance.get("/reports/purchasetransactions", {
      params,
    });
    return response.data;
  }
  async getCustomerReport(id: string, params?: any): Promise<ApiResponse> {
    const response = await this.instance.get(`/reports/customer/${id}`, {
      params,
    });
    return response.data;
  }

  async getVendorReport(id: string, params?: any): Promise<ApiResponse> {
    const response = await this.instance.get(`/reports/vendor/${id}`, {
      params,
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export const api = apiClient;
