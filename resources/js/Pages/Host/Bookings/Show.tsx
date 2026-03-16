import { Box, Button, Card, CardContent, Chip, Divider, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import { Head, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import HotelIcon from '@mui/icons-material/Hotel'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { useState } from 'react'
import Toast from '../../../components/shared/Toast'

export default function ShowBooking() {
  const { t, isRtl } = useLanguage()
  const { booking } = usePage().props as { booking: {
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
  } }
  const id = booking?.id ?? ''

  const [currentStatus, setCurrentStatus] = useState(booking.status)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const statusColors = {
    Confirmed: '#10B981',
    Pending: '#F59E0B',
    Cancelled: '#EF4444',
    Completed: '#3B82F6'
  }

  const statusColor = statusColors[currentStatus] || '#717171'

  const handleStatusChange = (newStatus: string) => {
    router.patch(`/host/bookings/${id}/status`, { status: newStatus.toLowerCase() }, {
      onSuccess: () => {
        setCurrentStatus(newStatus)
        setToast({ open: true, message: t('host.bookings.status_updated'), severity: 'success' })
      },
      onError: () => setToast({ open: true, message: t('host.bookings.update_failed'), severity: 'error' })
    })
  }

  return (
    <>
      <Head title={t('host.bookings.view_booking_title')} />
      <HostLayout title={t('host.bookings.view_booking_title')}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
        <Button
          startIcon={isRtl ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          onClick={() => router.visit('/host/bookings')}
          sx={{
            color: '#717171',
            textTransform: 'none',
            gap: 1,
            '& .MuiButton-startIcon': { marginInlineEnd: 0, marginInlineStart: 0 },
            '&:hover': { bgcolor: '#F9FAFB', color: '#222222' }
          }}
        >
          {t('host.bookings.back_to_bookings')}
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => router.visit(`/host/bookings/${id}/edit`)}
          fullWidth={window.innerWidth < 600}
          sx={{
            bgcolor: '#AD542D',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#78381C' }
          }}
        >
          {t('host.bookings.edit_booking_title')}
        </Button>
      </Stack>

      {/* Booking Header */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-start' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>
                Booking #{booking.id}
              </Typography>
              <Typography sx={{ color: '#717171', fontSize: 14 }}>
                Created {new Date(booking.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('host.bookings.status')}:</Typography>
                <FormControl size="small">
                  <Select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    sx={{
                      minWidth: 150,
                      bgcolor: `${statusColor}15`,
                      color: statusColor,
                      fontWeight: 600,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: statusColor }
                    }}
                  >
                    <MenuItem value="Pending">{t('host.bookings.status_pending')}</MenuItem>
                    <MenuItem value="Confirmed">{t('host.bookings.status_confirmed')}</MenuItem>
                    <MenuItem value="Completed">{t('host.earnings.completed')}</MenuItem>
                    <MenuItem value="Cancelled">{t('host.bookings.status_cancelled')}</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222' }}>
                {booking.amount}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Row>
        <Col xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>
                Guest Information
              </Typography>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.bookings.guest_name')}</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guest}</Typography>
                  </Box>
                </Stack>
                <Divider />
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Email</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guestEmail}</Typography>
                  </Box>
                </Stack>
                <Divider />
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PhoneIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Phone</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guestPhone}</Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>
                Booking Details
              </Typography>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <HotelIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Property</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.property}</Typography>
                    <Typography sx={{ fontSize: 12, color: '#717171' }}>{booking.propertyLocation}</Typography>
                  </Box>
                </Stack>
                <Divider />
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Check-in</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                      {new Date(booking.checkin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Check-out</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                      {new Date(booking.checkout).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#717171', mb: 1 }}>{t('host.bookings.total_amount')}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222' }}>
                    {booking.amount}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#717171', mt: 0.5 }}>
                    {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Col>
      </Row>
      </HostLayout>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </>
  )
}

