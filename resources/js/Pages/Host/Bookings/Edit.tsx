import { useState, useMemo } from 'react'
import { Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import InputError from '../../../components/InputError'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

function parseDateStr(s: string): Date | null {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export default function EditBooking() {
  const { t, isRtl } = useLanguage()
  const { booking, properties: propertiesList } = usePage().props as {
    booking: {
      id: string
      guest: string
      guestEmail: string
      guestPhone: string
      propertyId: number
      property: string
      checkin: string
      checkout: string
      status: string
      amount: string
    }
    properties: Array<{ id: number; title: string; location: string }>
  }
  const id = booking?.id ?? ''
  const properties = propertiesList ?? []

  const statusValue = booking?.status ? String(booking.status).toLowerCase() : 'pending'
  const { data, setData, put, processing, errors } = useForm({
    property_id: String(booking?.propertyId ?? ''),
    guest: booking?.guest ?? '',
    email: booking?.guestEmail ?? '',
    phone: booking?.guestPhone ?? '',
    checkin: booking?.checkin ?? '',
    checkout: booking?.checkout ?? '',
    amount: booking?.amount ?? '',
    status: statusValue,
  })

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (!booking?.checkin) return new Date()
    const [y, m] = booking.checkin.split('-').map(Number)
    return new Date(y, (m ?? 1) - 1, 1)
  })
  const selectedCheckin = useMemo(() => parseDateStr(data.checkin), [data.checkin])
  const selectedCheckout = useMemo(() => parseDateStr(data.checkout), [data.checkout])

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentMonth(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentMonth(newDate)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    
    const days = []
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, daysInPrevMonth - i)
      dayDate.setHours(0, 0, 0, 0)
      dayDate.setMinutes(0, 0, 0)
      dayDate.setSeconds(0, 0)
      dayDate.setMilliseconds(0)
      days.push({ day: daysInPrevMonth - i, isOtherMonth: true, date: new Date(dayDate.getTime()) })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i)
      dayDate.setHours(0, 0, 0, 0)
      dayDate.setMinutes(0, 0, 0)
      dayDate.setSeconds(0, 0)
      dayDate.setMilliseconds(0)
      days.push({ day: i, isOtherMonth: false, date: new Date(dayDate.getTime()) })
    }
    while (days.length < 42) {
      const nextMonthDay: number = days.length - daysInMonth - firstDay + 1
      const dayDate = new Date(year, month + 1, nextMonthDay)
      dayDate.setHours(0, 0, 0, 0)
      dayDate.setMinutes(0, 0, 0)
      dayDate.setSeconds(0, 0)
      dayDate.setMilliseconds(0)
      days.push({ day: nextMonthDay, isOtherMonth: true, date: new Date(dayDate.getTime()) })
    }
    return days
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'short', year: 'numeric' })
  }

  const handleDateClick = (date: Date) => {
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)
    const dateStr = `${normalizedDate.getFullYear()}-${String(normalizedDate.getMonth() + 1).padStart(2, '0')}-${String(normalizedDate.getDate()).padStart(2, '0')}`

    if (!selectedCheckin || (selectedCheckin && selectedCheckout)) {
      setData({ ...data, checkin: dateStr, checkout: '' })
    } else if (selectedCheckin && !selectedCheckout) {
      const normalizedCheckin = new Date(selectedCheckin)
      normalizedCheckin.setHours(0, 0, 0, 0)
      if (normalizedDate > normalizedCheckin) {
        setData({ ...data, checkout: dateStr })
      } else if (normalizedDate.getTime() !== normalizedCheckin.getTime()) {
        setData({ ...data, checkin: dateStr, checkout: '' })
      }
    }
  }

  const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    normalized.setMinutes(0)
    normalized.setSeconds(0)
    normalized.setMilliseconds(0)
    return normalized
  }

  const isDateInRange = (date: Date) => {
    if (!selectedCheckin || !selectedCheckout) return false
    const normalizedDate = normalizeDate(date)
    const normalizedCheckin = normalizeDate(selectedCheckin)
    const normalizedCheckout = normalizeDate(selectedCheckout)
    const inRange = normalizedDate >= normalizedCheckin && normalizedDate <= normalizedCheckout
    return inRange
  }

  const isDateStart = (date: Date) => {
    if (!selectedCheckin) return false
    const normalizedDate = normalizeDate(date)
    const normalizedCheckin = normalizeDate(selectedCheckin)
    const isMatch = normalizedDate.getTime() === normalizedCheckin.getTime()
    return isMatch
  }

  const isDateEnd = (date: Date) => {
    if (!selectedCheckout) return false
    const normalizedDate = normalizeDate(date)
    const normalizedCheckout = normalizeDate(selectedCheckout)
    const isMatch = normalizedDate.getTime() === normalizedCheckout.getTime()
    return isMatch
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate < today
  }

  const calendarDays = getDaysInMonth(currentMonth)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setData(name as keyof typeof data, value)
  }

  const handleSelectChange = (name: string, value: string) => {
    setData(name as keyof typeof data, value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`/host/bookings/${id}`, {
      onSuccess: () => router.visit('/host/bookings'),
    })
  }

  return (
    <>
      <Head title={t('host.bookings.edit_booking_title')} />
      <HostLayout title={t('host.bookings.edit_booking_title')}>
      <Button
        startIcon={isRtl ? <ArrowForwardIcon /> : <ArrowBackIcon />}
        onClick={() => router.visit('/host/bookings')}
        sx={{
          mb: 3,
          color: '#717171',
          textTransform: 'none',
          gap: 1,
          '& .MuiButton-startIcon': { marginInlineEnd: 0, marginInlineStart: 0 },
          '&:hover': { bgcolor: '#F9FAFB', color: '#222222' }
        }}
      >
        {t('host.bookings.back_to_bookings')}
      </Button>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222', mb: 4 }}>
            {t('host.bookings.edit_booking_information')}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Row>
              <Col xs={12} md={6}>
                <Stack spacing={3} sx={{ mb: { xs: 3, md: 0 } }}>
                  <Box>
                    <TextField
                      label={t('host.bookings.guest_name')}
                      name="guest"
                      value={data.guest}
                      onChange={handleChange}
                      fullWidth
                      error={Boolean(errors.guest)}
                    />
                    <InputError message={Array.isArray(errors.guest) ? errors.guest[0] : errors.guest} />
                  </Box>
                  <Box>
                    <TextField
                      label={t('host.bookings.email_address')}
                      name="email"
                      type="email"
                      value={data.email}
                      onChange={handleChange}
                      fullWidth
                      error={Boolean(errors.email)}
                    />
                    <InputError message={Array.isArray(errors.email) ? errors.email[0] : errors.email} />
                  </Box>
                  <Box>
                    <TextField
                      label={t('host.bookings.phone_number')}
                      name="phone"
                      value={data.phone}
                      onChange={handleChange}
                      fullWidth
                      error={Boolean(errors.phone)}
                    />
                    <InputError message={Array.isArray(errors.phone) ? errors.phone[0] : errors.phone} />
                  </Box>
                  <Box>
                    <FormControl fullWidth error={Boolean(errors.property_id)}>
                      <InputLabel>{t('host.bookings.property_label')}</InputLabel>
                      <Select
                        value={data.property_id}
                        onChange={(e) => handleSelectChange('property_id', e.target.value)}
                        label={t('host.bookings.property_label')}
                      >
                        {properties.map((property) => (
                          <MenuItem key={property.id} value={String(property.id)}>
                            {property.title} - {property.location}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <InputError message={Array.isArray(errors.property_id) ? errors.property_id[0] : errors.property_id} />
                  </Box>
                </Stack>
              </Col>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <Box>
                    <TextField
                      label={t('host.bookings.total_amount')}
                      name="amount"
                      type="number"
                      value={data.amount}
                      onChange={handleChange}
                      fullWidth
                      error={Boolean(errors.amount)}
                      InputProps={{
                        startAdornment: <Typography sx={{ marginInlineEnd: 1, color: '#717171' }}>$</Typography>
                      }}
                    />
                    <InputError message={Array.isArray(errors.amount) ? errors.amount[0] : errors.amount} />
                  </Box>
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel>{t('host.bookings.status_label')}</InputLabel>
                      <Select
                        value={data.status}
                        onChange={(e) => handleSelectChange('status', e.target.value)}
                        label={t('host.bookings.status_label')}
                      >
                        <MenuItem value="pending">{t('host.bookings.status_pending')}</MenuItem>
                        <MenuItem value="confirmed">{t('host.bookings.status_confirmed')}</MenuItem>
                        <MenuItem value="completed">{t('host.earnings.completed')}</MenuItem>
                        <MenuItem value="cancelled">{t('host.bookings.status_cancelled')}</MenuItem>
                      </Select>
                    </FormControl>
                    <InputError message={Array.isArray(errors.status) ? errors.status[0] : errors.status} />
                  </Box>
                </Stack>
              </Col>
            </Row>

            {/* Calendar Section */}
            <Row className="mt-4">
              <Col xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>
                  {t('host.bookings.select_dates')}
                </Typography>
                <Box sx={{ width: '100%', maxWidth: { xs: '100%', lg: '500px' }, mx: 'auto', px: { xs: 0, sm: 1 } }}>
                  <Paper 
                    key={`calendar-${currentMonth.getTime()}-${selectedCheckin?.getTime() ?? 0}-${selectedCheckout?.getTime() ?? 0}`}
                    elevation={0} 
                    sx={{ 
                      backgroundColor: '#FFFFFF',
                      color: '#1F1F1F',
                      transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                      borderRadius: { xs: '12px', md: '20px' },
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: '1px solid #E5E7EB',
                      padding: { xs: '12px', sm: '16px', md: '20px' },
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}
                  >
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          mb: { xs: 2, md: 2.5 },
                          pb: { xs: 1, md: 1.5 },
                          borderBottom: '2px solid #F3F4F6'
                        }}
                      >
                        <Button 
                          size="small" 
                          onClick={handlePrevMonth} 
                          sx={{ 
                            minWidth: { xs: 32, md: 36 }, 
                            height: { xs: 32, md: 36 },
                            borderRadius: '50%',
                            bgcolor: '#F9FAFB',
                            color: '#717171',
                            '&:hover': {
                              bgcolor: '#F3F4F6',
                              color: '#222222'
                            }
                          }}
                        >
                          <ChevronLeftIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                        </Button>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#222222', fontSize: { xs: 14, md: 16 }, letterSpacing: 0.5 }}>
                          {formatMonthYear(currentMonth)}
                        </Typography>
                        <Button 
                          size="small" 
                          onClick={handleNextMonth} 
                          sx={{ 
                            minWidth: { xs: 32, md: 36 }, 
                            height: { xs: 32, md: 36 },
                            borderRadius: '50%',
                            bgcolor: '#F9FAFB',
                            color: '#717171',
                            '&:hover': {
                              bgcolor: '#F3F4F6',
                              color: '#222222'
                            }
                          }}
                        >
                          <ChevronRightIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                        </Button>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: 0.25, md: 0.5 }, mb: { xs: 1, md: 1.5 }, width: '100%' }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <Box 
                            key={day} 
                            sx={{ 
                              textAlign: 'center', 
                              fontWeight: 700, 
                              color: '#717171', 
                              fontSize: { xs: 10, md: 11 }, 
                              py: { xs: 0.75, md: 1 },
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              minWidth: 0
                            }}
                          >
                            {day}
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: 0.25, md: 0.5 }, width: '100%' }}>
                        {calendarDays.slice(0, 35).map((d, idx) => {
                          const isInRange = !d.isOtherMonth && selectedCheckin && selectedCheckout && isDateInRange(d.date)
                          const isStart = !d.isOtherMonth && selectedCheckin && isDateStart(d.date)
                          const isEnd = !d.isOtherMonth && selectedCheckout && isDateEnd(d.date)
                          const isSelected = isStart || isEnd
                          const isPast = !d.isOtherMonth && isPastDate(d.date)
                          const isDisabled = d.isOtherMonth || isPast
                          const uniqueKey = `${idx}-${d.date.getTime()}-${selectedCheckin?.getTime() || 0}-${selectedCheckout?.getTime() || 0}`
                          
                          return (
                            <Box
                              key={uniqueKey}
                              onClick={() => !isDisabled && handleDateClick(d.date)}
                              sx={{
                                aspectRatio: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                color: isDisabled ? '#D1D5DB' : isSelected ? '#FFFFFF' : '#374151',
                                bgcolor: isSelected ? '#AD542D' : isInRange ? '#FFF5F5' : 'transparent',
                                borderRadius: isStart ? { xs: '4px 0 0 4px', md: '8px 0 0 8px' } : isEnd ? { xs: '0 4px 4px 0', md: '0 8px 8px 0' } : isInRange ? 0 : { xs: 1, md: 2 },
                                fontSize: { xs: 12, md: 13 },
                                fontWeight: isSelected ? 700 : 500,
                                minHeight: { xs: 32, md: 36 },
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                opacity: isDisabled ? 0.4 : 1,
                                minWidth: 0,
                                width: '100%',
                                maxWidth: '100%',
                                '&:hover': {
                                  bgcolor: isDisabled ? 'transparent' : isSelected ? '#78381C' : isInRange ? '#FFF5F5' : '#F3F4F6',
                                  transform: isDisabled ? 'none' : 'scale(1.05)',
                                  color: isDisabled ? '#D1D5DB' : isSelected ? '#FFFFFF' : '#222222',
                                  opacity: isDisabled ? 0.4 : 1
                                },
                                '&:active': {
                                  transform: isDisabled ? 'none' : 'scale(0.95)'
                                }
                              }}
                            >
                              {d.day}
                            </Box>
                          )
                        })}
                      </Box>
                      <Box 
                        sx={{ 
                          mt: { xs: 2, md: 2.5 }, 
                          pt: { xs: 1, md: 1.5 },
                          borderTop: '1px solid #F3F4F6',
                          display: 'flex',
                          justifyContent: 'space-around',
                          gap: { xs: 1, md: 2 }
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: { xs: 11, md: 12 }, color: '#717171', fontWeight: 500 }}>
                            {t('host.bookings.check_in')}
                          </Typography>
                          <Typography sx={{ fontSize: { xs: 12, md: 13 }, color: data.checkin ? '#222222' : '#9CA3AF', fontWeight: 600, mt: 0.5 }}>
                            {data.checkin || t('host.bookings.not_selected')}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: { xs: 11, md: 12 }, color: '#717171', fontWeight: 500 }}>
                            {t('host.bookings.check_out')}
                          </Typography>
                          <Typography sx={{ fontSize: { xs: 12, md: 13 }, color: data.checkout ? '#222222' : '#9CA3AF', fontWeight: 600, mt: 0.5 }}>
                            {data.checkout || t('host.bookings.not_selected')}
                          </Typography>
                        </Box>
                      </Box>
                      {(errors.checkin || errors.checkout) && (
                        <Box sx={{ mt: 1 }}>
                          <InputError message={(Array.isArray(errors.checkin) ? errors.checkin[0] : errors.checkin) || (Array.isArray(errors.checkout) ? errors.checkout[0] : errors.checkout)} />
                        </Box>
                      )}
                    </Paper>
                </Box>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap justifyContent="flex-end" sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.visit('/host/bookings')}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#D1D5DB',
                      color: '#717171',
                      '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
                    }}
                  >
                    {t('host.bookings.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={processing}
                    sx={{
                      bgcolor: '#AD542D',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#78381C' }
                    }}
                  >
                    {processing ? t('host.bookings.saving') : t('host.bookings.update_booking_btn')}
                  </Button>
                </Stack>
              </Col>
            </Row>
          </form>
        </CardContent>
      </Card>
      </HostLayout>
    </>
  )
}


