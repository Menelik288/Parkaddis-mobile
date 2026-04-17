import apiClient from '../api/client';
import dayjs from 'dayjs';

/** Matches dashboard fallback when API omits totals (see app/(tabs)/index.tsx). */
const FALLBACK_ETB_PER_HOUR = 25;

function parseMoney(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Start/end instants used for duration × rate (depends on status). */
function getPricingTimeWindow(r: Reservation): { start: dayjs.Dayjs; end: dayjs.Dayjs } | null {
  const o = r as unknown as Record<string, unknown>;
  const status = String(r.status ?? '').toUpperCase();

  const firstIso = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = o[k];
      if (typeof v === 'string' && v.length > 0) return v;
    }
    return undefined;
  };

  const schedStart = dayjs(r.startTime);
  const schedEnd = dayjs(r.endTime);

  // Cancelled: always scheduled booking window
  if (status === 'CANCELLED' || status === 'EXPIRED') {
    if (!schedStart.isValid() || !schedEnd.isValid()) return null;
    return { start: schedStart, end: schedEnd };
  }

  // Completed / paid (incl. unpaid completed): real session when API sends it
  if (status === 'COMPLETED' || status === 'PAID' || status === 'UNPAID') {
    const aStart = firstIso(
      'actualStartTime',
      'actual_start_time',
      'actualStart',
      'actual_start',
      'sessionStartTime',
      'session_started_at',
      'sessionStartedAt',
      'enteredAt',
      'checkedInAt',
      'startedAt',
      'realStartTime'
    );
    const aEnd = firstIso(
      'actualEndTime',
      'actual_end_time',
      'actualEnd',
      'actual_end',
      'sessionEndTime',
      'session_ended_at',
      'sessionEndedAt',
      'exitedAt',
      'checkedOutAt',
      'completedAt',
      'endedAt',
      'realEndTime'
    );
    const s = aStart ? dayjs(aStart) : schedStart;
    const e = aEnd ? dayjs(aEnd) : schedEnd;
    if (!s.isValid() || !e.isValid()) return null;
    return { start: s, end: e };
  }

  // Reserved, active, etc.: scheduled window
  if (!schedStart.isValid() || !schedEnd.isValid()) return null;
  return { start: schedStart, end: schedEnd };
}

/**
 * Price to show in lists: prefer API totals, else duration × hourly rate
 * (spot `pricePerHour` when present, else {@link FALLBACK_ETB_PER_HOUR}).
 * Duration uses {@link getPricingTimeWindow} (actual session for completed/paid; scheduled for cancelled).
 */
export function getReservationDisplayPriceEt(r: Reservation): string {
  const direct =
    parseMoney(r.totalCost) ??
    parseMoney(r.amount) ??
    parseMoney(r.total_amount) ??
    parseMoney(r.total_price) ??
    parseMoney(r.cost) ??
    parseMoney(r.price);
  if (direct != null) return direct.toFixed(2);

  const window = getPricingTimeWindow(r);
  if (!window) return '0.00';

  const hours = Math.max(0, window.end.diff(window.start, 'hour', true));
  const spotRate = r.spot?.pricePerHour;
  const rate = parseMoney(spotRate) ?? FALLBACK_ETB_PER_HOUR;
  return (hours * rate).toFixed(2);
}

/**
 * When the vehicle is considered on-site (QR / check-in). Falls back to scheduled `startTime`.
 */
export function getReservationEntryInstant(r: Reservation): dayjs.Dayjs | null {
  const o = r as unknown as Record<string, unknown>;
  const firstIso = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = o[k];
      if (typeof v === 'string' && v.length > 0) return v;
    }
    return undefined;
  };

  const aStart = firstIso(
    'actualStartTime',
    'actual_start_time',
    'actualStart',
    'actual_start',
    'sessionStartTime',
    'session_started_at',
    'sessionStartedAt',
    'enteredAt',
    'checkedInAt',
    'startedAt',
    'realStartTime'
  );
  if (aStart) {
    const d = dayjs(aStart);
    if (d.isValid()) return d;
  }
  const s = dayjs(r.startTime);
  return s.isValid() ? s : null;
}

