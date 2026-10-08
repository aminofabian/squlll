"use client";

/**
 * School transport admin GraphQL API.
 *
 * Thin wrappers over the transport module's resolvers. Uses the same
 * `gqlRequest` shape as the other school API helpers (Bearer token from
 * localStorage, cookies included, first GraphQL error thrown).
 */

export type RouteStopDirection = "AM_PICKUP" | "PM_DROP";
export type TripDirection = "AM" | "PM";
export type TripStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "EMERGENCY";

export interface TransportVehicle {
  id: string;
  label: string;
  registrationNo?: string | null;
  capacity?: number | null;
  isActive: boolean;
  notes?: string | null;
}

export interface TransportDriver {
  id: string;
  userId: string;
  phoneNumber?: string | null;
  licenseNo?: string | null;
  isActive: boolean;
  notes?: string | null;
  user?: { id: string; name?: string | null; email?: string | null } | null;
}

export interface TransportStop {
  id: string;
  routeId: string;
  name: string;
  sequence: number;
  lat: number;
  lng: number;
  geofenceRadiusM: number;
  direction: RouteStopDirection;
  scheduledPickupTime?: string | null;
  notes?: string | null;
}

export interface TransportRoute {
  id: string;
  name: string;
  fee: number;
  billingCycleLabel?: string | null;
  stops?: TransportStop[] | null;
}

export interface TransportTripStop {
  id: string;
  scheduledAt: string;
  arrivedAt?: string | null;
  departedAt?: string | null;
  studentsExpected: number;
  studentsBoarded: number;
  studentsAbsent: number;
  status: string;
  routeStop?: { id: string; name: string } | null;
}

export interface TransportTrip {
  id: string;
  tripDate: string;
  direction: TripDirection;
  status: TripStatus;
  scheduledStartAt: string;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  delayMinutes: number;
  route?: { id: string; name: string } | null;
  vehicle?: { id: string; label: string } | null;
  driver?: { id: string } | null;
  stops?: TransportTripStop[] | null;
}

export interface OnboardDriverResult {
  accountCreated: boolean;
  generatedPassword?: string | null;
  driver: { id: string; userId: string };
  user?: { id: string; name?: string | null; email?: string | null } | null;
}

async function gqlRequest<T>(body: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const accessToken =
    typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch("/api/graphql", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "Request failed");
  }
  return payload.data as T;
}

// ── Vehicles ──────────────────────────────────────────────────────────

const VEHICLE_FIELDS = `id label registrationNo capacity isActive notes`;

export async function fetchVehicles(): Promise<TransportVehicle[]> {
  const data = await gqlRequest<{ vehicles: TransportVehicle[] }>({
    query: `query Vehicles { vehicles { ${VEHICLE_FIELDS} } }`,
  });
  return data.vehicles;
}

export interface VehicleInput {
  label: string;
  registrationNo?: string;
  capacity?: number;
  notes?: string;
}

export async function createVehicle(input: VehicleInput): Promise<TransportVehicle> {
  const data = await gqlRequest<{ createVehicle: TransportVehicle }>({
    query: `mutation CreateVehicle($input: CreateVehicleInput!) {
      createVehicle(input: $input) { ${VEHICLE_FIELDS} }
    }`,
    variables: { input },
  });
  return data.createVehicle;
}

export async function updateVehicle(
  input: Partial<VehicleInput> & { id: string; isActive?: boolean },
): Promise<TransportVehicle> {
  const data = await gqlRequest<{ updateVehicle: TransportVehicle }>({
    query: `mutation UpdateVehicle($input: UpdateVehicleInput!) {
      updateVehicle(input: $input) { ${VEHICLE_FIELDS} }
    }`,
    variables: { input },
  });
  return data.updateVehicle;
}

export async function removeVehicle(id: string): Promise<boolean> {
  const data = await gqlRequest<{ removeVehicle: boolean }>({
    query: `mutation RemoveVehicle($id: ID!) { removeVehicle(id: $id) }`,
    variables: { id },
  });
  return data.removeVehicle;
}

// ── Drivers ───────────────────────────────────────────────────────────

const DRIVER_FIELDS = `id userId phoneNumber licenseNo isActive notes user { id name email }`;

export async function fetchDrivers(): Promise<TransportDriver[]> {
  const data = await gqlRequest<{ drivers: TransportDriver[] }>({
    query: `query Drivers { drivers { ${DRIVER_FIELDS} } }`,
  });
  return data.drivers;
}

export interface OnboardDriverInput {
  userId?: string;
  email?: string;
  name?: string;
  password?: string;
  phoneNumber?: string;
  licenseNo?: string;
  notes?: string;
}

