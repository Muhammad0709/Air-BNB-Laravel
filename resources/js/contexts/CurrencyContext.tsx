import React, { createContext, useCallback, useContext, useState } from 'react'
import { router } from '@inertiajs/react'

type CurrencyCode = 'USD' | 'PKR'

const STORAGE_KEY = 'currency'

type CurrencyContextValue = {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}

type CurrencyProviderProps = {
  children: React.ReactNode
  /** Pass from initial Inertia page props (e.g. auth.user.currency). Provider runs outside Inertia so cannot use usePage(). */
  initialCurrency?: CurrencyCode | null
}

export function CurrencyProvider({ children, initialCurrency }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window === 'undefined') return initialCurrency === 'PKR' ? 'PKR' : 'USD'
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null
    if (stored === 'USD' || stored === 'PKR') return stored
    return initialCurrency === 'PKR' || initialCurrency === 'USD' ? initialCurrency : 'USD'
  })

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch (_) {}
    // Persist to profile when logged in; server ignores if unauthenticated
    router.patch('/profile/currency', { currency: code }, { preserveState: true })
  }, [])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}
