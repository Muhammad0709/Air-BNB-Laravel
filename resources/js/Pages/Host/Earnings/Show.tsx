import { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import { Head, router, usePage } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import HomeIcon from '@mui/icons-material/Home'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'

export default function ShowEarning() {
  const { id } = (usePage().props as { id?: string }) || {}
  const [earning, setEarning] = useState({
    id: '',
    bookingId: '',
    guest: '',
    property: '',
    date: '',
    amount: '',
    status: '',
    payoutDate: '',
    nights: 0,
    commission: '',
    netAmount: ''
  })

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockEarning = {
      id: id || '1',
      bookingId: 'BK-001',
      guest: 'John Doe',
      property: 'Luxury Beachfront Villa',
      date: '2025-01-15',
      amount: '$1,495',
      status: 'Paid',
      payoutDate: '2025-01-20',
      nights: 5,
      commission: '$149.50',
      netAmount: '$1,345.50'
    }
    setEarning(mockEarning)
  }, [id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return '#10B981'
      case 'Pending': return '#F59E0B'
      case 'Cancelled': return '#EF4444'
      default: return '#717171'
    }
  }

  return (
    <>
      <Head title="Earning Details" />
      <HostLayout title="Earning Details">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.visit('/host/earnings')}
        sx={{
          mb: 3,
          color: '#717171',
          textTransform: 'none',
          '&:hover': { bgcolor: '#F9FAFB', color: '#222222' }
        }}
      >
        Back to Earnings
      </Button>

      {/* Earning Header */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>
                Earning #{earning.bookingId}
              </Typography>
              <Chip
                label={earning.status}
                size="small"
                sx={{
                  bgcolor: `${getStatusColor(earning.status)}15`,
                  color: getStatusColor(earning.status),
                  fontWeight: 600,
                  fontSize: 12
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222' }}>
                {earning.amount}
              </Typography>
              <Typography variant="body2" sx={{ color: '#717171' }}>
                {earning.nights} {earning.nights === 1 ? 'night' : 'nights'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Earning Details */}
      <Row>
        <Col xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>
                Booking Information
              </Typography>

              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Guest</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{earning.guest}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} alignItems="center">
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
                    <HomeIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Property</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{earning.property}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} alignItems="center">
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Booking Date</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                      {new Date(earning.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
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
                Payment Details
              </Typography>

              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
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
                    <AttachMoneyIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Total Amount</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                      {earning.amount}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} alignItems="center">
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
                    <AttachMoneyIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Commission (10%)</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{earning.commission}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} alignItems="center">
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
                    <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Net Amount</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                      {earning.netAmount}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Box>
                  <Typography sx={{ fontSize: 12, color: '#717171', mb: 1 }}>Payout Date</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                    {earning.payoutDate !== '-' 
                      ? new Date(earning.payoutDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Pending'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Col>
      </Row>
      </HostLayout>
    </>
  )
}

