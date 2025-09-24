"use client";

import { useState, useEffect } from "react";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";

// Define the GraphQL query
export const GET_ALL_STAFF = `
  query GetAllStaff {
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
      nationalId
      dateOfBirth
      dateOfJoining
      address
      emergencyContact
      emergencyContactPhone
      salary
      bankAccount
      bankName
      department
      supervisor
      jobDescription
      qualifications
      workExperience
      isActive
      hasCompletedProfile
      userId
      createdAt
      updatedAt
    }
  }
`;

// Define TypeScript interfaces for the staff data
export interface StaffMember {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  role: string;
  status: string;
  employeeId: string;
  nationalId: string;
  dateOfBirth: string;
  dateOfJoining: string;
  address: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  salary: number;
  bankAccount: string;
  bankName: string;
  department: string;
  supervisor: string;
  jobDescription: string;
  qualifications: string;
  workExperience: string;
  isActive: boolean;
  hasCompletedProfile: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffResponse {
  getAllStaff: StaffMember[];
}

export function useStaffMembers() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { config } = useSchoolConfigStore();

  const fetchStaffMembers = async () => {
    if (!config?.tenant?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // GraphQL query for staff members
      const query = GET_ALL_STAFF;

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff members');
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Error fetching staff members');
      }

      setStaffMembers(data.data.getAllStaff || []);
    } catch (err: any) {
      console.error("Error fetching staff members:", err);
      setError(err.message || 'Failed to load staff members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (config?.tenant?.id) {
      fetchStaffMembers();
    }
  }, [config?.tenant?.id]);

  const refetch = () => {
    fetchStaffMembers();
  };

  return {
    staffMembers,
    isLoading,
    error,
    refetch
  };
}
