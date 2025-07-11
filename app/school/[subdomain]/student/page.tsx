"use client"

import React from "react";
import EnhancedStudentDashboard from "./components/EnhancedStudentDashboard";
import { useParams } from 'next/navigation';

export default function StudentPage() {
  const params = useParams();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';
  return <EnhancedStudentDashboard subdomain={subdomain} />;
} 