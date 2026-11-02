import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { graphqlClient } from "@/lib/graphql-client";

const AVAILABLE_GRADE_LEVELS = gql`
  query AvailableGradeLevels($curriculumId: String!) {
    availableGradeLevelsForCurriculum(curriculumId: $curriculumId) {
      id
      name
      code
      order
      age
    }
  }
`;

export interface AvailableGradeLevel {
  id: string;
  name: string;
  code: string;
  order: number;
  age?: number | null;
}

interface AvailableGradeLevelsResponse {
  availableGradeLevelsForCurriculum: AvailableGradeLevel[];
}

export function useAvailableGradeLevels(
  curriculumId?: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["availableGradeLevels", curriculumId],
    queryFn: async (): Promise<AvailableGradeLevel[]> => {
      if (!curriculumId) return [];
      const data = await graphqlClient.request<AvailableGradeLevelsResponse>(
        AVAILABLE_GRADE_LEVELS,
        { curriculumId },
      );
      return data.availableGradeLevelsForCurriculum ?? [];
    },
    enabled: enabled && Boolean(curriculumId),
    staleTime: 30_000,
  });
}
