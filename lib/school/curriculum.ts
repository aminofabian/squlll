/**
 * Curriculum (tenant subjects) GraphQL access.
 *
 * School pages talk to the tenant GraphQL endpoint through
 * `chatGraphqlFetch`, passing the active subdomain so the API can resolve the
 * tenant. A curriculum is identified by its `Level.id` (the `curriculumId`
 * used across the app — see the classes page).
 */

import { chatGraphqlFetch } from "@/lib/chat/graphql";

/** A subject as attached to a tenant's curriculum (read-only view). */
export interface TenantSubjectView {
  id: string;
  curriculumId: string;
  subjectName: string;
  subjectCode: string;
  subjectType: string;
  creditHours: number | null;
  passingMarks: number | null;
  totalMarks: number | null;
  isActive: boolean;
  isCompulsory: boolean;
}

/** A catalog subject that can be attached to a curriculum. */
export interface AvailableCurriculumSubject {
  subjectId: string;
  name: string;
  code: string;
  subjectType: string;
  category: string | null;
  department: string | null;
}

/** Requirement for a subject on a curriculum. */
export type CurriculumSubjectType = "CORE" | "ELECTIVE";

export interface AssignSubjectInput {
  curriculumId: string;
  subjectId: string;
  subjectType?: CurriculumSubjectType;
  isCompulsory?: boolean;
  creditHours?: number;
  passingMarks?: number;
  totalMarks?: number;
}

export const TENANT_SUBJECTS_QUERY = `
  query TenantSubjects($curriculumId: String) {
    getTenantSubjects(curriculumId: $curriculumId) {
      id
      curriculumId
      subjectName
      subjectCode
      subjectType
      creditHours
      passingMarks
      totalMarks
      isActive
      isCompulsory
    }
  }
`;

/**
 * Fetch the subjects offered for a tenant curriculum. Omitting `curriculumId`
 * returns every subject across the tenant's curricula.
 */
export async function fetchTenantSubjects(
  subdomain: string,
  curriculumId?: string,
): Promise<TenantSubjectView[]> {
  const data = await chatGraphqlFetch<{
    getTenantSubjects: TenantSubjectView[];
  }>(
    TENANT_SUBJECTS_QUERY,
    { curriculumId: curriculumId ?? null },
    subdomain,
  );
  return data.getTenantSubjects ?? [];
}

const AVAILABLE_SUBJECTS_QUERY = `
  query AvailableSubjects($curriculumId: String!) {
    availableSubjectsForCurriculum(curriculumId: $curriculumId) {
      subjectId
      name
      code
      subjectType
      category
      department
    }
  }
`;

const ASSIGN_SUBJECT_MUTATION = `
  mutation AssignSubjectToLevel($input: CreateTenantSubjectInput!) {
    assignSubjectToLevel(input: $input) {
      id
      name
      subjectType
    }
  }
`;

const DEACTIVATE_SUBJECT_MUTATION = `
  mutation DeactivateTenantSubject($tenantSubjectId: String!) {
    deactivateTenantSubject(tenantSubjectId: $tenantSubjectId)
  }
`;

/** Catalog subjects not yet attached to the given curriculum. */
export async function fetchAvailableSubjects(
  subdomain: string,
  curriculumId: string,
): Promise<AvailableCurriculumSubject[]> {
  const data = await chatGraphqlFetch<{
    availableSubjectsForCurriculum: AvailableCurriculumSubject[];
  }>(AVAILABLE_SUBJECTS_QUERY, { curriculumId }, subdomain);
  return data.availableSubjectsForCurriculum ?? [];
}

/** Attach a catalog subject to a curriculum. */
export async function assignSubjectToLevel(
  subdomain: string,
  input: AssignSubjectInput,
): Promise<void> {
  await chatGraphqlFetch<{ assignSubjectToLevel: { id: string } }>(
    ASSIGN_SUBJECT_MUTATION,
    { input },
    subdomain,
  );
}

/** Remove a subject from a curriculum (soft-deactivates the tenant subject). */
export async function deactivateTenantSubject(
  subdomain: string,
  tenantSubjectId: string,
): Promise<boolean> {
  const data = await chatGraphqlFetch<{ deactivateTenantSubject: boolean }>(
    DEACTIVATE_SUBJECT_MUTATION,
    { tenantSubjectId },
    subdomain,
  );
  return data.deactivateTenantSubject;
}
