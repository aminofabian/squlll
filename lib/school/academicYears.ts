/**
 * School Years (Academic Years + Terms) GraphQL module.
 *
 * Query strings, typed fetch functions and interfaces for the `/school-years`
 * page. Every call goes through {@link chatGraphqlFetch}, which resolves to the
 * query `data` object and throws on GraphQL or transport errors.
 */

import { chatGraphqlFetch } from "@/lib/chat/graphql";

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  terms: Term[];
}

export interface CreateAcademicYearInput {
  name: string;
  startDate: string;
  endDate: string;
}

export interface CreateTermInput {
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  halfTermStartDate?: string;
  halfTermEndDate?: string;
}

export const ACADEMIC_YEARS_QUERY = `
  query AcademicYears {
    academicYears {
      id
      name
      startDate
      endDate
      isActive
      isCurrent
      terms {
        id
        name
        startDate
        endDate
        isActive
        isCurrent
      }
    }
  }
`;

export const CREATE_ACADEMIC_YEAR_MUTATION = `
  mutation CreateAcademicYear($input: CreateAcademicYearInput!) {
    createAcademicYear(input: $input) {
      id
    }
  }
`;

export const CREATE_TERM_MUTATION = `
  mutation CreateTerm($input: CreateTermInput!) {
    createTerm(input: $input) {
      id
    }
  }
`;

export const DELETE_ACADEMIC_YEAR_MUTATION = `
  mutation DeleteAcademicYear($id: ID!) {
    deleteAcademicYear(id: $id)
  }
`;

export const DELETE_TERM_MUTATION = `
  mutation DeleteTerm($id: ID!) {
    deleteTerm(id: $id)
  }
`;

export async function fetchAcademicYears(
  subdomain: string,
): Promise<AcademicYear[]> {
  const data = await chatGraphqlFetch<{ academicYears: AcademicYear[] }>(
    ACADEMIC_YEARS_QUERY,
    {},
    subdomain,
  );
  return data.academicYears ?? [];
}

export async function createAcademicYear(
  subdomain: string,
  input: CreateAcademicYearInput,
): Promise<{ id: string }> {
  const data = await chatGraphqlFetch<{
    createAcademicYear: { id: string };
  }>(CREATE_ACADEMIC_YEAR_MUTATION, { input }, subdomain);
  return data.createAcademicYear;
}

export async function createTerm(
  subdomain: string,
  input: CreateTermInput,
): Promise<{ id: string }> {
  const data = await chatGraphqlFetch<{ createTerm: { id: string } }>(
    CREATE_TERM_MUTATION,
    { input },
    subdomain,
  );
  return data.createTerm;
}

export async function deleteAcademicYear(
  subdomain: string,
  id: string,
): Promise<boolean> {
  const data = await chatGraphqlFetch<{ deleteAcademicYear: boolean }>(
    DELETE_ACADEMIC_YEAR_MUTATION,
    { id },
    subdomain,
  );
  return data.deleteAcademicYear;
}

export async function deleteTerm(
  subdomain: string,
  id: string,
): Promise<boolean> {
  const data = await chatGraphqlFetch<{ deleteTerm: boolean }>(
    DELETE_TERM_MUTATION,
    { id },
    subdomain,
  );
  return data.deleteTerm;
}
