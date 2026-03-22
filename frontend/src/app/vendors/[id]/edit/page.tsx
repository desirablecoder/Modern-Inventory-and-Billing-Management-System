"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api";
import { Vendor, CreateVendorData } from "@/types";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";
import {
  FadeIn,
  SlideIn,
  FormFieldAnimation,
  ScaleOnHover,
} from "@/components/animations";

export default function EditVendorPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingVendor, setLoadingVendor] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vendor, setVendor] = useState<Vendor | null>(null);

  const [formData, setFormData] = useState<CreateVendorData>({
    name: "",
    phone: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    notes: "",
  });

  useEffect(() => {
    if (vendorId) {
      loadVendor();
    }
  }, [vendorId]);

  const loadVendor = async () => {
    try {
      const response = await apiClient.getVendor(vendorId);
      if (response.success) {
        const vendorData = response.data.vendor;
        setVendor(vendorData);
        setFormData({
          name: vendorData.name,
          phone: vendorData.phone,
          email: vendorData.email || "",
          address: vendorData.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          notes: vendorData.notes || "",
        });
      } else {
        setError("Failed to load vendor");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load vendor");
    } finally {
      setLoadingVendor(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "creditLimit" ? Number(value) : value,
      }));
    }
  };

  // const handleTypeChange = (value: "customer" | "vendor") => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     type: value,
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await apiClient.updateVendor(vendorId, formData);
      if (response.success) {
        setSuccess("Vendor updated successfully!");
        setTimeout(() => {
          router.push("/vendors");
        }, 1500);
      } else {
        setError(response.message || "Failed to update vendor");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update vendor");
    } finally {
      setLoading(false);
    }
  };

  if (loadingVendor) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-100">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading vendor details...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!vendor) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/vendors")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vendors
              </Button>
            </div>
            <Alert variant="destructive">
              <AlertDescription>{error || "Vendor not found"}</AlertDescription>
            </Alert>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <FadeIn delay={0.1}>
            <div className="flex items-center space-x-2">
              <Link href="/vendors">
                <ScaleOnHover>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </ScaleOnHover>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-primary">Edit Vendor</h1>
                <p className="text-muted-foreground">
                  Update vendor information
                </p>
              </div>
            </div>
          </FadeIn>

          <SlideIn direction="up" duration={0.5}>
            <Card className="max-w-4xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Vendor Information
                </CardTitle>
                <CardDescription>
                  Update the details for {vendor.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <SlideIn direction="down" duration={0.3}>
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </SlideIn>
                  )}

                  {success && (
                    <SlideIn direction="down" duration={0.3}>
                      <Alert className="border-green-200 bg-green-50 text-green-800">
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    </SlideIn>
                  )}

                  {/* Basic Information */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormFieldAnimation delay={0.2}>
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          <User className="inline h-4 w-4 mr-1" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter full name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="transition-all duration-300 focus:scale-105"
                        />
                      </div>
                    </FormFieldAnimation>

                    {/* <FormFieldAnimation delay={0.3}>
                      <div className="space-y-2">
                        <Label htmlFor="type">Contact Type *</Label>
                        <Select value={formData.type} onValueChange={handleTypeChange}>
                          <SelectTrigger className="transition-all duration-300 focus:scale-105">
                            <SelectValue placeholder="Select contact type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormFieldAnimation>
 */}
                    <FormFieldAnimation delay={0.4}>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          <Phone className="inline h-4 w-4 mr-1" />
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="transition-all duration-300 focus:scale-105"
                        />
                      </div>
                    </FormFieldAnimation>

                    <FormFieldAnimation delay={0.5}>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          <Mail className="inline h-4 w-4 mr-1" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter email address"
                          value={formData.email}
                          onChange={handleChange}
                          className="transition-all duration-300 focus:scale-105"
                        />
                      </div>
                    </FormFieldAnimation>
                  </div>

                  {/* Address Information */}
                  <FormFieldAnimation delay={0.6}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <Label className="text-base font-semibold">
                          Address
                        </Label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="address.street">Street Address</Label>
                          <Input
                            id="address.street"
                            name="address.street"
                            type="text"
                            placeholder="Enter street address"
                            value={formData.address?.street || ""}
                            onChange={handleChange}
                            className="transition-all duration-300 focus:scale-105"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address.city">City</Label>
                          <Input
                            id="address.city"
                            name="address.city"
                            type="text"
                            placeholder="Enter city"
                            value={formData.address?.city || ""}
                            onChange={handleChange}
                            className="transition-all duration-300 focus:scale-105"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address.state">State/Province</Label>
                          <Input
                            id="address.state"
                            name="address.state"
                            type="text"
                            placeholder="Enter state or province"
                            value={formData.address?.state || ""}
                            onChange={handleChange}
                            className="transition-all duration-300 focus:scale-105"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address.zipCode">
                            ZIP/Postal Code
                          </Label>
                          <Input
                            id="address.zipCode"
                            name="address.zipCode"
                            type="text"
                            placeholder="Enter ZIP or postal code"
                            value={formData.address?.zipCode || ""}
                            onChange={handleChange}
                            className="transition-all duration-300 focus:scale-105"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address.country">Country</Label>
                          <Input
                            id="address.country"
                            name="address.country"
                            type="text"
                            placeholder="Enter country"
                            value={formData.address?.country || ""}
                            onChange={handleChange}
                            className="transition-all duration-300 focus:scale-105"
                          />
                        </div>
                      </div>
                    </div>
                  </FormFieldAnimation>

                  {/* Financial Information */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* <FormFieldAnimation delay={0.7}>
                      <div className="space-y-2">
                        <Label htmlFor="creditLimit">
                          <CreditCard className="inline h-4 w-4 mr-1" />
                          Credit Limit
                        </Label>
                        <Input
                          id="creditLimit"
                          name="creditLimit"
                          type="number"
                          placeholder="Enter credit limit"
                          value={formData.creditLimit}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="transition-all duration-300 focus:scale-105"
                        />
                      </div>
                    </FormFieldAnimation> */}

                    <FormFieldAnimation delay={0.8}>
                      <div className="space-y-2">
                        <Label htmlFor="notes">
                          <FileText className="inline h-4 w-4 mr-1" />
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          placeholder="Enter any additional notes"
                          value={formData.notes}
                          onChange={handleChange}
                          className="transition-all duration-300 focus:scale-105"
                          rows={3}
                        />
                      </div>
                    </FormFieldAnimation>
                  </div>

                  {/* Submit Button */}
                  <FormFieldAnimation delay={0.9}>
                    <div className="flex gap-4 pt-4">
                      <ScaleOnHover>
                        <Button
                          type="submit"
                          className="flex-1 transition-all duration-300"
                          disabled={loading}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {loading ? "Updating Vendor..." : "Update Vendor"}
                        </Button>
                      </ScaleOnHover>

                      <ScaleOnHover>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push("/vendors")}
                          className="transition-all duration-300"
                        >
                          Cancel
                        </Button>
                      </ScaleOnHover>
                    </div>
                  </FormFieldAnimation>
                </form>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
