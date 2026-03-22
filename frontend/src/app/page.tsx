"use client";

import { ThemeColorToggle } from "@/components/theme-color-toggle";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";

import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  ScaleOnHover,
  SlideIn,
  BounceIn,
  PageTransition,
} from "@/components/animations";
import {
  ArrowRight,
  BarChart3,
  Package,
  Users,
  Receipt,
  Shield,
  Zap,
  Cloud,
  CheckCircle,
  TrendingUp,
  Smartphone,
  Globe,
  ClipboardCheck,
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Track your products, stock levels, and get low stock alerts automatically.",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Users,
    title: "Customer & Vendor Management",
    description:
      "Manage all your business relationships in one centralized location.",
    color: "text-green-600 dark:text-green-400",
  },
  {
    icon: Receipt,
    title: "Transaction Processing",
    description: "Record sales and purchases with automatic stock updates.",
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: BarChart3,
    title: "Advanced Reporting",
    description: "Get insights with comprehensive reports and analytics.",
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Your data is protected with enterprise-level security measures.",
    color: "text-red-600 dark:text-red-400",
  },
  {
    icon: Cloud,
    title: "Cloud-Based",
    description: "Access your business data anywhere, anytime from any device.",
    color: "text-indigo-600 dark:text-indigo-400",
  },
];

const benefits = [
  "Real-time inventory tracking",
  "Automated stock management",
  "Comprehensive reporting",
  "Multi-device accessibility",
  "Secure data storage",
  "User-friendly interface",
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation  />

        {/* Hero Section */}
        <section className="relative py-20 lg:py-30 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <SlideIn direction="up" delay={0.4}>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6">
                  Modern{" "}
                  <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent ">
                    Inventory & Billing
                  </span>{" "}
                  Management System
                </h1>
              </SlideIn>

              <FadeIn delay={0.6}>
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  Modern Inventory & Billing Management System is a Modern and
                  responsive integrated business management system for small
                  businesses. It offers inventory management, billing, and
                  reporting features to streamline operations and enhance
                  efficiency.
                </p>
              </FadeIn>

              <FadeIn delay={0.8}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user ? (
                    <ScaleOnHover>
                      <Button size="lg" asChild className="group">
                        <Link href="/dashboard">
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </ScaleOnHover>
                  ) : (
                    <>
                      <ScaleOnHover>
                        <Button size="lg" asChild className="group">
                          <Link href="/register">
                            Get Started Free
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </ScaleOnHover>
                      <ScaleOnHover>
                        <Button variant="outline" size="lg" asChild>
                          <Link href="/login">Sign In</Link>
                        </Button>
                      </ScaleOnHover>
                    </>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>

          {/* Animated Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <FadeIn delay={1} duration={2}>
              <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)] animate-pulse">
                <div className="aspect-1108/632 w-277 bg-linear-to-r from-primary/20 to-secondary/20 opacity-20" />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Benefits Section */}

        {/* CTA Section */}
        <section className="py-1 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            <FadeIn delay={0.2}>
              <h1>
                Needs registration to access the dashboard and manage your
                inventory and billing
              </h1>
            </FadeIn>
          </div>

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FadeIn delay={0.8} duration={3}>
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
            </FadeIn>
            <FadeIn delay={1.2} duration={3}>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
            </FadeIn>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/50 py-5">
          <div className="container mx-auto px-4">
            <FadeIn delay={0.2}>
              <StaggerContainer staggerDelay={0.15}>
                <div className="grid gap-8 md:grid-cols-4">
                  <StaggerItem>
                    <div>
                      <div className="flex items-center space-x-2 mb-4 group">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                          <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold">
                          Modern Inventory & Billing Management System
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Modern Inventory & Billing Management System is a Modern
                        and responsive integrated business management system for
                        small businesses
                      </p>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div>
                      <h3 className="font-semibold mb-3">Features</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Inventory
                        </li>
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Customers
                        </li>
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Vendors
                        </li>
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Sales & Purchases
                        </li>
                      </ul>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div>
                      <h3 className="font-semibold mb-3">&nbsp;</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Dashboard
                        </li>
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Payments
                        </li>
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Receipts
                        </li>
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Reports
                        </li>
                      </ul>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div>
                      <h3 className="font-semibold mb-3">Company</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          About Us
                        </li>
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Contact Us
                        </li>
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Privacy Policy
                        </li>
                        <li className="hover:text-foreground transition-colors cursor-pointer">
                          Terms of Service
                        </li>
                      </ul>
                    </div>
                  </StaggerItem>
                </div>
              </StaggerContainer>
            </FadeIn>

            <SlideIn direction="up" delay={0.6}>
              <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                <p>
                  &copy; 2026 Modern Inventory & Billing Management System. All
                  rights reserved.
                </p>
              </div>
            </SlideIn>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
