function getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

const defaults: RequestInit = {
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-XSRF-TOKEN': getCsrfToken(),
  },
}

export async function apiGet<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { ...defaults, method: 'GET' })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export async function apiPostForm<T = unknown>(url: string, body: FormData): Promise<T> {
  const token = getCsrfToken()
  const res = await fetch(url, {
    credentials: 'include',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(token ? { 'X-XSRF-TOKEN': token } : {}),
    },
    body,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export async function apiPostJson<T = unknown>(url: string, data: object): Promise<T> {
  const token = getCsrfToken()
  const res = await fetch(url, {
    credentials: 'include',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(token ? { 'X-XSRF-TOKEN': token } : {}),
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}
