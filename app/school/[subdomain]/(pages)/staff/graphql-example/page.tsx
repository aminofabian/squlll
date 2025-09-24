"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StaffTable } from "../components/StaffTable";
import { UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StaffGraphQLExample() {
  const [activeTab, setActiveTab] = useState("all-staff");

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="border-b-2 border-primary/20 pb-6">
        <div className="flex flex-col gap-2">
          <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
            <span className="text-xs font-mono uppercase tracking-wide text-primary">
              Staff Management (GraphQL)
            </span>
          </div>
          <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
            School Staff Directory
          </h1>
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Manage teaching and non-teaching staff using GraphQL query
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white font-mono">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        defaultValue="all-staff" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all-staff">All Staff</TabsTrigger>
          <TabsTrigger value="teaching">Teaching</TabsTrigger>
          <TabsTrigger value="admin">Administrative</TabsTrigger>
        </TabsList>

        <TabsContent value="all-staff" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-mono font-semibold">All Staff Members</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Complete list of all teaching and non-teaching staff
            </p>
          </div>
          
          <StaffTable />
        </TabsContent>

        <TabsContent value="teaching" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-mono font-semibold">Teaching Staff</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              All teachers and academic staff members
            </p>
          </div>
          
          {/* TODO: Add filtered staff table */}
          <div className="border-2 border-primary/20 p-8 rounded-xl">
            <p className="text-slate-600 dark:text-slate-400 text-center">
              Teaching staff filter would be implemented here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="admin" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-mono font-semibold">Administrative Staff</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              All non-teaching and administrative staff members
            </p>
          </div>
          
          {/* TODO: Add filtered staff table */}
          <div className="border-2 border-primary/20 p-8 rounded-xl">
            <p className="text-slate-600 dark:text-slate-400 text-center">
              Administrative staff filter would be implemented here
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Information */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 mt-8">
        <h3 className="font-mono font-bold text-lg mb-2">GraphQL Query Example</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          This page demonstrates using the GraphQL query for fetching staff members:
        </p>
        <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-sm">
{`query GetAllStaff {
  getAllStaff {
    id
    fullName
    firstName
    lastName
    email
    phoneNumber
    gender
    role
    status
    employeeId
    // ... other fields
  }
}`}
        </pre>
      </div>
    </div>
  );
}
