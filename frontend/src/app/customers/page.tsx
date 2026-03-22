"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api";
import { Customer } from "@/types";
import { Plus, Search, Edit, Trash2, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("customers");

  useEffect(() => {
    loadCustomers();
  }, [search, activeTab]);

  const loadCustomers = async () => {
    try {
      let response;
      response = await apiClient.getAllCustomers({ search });
      console.log("API Response:", response);
      if (response.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await apiClient.deleteCustomer(id);
        loadCustomers();
      } catch (error) {
        console.error("Failed to delete customer:", error);
      }
    }
  };

  const CustomerTable = ({ customers }: { customers: Customer[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {/* <TableHead>Type</TableHead> */}
          <TableHead>Contact Info</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer._id}>
            <TableCell>
              <div>
                <div className="font-medium">{customer.name}</div>
                {customer.address?.city && (
                  <div className="text-sm text-muted-foreground">
                    {customer.address.city}, {customer.address.state}
                  </div>
                )}
              </div>
            </TableCell>
            {/* <TableCell>
              <Badge variant={"default"}>Customer</Badge>
            </TableCell> */}
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-sm">
                  <Phone className="h-3 w-3" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{customer.email}</span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div
                className={`font-medium ${
                  customer.outstandingReceivable > 0
                    ? "text-green-500"
                    : customer.outstandingReceivable < 0
                      ? "text-red-500"
                      : ""
                }`}
              >
                ${customer.outstandingReceivable.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Limit: ${customer.creditLimit.toFixed(2)}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Link href={`/customers/${customer._id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Edit ${customer.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(customer._id)}
                  aria-label={`Delete ${customer.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {customers.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground"
            >
              No customers found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Customers</h1>
              <p className="text-muted-foreground">Manage your customers</p>
            </div>
            <Link href="/customers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="customers" className="mt-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <CustomerTable customers={customers} />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
