type DateInput = Date | string | null | undefined

function dateParts(value: DateInput): [number, number, number] | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return [value.getFullYear(), value.getMonth() + 1, value.getDate()]
  }

  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null

  const [, year, month, day] = match
  const utc = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  if (utc.getUTCFullYear() !== Number(year) || utc.getUTCMonth() + 1 !== Number(month) || utc.getUTCDate() !== Number(day)) {
    return null
  }

  return [Number(year), Number(month), Number(day)]
}

/** Calendar-day difference, independent of the time of day and DST transitions. */
export function stayNights(checkin: DateInput, checkout: DateInput): number | null {
  const start = dateParts(checkin)
  const end = dateParts(checkout)
  if (!start || !end) return null

  const startDay = Date.UTC(start[0], start[1] - 1, start[2])
  const endDay = Date.UTC(end[0], end[1] - 1, end[2])
  const nights = (endDay - startDay) / 86_400_000
  return Number.isInteger(nights) && nights > 0 ? nights : null
}
