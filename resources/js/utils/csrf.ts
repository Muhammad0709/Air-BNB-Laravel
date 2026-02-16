/**
 * Read Laravel's XSRF-TOKEN cookie for the X-XSRF-TOKEN header (prevents 419 on POST).
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}
