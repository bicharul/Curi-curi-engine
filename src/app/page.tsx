"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bike, Search, Shield, Zap } from "lucide-react";
import { ReportBikeDialog } from "@/components/ReportBikeDialog";
import { CheckBikeDialog } from "@/components/CheckBikeDialog";

export default function Home() {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showCheckDialog, setShowCheckDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full">
                  <Bike className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6">
              Curi Engine
              <span className="block text-2xl sm:text-4xl font-normal text-slate-600 dark:text-slate-400 mt-2">
                Search Engine Motor Curian
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              A robust, real-time web platform to combat motorcycle theft. 
              Report lost bikes instantly and check potential stolen vehicles with our powerful search engine.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg"
                onClick={() => setShowCheckDialog(true)}
              >
                <Search className="mr-2 h-5 w-5" />
                Check a Bike
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 text-lg border-slate-300 dark:border-slate-700"
                onClick={() => setShowReportDialog(true)}
              >
                <Shield className="mr-2 h-5 w-5" />
                Report Lost Bike
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900 bg-[length:60px_60px] -z-10"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              How Curi Engine Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our comprehensive system helps protect motorcycles and recover stolen vehicles through community-powered reporting and intelligent search.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl">Report Lost Bikes</CardTitle>
                <CardDescription>
                  Quickly file detailed reports with photos, VIN numbers, and theft information to help track your stolen motorcycle.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Instant Search</CardTitle>
                <CardDescription>
                  Search by VIN, engine number, or plate number with real-time results and fuzzy matching for typo tolerance.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Real-time Updates</CardTitle>
                <CardDescription>
                  Get instant notifications when your bike is found or when new matches are discovered in our database.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                24/7
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Monitoring
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                &lt;1s
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Search Time
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                100%
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Secure
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                ∞
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Database
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join the Fight Against Motorcycle Theft
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Be part of our community-driven platform. Report stolen bikes, help others find their motorcycles, and make our roads safer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="px-8 py-3 text-lg"
              onClick={() => setShowReportDialog(true)}
            >
              Get Started Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-orange-600"
              onClick={() => setShowCheckDialog(true)}
            >
              Try Search Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Bike className="h-8 w-8 text-orange-500 mr-3" />
              <span className="text-xl font-bold">Curi Engine</span>
            </div>
            <div className="flex gap-6">
              <Badge variant="outline" className="border-slate-700 text-slate-400">
                Secure
              </Badge>
              <Badge variant="outline" className="border-slate-700 text-slate-400">
                Fast
              </Badge>
              <Badge variant="outline" className="border-slate-700 text-slate-400">
                Reliable
              </Badge>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
            <p>&copy; 2024 Curi Engine. Empowering citizens, deterring thieves, and bringing stolen bikes home.</p>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <ReportBikeDialog 
        open={showReportDialog} 
        onOpenChange={setShowReportDialog} 
      />
      <CheckBikeDialog 
        open={showCheckDialog} 
        onOpenChange={setShowCheckDialog} 
      />
    </div>
  );
}