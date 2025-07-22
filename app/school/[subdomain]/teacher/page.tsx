"use client"

import React from "react";
import EnhancedTeacherDashboard from "./components/EnhancedTeacherDashboard";
import { useParams } from 'next/navigation';
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig';

export default function TeacherPage() {
  const params = useParams();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';
  
  // Load school configuration to populate the store with live grades and subjects
  useSchoolConfig();
  
  return <EnhancedTeacherDashboard subdomain={subdomain} />;
} 