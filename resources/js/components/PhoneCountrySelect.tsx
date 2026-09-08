import React, { useEffect, useMemo, useState } from 'react'
import { Box, FormControl, ListSubheader, MenuItem, Select, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { getCountries, getCountryCallingCode, type Country } from 'react-phone-number-input'
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
  onChange: (code: string, country: Country) => void
  size?: 'small' | 'medium'
  sx?: object
}

export default function PhoneCountrySelect({ value, onChange, size = 'small', sx }: PhoneCountrySelectProps) {
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(
    () => PHONE_COUNTRY_LIST.find((item) => item.code === value)?.country ?? 'NL'
  )

  useEffect(() => {
    const currentSelection = PHONE_COUNTRY_LIST.find((item) => item.country === selectedCountry)
    if (currentSelection?.code === value) return
    setSelectedCountry(PHONE_COUNTRY_LIST.find((item) => item.code === value)?.country ?? 'NL')
  }, [value, selectedCountry])

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return PHONE_COUNTRY_LIST

    return PHONE_COUNTRY_LIST.filter(({ label, code, country }) =>
      label.toLowerCase().includes(query) || code.includes(query) || country.toLowerCase().includes(query)
    )
  }, [search])

  return (
    <FormControl size={size} sx={{ minWidth: 160, ...sx }}>
      <Select
        value={selectedCountry}
        onChange={(e) => {
          const selected = PHONE_COUNTRY_LIST.find((item) => item.country === e.target.value)
          if (selected) {
            setSelectedCountry(selected.country)
            onChange(selected.code, selected.country as Country)
          }
        }}
        onClose={() => setSearch('')}
        renderValue={(v) => {
          const item = PHONE_COUNTRY_LIST.find((x) => x.country === v)
          return item ? `${item.flag} ${item.code}` : v
        }}
        MenuProps={{
          PaperProps: { sx: { maxHeight: 420 } },
          MenuListProps: { autoFocusItem: false, variant: 'menu' },
        }}
      >
        <ListSubheader sx={{ py: 1, bgcolor: '#FFFFFF' }}>
          <TextField
            size="small"
            fullWidth
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Search country or code"
            InputProps={{ startAdornment: <SearchIcon sx={{ color: '#6B7280', mr: 1 }} /> }}
          />
        </ListSubheader>
        {filteredCountries.map(({ country, code, flag, label }) => (
          <MenuItem key={country} value={country}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>{flag}</span>
              <span>{code}</span>
              <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{label}</span>
            </Box>
          </MenuItem>
        ))}
        {filteredCountries.length === 0 && (
          <MenuItem disabled>No country found</MenuItem>
        )}
      </Select>
    </FormControl>
  )
}
