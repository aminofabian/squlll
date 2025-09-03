"use client"

import React from "react";
import EnhancedTeacherDashboard from "./components/EnhancedTeacherDashboard";
import { useParams } from 'next/navigation';

export default function TeacherPage() {
  const params = useParams();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';
  
  // Note: We no longer need to load school configuration for teachers
  // Teachers now use their specific assigned grades and subjects via useTeacherData
  // School configuration is mainly for admin users
  
  return <EnhancedTeacherDashboard subdomain={subdomain} />;
} 