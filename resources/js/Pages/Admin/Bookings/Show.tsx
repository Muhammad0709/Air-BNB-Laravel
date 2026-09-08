import React from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import { Head, usePage, router } from '@inertiajs/react'
import RtlBackArrowIcon from '../../../components/RtlBackArrowIcon'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import HotelIcon from '@mui/icons-material/Hotel'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { useLanguage } from '../../../hooks/use-language'
import { adminButtonStartIconSx } from '../../../utils/adminButtonStartIconSx'
import { getBookingStatusColor, getBookingStatusLabel } from '../../../utils/bookingStatus'

type BookingDetail = {
  id: string
  guest: string
  guestEmail: string
  guestPhone: string
  property: string
  propertyLocation: string
  checkin: string
  checkout: string
  status: string
  amount: string
  nights: number
  createdAt: string
}

export default function ShowBooking() {
  const { t } = useLanguage()
  const { id, booking: bookingProp } = (usePage().props as { id?: string; booking?: BookingDetail }) || {}
  const booking = bookingProp ?? {
    id: id || '',
    guest: '',
    guestEmail: '',
    guestPhone: '',
    property: '',
    propertyLocation: '',
    checkin: '',
    checkout: '',
    status: '',
    amount: '',
    nights: 0,
    createdAt: ''
  }

  const getStatusColor = getBookingStatusColor
  const getStatusLabel = getBookingStatusLabel

  return (
    <>
      <Head title={t('admin.bookings.view_booking')} />
      <AdminLayout title={t('admin.bookings.view_booking')}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
          <Button startIcon={<RtlBackArrowIcon />} onClick={() => router.visit('/admin/bookings')} sx={{ color: '#717171', textTransform: 'none', '&:hover': { bgcolor: '#F9FAFB', color: '#222222' }, ...adminButtonStartIconSx }}>
            {t('admin.bookings.back_to_bookings')}
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => router.visit(`/admin/bookings/${id}/edit`)} sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' }, ...adminButtonStartIconSx }}>
            {t('admin.bookings.edit_booking')}
          </Button>
        </Stack>

        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-start' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>{t('admin.bookings.booking_number')} #{booking.id}</Typography>
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Chip label={getStatusLabel(booking.status)} size="small" sx={{ bgcolor: `${getStatusColor(booking.status)}15`, color: getStatusColor(booking.status), fontWeight: 600, fontSize: 12 }} />
                  <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('admin.bookings.created')} {booking.createdAt && new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
                </Stack>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222' }}>{booking.amount}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Row>
          <Col xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>{t('admin.bookings.guest_information')}</Typography>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PersonIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('admin.bookings.guest_name')}</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guest}</Typography></Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><EmailIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('admin.bookings.email')}</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guestEmail}</Typography></Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PhoneIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('admin.bookings.phone')}</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guestPhone}</Typography></Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>{t('admin.bookings.booking_details')}</Typography>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HotelIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('admin.bookings.property')}</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.property}</Typography><Typography sx={{ fontSize: 12, color: '#717171' }}>{booking.propertyLocation}</Typography></Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarTodayIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('admin.bookings.checkin')}</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.checkin && new Date(booking.checkin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography></Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarTodayIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('admin.bookings.checkout')}</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.checkout && new Date(booking.checkout).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography></Box>
                  </Stack>
                  <Divider />
                  <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 1 }}>{t('admin.bookings.total_amount')}</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: '#222222' }}>{booking.amount}</Typography><Typography sx={{ fontSize: 12, color: '#717171', mt: 0.5 }}>{booking.nights} {booking.nights === 1 ? t('admin.bookings.night') : t('admin.bookings.nights')}</Typography></Box>
                </Stack>
              </CardContent>
            </Card>
          </Col>
        </Row>
      </AdminLayout>
    </>
  )
}
