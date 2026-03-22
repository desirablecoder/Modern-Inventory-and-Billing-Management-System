"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Search, AlertTriangle, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FadeIn,
  BounceIn,
  SlideIn,
  AnimatedButton,
} from "@/components/animations";

export default function NotFoundPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated 404 Text */}
        <BounceIn delay={0.2}>
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold text-muted-foreground/20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center"></div>
          </div>
        </BounceIn>

        {/* Error Message */}
        <FadeIn delay={0.4}>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-2xl md:text-3xl font-semibold">
                Page Not Found
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved. Let&apos;s get you back on track!
            </p>
          </div>
        </FadeIn>

        {/* Navigation Actions */}
        <FadeIn delay={0.8}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/">
              <AnimatedButton>
                <div>
                  <Button variant="default">
                    <Home className="w-4 h-4 mr-2" />
                    Home Page
                  </Button>
                </div>
              </AnimatedButton>
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
