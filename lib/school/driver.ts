/**
 * Driver web GraphQL — the caller's own trips (drivers/conductors).
 *
 * Mirrors the mobile driver documents (`mobile/src/api/graphql/driver.ts`) so the
 * web run-sheet behaves the same as the app. All calls go through
 * `chatGraphqlFetch`, which resolves to the query `data` and throws on errors.
 */

import { chatGraphqlFetch } from "@/lib/chat/graphql";

export type TripStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "EMERGENCY";

export type TripStopStatus = "PENDING" | "ARRIVED" | "DEPARTED" | "SKIPPED";

export type BoardingEventType =
  | "BOARDED"
  | "DROPPED_AT_SCHOOL"
  | "PICKED_FROM_SCHOOL"
  | "DROPPED_AT_HOME"
  | "MARKED_ABSENT"
  | "NO_SHOW"
  | "EXCUSED";

export interface DriverTripStop {
  id: string;
  scheduledAt: string;
  arrivedAt?: string | null;
  departedAt?: string | null;
  studentsExpected: number;
  studentsBoarded: number;
  studentsAbsent: number;
  status: TripStopStatus;
  routeStop?: { id: string; name: string } | null;
}

export interface DriverTrip {
  id: string;
  tripDate: string;
  direction: "AM" | "PM";
  status: TripStatus;
  scheduledStartAt: string;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  delayMinutes: number;
  route?: { id: string; name: string } | null;
  vehicle?: { id: string; label: string } | null;
  stops?: DriverTripStop[] | null;
}

export interface DriverTripStudent {
  studentId: string;
  name: string;
  admissionNumber?: string | null;
  routeStopId?: string | null;
  routeStopName?: string | null;
  eventType?: BoardingEventType | null;
}

export interface MarkJourneyEventInput {
  tripId: string;
  studentId: string;
  type: BoardingEventType;
  routeStopId?: string | null;
  note?: string | null;
}

const TRIP_STOP_FIELDS = `
  id scheduledAt arrivedAt departedAt
  studentsExpected studentsBoarded studentsAbsent status
  routeStop { id name }
`;

const TRIP_FIELDS = `
  id tripDate direction status scheduledStartAt actualStartAt actualEndAt delayMinutes
  route { id name }
  vehicle { id label }
  stops { ${TRIP_STOP_FIELDS} }
`;

const MY_DRIVER_TRIPS = `
  query MyDriverTrips($date: String) {
    myDriverTrips(date: $date) { ${TRIP_FIELDS} }
  }
`;

const MY_DRIVER_TRIP = `
  query MyDriverTrip($id: ID!) {
    myDriverTrip(id: $id) { ${TRIP_FIELDS} }
  }
`;

const MY_DRIVER_TRIP_STUDENTS = `
  query MyDriverTripStudents($tripId: ID!) {
    myDriverTripStudents(tripId: $tripId) {
      studentId name admissionNumber routeStopId routeStopName eventType
    }
  }
`;

const MARK_MY_STOP_ARRIVED = `
  mutation MarkMyStopArrived($tripStopId: ID!) {
    markMyStopArrived(tripStopId: $tripStopId) { id arrivedAt status }
  }
`;

const MARK_MY_STOP_DEPARTED = `
  mutation MarkMyStopDeparted($tripStopId: ID!) {
    markMyStopDeparted(tripStopId: $tripStopId) { id departedAt status }
  }
`;

const MARK_MY_JOURNEY_EVENT = `
  mutation MarkMyJourneyEvent($input: MarkJourneyEventInput!) {
    markMyJourneyEvent(input: $input) { id type }
  }
`;

/** Calendar date in East Africa Time — the app's operating timezone. */
export function todayIso(now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Nairobi",
    }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

export async function fetchMyDriverTrips(
  subdomain: string,
  date: string,
): Promise<DriverTrip[]> {
  const data = await chatGraphqlFetch<{ myDriverTrips: DriverTrip[] }>(
    MY_DRIVER_TRIPS,
    { date },
    subdomain,
  );
  return data.myDriverTrips ?? [];
}

export async function fetchMyDriverTrip(
  subdomain: string,
  id: string,
): Promise<DriverTrip | null> {
  const data = await chatGraphqlFetch<{ myDriverTrip: DriverTrip | null }>(
    MY_DRIVER_TRIP,
    { id },
    subdomain,
  );
  return data.myDriverTrip ?? null;
}

export async function fetchMyDriverTripStudents(
  subdomain: string,
  tripId: string,
): Promise<DriverTripStudent[]> {
  const data = await chatGraphqlFetch<{
    myDriverTripStudents: DriverTripStudent[];
  }>(MY_DRIVER_TRIP_STUDENTS, { tripId }, subdomain);
  return data.myDriverTripStudents ?? [];
}

export async function markMyStopArrived(
  subdomain: string,
  tripStopId: string,
): Promise<void> {
  await chatGraphqlFetch(MARK_MY_STOP_ARRIVED, { tripStopId }, subdomain);
}

export async function markMyStopDeparted(
  subdomain: string,
  tripStopId: string,
): Promise<void> {
  await chatGraphqlFetch(MARK_MY_STOP_DEPARTED, { tripStopId }, subdomain);
}

export async function markMyJourneyEvent(
  subdomain: string,
  input: MarkJourneyEventInput,
): Promise<void> {
  await chatGraphqlFetch(MARK_MY_JOURNEY_EVENT, { input }, subdomain);
}
