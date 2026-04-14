/**
 * Display-only conversion: amounts in the app are stored in USD.
 * Supported codes + rates come from the server (config + exchange API).
 */

export type CurrencyCode = string

let supportedCodes: readonly string[] = ['USD']

/** Sync from Inertia shared prop `supportedCurrencies` (see app bootstrap + events). */
export function setSupportedCurrencies(codes: string[] | null | undefined): void {
  if (!codes?.length) {
    supportedCodes = ['USD']
    return
  }
  const next = [...new Set(codes.map((c) => c.toUpperCase().trim()).filter(Boolean))]
  supportedCodes = next.length ? next : ['USD']
}

export function getSupportedCurrencies(): readonly string[] {
  return supportedCodes
}

function defaultCurrencyFallback(): string {
  const list = getSupportedCurrencies()
  if (list.includes('USD')) return 'USD'
  return list[0] ?? 'USD'
}

let activeRates: Partial<Record<string, number>> | null = null

/** Sync from Inertia shared prop `exchangeRates`. */
export function setExchangeRates(rates: Record<string, number> | null | undefined): void {
  if (!rates || typeof rates !== 'object') return
  const next: Partial<Record<string, number>> = {}
  for (const code of getSupportedCurrencies()) {
    const v = rates[code]
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
      next[code] = v
    }
  }
  activeRates = Object.keys(next).length ? next : null
}

function rateFor(currency: string): number | null {
  if (currency.toUpperCase() === 'USD') return 1
  const v = activeRates?.[currency.toUpperCase()]
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v
  return null
}

export function isCurrencyCode(value: string | null | undefined): value is string {
  if (value == null) return false
  return supportedCodes.includes(value.toUpperCase())
}

/**
 * Format a USD amount for display in the selected currency.
 * When no live rate exists for that currency, shows USD (stored amount is already USD).
 */
export function formatPrice(amountUsd: number, currency: CurrencyCode): string {
  const num = Number(amountUsd)
  const safe = Number.isNaN(num) || num < 0 ? 0 : num
  const code = currency.toUpperCase()
  const rate = rateFor(code)
  if (rate === null) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe)
  }

  const local = safe * rate

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).format(local)
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe)
  }
}

export { defaultCurrencyFallback }