export async function onboardDriver(
  input: OnboardDriverInput,
): Promise<OnboardDriverResult> {
  const data = await gqlRequest<{ onboardDriver: OnboardDriverResult }>({
    query: `mutation OnboardDriver($input: OnboardDriverInput!) {
      onboardDriver(input: $input) {
        accountCreated generatedPassword
        driver { id userId }
        user { id name email }
      }
    }`,
    variables: { input },
  });
  return data.onboardDriver;
}

export async function updateDriver(input: {
  id: string;
  phoneNumber?: string;
  licenseNo?: string;
  isActive?: boolean;
  notes?: string;
}): Promise<TransportDriver> {
  const data = await gqlRequest<{ updateDriver: TransportDriver }>({
    query: `mutation UpdateDriver($input: UpdateDriverInput!) {
      updateDriver(input: $input) { ${DRIVER_FIELDS} }
    }`,
    variables: { input },
  });
  return data.updateDriver;
}

export async function removeDriver(id: string): Promise<boolean> {
  const data = await gqlRequest<{ removeDriver: boolean }>({
    query: `mutation RemoveDriver($id: ID!) { removeDriver(id: $id) }`,
    variables: { id },
  });
  return data.removeDriver;
}

// ── Routes & stops ────────────────────────────────────────────────────

const STOP_FIELDS = `id routeId name sequence lat lng geofenceRadiusM direction scheduledPickupTime notes`;
const ROUTE_FIELDS = `id name fee billingCycleLabel stops { ${STOP_FIELDS} }`;

export async function fetchTransportRoutes(): Promise<TransportRoute[]> {
  const data = await gqlRequest<{ transportRoutes: TransportRoute[] }>({
    query: `query TransportRoutes { transportRoutes { ${ROUTE_FIELDS} } }`,
  });
  return data.transportRoutes;
}

export async function createTransportRoute(input: {
  name: string;
  fee: number;
  billingCycleLabel?: string;
}): Promise<TransportRoute> {
  const data = await gqlRequest<{ createTransportRoute: TransportRoute }>({
    query: `mutation CreateTransportRoute($input: CreateTransportRouteInput!) {
      createTransportRoute(input: $input) { ${ROUTE_FIELDS} }
    }`,
    variables: { input },
  });
  return data.createTransportRoute;
}

export async function updateTransportRoute(input: {
  id: string;
  name?: string;
  fee?: number;
  billingCycleLabel?: string;
}): Promise<TransportRoute> {
  const data = await gqlRequest<{ updateTransportRoute: TransportRoute }>({
    query: `mutation UpdateTransportRoute($input: UpdateTransportRouteInput!) {
      updateTransportRoute(input: $input) { ${ROUTE_FIELDS} }
    }`,
    variables: { input },
  });
  return data.updateTransportRoute;
}

export async function removeTransportRoute(id: string): Promise<boolean> {
  const data = await gqlRequest<{ removeTransportRoute: boolean }>({
    query: `mutation RemoveTransportRoute($id: String!) { removeTransportRoute(id: $id) }`,
    variables: { id },
  });
  return data.removeTransportRoute;
}

export interface RouteStopInput {
  routeId: string;
  name: string;
  sequence: number;
  lat: number;
  lng: number;
  geofenceRadiusM?: number;
  direction?: RouteStopDirection;
  scheduledPickupTime?: string;
  notes?: string;
}

export async function addRouteStop(input: RouteStopInput): Promise<TransportStop> {
  const data = await gqlRequest<{ addRouteStop: TransportStop }>({
    query: `mutation AddRouteStop($input: AddRouteStopInput!) {
      addRouteStop(input: $input) { ${STOP_FIELDS} }
    }`,
    variables: { input },
  });
  return data.addRouteStop;
}

export async function updateRouteStop(
  input: Partial<RouteStopInput> & { id: string },
): Promise<TransportStop> {
  const data = await gqlRequest<{ updateRouteStop: TransportStop }>({
    query: `mutation UpdateRouteStop($input: UpdateRouteStopInput!) {
      updateRouteStop(input: $input) { ${STOP_FIELDS} }
    }`,
    variables: { input },
  });
  return data.updateRouteStop;
}

export async function removeRouteStop(id: string): Promise<boolean> {
  const data = await gqlRequest<{ removeRouteStop: boolean }>({
    query: `mutation RemoveRouteStop($id: ID!) { removeRouteStop(id: $id) }`,
    variables: { id },
  });
  return data.removeRouteStop;
}

// ── Student assignment ────────────────────────────────────────────────

export interface TransportAssignmentRow {
  id: string;
  studentId: string;
  status: string;
  pickupPoint?: string | null;
  student?: {
    id: string;
    admission_number?: string | null;
    user?: { id: string; name?: string | null } | null;
  } | null;
  routeStop?: { id: string; name: string } | null;
}

