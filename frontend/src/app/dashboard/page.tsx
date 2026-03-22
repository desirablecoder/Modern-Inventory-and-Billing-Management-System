'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { DashboardSummary } from '@/types';
import { Package, Users, Receipt, TrendingUp, AlertTriangle, DollarSign, ClipboardCheck } from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await apiClient.getDashboard();
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your inventory management system</p>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <ClipboardCheck  className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.overview.totalProducts || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.overview.totalCustomers || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.overview.totalVendors || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {summary?.overview.lowStockProductsCount || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  ${summary?.monthly.sales?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.monthly.transactionCount || 0} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Purchases</CardTitle>
                <Receipt className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  ${summary?.monthly.purchases?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  (summary?.monthly.profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ${summary?.monthly.profit?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Low Stock Products */}
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Products</CardTitle>
                <CardDescription>Products that need restocking</CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.lowStockProducts && summary.lowStockProducts.length > 0 ? (
                  <div className="space-y-2">
                    {summary.lowStockProducts.slice(0, 5).map((product) => (
                      <div key={product._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-orange-500">{product.stock} left</p>
                          <p className="text-sm text-muted-foreground">Min: {product.minStockLevel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No low stock products</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Sale Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sale Transactions</CardTitle>
                <CardDescription>Latest sales</CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.recentSales && summary.recentSales.length > 0 ? (
                  <div className="space-y-2">
                    {summary.recentSales.slice(0, 5).map((transaction) => (
                      <div key={transaction._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {transaction.customerName }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        {/* 'text-red-500' */}
                        <div className={`font-medium ${
                          'text-green-500'  
                        }`}>
                          {'+'}${transaction.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent transactions</p>
                )}
              </CardContent>
            </Card>

            
            {/* Recent Purchase Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchase Transactions</CardTitle>
                <CardDescription>Latest purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.recentPurchases && summary.recentPurchases.length > 0 ? (
                  <div className="space-y-2">
                    {summary.recentPurchases.slice(0, 5).map((transaction) => (
                      <div key={transaction._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {transaction.vendorName }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`font-medium ${
                          'text-red-500'  
                        }`}>
                          {'-'}${transaction.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent transactions</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}