import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import { Head, usePage, router } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import HotelIcon from '@mui/icons-material/Hotel'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'

export default function ShowBooking() {
  const { id } = (usePage().props as { id?: string }) || {}
  const [booking, setBooking] = useState({
    id: '',
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
  })

  useEffect(() => {
    const mockBooking = {
      id: id || '1',
      guest: 'John Doe',
      guestEmail: 'john.doe@example.com',
      guestPhone: '+1 (555) 123-4567',
      property: 'Luxury Beachfront Villa',
      propertyLocation: 'Malibu, California',
      checkin: '2025-01-15',
      checkout: '2025-01-20',
      status: 'Confirmed',
      amount: '$1,495',
      nights: 5,
      createdAt: '2025-01-10'
    }
    setBooking(mockBooking)
  }, [id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return '#10B981'
      case 'Pending': return '#F59E0B'
      case 'Cancelled': return '#EF4444'
      default: return '#717171'
    }
  }

  return (
    <>
      <Head title="View Booking" />
      <AdminLayout title="View Booking">
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.visit('/admin/bookings')} sx={{ color: '#717171', textTransform: 'none', '&:hover': { bgcolor: '#F9FAFB', color: '#222222' } }}>
            Back to Bookings
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => router.visit(`/admin/bookings/${id}/edit`)} sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}>
            Edit Booking
          </Button>
        </Stack>

        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-start' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>Booking #{booking.id}</Typography>
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Chip label={booking.status} size="small" sx={{ bgcolor: `${getStatusColor(booking.status)}15`, color: getStatusColor(booking.status), fontWeight: 600, fontSize: 12 }} />
                  <Typography sx={{ color: '#717171', fontSize: 14 }}>Created {booking.createdAt && new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
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
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>Guest Information</Typography>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PersonIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Guest Name</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guest}</Typography></Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><EmailIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Email</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guestEmail}</Typography></Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PhoneIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Phone</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guestPhone}</Typography></Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>Booking Details</Typography>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HotelIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Property</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.property}</Typography><Typography sx={{ fontSize: 12, color: '#717171' }}>{booking.propertyLocation}</Typography></Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarTodayIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Check-in</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.checkin && new Date(booking.checkin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography></Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarTodayIcon sx={{ fontSize: 20, color: '#717171' }} /></Box>
                    <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Check-out</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.checkout && new Date(booking.checkout).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography></Box>
                  </Stack>
                  <Divider />
                  <Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 1 }}>Total Amount</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: '#222222' }}>{booking.amount}</Typography><Typography sx={{ fontSize: 12, color: '#717171', mt: 0.5 }}>{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</Typography></Box>
                </Stack>
              </CardContent>
            </Card>
          </Col>
        </Row>
      </AdminLayout>
    </>
  )
}
