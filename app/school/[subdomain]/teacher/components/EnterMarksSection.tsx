"use client"

import React from "react";
import { ArrowLeft, CheckSquare, Calendar, Home } from "lucide-react";
import ExamsMarksComponent from "./ExamsMarksComponent";

interface EnterMarksSectionProps {
  subdomain: string;
  onBack: () => void;
}

export default function EnterMarksSection({ subdomain, onBack }: EnterMarksSectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-card/95 via-white/90 to-primary/10 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-primary/20 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-6 lg:px-10 lg:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CheckSquare className="w-6 h-6 text-primary-foreground text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Enter Marks</h1>
                <p className="text-sm text-muted-foreground/90 font-medium">Manage student exam results and performance tracking.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-primary/90 text-white font-semibold rounded-lg hover:bg-primary transition-all duration-300 shadow-lg"
              >
                <Home className="w-4 h-4" />
                Return to Main Menu
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-full border border-primary/10 shadow-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground/80">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <ExamsMarksComponent subdomain={subdomain} />
        </div>
      </div>
    </div>
  );
} 