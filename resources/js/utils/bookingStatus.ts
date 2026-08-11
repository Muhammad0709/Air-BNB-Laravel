/**
 * Shared booking-status helpers used across Host, Admin, and Customer pages.
 * Single source of truth — update here to affect all panels.
 */

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending:                  '#F59E0B',   // amber
  awaiting_host_response:   '#F97316',   // orange
  awaiting_payment:         '#EAB308',   // yellow
  confirmed:                '#10B981',   // green
  cancelled:                '#EF4444',   // red
  completed:                '#6366F1',   // indigo
  expired:                  '#9CA3AF',   // grey
  refunded:                 '#3B82F6',   // blue
  disputed:                 '#8B5CF6',   // purple
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending:                  'Pending',
  awaiting_host_response:   'Awaiting Host Response',
  awaiting_payment:         'Awaiting Payment',
  confirmed:                'Confirmed',
  cancelled:                'Cancelled',
  completed:                'Completed',
  expired:                  'Expired',
  refunded:                 'Refunded',
  disputed:                 'Disputed',
}

/** All 9 status values */
export const ALL_BOOKING_STATUSES = Object.keys(BOOKING_STATUS_COLORS)

/** Statuses a host can manually set */
export const HOST_SELECTABLE_STATUSES = [
  'pending',
  'awaiting_host_response',
  'awaiting_payment',
  'confirmed',
  'cancelled',
  'completed',
  'expired',
  'refunded',
  'disputed',
]

/** Returns hex color for a status string (raw value, case-insensitive) */
export function getBookingStatusColor(status: string): string {
  return BOOKING_STATUS_COLORS[status?.toLowerCase()] ?? '#717171'
}

/** Returns human-readable label for a status string */
export function getBookingStatusLabel(status: string): string {
  const key = status?.toLowerCase()
  return BOOKING_STATUS_LABELS[key] ?? status ?? '—'
}

/** Returns color for payment_status (paid / pending / unpaid) */
export function getPaymentStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'paid':    return '#10B981'
    case 'pending': return '#F59E0B'
    case 'unpaid':  return '#EF4444'
    default:        return '#717171'
  }
}

/** Returns label for payment_status */
export function getPaymentStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case 'paid':    return 'Paid'
    case 'pending': return 'Payment Pending'
    case 'unpaid':  return 'Unpaid'
    default:        return status ?? '—'
  }
}
