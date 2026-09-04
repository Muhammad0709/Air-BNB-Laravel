import { Box, IconButton, Popover, Stack, Typography } from '@mui/material'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { useMemo, useRef, useState } from 'react'

type Props = { checkin: string; checkout: string; onCheckinChange: (value: string) => void; onCheckoutChange: (value: string) => void; whenLabel: string; addDatesLabel: string; checkinLabel: string; checkoutLabel: string; isRtl?: boolean; open: boolean; onOpenChange: (open: boolean) => void }

const toLocalDate = (value: string) => {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const toValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const makeMonthDays = (month: Date) => {
  const year = month.getFullYear(), monthIndex = month.getMonth()
  const offset = new Date(year, monthIndex, 1).getDay()
  const total = new Date(year, monthIndex + 1, 0).getDate()
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - offset + 1
    return day > 0 && day <= total ? new Date(year, monthIndex, day) : null
  })
}

export default function HomeDatePicker({ checkin, checkout, onCheckinChange, onCheckoutChange, whenLabel, addDatesLabel, checkinLabel, checkoutLabel, isRtl = false, open, onOpenChange }: Props) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const base = toLocalDate(checkin) || new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const start = toLocalDate(checkin), end = toLocalDate(checkout)
  const secondMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const displayValue = useMemo(() => {
    if (!start) return addDatesLabel
    const format = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return end ? `${format(start)} – ${format(end)}` : `${format(start)} – ${checkoutLabel}`
  }, [checkin, checkout, addDatesLabel, checkoutLabel])
  const selectDate = (date: Date) => {
    if (!start || end || date < start) { onCheckinChange(toValue(date)); onCheckoutChange('') }
    else onCheckoutChange(toValue(date))
  }
  const renderMonth = (month: Date, secondary = false) => (
    <Box className={`home-calendar-month${secondary ? ' secondary' : ''}`}>
      <Typography className="home-calendar-month-title">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Typography>
      <Box className="home-calendar-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span className="home-calendar-weekday" key={`${day}-${index}`}>{day}</span>)}
        {makeMonthDays(month).map((date, index) => {
          if (!date) return <span key={index} className="home-calendar-day empty" />
          const time = date.getTime(), isStart = !!start && time === start.getTime(), isEnd = !!end && time === end.getTime()
          const inRange = !!start && !!end && date > start && date < end, disabled = date < today
          return <button type="button" key={toValue(date)} disabled={disabled} onClick={() => selectDate(date)} className={`home-calendar-day${isStart ? ' range-start' : ''}${isEnd ? ' range-end' : ''}${inRange ? ' in-range' : ''}`}>{date.getDate()}</button>
        })}
      </Box>
    </Box>
  )
  return (
    <>
      <Box ref={anchorRef} className={`search-field search-field-when${checkin ? ' has-value' : ''}${open ? ' active' : ''}`} role="button" tabIndex={0} onClick={() => onOpenChange(true)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenChange(true) }}>
        <label>{whenLabel}</label><Typography component="span" className="search-date-value">{displayValue}</Typography>
      </Box>
      <Popover
        open={open}
        anchorEl={() => anchorRef.current?.closest('.hero-search-form') as HTMLElement}
        onClose={() => onOpenChange(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: isRtl ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: isRtl ? 'right' : 'left' }}
        marginThreshold={12}
        slotProps={{
          paper: {
            className: 'home-calendar-popover',
            style: { width: anchorRef.current?.closest('.hero-search-form')?.getBoundingClientRect().width },
          },
        }}
      >
        <Box className="home-calendar-panel">
          <Stack direction="row" justifyContent="flex-end" alignItems="center" className="home-calendar-heading">
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="Previous month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>{isRtl ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}</IconButton>
              <IconButton aria-label="Next month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>{isRtl ? <ChevronLeftRoundedIcon /> : <ChevronRightRoundedIcon />}</IconButton>
            </Stack>
          </Stack>
          <Box className="home-calendar-months">{renderMonth(visibleMonth)}{renderMonth(secondMonth, true)}</Box>
        </Box>
      </Popover>
    </>
  )
}
