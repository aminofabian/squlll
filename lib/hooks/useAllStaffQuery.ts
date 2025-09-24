import { gql, useQuery } from "@apollo/client";
import { useState, useCallback } from "react";
import { StaffMember, StaffResponse } from "@/app/school/[subdomain]/(pages)/staff/types";

// Define the GraphQL query for all staff members
export const GET_ALL_STAFF = gql`
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

export function useAllStaffQuery() {
  const [error, setError] = useState<string | null>(null);
  
  // Execute the GraphQL query
  const { data, loading, refetch } = useQuery<StaffResponse>(GET_ALL_STAFF, {
    onError: (error) => {
      console.error("Error fetching staff:", error);
      setError(error.message);
    },
    fetchPolicy: "network-only" // Don't use cache for this query
  });

  const staffMembers = data?.getAllStaff || [];
  
  // Manual fetch function if needed
  const fetchStaffMembers = useCallback(async () => {
    try {
      const result = await refetch();
      return result.data?.getAllStaff || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch staff members";
      setError(errorMessage);
      throw error;
    }
  }, [refetch]);

  return {
    staffMembers,
    isLoading: loading,
    error,
    refetch: fetchStaffMembers
  };
}
