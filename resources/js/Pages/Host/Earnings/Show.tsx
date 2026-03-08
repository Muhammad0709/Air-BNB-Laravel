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

interface Earning {
  id: number
  bookingId: string
  guest: string
  property: string
  date: string
  amount: string
  status: string
  payoutDate: string
  nights: number
  commission: string
  commissionRate: number
  netAmount: string
}

interface Props {
  earning: Earning
}

export default function ShowEarning() {
  const { earning } = usePage<Props>().props

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

      <Row>
        <Col xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>
                Booking Information
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Guest</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{earning.guest}</Typography>
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
                    <HomeIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Property</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{earning.property}</Typography>
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Booking Date</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{earning.date}</Typography>
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
                    <AttachMoneyIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Commission ({earning.commissionRate}%)</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{earning.commission}</Typography>
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
                    {earning.payoutDate !== '-' ? earning.payoutDate : 'Pending'}
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