const hourlyRate = (r: Reservation) => parseMoney(r.spot?.pricePerHour) ?? FALLBACK_ETB_PER_HOUR;

/** Estimated ETB for extending a session by `extraMinutes` at the spot hourly rate. */
export function getExtensionExtraCostEt(r: Reservation, extraMinutes: number): string {
  const rate = hourlyRate(r);
  const hours = Math.max(0, extraMinutes) / 60;
  return (hours * rate).toFixed(2);
}

/**
 * Active session card: **ACTIVE** = cost so far (now − entry) × rate;
 * **RESERVED** = full scheduled slot × rate (estimate). Uses {@link hourlyRate}, not hardcoded 25.
 */
export function getDashboardSessionPriceEt(r: Reservation): string {
  const status = String(r.status ?? '').toUpperCase();
  const rate = hourlyRate(r);

  if (status === 'ACTIVE') {
    const entry = getReservationEntryInstant(r);
    if (!entry) return '0.00';
    const hours = Math.max(0, dayjs().diff(entry, 'hour', true));
    return (hours * rate).toFixed(2);
  }

  if (status === 'RESERVED') {
    const schedStart = dayjs(r.startTime);
    const schedEnd = dayjs(r.endTime);
    if (!schedStart.isValid() || !schedEnd.isValid()) return '0.00';
    const hours = Math.max(0, schedEnd.diff(schedStart, 'hour', true));
    return (hours * rate).toFixed(2);
  }

  return getReservationDisplayPriceEt(r);
}

export interface CreateReservationData {
  spotId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
}

/** Avoids rendering raw API `location` objects inside <Text>. */
export function getReservationLocationLabel(r: Reservation, fallback = 'ParkAddis Station'): string {
  const o = r as unknown as Record<string, unknown>;
  const spot = o.spot as { location?: { name?: string } } | undefined;
  if (spot?.location?.name) return String(spot.location.name);
  const loc = o.location;
  if (typeof loc === 'string') return loc;
  if (loc && typeof loc === 'object' && 'name' in loc) {
    const name = (loc as { name?: string }).name;
    if (name) return String(name);
  }
  if (o.locationName) return String(o.locationName);
  return fallback;
}