export interface StudentOption {
  id: string;
  name?: string | null;
  admission_number?: string | null;
}

export async function fetchRouteAssignments(
  routeId: string,
): Promise<TransportAssignmentRow[]> {
  const data = await gqlRequest<{ getAssignmentsByRoute: TransportAssignmentRow[] }>({
    query: `query RouteAssignments($routeId: String!) {
      getAssignmentsByRoute(routeId: $routeId) {
        id studentId status pickupPoint
        student { id admission_number user { id name } }
        routeStop { id name }
      }
    }`,
    variables: { routeId },
  });
  return data.getAssignmentsByRoute;
}

export async function assignStudentsToRoute(input: {
  routeId: string;
  studentIds: string[];
  routeStopId?: string;
}): Promise<number> {
  const data = await gqlRequest<{ assignStudentsToRoute: { id: string }[] }>({
    query: `mutation AssignStudentsToRoute($input: BulkTransportAssignmentInput!) {
      assignStudentsToRoute(input: $input) { id }
    }`,
    variables: { input },
  });
  return data.assignStudentsToRoute.length;
}

export async function removeStudentFromRoute(input: {
  studentId: string;
  routeId: string;
}): Promise<boolean> {
  const data = await gqlRequest<{ removeStudentFromRoute: boolean }>({
    query: `mutation RemoveStudentFromRoute($input: RemoveTransportAssignmentInput!) {
      removeStudentFromRoute(input: $input)
    }`,
    variables: { input },
  });
  return data.removeStudentFromRoute;
}

export async function fetchStudentsForTenant(): Promise<StudentOption[]> {
  const data = await gqlRequest<{ studentsForTenant: StudentOption[] }>({
    query: `query StudentsForTenant { studentsForTenant { id name admission_number } }`,
  });
  return data.studentsForTenant;
}

// ── Trips ─────────────────────────────────────────────────────────────

const TRIP_FIELDS = `
  id tripDate direction status scheduledStartAt actualStartAt actualEndAt delayMinutes
  route { id name }
  vehicle { id label }
  driver { id }
  stops {
    id scheduledAt arrivedAt departedAt
    studentsExpected studentsBoarded studentsAbsent status
    routeStop { id name }
  }`;

export interface TripFilter {
  date?: string;
  routeId?: string;
  status?: TripStatus;
}

export async function fetchTrips(filter?: TripFilter): Promise<TransportTrip[]> {
  const data = await gqlRequest<{ trips: TransportTrip[] }>({
    query: `query Trips($filter: TripsFilterInput) { trips(filter: $filter) { ${TRIP_FIELDS} } }`,
    variables: { filter },
  });
  return data.trips;
}

export async function materialiseTrips(input: {
  date: string;
  direction?: TripDirection;
}): Promise<{ id: string }[]> {
  const data = await gqlRequest<{ materialiseTrips: { id: string }[] }>({
    query: `mutation MaterialiseTrips($input: MaterialiseTripsInput!) {
      materialiseTrips(input: $input) { id }
    }`,
    variables: { input },
  });
  return data.materialiseTrips;
}

export async function assignTripCrew(input: {
  tripId: string;
  vehicleId?: string;
  driverId?: string;
  conductorId?: string;
}): Promise<TransportTrip> {
  const data = await gqlRequest<{ assignTripCrew: TransportTrip }>({
    query: `mutation AssignTripCrew($input: AssignTripCrewInput!) {
      assignTripCrew(input: $input) { ${TRIP_FIELDS} }
    }`,
    variables: { input },
  });
  return data.assignTripCrew;
}

export async function setTripAction(
  action: "startTrip" | "endTrip" | "cancelTrip",
  id: string,
): Promise<TransportTrip> {
  const data = await gqlRequest<Record<string, TransportTrip>>({
    query: `mutation TripAction($id: ID!) { ${action}(id: $id) { ${TRIP_FIELDS} } }`,
    variables: { id },
  });
  return data[action];
}

// ── Live tracking ─────────────────────────────────────────────────────

