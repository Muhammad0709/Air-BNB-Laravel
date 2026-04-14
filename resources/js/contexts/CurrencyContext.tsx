import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import {
  type CurrencyCode,
  defaultCurrencyFallback,
  isCurrencyCode,
} from '../utils/currency'

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
  initialCurrency?: string | null
}

function normalizeCurrency(value: string | null | undefined): CurrencyCode {
  if (isCurrencyCode(value)) return value!.toUpperCase()
  return defaultCurrencyFallback()
}

export function CurrencyProvider({ children, initialCurrency }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window === 'undefined') return normalizeCurrency(initialCurrency)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isCurrencyCode(stored)) return stored.toUpperCase()
    return normalizeCurrency(initialCurrency)
  })

  useEffect(() => {
    const fixIfInvalid = () => {
      setCurrencyState((prev) => (isCurrencyCode(prev) ? prev : normalizeCurrency(null)))
    }
    document.addEventListener('currencies:updated', fixIfInvalid)
    return () => document.removeEventListener('currencies:updated', fixIfInvalid)
  }, [])

  const setCurrency = useCallback((code: CurrencyCode) => {
    const upper = code.toUpperCase()
    setCurrencyState(upper)
    try {
      localStorage.setItem(STORAGE_KEY, upper)
    } catch (_) {}
    router.patch('/profile/currency', { currency: upper }, { preserveState: true })
  }, [])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export type { CurrencyCode }
export { isCurrencyCode }
