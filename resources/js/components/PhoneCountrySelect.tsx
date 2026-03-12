import React from 'react'
import { Box, FormControl, MenuItem, Select } from '@mui/material'
import { getCountries, getCountryCallingCode } from 'react-phone-number-input'
import enLocale from 'react-phone-number-input/locale/en.json'

function countryToFlag(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return ''
  return [...iso2.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))).join('')
}

function getPhoneCountryList(): { country: string; code: string; flag: string; label: string }[] {
  const list: { country: string; code: string; flag: string; label: string }[] = []
  const countries = getCountries()
  const labels = enLocale as Record<string, string>
  countries.forEach((country) => {
    try {
      const dial = getCountryCallingCode(country)
      list.push({
        country,
        code: `+${dial}`,
        flag: countryToFlag(country),
        label: labels[country] || country,
      })
    } catch {
      // skip invalid
    }
  })
  list.sort((a, b) => a.label.localeCompare(b.label))
  return list
}

const PHONE_COUNTRY_LIST = getPhoneCountryList()

export type PhoneCountrySelectProps = {
  value: string
  onChange: (code: string) => void
  size?: 'small' | 'medium'
  sx?: object
}

export default function PhoneCountrySelect({ value, onChange, size = 'small', sx }: PhoneCountrySelectProps) {
  return (
    <FormControl size={size} sx={{ minWidth: 160, ...sx }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        renderValue={(v) => {
          const item = PHONE_COUNTRY_LIST.find((x) => x.code === v)
          return item ? `${item.flag} ${item.code}` : v
        }}
        MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
      >
        {PHONE_COUNTRY_LIST.map(({ country, code, flag, label }) => (
          <MenuItem key={country} value={code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>{flag}</span>
              <span>{code}</span>
              <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{label}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
