/**
 * Exchange rate USD → PKR (used for display only; update as needed).
 */
export const USD_TO_PKR_RATE = 278

export type CurrencyCode = 'USD' | 'PKR'

/**
 * Format an amount (stored in USD) for display in the given currency.
 */
export function formatPrice(amountUsd: number, currency: CurrencyCode): string {
  const num = Number(amountUsd)
  if (Number.isNaN(num) || num < 0) return currency === 'PKR' ? 'Rs 0' : '$0'
  if (currency === 'PKR') {
    const pkr = Math.round(num * USD_TO_PKR_RATE)
    return 'Rs ' + pkr.toLocaleString()
  }
  return '$' + (Number.isInteger(num) ? num.toLocaleString() : num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','))
}
