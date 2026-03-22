'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { InventoryReport, Customer, Vendor, Sale,Purchase } from '@/types';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  BarChart3,
  Download,
  RefreshCw,
  ClipboardCheck
} from 'lucide-react';
import { FadeIn, SlideIn, StaggerContainer, StaggerItem } from '@/components/animations';

interface CustomerReportData {
  customer?: Customer;
  statistics: {
    totalPurchases: number;
    totalTransactions: number;
    averagePurchaseAmount: number;
    currentBalance: number;
    creditLimit?: number;
  };
  topProducts?: Array<{
    product: { name: string; category: string };
    totalQuantity: number;
    totalAmount: number;
    transactionCount: number;
  }>;
  monthlyBreakdown?: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
}

interface VendorReportData {
  vendor?: Vendor;
  statistics: {
    totalPurchases: number;
    totalTransactions: number;
    averagePurchaseAmount: number;
    currentBalance: number;
    creditLimit?: number;
  };
  topProducts?: Array<{
    product: { name: string; category: string };
    totalQuantity: number;
    totalAmount: number;
    transactionCount: number;
  }>;
  monthlyBreakdown?: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
}
interface SaleReportData {
  saleTransactions: Sale[];
  summary: {
    totalSales: number;
    totalPurchases: number;
    profit: number;
    salesCount: number;
    purchasesCount: number;
    averageSaleAmount: number;
    averagePurchaseAmount: number;
  };
}
interface PurchaseReportData {
  purchaseTransactions: Purchase[];
  summary: {
    totalSales: number;
    totalPurchases: number;
    profit: number;
    salesCount: number;
    purchasesCount: number;
    averageSaleAmount: number;
    averagePurchaseAmount: number;
  };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(false);
  
  // Inventory Report State
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [inventoryFilters, setInventoryFilters] = useState({
    category: '',
    sortBy: 'name'
  });

  // Sale Report State
  const [saleReport, setSaleReport] = useState<SaleReportData | null>(null);
  const [saleFilters, setSaleFilters] = useState({
    startDate: '',
    endDate: '',
  });

  // Transaction Report State
  const [purchaseReport, setPurchaseReport] = useState<PurchaseReportData | null>(null);
  const [purchaseFilters, setPurchaseFilters] = useState({
    startDate: '',
    endDate: '',
  });

  // Contact Reports State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerReport, setCustomerReport] = useState<CustomerReportData | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [vendorReport, setVendorReport] = useState<VendorReportData | null>(null);

  useEffect(() => {
    if (user) {
      loadInventoryReport();
      loadCustomersForReports();
      loadVendorsForReports();
    }
  }, [user]);

