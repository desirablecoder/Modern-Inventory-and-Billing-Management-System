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
import { Vendor } from "@/types";
import { Plus, Search, Edit, Trash2, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("vendors");

  useEffect(() => {
    loadVendors();
  }, [search, activeTab]);

  const loadVendors = async () => {
    try {
      let response;
      response = await apiClient.getAllVendors({ search });
      console.log("API Response:", response);
      if (response.success) {
        setVendors(response.data.vendors);
      }
    } catch (error) {
      console.error("Failed to load vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      try {
        await apiClient.deleteVendor(id);
        loadVendors();
      } catch (error) {
        console.error("Failed to delete vendor:", error);
      }
    }
  };

  const VendorTable = ({ vendors }: { vendors: Vendor[] }) => (
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
        {vendors.map((vendor) => (
          <TableRow key={vendor._id}>
            <TableCell>
              <div>
                <div className="font-medium">{vendor.name}</div>
                {vendor.address?.city && (
                  <div className="text-sm text-muted-foreground">
                    {vendor.address.city}, {vendor.address.state}
                  </div>
                )}
              </div>
            </TableCell>
            {/* <TableCell>
              <Badge variant={"default"}>Vendor</Badge>
            </TableCell> */}
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-sm">
                  <Phone className="h-3 w-3" />
                  <span>{vendor.phone}</span>
                </div>
                {vendor.email && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{vendor.email}</span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div
                className={`font-medium ${
                  vendor.outstandingBalance > 0
                    ? "text-green-500"
                    : vendor.outstandingBalance < 0
                      ? "text-red-500"
                      : ""
                }`}
              >
                ${vendor.outstandingBalance.toFixed(2)}
              </div>
              {/* <div className="text-sm text-muted-foreground">
                Limit: ${vendor.creditLimit.toFixed(2)}
              </div> */}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Link href={`/vendors/${vendor._id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Edit ${vendor.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(vendor._id)}
                  aria-label={`Delete ${vendor.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {vendors.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground"
            >
              No vendors found
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
              <h1 className="text-3xl font-bold text-primary">Vendors</h1>
              <p className="text-muted-foreground">Manage your vendors</p>
            </div>
            <Link href="/vendors/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="vendors" className="mt-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <VendorTable vendors={vendors} />
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
