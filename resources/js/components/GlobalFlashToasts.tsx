import React, { useEffect, useRef, useState } from 'react'
import { usePage } from '@inertiajs/react'
import Toast from './Admin/Toast';

type Flash = { success?: string | null; error?: string | null }

/**
 * Shows MUI toast for session flash.success / flash.error after Inertia redirects.
 * Many flows (login, register, host actions) only set flash on the server; this runs on the destination page.
 */
export default function GlobalFlashToasts() {
  const page = usePage<{ flash?: Flash }>()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<'success' | 'error'>('success')
  const lastKeyRef = useRef<string | null>(null)

  useEffect(() => {
    const flash = page.props.flash
    const success = flash?.success ?? undefined
    const error = flash?.error ?? undefined
    const text = error ?? success

    if (!text) {
      lastKeyRef.current = null
      return
    }

    const key = `${page.url}:${error ? 'e' : 's'}:${text}`
    if (lastKeyRef.current === key) return
    lastKeyRef.current = key

    setMessage(text)
    setSeverity(error ? 'error' : 'success')
    setOpen(true)
  }, [page.url, page.props.flash?.success, page.props.flash?.error])

  return (
    <Toast
      open={open}
      onClose={() => setOpen(false)}
      message={message}
      severity={severity}
    />
  )
}
