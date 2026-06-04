"use client";

import { useCallback, useEffect, useState } from "react";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";

export type StudentLinkedParent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  userId?: string | null;
  isActive: boolean;
};

const GET_PARENTS_FOR_STUDENT = gql`
  query GetParentsForStudent($studentId: String!) {
    teacherGetParentsByStudentId(studentId: $studentId) {
      id
      name
      email
      phone
      userId
      isActive
    }
  }
`;

export function useStudentParents(studentId: string | null | undefined) {
  const [parents, setParents] = useState<StudentLinkedParent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParents = useCallback(async () => {
    if (!studentId) {
      setParents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await graphqlClient.request<{
        teacherGetParentsByStudentId: StudentLinkedParent[];
      }>(GET_PARENTS_FOR_STUDENT, { studentId });

      setParents(response.teacherGetParentsByStudentId ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load parents");
      setParents([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void fetchParents();
  }, [fetchParents]);

  return { parents, loading, error, refetch: fetchParents };
}