  const loadInventoryReport = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getInventoryReport(inventoryFilters);
      if (response.success) {
        setInventoryReport(response.data);
      }
    } catch (error) {
      console.error('Failed to load inventory report:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSaleReport = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getTransactionReport(saleFilters);
      if (response.success) {
        setSaleReport(response.data);
      }
    } catch (error) {
      console.error('Failed to load sale report:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseReport = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getTransactionReport(purchaseFilters);
      if (response.success) {
        setPurchaseReport(response.data);
      }
    } catch (error) {
      console.error('Failed to load purchase report:', error);
    } finally {
      setLoading(false);
    }
  };


  const loadCustomersForReports = async () => {
    if (!user) return;
    
    try {
      const [customersResponse] = await Promise.all([
        apiClient.getCustomers(),
      ]);
      
      if (customersResponse.success) {
        // Handle different possible response structures
        const customersData = customersResponse.data?.customers || customersResponse.data || [];
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } else {
        setCustomers([]);
      }
      
    } catch (error) {
      console.error('Failed to load customers:', error);
      // Ensure we always have arrays even on error
      setCustomers([]);
    }
  };
const loadVendorsForReports = async () => {
    if (!user) return;
    
    try {
      const [vendorsResponse] = await Promise.all([
        apiClient.getVendors()
      ]);
      
      if (vendorsResponse.success) {
        // Handle different possible response structures
        const vendorsData = vendorsResponse.data?.vendors || vendorsResponse.data || [];
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error('Failed to load vendors:', error);
      // Ensure we always have arrays even on error
      setVendors([]);
    }
  };

  const loadCustomerReport = async (contactId: string, type: 'customer' ) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response =await apiClient.getCustomerReport(contactId)
      if (response.success) {
        setCustomerReport(response.data);
      }
    } catch (error) {
      console.error('Failed to load customer report:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadVendorReport = async (contactId: string, type: 'vendor') => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response =await apiClient.getVendorReport(contactId);
      
      if (response.success) {
        setVendorReport(response.data);
      }
    } catch (error) {
      console.error('Failed to load contact report:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <Layout>
        <FadeIn>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-primary">Reports & Analytics</h1>
                <p className="text-muted-foreground">Comprehensive business insights and analytics</p>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 ">
                <TabsTrigger value="inventory" className="gap-2 text-primary">
                  <ClipboardCheck  className="h-4 w-4 text-primary" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="saletransactions" className="gap-2 text-primary">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Sales
                </TabsTrigger>
                <TabsTrigger value="purchasetransactions" className="gap-2 text-primary">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Purchases
                </TabsTrigger>
                <TabsTrigger value="customers" className="gap-2 text-primary">
                  <Users className="h-4 w-4 text-primary" />
                  Customers
                </TabsTrigger>
                <TabsTrigger value="vendors" className="gap-2 text-primary">
                  <Users className="h-4 w-4 text-primary" />
                  Vendors
                </TabsTrigger>
              </TabsList>

              {/* Inventory Report */}
              <TabsContent value="inventory" className="space-y-6">
                <SlideIn direction="up">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardCheck  className="h-5 w-5" />
                        Inventory Report
                      </CardTitle>
                      <CardDescription>
                        Detailed analysis of your product inventory and stock levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Filters */}
                      <div className="flex gap-4 mb-6 flex-wrap">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            placeholder="Filter by category..."
                            value={inventoryFilters.category}
                            onChange={(e) => setInventoryFilters(prev => ({ ...prev, category: e.target.value }))}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={loadInventoryReport} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                          </Button>
                        </div>
                      </div>

                      {loading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : inventoryReport ? (
                        <div className="space-y-6">
                          {/* Statistics Cards */}
                          <StaggerContainer>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                              <StaggerItem>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                                        <p className="text-2xl font-bold">{inventoryReport.statistics.totalProducts}</p>
                                      </div>
                                      <ClipboardCheck  className="h-8 w-8 text-blue-500" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </StaggerItem>

                              <StaggerItem>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                        <p className="text-2xl font-bold">{formatCurrency(inventoryReport.statistics.totalValue)}</p>
                                      </div>
                                      <DollarSign className="h-8 w-8 text-green-500" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </StaggerItem>

                              <StaggerItem>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                                        <p className="text-2xl font-bold text-orange-500">{inventoryReport.statistics.lowStockCount}</p>
                                      </div>
                                      <AlertTriangle className="h-8 w-8 text-orange-500" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </StaggerItem>

                              <StaggerItem>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                                        <p className="text-2xl font-bold text-red-500">{inventoryReport.statistics.outOfStockCount}</p>
                                      </div>
                                      <TrendingDown className="h-8 w-8 text-red-500" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </StaggerItem>
                            </div>
                          </StaggerContainer>

                          {/* Products Table */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Product Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {inventoryReport.products.slice(0, 10).map((product) => (
                                    <TableRow key={product._id}>
                                      <TableCell>
                                        <div>
                                          <p className="font-medium">{product.name}</p>
                                          <p className="text-sm text-muted-foreground">{product.sku}</p>
                                        </div>
                                      </TableCell>
                                      <TableCell>{product.category}</TableCell>
                                      <TableCell>{formatCurrency(product.price)}</TableCell>
                                      <TableCell>{product.stock}</TableCell>
                                      <TableCell>
                                        {product.stock === 0 ? (
                                          <Badge variant="destructive">Out of Stock</Badge>
                                        ) : product.stock <= product.minStockLevel ? (
                                          <Badge variant="secondary">Low Stock</Badge>
                                        ) : (
                                          <Badge variant="default">In Stock</Badge>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </SlideIn>
              </TabsContent>

              {/* Sales Transaction Report */}
              <TabsContent value="saletransactions" className="space-y-6">
                <SlideIn direction="up">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Sales Transaction Report
                      </CardTitle>
                      <CardDescription>
                        Analyze your sales transactions over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Filters */}
                      <div className="flex gap-4 mb-6 flex-wrap">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={saleFilters.startDate}
                            onChange={(e) => setSaleFilters(prev => ({ ...prev, startDate: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={saleFilters.endDate}
                            onChange={(e) => setSaleFilters(prev => ({ ...prev, endDate: e.target.value }))}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={loadSaleReport} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Generate Report
                          </Button>
                        </div>
                      </div>

                      {loading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : saleReport ? (
                        <div className="space-y-6">
                          {/* Summary Cards */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(saleReport.summary.totalSales)}</p>
                                  </div>
                                  <TrendingUp className="h-8 w-8 text-green-500" />
                                </div>
                              </CardContent>
                            </Card>


                            <Card>
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                                    <p className={`text-2xl font-bold ${saleReport.summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatCurrency(saleReport.summary.profit)}
                                    </p>
                                  </div>
                                  <DollarSign className="h-8 w-8 text-blue-500" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Sale</p>
                                    <p className="text-2xl font-bold">{formatCurrency(saleReport.summary.averageSaleAmount)}</p>
                                  </div>
                                  <BarChart3 className="h-8 w-8 text-purple-500" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Recent Transactions */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Recent Sale Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Amount</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {saleReport.saleTransactions.slice(0, 10).map((transaction) => (
                                    <TableRow key={transaction._id}>
                                      <TableCell>{formatDate(transaction.date)}</TableCell>
                                      <TableCell>
                                        <Badge variant={'default'}>
                                          {"sale"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {transaction.customerName }
                                      </TableCell>
                                      <TableCell className={'text-green-600'}>
                                        {formatCurrency(transaction.totalAmount)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Click &quot;Generate Report&quot; to view transaction analytics</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </SlideIn>
              </TabsContent>

              {/* Purchases Transaction Report */}
              <TabsContent value="purchasetransactions" className="space-y-6">
                <SlideIn direction="up">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Purchases Transaction Report
                      </CardTitle>
                      <CardDescription>
                        Analyze your purchase transactions over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Filters */}
                      <div className="flex gap-4 mb-6 flex-wrap">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={purchaseFilters.startDate}
                            onChange={(e) => setPurchaseFilters(prev => ({ ...prev, startDate: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={purchaseFilters.endDate}
                            onChange={(e) => setPurchaseFilters(prev => ({ ...prev, endDate: e.target.value }))}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={loadPurchaseReport} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Generate Report
                          </Button>
                        </div>
                      </div>

                      {loading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : purchaseReport ? (
                        <div className="space-y-6">
                          {/* Summary Cards */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      

                            <Card>
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(purchaseReport.summary.totalPurchases)}</p>
                                  </div>
                                  <TrendingDown className="h-8 w-8 text-red-500" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                                    <p className={`text-2xl font-bold ${purchaseReport.summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatCurrency(purchaseReport.summary.profit)}
                                    </p>
                                  </div>
                                  <DollarSign className="h-8 w-8 text-blue-500" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Purchase</p>
                                    <p className="text-2xl font-bold">{formatCurrency(purchaseReport.summary.averagePurchaseAmount)}</p>
                                  </div>
                                  <BarChart3 className="h-8 w-8 text-purple-500" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Recent Transactions */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Amount</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {purchaseReport.purchaseTransactions.slice(0, 10).map((transaction) => (
                                    <TableRow key={transaction._id}>
                                      <TableCell>{formatDate(transaction.date)}</TableCell>
                                      <TableCell>
                                        <Badge variant={'secondary'}>
                                          {"purchase"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        { transaction.vendorName}
                                      </TableCell>
                                      <TableCell className={ 'text-red-600'}>
                                        {formatCurrency(transaction.totalAmount)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Click &quot;Generate Report&quot; to view transaction analytics</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </SlideIn>
              </TabsContent>

              {/* Customer Reports */}
              <TabsContent value="customers" className="space-y-6">
                <SlideIn direction="up">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Customer Reports
                      </CardTitle>
                      <CardDescription>
                        Detailed analysis of customer purchase behavior
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer">Select Customer</Label>
                          <Select
                            value={selectedCustomer}
                            onValueChange={(value) => {
                              setSelectedCustomer(value);
                              if (value) loadCustomerReport(value, 'customer');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a customer..." />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(customers) && customers.map((customer) => (
                                <SelectItem key={customer._id} value={customer._id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {customerReport && customerReport.customer && (
                          <div className="space-y-6 mt-6">
                            <div className="grid gap-4 md:grid-cols-3">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                                    <p className="text-2xl font-bold text-green-600">
                                      {formatCurrency(customerReport.statistics.totalPurchases)}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                                    <p className="text-2xl font-bold">{customerReport.statistics.totalTransactions}</p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-muted-foreground">Average Purchase</p>
                                    <p className="text-2xl font-bold">
                                      {formatCurrency(customerReport.statistics.averagePurchaseAmount)}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </SlideIn>
              </TabsContent>

              {/* Vendor Reports */}
              <TabsContent value="vendors" className="space-y-6">
                <SlideIn direction="up">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Vendor Reports
                      </CardTitle>
                      <CardDescription>
                        Analysis of vendor relationships and purchase patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="vendor">Select Vendor</Label>
                          <Select
                            value={selectedVendor}
                            onValueChange={(value) => {
                              setSelectedVendor(value);
                              if (value) loadVendorReport(value, 'vendor');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a vendor..." />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(vendors) && vendors.map((vendor) => (
                                <SelectItem key={vendor._id} value={vendor._id}>
                                  {vendor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {vendorReport && vendorReport.vendor && (
                          <div className="space-y-6 mt-6">
                            <div className="grid gap-4 md:grid-cols-3">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                                    <p className="text-2xl font-bold text-red-600">
                                      {formatCurrency(vendorReport.statistics.totalPurchases)}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                                    <p className="text-2xl font-bold">{vendorReport.statistics.totalTransactions}</p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-muted-foreground">Average Purchase</p>
                                    <p className="text-2xl font-bold">
                                      {formatCurrency(vendorReport.statistics.averagePurchaseAmount)}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </SlideIn>
              </TabsContent>
            </Tabs>
          </div>
        </FadeIn>
      </Layout>
    </ProtectedRoute>
  );
}