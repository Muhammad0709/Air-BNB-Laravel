import React from 'react'
import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import { Head, usePage, router, useForm } from '@inertiajs/react'
import RtlBackArrowIcon from '../../../components/RtlBackArrowIcon'
import { useLanguage } from '../../../hooks/use-language'
import { adminButtonStartIconSx } from '../../../utils/adminButtonStartIconSx'
import { ALL_BOOKING_STATUSES, getBookingStatusLabel } from '../../../utils/bookingStatus'

type PropertyOption = { id: number; title: string; location: string }

type BookingFormData = {
  guest: string
  guestEmail: string
  guestPhone: string
  property: string
  checkin: string
  checkout: string
  status: string
  amount: string
}

export default function EditBooking() {
  const { t } = useLanguage()
  const { id, booking, properties: propertiesList } = (usePage().props as { id?: string; booking?: BookingFormData; properties?: PropertyOption[] }) || {}
  const properties = propertiesList ?? []
  const { data: formData, setData: setFormData, put, transform, processing, errors } = useForm<BookingFormData>(booking ?? {
    guest: '',
    guestEmail: '',
    guestPhone: '',
    property: '',
    checkin: '',
    checkout: '',
    status: 'pending',
    amount: ''
  })

  transform((data) => ({ ...data, property_id: data.property }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(name as keyof BookingFormData, value)
  }

  const handleSelectChange = (name: keyof BookingFormData, value: string) => {
    setFormData(name, value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`/admin/bookings/${id}`)
  }

  return (
    <>
      <Head title={t('admin.bookings.edit_booking')} />
      <AdminLayout title={t('admin.bookings.edit_booking')}>
        <Button startIcon={<RtlBackArrowIcon />} onClick={() => router.visit('/admin/bookings')} sx={{ mb: 3, color: '#717171', textTransform: 'none', '&:hover': { bgcolor: '#F9FAFB', color: '#222222' }, ...adminButtonStartIconSx }}>
          {t('admin.bookings.back_to_bookings')}
        </Button>
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222', mb: 4 }}>{t('admin.bookings.edit_booking_information')}</Typography>
            <form onSubmit={handleSubmit}>
              <Row>
                <Col xs={12} md={6}>
                  <Stack spacing={3} sx={{ mb: { xs: 3, md: 0 } }}>
                    <TextField label={t('admin.bookings.guest_name')} name="guest" value={formData.guest} onChange={handleChange} required fullWidth error={!!errors.guest} helperText={errors.guest} />
                    <TextField label={t('admin.bookings.email_address')} name="guestEmail" type="email" value={formData.guestEmail} onChange={handleChange} required fullWidth error={!!errors.guestEmail} helperText={errors.guestEmail} />
                    <TextField label={t('admin.bookings.phone_number')} name="guestPhone" value={formData.guestPhone} onChange={handleChange} required fullWidth error={!!errors.guestPhone} helperText={errors.guestPhone} />
                  </Stack>
                </Col>
                <Col xs={12} md={6}>
                  <Stack spacing={3}>
                    <FormControl fullWidth required error={!!errors.property_id}>
                      <InputLabel>{t('admin.bookings.property')}</InputLabel>
                      <Select value={formData.property} onChange={(e) => handleSelectChange('property', e.target.value)} label={t('admin.bookings.property')}>
                        {properties.map((p) => (
                          <MenuItem key={p.id} value={String(p.id)}>{p.title} — {p.location}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField label={t('admin.bookings.checkin_date')} name="checkin" type="date" value={formData.checkin} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} error={!!errors.checkin} helperText={errors.checkin} />
                    <TextField label={t('admin.bookings.checkout_date')} name="checkout" type="date" value={formData.checkout} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} error={!!errors.checkout} helperText={errors.checkout} />
                  </Stack>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col xs={12} md={6}>
                  <TextField label={t('admin.bookings.total_amount')} name="amount" type="number" value={formData.amount} onChange={handleChange} required fullWidth InputProps={{ startAdornment: <Typography sx={{ marginInlineEnd: 1, color: '#717171' }}>$</Typography> }} sx={{ mb: { xs: 3, md: 0 } }} error={!!errors.amount} helperText={errors.amount} />
                </Col>
                <Col xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('admin.bookings.status')}</InputLabel>
                    <Select value={formData.status} onChange={(e) => handleSelectChange('status', e.target.value)} label={t('admin.bookings.status')}>
                      {ALL_BOOKING_STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>{getBookingStatusLabel(s)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col xs={12}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap justifyContent="flex-end" sx={{ width: '100%' }}>
                    <Button variant="outlined" type="button" onClick={() => router.visit('/admin/bookings')} sx={{ textTransform: 'none', borderColor: '#D1D5DB', color: '#717171', '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>{t('common.cancel')}</Button>
                    <Button type="submit" variant="contained" disabled={processing} sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}>{t('admin.bookings.update_booking')}</Button>
                  </Stack>
                </Col>
              </Row>
            </form>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  )
}
