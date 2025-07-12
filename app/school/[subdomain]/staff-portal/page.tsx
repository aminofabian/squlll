"use client"

import React from "react";
import EnhancedStaffDashboard from "./components/EnhancedStaffDashboard";
import { useParams } from 'next/navigation';

export default function StaffPortalPage() {
  const params = useParams();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';
  
  return <EnhancedStaffDashboard subdomain={subdomain} />;
}
