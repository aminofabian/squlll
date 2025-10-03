"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Search } from "lucide-react";
import { StudentLedger } from "./StudentLedger";
import { useStudentLedger } from "@/lib/hooks/use-student-ledger";

export function StudentLedgerDemo() {
  const [studentId, setStudentId] = useState("7194c10a-e380-49d9-8175-b1783bb5d78d");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [isSearching, setIsSearching] = useState(false);

  const { ledgerData, loading, error, refetch } = useStudentLedger({
    studentId,
    dateRange: {
      startDate,
      endDate
    },
    skip: !isSearching
  });

  const handleSearch = () => {
    setIsSearching(true);
    refetch();
  };

  const handleReset = () => {
    setIsSearching(false);
    setStudentId("7194c10a-e380-49d9-8175-b1783bb5d78d");
    setStartDate("2024-01-01");
    setEndDate("2024-12-31");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Search Form */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Student Ledger Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-sm font-mono">
                Student ID
              </Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter student ID"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-mono">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-mono">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="font-mono"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : "Search Ledger"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="font-mono"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Display */}
      {isSearching && (
        <StudentLedger 
          ledgerData={ledgerData}
          loading={loading}
          error={error}
        />
      )}

      {/* Instructions */}
      {!isSearching && (
        <Card className="border-2 border-dashed border-primary/20">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-medium text-slate-600 mb-2">
              Ready to View Student Ledger
            </h3>
            <p className="text-sm text-slate-500 font-mono mb-4">
              Enter a student ID and date range above, then click "Search Ledger" to view the student's financial transaction history.
            </p>
            <div className="text-xs text-muted-foreground font-mono">
              <p>Default student ID: 7194c10a-e380-49d9-8175-b1783bb5d78d</p>
              <p>Default date range: 2024-01-01 to 2024-12-31</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
