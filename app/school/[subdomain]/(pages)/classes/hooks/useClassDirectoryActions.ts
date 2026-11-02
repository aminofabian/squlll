"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { graphqlClient } from "@/lib/graphql-client";
import type { CampusClassUnit } from "../components/ClassesCampusOverview";

const UPDATE_TENANT_GRADE_LEVEL = gql`
  mutation UpdateTenantGradeLevel($input: UpdateTenantGradeLevelInput!) {
    updateTenantGradeLevel(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_STREAM = gql`
  mutation UpdateClassStream($input: UpdateStreamInput!) {
    updateStream(input: $input) {
      id
      name
      capacity
    }
  }
`;

const CREATE_TENANT_GRADE_LEVEL = gql`
  mutation CreateTenantGradeLevel(
    $curriculumId: String!
    $gradeLevelId: String!
  ) {
    createTenantGradeLevel(
      curriculumId: $curriculumId
      gradeLevelId: $gradeLevelId
    ) {
      id
      name
    }
  }
`;

const DELETE_TENANT_GRADE_LEVEL = gql`
  mutation DeleteClassGradeLevel($tenantGradeLevelId: String!) {
    deleteTenantGradeLevel(tenantGradeLevelId: $tenantGradeLevelId)
  }
`;

const DELETE_TENANT_STREAM = gql`
  mutation DeleteClassStream($tenantStreamId: String!) {
    deleteTenantStream(tenantStreamId: $tenantStreamId)
  }
`;

const GET_TENANT_STREAMS = gql`
  query GetClassTenantStreams($tenantGradeLevelId: String) {
    getTenantStreams(tenantGradeLevelId: $tenantGradeLevelId) {
      id
      stream {
        id
        name
      }
    }
  }
`;

interface TenantStreamRow {
  id: string;
  stream?: { id: string; name?: string } | null;
}

export function useClassDirectoryActions() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const invalidate = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["schoolConfig"] }),
      queryClient.invalidateQueries({ queryKey: ["gradeLevelsForSchoolType"] }),
      queryClient.invalidateQueries({ queryKey: ["availableGradeLevels"] }),
      queryClient.invalidateQueries({ queryKey: ["campusClassTeachers"] }),
      queryClient.invalidateQueries({ queryKey: ["tenantStatistics"] }),
    ]);
  }, [queryClient]);

  const renameClass = useCallback(
    async (unit: CampusClassUnit, name: string) => {
      setIsSaving(true);
      try {
        await graphqlClient.request(UPDATE_TENANT_GRADE_LEVEL, {
          input: { id: unit.gradeId, name: name.trim() },
        });
        await invalidate();
      } finally {
        setIsSaving(false);
      }
    },
    [invalidate],
  );

  const renameStream = useCallback(
    async (unit: CampusClassUnit, name: string) => {
      if (!unit.streamId) {
        throw new Error("This class does not have a stream to edit");
      }
      setIsSaving(true);
      try {
        await graphqlClient.request(UPDATE_STREAM, {
          input: {
            id: unit.streamId,
            name: name.trim(),
          },
        });
        await invalidate();
      } finally {
        setIsSaving(false);
      }
    },
    [invalidate],
  );

  const createGrade = useCallback(
    async (curriculumId: string, gradeLevelId: string) => {
      setIsSaving(true);
      try {
        const data = await graphqlClient.request<{
          createTenantGradeLevel: { id: string; name?: string };
        }>(CREATE_TENANT_GRADE_LEVEL, { curriculumId, gradeLevelId });
        await invalidate();
        return data.createTenantGradeLevel;
      } finally {
        setIsSaving(false);
      }
    },
    [invalidate],
  );

  const deleteGrade = useCallback(
    async (unit: CampusClassUnit) => {
      setIsDeleting(true);
      try {
        await graphqlClient.request(DELETE_TENANT_GRADE_LEVEL, {
          tenantGradeLevelId: unit.gradeId,
        });
        await invalidate();
      } finally {
        setIsDeleting(false);
      }
    },
    [invalidate],
  );

  const deleteStream = useCallback(
    async (unit: CampusClassUnit) => {
      if (!unit.streamId) {
        throw new Error("This class does not have a stream to delete");
      }
      setIsDeleting(true);
      try {
        const data = await graphqlClient.request<{
          getTenantStreams: TenantStreamRow[];
        }>(GET_TENANT_STREAMS, { tenantGradeLevelId: unit.gradeId });
        const match = (data.getTenantStreams ?? []).find(
          (row) => row.stream?.id === unit.streamId,
        );
        if (!match) {
          throw new Error(
            `Could not find the stream for ${unit.label}. Refresh and try again.`,
          );
        }
        await graphqlClient.request(DELETE_TENANT_STREAM, {
          tenantStreamId: match.id,
        });
        await invalidate();
      } finally {
        setIsDeleting(false);
      }
    },
    [invalidate],
  );

  const deleteClasses = useCallback(
    async (units: CampusClassUnit[], allUnits: CampusClassUnit[]) => {
      if (units.length === 0) return;
      if (units.some((unit) => unit.studentCount > 0)) {
        throw new Error(
          "One of these classes still has students. Move them before deleting.",
        );
      }

      setIsDeleting(true);
      try {
        const byGrade = new Map<string, CampusClassUnit[]>();
        for (const unit of units) {
          const group = byGrade.get(unit.gradeId) ?? [];
          group.push(unit);
          byGrade.set(unit.gradeId, group);
        }

        const fullGradeDeletes: string[] = [];
        const streamDeletes: CampusClassUnit[] = [];
        const tenantStreamsByGrade = new Map<string, TenantStreamRow[]>();

        for (const [gradeId, selected] of byGrade) {
          const all = allUnits.filter((unit) => unit.gradeId === gradeId);
          if (selected.length === all.length) {
            fullGradeDeletes.push(gradeId);
            continue;
          }

          const data = await graphqlClient.request<{
            getTenantStreams: TenantStreamRow[];
          }>(GET_TENANT_STREAMS, { tenantGradeLevelId: gradeId });
          tenantStreamsByGrade.set(gradeId, data.getTenantStreams ?? []);
          streamDeletes.push(...selected);
        }

        for (const gradeId of fullGradeDeletes) {
          await graphqlClient.request(DELETE_TENANT_GRADE_LEVEL, {
            tenantGradeLevelId: gradeId,
          });
        }

        for (const unit of streamDeletes) {
          const rows = tenantStreamsByGrade.get(unit.gradeId) ?? [];
          const match = rows.find(
            (row) => row.stream?.id === unit.streamId,
          );
          if (!match) {
            throw new Error(
              `Could not find the stream for ${unit.label}. Refresh and try again.`,
            );
          }
          await graphqlClient.request(DELETE_TENANT_STREAM, {
            tenantStreamId: match.id,
          });
        }

        await invalidate();
      } finally {
        setIsDeleting(false);
      }
    },
    [invalidate],
  );

  return {
    createGrade,
    renameClass,
    renameStream,
    deleteClasses,
    deleteGrade,
    deleteStream,
    isSaving,
    isDeleting,
  };
}
