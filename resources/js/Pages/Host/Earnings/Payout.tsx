import { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import { Head, router, usePage } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PaymentIcon from '@mui/icons-material/Payment'

export default function ShowPayout() {
  const { id } = (usePage().props as { id?: string }) || {}
  const [payout, setPayout] = useState({
    id: '',
    payoutId: '',
    amount: '',
    date: '',
    method: '',
    status: '',
    account: '',
    transactionId: '',
    processedDate: ''
  })

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockPayout = {
      id: id || '1',
      payoutId: 'PO-001',
      amount: '$5,200',
      date: '2025-01-20',
      method: 'Bank Transfer',
      status: 'Completed',
      account: '****1234',
      transactionId: 'TXN-20250120-001',
      processedDate: '2025-01-20'
    }
    setPayout(mockPayout)
  }, [id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10B981'
      case 'Processing': return '#F59E0B'
      case 'Failed': return '#EF4444'
      default: return '#717171'
    }
  }

  return (
    <>
      <Head title="Payout Details" />
      <HostLayout title="Payout Details">
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

      {/* Payout Header */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>
                Payout #{payout.payoutId}
              </Typography>
              <Chip
                label={payout.status}
                size="small"
                sx={{
                  bgcolor: `${getStatusColor(payout.status)}15`,
                  color: getStatusColor(payout.status),
                  fontWeight: 600,
                  fontSize: 12
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222' }}>
                {payout.amount}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Payout Details */}
      <Row>
        <Col xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>
                Payout Information
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Amount</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                      {payout.amount}
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
                    <PaymentIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Payment Method</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{payout.method}</Typography>
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Account</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{payout.account}</Typography>
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
                Transaction Details
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
                    <CalendarTodayIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Request Date</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                      {new Date(payout.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
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
                    <CalendarTodayIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Processed Date</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                      {new Date(payout.processedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Box>
                  <Typography sx={{ fontSize: 12, color: '#717171', mb: 1 }}>Transaction ID</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#222222', fontFamily: 'monospace' }}>
                    {payout.transactionId}
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

