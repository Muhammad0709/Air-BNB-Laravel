import { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import Toast from '../../../Components/Admin/Toast'
import { Head, router, usePage } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

export default function EditBooking() {
  const { id } = (usePage().props as { id?: string }) || {}
  const [toastOpen, setToastOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCheckin, setSelectedCheckin] = useState<Date | null>(null)
  const [selectedCheckout, setSelectedCheckout] = useState<Date | null>(null)
  const [renderKey, setRenderKey] = useState(0)
  
  const [formData, setFormData] = useState({
    guest: '',
    guestEmail: '',
    guestPhone: '',
    property: '',
    checkin: '',
    checkout: '',
    status: 'Pending',
    amount: ''
  })

  // Mock properties - in real app, fetch from API
  const properties = [
    { id: 1, title: 'Luxury Beachfront Villa', location: 'Malibu, California' },
    { id: 2, title: 'Modern Apartment', location: 'Los Angeles, CA' },
    { id: 3, title: 'Cozy Studio', location: 'San Francisco, CA' },
  ]

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockBooking = {
      id: id || '1',
      guest: 'John Doe',
      guestEmail: 'john.doe@example.com',
      guestPhone: '+1 (555) 123-4567',
      property: 'Luxury Beachfront Villa',
      checkin: '2025-01-15',
      checkout: '2025-01-20',
      status: 'Confirmed',
      amount: '1495'
    }

    setFormData({
      guest: mockBooking.guest,
      guestEmail: mockBooking.guestEmail,
      guestPhone: mockBooking.guestPhone,
      property: mockBooking.property,
      checkin: mockBooking.checkin,
      checkout: mockBooking.checkout,
      status: mockBooking.status,
      amount: mockBooking.amount
    })

    // Set calendar month and selected dates
    // Parse date string manually to avoid timezone issues
    const [checkinYear, checkinMonth, checkinDay] = mockBooking.checkin.split('-').map(Number)
    const checkinDate = new Date(checkinYear, checkinMonth - 1, checkinDay)
    checkinDate.setHours(0, 0, 0, 0)
    
    const [checkoutYear, checkoutMonth, checkoutDay] = mockBooking.checkout.split('-').map(Number)
    const checkoutDate = new Date(checkoutYear, checkoutMonth - 1, checkoutDay)
    checkoutDate.setHours(0, 0, 0, 0)
    
    // Ensure we create new Date objects to trigger re-render
    const checkinDateCopy = new Date(checkinDate.getTime())
    const checkoutDateCopy = new Date(checkoutDate.getTime())
    
    // Set dates in a batch to ensure React re-renders
    setCurrentMonth(new Date(checkinDateCopy))
    setSelectedCheckin(new Date(checkinDateCopy))
    setSelectedCheckout(new Date(checkoutDateCopy))
    
    // Debug: Log the dates being set
    console.log('Setting dates:', {
      checkin: checkinDateCopy.toISOString(),
      checkout: checkoutDateCopy.toISOString(),
      checkinTime: checkinDateCopy.getTime(),
      checkoutTime: checkoutDateCopy.getTime()
    })
  }, [id])

  // Force re-render when dates are set
  useEffect(() => {
    if (selectedCheckin && selectedCheckout) {
      // Force a re-render by updating a counter
      setRenderKey(prev => prev + 1)
    }
  }, [selectedCheckin, selectedCheckout])

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
    // Normalize the clicked date
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)
    
    if (!selectedCheckin || (selectedCheckin && selectedCheckout)) {
      // Start new selection
      setSelectedCheckin(new Date(normalizedDate))
      setSelectedCheckout(null)
      const dateStr = `${normalizedDate.getFullYear()}-${String(normalizedDate.getMonth() + 1).padStart(2, '0')}-${String(normalizedDate.getDate()).padStart(2, '0')}`
      setFormData(prev => ({ ...prev, checkin: dateStr, checkout: '' }))
    } else if (selectedCheckin && !selectedCheckout) {
      // Normalize selectedCheckin for comparison
      const normalizedCheckin = new Date(selectedCheckin)
      normalizedCheckin.setHours(0, 0, 0, 0)
      
      // Select checkout date
      if (normalizedDate > normalizedCheckin) {
        setSelectedCheckout(new Date(normalizedDate))
        const dateStr = `${normalizedDate.getFullYear()}-${String(normalizedDate.getMonth() + 1).padStart(2, '0')}-${String(normalizedDate.getDate()).padStart(2, '0')}`
        setFormData(prev => ({ ...prev, checkout: dateStr }))
      } else if (normalizedDate < normalizedCheckin) {
        // If clicked date is before checkin, make it the new checkin
        setSelectedCheckin(new Date(normalizedDate))
        setSelectedCheckout(null)
        const dateStr = `${normalizedDate.getFullYear()}-${String(normalizedDate.getMonth() + 1).padStart(2, '0')}-${String(normalizedDate.getDate()).padStart(2, '0')}`
        setFormData(prev => ({ ...prev, checkin: dateStr, checkout: '' }))
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
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Updated booking data:', formData)
    setToastOpen(true)
    // Navigate back to bookings list after successful submission
    setTimeout(() => {
      router.visit('/host/bookings')
    }, 1500)
  }

  const handleToastClose = () => {
    setToastOpen(false)
  }

  return (
    <>
      <Head title="Edit Booking" />
      <HostLayout title="Edit Booking">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.visit('/host/bookings')}
        sx={{
          mb: 3,
          color: '#717171',
          textTransform: 'none',
          '&:hover': { bgcolor: '#F9FAFB', color: '#222222' }
        }}
      >
        Back to Bookings
      </Button>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222', mb: 4 }}>
            Edit Booking Information
          </Typography>

          <form onSubmit={handleSubmit}>
            <Row>
              <Col xs={12} md={6}>
                <Stack spacing={3} sx={{ mb: { xs: 3, md: 0 } }}>
                  <TextField
                    label="Guest Name"
                    name="guest"
                    value={formData.guest}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Email Address"
                    name="guestEmail"
                    type="email"
                    value={formData.guestEmail}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Phone Number"
                    name="guestPhone"
                    value={formData.guestPhone}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <FormControl fullWidth required>
                    <InputLabel>Property</InputLabel>
                    <Select
                      value={formData.property}
                      onChange={(e) => handleSelectChange('property', e.target.value)}
                      label="Property"
                    >
                      {properties.map((property) => (
                        <MenuItem key={property.id} value={property.title}>
                          {property.title} - {property.location}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Col>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <TextField
                    label="Total Amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: '#717171' }}>$</Typography>
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleSelectChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Confirmed">Confirmed</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Col>
            </Row>

            {/* Calendar Section */}
            <Row className="mt-4">
              <Col xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>
                  Select Dates
                </Typography>
                <Box sx={{ width: '100%', maxWidth: { xs: '100%', lg: '500px' }, mx: 'auto', px: { xs: 0, sm: 1 } }}>
                  <Paper 
                    key={`calendar-${currentMonth.getTime()}-${selectedCheckin?.getTime() || 0}-${selectedCheckout?.getTime() || 0}-${renderKey}`}
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
                          
                          // Debug: Log actual boolean values
                          if (d.day >= 14 && d.day <= 20 && !d.isOtherMonth) {
                            console.log(`Date ${d.day}: isStart=${isStart}, isEnd=${isEnd}, isInRange=${isInRange}, isSelected=${isSelected}, bgcolor will be:`, isSelected ? '#AD542D' : isInRange ? '#FFF5F5' : 'transparent')
                          }
                          
                          // Force React to see this as a new component when dates change
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
                                backgroundColor: isSelected ? '#AD542D' : isInRange ? '#FFF5F5' : 'transparent',
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
                            Check-in
                          </Typography>
                          <Typography sx={{ fontSize: { xs: 12, md: 13 }, color: formData.checkin ? '#222222' : '#9CA3AF', fontWeight: 600, mt: 0.5 }}>
                            {formData.checkin || 'Not selected'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: { xs: 11, md: 12 }, color: '#717171', fontWeight: 500 }}>
                            Check-out
                          </Typography>
                          <Typography sx={{ fontSize: { xs: 12, md: 13 }, color: formData.checkout ? '#222222' : '#9CA3AF', fontWeight: 600, mt: 0.5 }}>
                            {formData.checkout || 'Not selected'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                </Box>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" sx={{ width: '100%' }}>
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
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      bgcolor: '#AD542D',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#78381C' }
                    }}
                  >
                    Update Booking
                  </Button>
                </Stack>
              </Col>
            </Row>
          </form>
        </CardContent>
      </Card>
      <Toast
        open={toastOpen}
        onClose={handleToastClose}
        message="Booking updated successfully!"
        severity="success"
      />
      </HostLayout>
    </>
  )
}


