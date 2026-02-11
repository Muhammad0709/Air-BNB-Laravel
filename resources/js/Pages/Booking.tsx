import React, { useState, useEffect } from 'react'
import { Box, Button, FormControl, InputAdornment, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/shared/Toast'
import { Container, Row, Col } from 'react-bootstrap'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import { router, Head, usePage } from '@inertiajs/react'
import ListingPreviewCard from '../components/ListingPreviewCard'
import BookingSummaryCard from '../components/BookingSummaryCard'
import { useLanguage } from '../hooks/use-language'

const PLACEHOLDER_IMAGE = '/images/popular-stay-1.svg'

type BookingProperty = {
  id: number
  title: string
  location: string
  image: string
  price: number
  bedrooms: number
  bathrooms: number
  guests: number
  reviews_count: number
  rating: number
}

type BookingPageProps = {
  property: BookingProperty | null
  nights: number
  checkin: string
  checkout: string
  costs: Array<{ label: string; amount: string }>
  totalAmount: string
  rules: string[]
}

export default function Booking() {
  const { t } = useLanguage()
  const { property, nights, checkin, checkout, costs, totalAmount, rules } = usePage<BookingPageProps>().props

  const updateDates = (newCheckin: string, newCheckout: string) => {
    const params: Record<string, string> = {}
    if (property?.id) params.property_id = String(property.id)
    params.checkin = newCheckin
    params.checkout = newCheckout
    const url = `/booking?${new URLSearchParams(params).toString()}`
    // Partial reload: only refresh price-related props so they update; form state is preserved
    router.visit(url, {
      method: 'get',
      preserveState: true,
      only: ['costs', 'totalAmount', 'nights', 'checkin', 'checkout'],
    })
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phoneCode: '+31',
    guests: 1,
    rooms: 1,
    adults: 1,
    children: 0,
    paymentMethod: 'ideal',
    cardNumber: '',
    expiryDate: '',
    csv: ''
  })

  useEffect(() => {
    if (property) {
      setFormData(prev => ({
        ...prev,
        rooms: Math.max(1, property.bedrooms || 1),
        guests: Math.max(1, property.guests || 1),
        adults: Math.max(1, property.guests ? Math.min(property.guests, 10) : 1),
        children: 0
      }))
    }
  }, [property])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters'

    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email'

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\d{7,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) newErrors.phone = 'Please enter a valid phone number'

    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required'
    else if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s|-/g, ''))) newErrors.cardNumber = 'Please enter a valid card number'

    if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required'
    else if (!/^(0[1-9]|1[0-2])\/\d{2,4}$/.test(formData.expiryDate)) newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)'

    if (!formData.csv.trim()) newErrors.csv = 'CVC/CVV is required'
    else if (!/^\d{3,4}$/.test(formData.csv)) newErrors.csv = 'Please enter a valid CSV/CVC'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      setToast({ open: true, message: 'Booking request submitted successfully!', severity: 'success' })
      let url = '/confirmation'
      if (property) {
        const params = new URLSearchParams({ property_id: String(property.id) })
        if (checkin) params.set('checkin', checkin)
        if (checkout) params.set('checkout', checkout)
        url = `/confirmation?${params.toString()}`
      }
      setTimeout(() => router.visit(url), 1000)
    } else {
      setToast({ open: true, message: 'Please fix the errors in the form', severity: 'error' })
    }
  }

  return (
    <>
      <Head title={t('booking.title')} />
      <Box>
        <Navbar />
        <Box className="booking-page">
          <Container className="px-0">
            <Box sx={{ mb: 2, mt: 4 }}>
              <Typography variant="h2" sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#222222', mb: 2 }}>
                {t('booking.title')}
              </Typography>
            </Box>

            <Row>
              <Col xs={12} md={7} lg={8} className="px-0">
                <Paper elevation={0} className="booking-form">
                  <Typography className="section-title" sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#222222', mb: 2 }}>{t('booking.guest_details')}</Typography>

                  <form onSubmit={handleSubmit}>
                    {property && (
                      <Stack direction="row" spacing={1.5} className="field" sx={{ mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography className="label">{t('home.checkin')}</Typography>
                          <TextField
                            size="small"
                            fullWidth
                            type="date"
                            value={checkin}
                            onChange={(e) => {
                              const newCheckin = e.target.value
                              let newCheckout = checkout
                              if (new Date(newCheckin) >= new Date(checkout)) {
                                const d = new Date(newCheckin)
                                d.setDate(d.getDate() + 1)
                                newCheckout = d.toISOString().slice(0, 10)
                              }
                              updateDates(newCheckin, newCheckout)
                            }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography className="label">{t('home.checkout')}</Typography>
                          <TextField
                            size="small"
                            fullWidth
                            type="date"
                            value={checkout}
                            onChange={(e) => {
                              const newCheckout = e.target.value
                              if (new Date(newCheckout) <= new Date(checkin)) return
                              updateDates(checkin, newCheckout)
                            }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: checkin }}
                          />
                        </Box>
                      </Stack>
                    )}
                    {property && (
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                        {nights} night{nights !== 1 ? 's' : ''} · Price details update when you change dates
                      </Typography>
                    )}
                    <Box className="field">
                      <Typography className="label">{t('booking.name')}</Typography>
                      <TextField 
                        size="small" 
                        fullWidth 
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        error={!!errors.name}
                        helperText={errors.name}
                      />
                    </Box>

                    <Box className="field">
                      <Typography className="label">Number of Rooms</Typography>
                      <FormControl fullWidth size="small">
                        <Select 
                          value={formData.rooms} 
                          displayEmpty
                          onChange={(e) => handleChange('rooms', Number(e.target.value))}
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map((r) => (
                            <MenuItem key={r} value={r}>{r} {r > 1 ? 'rooms' : 'room'}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Stack direction="row" spacing={1.5} className="field">
                      <Box sx={{ flex: 1 }}>
                        <Typography className="label">Adults</Typography>
                        <FormControl fullWidth size="small">
                          <Select 
                            value={formData.adults} 
                            displayEmpty
                            onChange={(e) => handleChange('adults', Number(e.target.value))}
                          >
                            {[1,2,3,4,5,6,7,8,9,10].map((a) => (
                              <MenuItem key={a} value={a}>{a} {a > 1 ? 'adults' : 'adult'}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography className="label">Children</Typography>
                        <FormControl fullWidth size="small">
                          <Select 
                            value={formData.children} 
                            displayEmpty
                            onChange={(e) => handleChange('children', Number(e.target.value))}
                          >
                            {[0,1,2,3,4,5,6,7,8,9,10].map((c) => (
                              <MenuItem key={c} value={c}>{c} {c === 1 ? 'child' : c === 0 ? 'children' : 'children'}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Stack>

                    <Box className="field">
                      <Typography className="label">Email</Typography>
                      <TextField 
                        size="small" 
                        placeholder="example@gmail.com" 
                        fullWidth 
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        error={!!errors.email}
                        helperText={errors.email}
                      />
                    </Box>

                    <Box className="field">
                      <Typography className="label">Phone Number</Typography>
                      <Stack direction="row" spacing={1.5}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select 
                            value={formData.phoneCode}
                            onChange={(e) => handleChange('phoneCode', e.target.value)}
                          >
                            {['+31','+44','+1','+92'].map((c) => (
                              <MenuItem key={c} value={c}>{c}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField 
                          size="small" 
                          fullWidth 
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          error={!!errors.phone}
                          helperText={errors.phone}
                        />
                      </Stack>
                      <Typography className="help">We will only contact you about your booking</Typography>
                    </Box>

                    <Typography className="section-title" sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#222222', mb: 2, mt: 1.5 }}>Card info</Typography>
                    <Box className="field">
                      <Typography className="label">Card Number</Typography>
                      <TextField 
                        size="small" 
                        fullWidth 
                        value={formData.cardNumber}
                        onChange={(e) => handleChange('cardNumber', e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><CreditCardIcon sx={{ color: '#9CA3AF' }} /></InputAdornment> }}
                        error={!!errors.cardNumber}
                        helperText={errors.cardNumber}
                      />
                    </Box>

                    <Stack direction="row" spacing={1.5} className="field">
                      <Box sx={{ flex: 1 }}>
                        <Typography className="label">Expiry Date</Typography>
                        <TextField 
                          size="small" 
                          fullWidth 
                          placeholder="MM/YY" 
                          value={formData.expiryDate}
                          onChange={(e) => handleChange('expiryDate', e.target.value)}
                          error={!!errors.expiryDate}
                          helperText={errors.expiryDate}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography className="label">CSV/CVC</Typography>
                        <TextField 
                          size="small" 
                          fullWidth 
                          placeholder="123" 
                          value={formData.csv}
                          onChange={(e) => handleChange('csv', e.target.value)}
                          error={!!errors.csv}
                          helperText={errors.csv}
                        />
                      </Box>
                    </Stack>

                    <Paper elevation={0} className="booking-total">
                      <Typography>Total</Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography className="grand-total">{totalAmount}</Typography>
                        <Button type="submit" variant="contained" className="request-btn">Book</Button>
                      </Stack>
                    </Paper>
                  </form>
                </Paper>
              </Col>

              <Col xs={12} md={5} lg={4}>
                <ListingPreviewCard
                  image={property?.image ?? PLACEHOLDER_IMAGE}
                  title={property?.title ?? 'Select a property'}
                  location={property?.location ?? '—'}
                  reviews={property?.reviews_count ?? 0}
                  rating={property?.rating ?? 0}
                />

                <BookingSummaryCard
                  rules={rules}
                  costs={costs}
                  totalAmount={totalAmount}
                />
              </Col>
            </Row>
          </Container>
        </Box>
        <Footer />
        
        <Toast
          open={toast.open}
          onClose={() => setToast({ ...toast, open: false })}
          message={toast.message}
          severity={toast.severity}
        />
      </Box>
    </>
  )
}
