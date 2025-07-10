"use client"

import React from "react";
import EnhancedTeacherDashboard from "./components/EnhancedTeacherDashboard";
import { useParams } from 'next/navigation';

export default function TeacherPage() {
  const params = useParams();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';
  return <EnhancedTeacherDashboard subdomain={subdomain} />;
} 