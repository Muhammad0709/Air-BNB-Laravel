import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher?: typeof Pusher
    Echo?: Echo
  }
}

const key = import.meta.env.VITE_REVERB_APP_KEY
const host = import.meta.env.VITE_REVERB_HOST
const port = import.meta.env.VITE_REVERB_PORT
const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http'

if (key && host) {
  window.Pusher = Pusher

  window.Echo = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: host,
    wsPort: port ? Number(port) : 80,
    wssPort: port ? Number(port) : 443,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': getCsrfToken(),
      },
    },
  })
}

function getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export default window.Echo
