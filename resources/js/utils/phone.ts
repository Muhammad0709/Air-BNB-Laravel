import { parsePhoneNumber, type Country } from 'react-phone-number-input'

/** Split DB / profile value into country code + national digits for UI pickers */
export function splitStoredPhone(raw: string | null | undefined): { phoneCode: string; phone: string; phoneCountry: Country } {
  const fallback: { phoneCode: string; phone: string; phoneCountry: Country } = { phoneCode: '+31', phone: '', phoneCountry: 'NL' }
  if (!raw?.trim()) return fallback
  const s = raw.trim()
  try {
    const parsed = parsePhoneNumber(s)
    if (parsed) {
      return {
        phoneCode: `+${parsed.countryCallingCode}`,
        phone: String(parsed.nationalNumber).replace(/\D/g, ''),
        phoneCountry: parsed.country ?? 'NL',
      }
    }
  } catch {
    // ignore
  }
  const digits = s.replace(/\D/g, '')
  if (digits.length >= 7) return { ...fallback, phone: digits }
  return fallback
}

/** Combine picker + national number for DB (E.164-style, no spaces) */
export function combinePhoneE164(phoneCode: string, nationalDigits: string): string {
  const code = (phoneCode || '+31').trim()
  const digits = (nationalDigits || '').replace(/\D/g, '')
  if (!digits) return ''
  const prefix = code.startsWith('+') ? code : `+${code}`
  return `${prefix}${digits}`
}