/** QR payload for gate scanners (`qrToken` / `qr_token` from API / reservations row). */
export function getReservationQrToken(r: Reservation): string | null {
  const o = r as unknown as Record<string, unknown>;
  for (const k of ['qrToken', 'qr_token', 'qrTokenId']) {
    const v = o[k];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return null;
}

export function getReservationPlateLabel(r: Reservation, fallback = '—'): string {
  const o = r as unknown as Record<string, unknown>;
  const vehicle = o.vehicle as { plateNumber?: string; plate?: string } | undefined;
  if (vehicle?.plateNumber) return String(vehicle.plateNumber);
  if (vehicle?.plate) return String(vehicle.plate);
  for (const k of ['plateNumber', 'plate_number', 'plate']) {
    const v = o[k];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return fallback;
}

export interface Reservation {
  id: string;
  userId: string;
  spotId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  status: 'RESERVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAID' | 'UNPAID' | 'EXPIRED' | string;
  qrToken?: string;
  qr_token?: string;
  vehicle?: { plateNumber?: string; plate?: string; carModel?: string };
  /** Real session times when backend sends them (used for completed/paid pricing). */
  actualStartTime?: string;
  actualEndTime?: string;
  spot?: {
    location?: { id?: string; name?: string; geom?: string };
    locationId?: string;
    geom?: string;
    pricePerHour?: string | number;
  };
  locationId?: string;
  geom?: string;
  location?: string | { name?: string };
  locationName?: string;
  totalCost?: string | number;
  amount?: string | number;
  total_amount?: string | number;
  total_price?: string | number;
  cost?: string | number;
  price?: string | number;
}

export const reservationService = {
  createReservation: async (data: CreateReservationData) => {
    const response = await apiClient.post<{ reservedSpot: Reservation }>('/reservation', data);
    return response.data.reservedSpot;
  },

  getUserReservations: async () => {
    const response = await apiClient.get<Reservation[]>('/reservation');
    return response.data;
  },

  getActiveReservation: async () => {
    const response = await apiClient.get<Reservation | null>('/reservation/active');
    return response.data;
  },

  validateQR: async (qrToken: string) => {
    const response = await apiClient.post('/reservation/validate', { qrToken });
    return response.data;
  },

  startSession: async (reservationId: string) => {
    const response = await apiClient.post('/reservation/start', { reservationId });
    return response.data;
  },

  completeSession: async (reservationId: string) => {
    const response = await apiClient.post('/reservation/complete', { reservationId });
    return response.data;
  },

  cancelReservation: async (reservation: Reservation) => {
    // Some backend versions might expect 'reservationId', 'id', or even 'qrToken'
    const payload = { 
      reservationId: reservation.id,
      id: reservation.id,
      qrToken: reservation.qrToken
    };
    const response = await apiClient.post('/reservation/cancel', payload);
    return response.data;
  },

  extendReservation: async (reservationId: string, extraMinutes: number): Promise<Reservation> => {
    const response = await apiClient.post<Record<string, unknown>>('/reservation/extend', {
      reservationId,
      extraMinutes,
      additionalMinutes: extraMinutes,
    });
    const d = response.data as Record<string, unknown>;

    const asRow = (o: unknown): Reservation | null => {
      if (o && typeof o === 'object' && typeof (o as Reservation).id === 'string') return o as Reservation;
      return null;
    };

    const candidates: unknown[] = [
      d.reservation,
      d.reservedSpot,
      d.updatedReservation,
      d.session,
      d.data,
      d.result,
      Array.isArray(d.rows) ? d.rows[0] : undefined,
      Array.isArray(d.reservations) ? d.reservations[0] : undefined,
    ];
    for (const c of candidates) {
      const row = asRow(c);
      if (row) return row;
    }
    const top = asRow(d);
    if (top) return top;

    const okish = d.ok === true || d.success === true || d.status === 'ok';
    if (okish) {
      try {
        const activeRes = await apiClient.get<Record<string, unknown>>('/reservation/active');
        const a = (activeRes.data ?? {}) as Record<string, unknown>;
        const merged =
          asRow(a.reservedSpot) ??
          asRow(a.activeSession) ??
          asRow(a.data) ??
          asRow(a);
        if (merged) return merged;
      } catch {
        /* fall through */
      }
    }

    const msg =
      (typeof d.message === 'string' && d.message) ||
      (typeof d.error === 'string' && d.error) ||
      'Could not extend reservation';
    throw new Error(msg);
  },

  /**
   * Fetches BOTH the active reservation and the history, 
   * merging them into a single deduplicated list with robust unwrapping.
   */
  getAllUserSessions: async (): Promise<Reservation[]> => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        apiClient.get<any>('/reservation/active').catch(() => ({ data: null })),
        apiClient.get<any>('/reservation').catch(() => ({ data: [] }))
      ]);

      // Robust unwrapping for Active
      let active: Reservation | null = null;
      if (activeRes.data) {
        active = activeRes.data.reservedSpot || activeRes.data.activeSession || (typeof activeRes.data === 'object' && activeRes.data.id ? activeRes.data : null);
      }

      // Robust unwrapping for History
      let historyArray: Reservation[] = [];
      if (historyRes.data) {
        if (Array.isArray(historyRes.data)) {
          historyArray = historyRes.data;
        } else {
          historyArray = historyRes.data.reservations || historyRes.data.history || historyRes.data.data || [];
        }
      }

      // If no active, just return history
      if (!active) return historyArray;

      // Merge and deduplicate
      const merged = [active, ...historyArray.filter(r => r.id !== active.id)];
      return merged;
    } catch (err) {
      return [];
    }
  }
};

export default reservationService;