export interface LiveBus {
  tripId: string;
  routeId?: string | null;
  routeName?: string | null;
  vehicleLabel?: string | null;
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface TransportMapConfig {
  enabled: boolean;
  provider: string;
  styleUrl?: string | null;
  attribution?: string | null;
}

/** Every currently-active bus in the tenant (school admin command map). */
export async function fetchLiveBuses(): Promise<LiveBus[]> {
  const data = await gqlRequest<{ liveTenantBuses: LiveBus[] }>({
    query: `query LiveTenantBuses {
      liveTenantBuses { tripId routeId routeName vehicleLabel lat lng updatedAt }
    }`,
  });
  return data.liveTenantBuses;
}

/** The resolved map style (super-admin configured); `enabled` is false until set. */
export async function fetchTransportMapConfig(): Promise<TransportMapConfig> {
  const data = await gqlRequest<{ transportMapConfig: TransportMapConfig }>({
    query: `query TransportMapConfig {
      transportMapConfig { enabled provider styleUrl attribution }
    }`,
  });
  return data.transportMapConfig;
}

// ── Safety alerts & command-centre metrics ────────────────────────────

export type EmergencyAlertType =
  | "PANIC"
  | "BREAKDOWN"
  | "DEVIATION"
  | "LONG_STOP"
  | "UNRESPONSIVE";

export type EmergencyAlertStatus = "OPEN" | "ACKED" | "RESOLVED";

export type EmergencyAlertSource = "DRIVER" | "SYSTEM";

export interface EmergencyAlert {
  id: string;
  tripId: string;
  type: EmergencyAlertType;
  status: EmergencyAlertStatus;
  source: EmergencyAlertSource;
  lat?: number | null;
  lng?: number | null;
  note?: string | null;
  createdAt: string;
  ackedAt?: string | null;
  resolvedAt?: string | null;
}

export interface TransportOverviewMetrics {
  activeTrips: number;
  studentsTransported: number;
  onTimeRoutes: number;
  delayedRoutes: number;
  studentsAbsent: number;
  openAlerts: number;
  alertMttrSeconds?: number | null;
}

const ALERT_FIELDS = `id tripId type status source lat lng note createdAt ackedAt resolvedAt`;

export async function fetchEmergencyAlerts(
  status?: EmergencyAlertStatus,
): Promise<EmergencyAlert[]> {
  const data = await gqlRequest<{ emergencyAlerts: EmergencyAlert[] }>({
    query: `query EmergencyAlerts($filter: EmergencyAlertsFilterInput) {
      emergencyAlerts(filter: $filter) { ${ALERT_FIELDS} }
    }`,
    variables: { filter: status ? { status } : undefined },
  });
  return data.emergencyAlerts;
}

export async function acknowledgeEmergency(id: string): Promise<EmergencyAlert> {
  const data = await gqlRequest<{ acknowledgeEmergency: EmergencyAlert }>({
    query: `mutation AcknowledgeEmergency($id: ID!) {
      acknowledgeEmergency(id: $id) { ${ALERT_FIELDS} }
    }`,
    variables: { id },
  });
  return data.acknowledgeEmergency;
}

export async function resolveEmergency(
  id: string,
  note?: string,
): Promise<EmergencyAlert> {
  const data = await gqlRequest<{ resolveEmergency: EmergencyAlert }>({
    query: `mutation ResolveEmergency($id: ID!, $note: String) {
      resolveEmergency(id: $id, note: $note) { ${ALERT_FIELDS} }
    }`,
    variables: { id, note },
  });
  return data.resolveEmergency;
}

export async function fetchTransportOverviewMetrics(): Promise<TransportOverviewMetrics> {
  const data = await gqlRequest<{ transportOverviewMetrics: TransportOverviewMetrics }>({
    query: `query TransportOverviewMetrics {
      transportOverviewMetrics {
        activeTrips studentsTransported onTimeRoutes delayedRoutes
        studentsAbsent openAlerts alertMttrSeconds
      }
    }`,
  });
  return data.transportOverviewMetrics;
}

// ── Safety-detection thresholds ───────────────────────────────────────

export interface TransportSafetyThresholds {
  longStopRadiusM: number;
  longStopMinutes: number;
  deviationRadiusM: number;
  updatedAt?: string | null;
}

const SAFETY_SETTINGS_FIELDS = `longStopRadiusM longStopMinutes deviationRadiusM updatedAt`;

/** The tenant's automatic-detection thresholds (defaults when never tuned). */
export async function fetchTransportSafetySettings(): Promise<TransportSafetyThresholds> {
  const data = await gqlRequest<{ transportSafetySettings: TransportSafetyThresholds }>({
    query: `query TransportSafetySettings { transportSafetySettings { ${SAFETY_SETTINGS_FIELDS} } }`,
  });
  return data.transportSafetySettings;
}

export async function updateTransportSafetySettings(
  input: Partial<Omit<TransportSafetyThresholds, "updatedAt">>,
): Promise<TransportSafetyThresholds> {
  const data = await gqlRequest<{ updateTransportSafetySettings: TransportSafetyThresholds }>({
    query: `mutation UpdateTransportSafetySettings($input: UpdateTransportSafetySettingsInput!) {
      updateTransportSafetySettings(input: $input) { ${SAFETY_SETTINGS_FIELDS} }
    }`,
    variables: { input },
  });
  return data.updateTransportSafetySettings;
}
