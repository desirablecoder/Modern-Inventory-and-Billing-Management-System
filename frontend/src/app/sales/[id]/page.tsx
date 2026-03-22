"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { use } from "react";
import {
  ArrowLeft,
  Receipt,
  User,
  Calendar,
  CreditCard,
  Package,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { api } from "@/lib/api";

interface Sale {
  _id: string;
  totalAmount: number;
  date: string;
  status: string;
  customerId?: {
    _id: string;
    name: string;
    phone: string;
    email: string;
    address?: string;
  };
  products: Array<{
    productId: {
      _id: string;
      name: string;
      category: string;
      sku: string;
    };
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  paymentMethod: string;
  notes?: string;
}

export default function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resolvedParams = use(params);
  const id = resolvedParams.id;

  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true);
        const response = await api.getSale(id);

        if (response.success) {
          setSale(response.data.sale);
        } else {
          setError("Sale not found");
        }
      } catch (err) {
        console.error("Error fetching sale:", err);
        setError("Error loading sale details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSale();
    }
  }, [id]);

  const getTypeColor = (type: string) => {
    return type === "sale"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sale details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !sale) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/sales")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sales
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertDescription>{error || "Sale not found"}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/sales")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">
                Sale Details
              </h1>
              <p className="text-muted-foreground">Sale ID: {sale._id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* <Badge className={getTypeColor(sale.type)}>
              {sale.type}
            </Badge> */}
            <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
          </div>
        </div>

        {/* Sale Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Sale Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {new Date(sale.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Payment Method:
                  </span>
                  <span className="font-medium capitalize">
                    {sale.paymentMethod}
                  </span>
                </div>

                {sale.notes && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Notes:
                      </span>
                      <p className="font-medium text-sm mt-1">{sale.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p
                    // "text-red-600
                    className={`text-3xl font-bold ${"text-green-600"}`}
                  >
                    ${sale.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {sale.customerId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {"Customer"} Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {sale.customerId?.name}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{sale.customerId?.phone}</p>
                    <p>{sale.customerId?.email}</p>
                    {/* {<p>{sale.customerId?.address}</p>} */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Products ({sale.products.length})
            </CardTitle>
            <CardDescription>Items included in this sale</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.products.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        {item.productId && (
                          <p className="text-sm text-muted-foreground">
                            ID: {item.productId._id}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.productId?.sku || "N/A"}</TableCell>
                    <TableCell>{item.productId?.category || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Sale Total */}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p
                    // "text-red-600"
                    className={`text-xl font-bold ${"text-green-600"}`}
                  >
                    ${sale.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
