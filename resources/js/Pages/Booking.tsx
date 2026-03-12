import React, { useState, useEffect } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Paper, Radio, RadioGroup, FormControlLabel, Select, Stack, TextField, Typography } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/shared/Toast'
import { Container, Row, Col } from 'react-bootstrap'
import { router, Head, usePage } from '@inertiajs/react'
import ListingPreviewCard from '../components/ListingPreviewCard'
import BookingSummaryCard from '../components/BookingSummaryCard'
import { useLanguage } from '../hooks/use-language'
import { useCurrency } from '../contexts/CurrencyContext'
import { formatPrice } from '../utils/currency'
import PhoneCountrySelect from '../components/PhoneCountrySelect'

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
  costs: Array<{ label: string; amount: number }>
  totalAmount: number
  rules: string[]
}

export default function Booking() {
  const { t } = useLanguage()
  const { currency } = useCurrency()
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

  const [formData, setFormData] = useState<{
    name: string
    email: string
    phone: string
    phoneCode: string
    guests: number
    rooms: number | ''
    adults: number | ''
    children: number
  }>({
    name: '',
    email: '',
    phone: '',
    phoneCode: '+31',
    guests: 1,
    rooms: '',
    adults: '',
    children: 0,
  })

  const maxRooms = property ? Math.max(10, Math.min(20, property.bedrooms || 1)) : 10
  const roomOptions = Array.from({ length: maxRooms }, (_, i) => i + 1)

  useEffect(() => {
    if (property) {
      setFormData(prev => ({
        ...prev,
        guests: Math.max(1, property.guests || 1),
        adults: prev.adults === '' ? '' : Math.max(1, property.guests ? Math.min(property.guests, 10) : 1),
        children: 0,
      }))
    }
  }, [property?.id, property?.bedrooms, property?.guests])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = t('booking.err_name_required')
    else if (formData.name.trim().length < 2) newErrors.name = t('booking.err_name_min')

    if (!formData.email.trim()) newErrors.email = t('booking.err_email_required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('booking.err_email_invalid')

    if (!formData.phone.trim()) newErrors.phone = t('booking.err_phone_required')
    else if (!/^\d{7,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) newErrors.phone = t('booking.err_phone_invalid')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const [submitting, setSubmitting] = useState(false)

  const handleBookClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      setToast({ open: true, message: t('booking.toast_fix_errors'), severity: 'error' })
      return
    }
    if (!property?.id) {
      setToast({ open: true, message: t('booking.select_property'), severity: 'error' })
      return
    }
    // Open payment modal
    setPaymentModalOpen(true)
  }

  const handleConfirmBooking = () => {
    setPaymentModalOpen(false)
    setSubmitting(true)
    router.post('/booking', {
      property_id: property.id,
      checkin,
      checkout,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone_code: formData.phoneCode || '+31',
      phone: formData.phone.trim(),
      rooms: (formData.rooms === '' ? (property?.bedrooms || 1) : formData.rooms) ?? 1,
      adults: (formData.adults === '' ? 1 : formData.adults) ?? 1,
      children: formData.children ?? 0,
      payment_method: paymentMethod,
    }, {
      onFinish: () => setSubmitting(false),
      onError: (errors) => setErrors(errors as Record<string, string>),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleBookClick(e)
  }

  return (
    <>
      <Head title={t('booking.title')} />
      <Box>
        <Navbar />
        <Box className="booking-page">
          <Container className="px-0">
            <Box sx={{ mb: 2, mt: 4 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, fontWeight: 800, color: '#222222', mb: 2 }}>
                {t('booking.title')}
              </Typography>
            </Box>

            <Row>
              <Col xs={12} md={7} lg={8} className="px-0">
                <Paper elevation={0} className="booking-form">
                  <Typography className="section-title" sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' }, fontWeight: 700, color: '#222222', mb: 2 }}>{t('booking.guest_details')}</Typography>

                  <form onSubmit={handleSubmit}>
                    {property && (
                      <Stack direction="row" spacing={1.5} useFlexGap className="field" sx={{ mb: 2 }}>
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
                        {nights !== 1
                          ? t('booking.nights_note_plural').replace(':count', String(nights))
                          : t('booking.nights_note').replace(':count', String(nights))}
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
                      <Typography className="label">{t('booking.number_of_rooms')}</Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={formData.rooms === '' ? '' : formData.rooms}
                          displayEmpty
                          renderValue={(v) => (v === '' || v === undefined ? t('booking.number_of_rooms') : `${v} ${v > 1 ? t('booking.rooms') : t('booking.room')}`)}
                          onChange={(e) => handleChange('rooms', e.target.value === '' ? '' : Number(e.target.value))}
                        >
                          <MenuItem value="" disabled>{t('booking.number_of_rooms')}</MenuItem>
                          {roomOptions.map((r) => (
                            <MenuItem key={r} value={r}>{r} {r > 1 ? t('booking.rooms') : t('booking.room')}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Stack direction="row" spacing={1.5} useFlexGap className="field">
                      <Box sx={{ flex: 1 }}>
                        <Typography className="label">{t('booking.adults')}</Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={formData.adults === '' ? '' : formData.adults}
                            displayEmpty
                            renderValue={(v) => (v === '' || v === undefined ? t('booking.adults') : `${v} ${v === 1 ? t('booking.adult') : t('booking.adults')}`)}
                            onChange={(e) => handleChange('adults', e.target.value === '' ? '' : Number(e.target.value))}
                          >
                            <MenuItem value="" disabled>{t('booking.adults')}</MenuItem>
                            {[1,2,3,4,5,6,7,8,9,10].map((a) => (
                              <MenuItem key={a} value={a}>{a} {a > 1 ? t('booking.adults') : t('booking.adult')}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography className="label">{t('booking.children')}</Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={formData.children}
                            displayEmpty
                            renderValue={(v) => (v === 0 ? t('booking.children') : `${v} ${v === 1 ? t('booking.child') : t('booking.children')}`)}
                            onChange={(e) => handleChange('children', Number(e.target.value))}
                          >
                            <MenuItem value={0}>{t('booking.children')}</MenuItem>
                            {[1,2,3,4,5,6,7,8,9,10].map((c) => (
                              <MenuItem key={c} value={c}>{c} {c === 1 ? t('booking.child') : t('booking.children')}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Stack>

                    <Box className="field">
                      <Typography className="label">{t('booking.email')}</Typography>
                      <TextField 
                        size="small" 
                        placeholder={t('booking.email_placeholder')} 
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
                      <Typography className="label">{t('booking.phone_number')}</Typography>
                      <Stack direction="row" spacing={1.5} useFlexGap>
                        <PhoneCountrySelect
                          value={formData.phoneCode}
                          onChange={(code) => handleChange('phoneCode', code)}
                        />
                        <TextField 
                          size="small" 
                          fullWidth 
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          error={!!errors.phone}
                          helperText={errors.phone}
                        />
                      </Stack>
                      <Typography className="help">{t('booking.phone_note')}</Typography>
                    </Box>

                    <Paper elevation={0} className="booking-total">
                      <Typography>{t('booking.total')}</Typography>
                      <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                        <Typography className="grand-total">{formatPrice(totalAmount, currency)}</Typography>
                        <Button type="submit" variant="contained" className="request-btn" disabled={submitting}>{submitting ? '...' : t('booking.book_btn')}</Button>
                      </Stack>
                    </Paper>
                  </form>
                </Paper>
              </Col>

              <Col xs={12} md={5} lg={4}>
                <ListingPreviewCard
                  image={property?.image ?? PLACEHOLDER_IMAGE}
                  title={property?.title ?? t('booking.select_property')}
                  location={property?.location ?? '—'}
                  reviews={property?.reviews_count ?? 0}
                  rating={property?.rating ?? 0}
                />

                <BookingSummaryCard
                  rules={rules}
                  costs={costs.map((c) => ({ label: c.label, amount: formatPrice(c.amount, currency) }))}
                  totalAmount={formatPrice(totalAmount, currency)}
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

        {/* Payment Method Modal */}
        <Dialog 
          open={paymentModalOpen} 
          onClose={() => setPaymentModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
            {t('booking.payment_method_title')}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 3, color: '#6B7280' }}>
              {t('booking.payment_method_subtitle')}
            </Typography>
            
            <RadioGroup 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  border: '2px solid', 
                  borderColor: paymentMethod === 'cash' ? '#AD542D' : '#E5E7EB',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setPaymentMethod('cash')}
              >
                <FormControlLabel 
                  value="cash" 
                  control={<Radio sx={{ color: '#AD542D', '&.Mui-checked': { color: '#AD542D' } }} />} 
                  label={
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {t('booking.payment_cash')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                        {t('booking.payment_cash_desc')}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: '2px solid', 
                  borderColor: paymentMethod === 'online' ? '#AD542D' : '#E5E7EB',
                  borderRadius: 2,
                  cursor: 'not-allowed',
                  opacity: 0.6,
                  transition: 'all 0.2s'
                }}
              >
                <FormControlLabel 
                  value="online" 
                  control={<Radio disabled />} 
                  label={
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {t('booking.payment_online')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5, fontStyle: 'italic' }}>
                        {t('booking.coming_soon')}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                  disabled
                />
              </Paper>
            </RadioGroup>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => setPaymentModalOpen(false)}
              sx={{ color: '#6B7280' }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleConfirmBooking}
              variant="contained"
              disabled={submitting}
              sx={{ 
                bgcolor: '#AD542D', 
                '&:hover': { bgcolor: '#78381C' },
                minWidth: 120
              }}
            >
              {submitting ? '...' : t('booking.confirm_booking')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  )
}
