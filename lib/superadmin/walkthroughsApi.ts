import { superAdminGraphqlRequest } from "./graphql";

/**
 * GraphQL enums are registered by their TS key, so the wire values are UPPERCASE
 * even though the column stores lowercase (same as AdmissionApplicationStatus).
 */
export type WalkthroughStatus = "NEW" | "CONTACTED" | "SCHEDULED" | "CLOSED";

export interface WalkthroughRequestRecord {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  phone: string | null;
  role: string | null;
  county: string | null;
  studentCount: string | null;
  preferredTime: string | null;
  message: string | null;
  status: WalkthroughStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

const WALKTHROUGH_FIELDS = `
  id
  name
  email
  schoolName
  phone
  role
  county
  studentCount
  preferredTime
  message
  status
  adminNotes
  createdAt
  updatedAt
`;

const WALKTHROUGH_REQUESTS_QUERY = `
  query WalkthroughRequests {
    walkthroughRequests {
      ${WALKTHROUGH_FIELDS}
    }
  }
`;

const UPDATE_WALKTHROUGH_REQUEST_MUTATION = `
  mutation UpdateWalkthroughRequest($input: UpdateWalkthroughRequestInput!) {
    updateWalkthroughRequest(input: $input) {
      ${WALKTHROUGH_FIELDS}
    }
  }
`;

export interface UpdateWalkthroughInput {
  id: string;
  status?: WalkthroughStatus;
  adminNotes?: string;
}

export async function fetchWalkthroughRequests(): Promise<
  WalkthroughRequestRecord[]
> {
  const data = await superAdminGraphqlRequest<{
    walkthroughRequests: WalkthroughRequestRecord[];
  }>(WALKTHROUGH_REQUESTS_QUERY);
  return data.walkthroughRequests ?? [];
}

export async function updateWalkthroughRequest(
  input: UpdateWalkthroughInput,
): Promise<WalkthroughRequestRecord> {
  const data = await superAdminGraphqlRequest<{
    updateWalkthroughRequest: WalkthroughRequestRecord;
  }>(UPDATE_WALKTHROUGH_REQUEST_MUTATION, { input });
  return data.updateWalkthroughRequest;
}
