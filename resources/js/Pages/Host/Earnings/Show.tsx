import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import { Head, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
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
  const { t, isRtl } = useLanguage()
  const { earning } = usePage<Props>().props

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return '#10B981'
      case 'Pending': return '#F59E0B'
      case 'Cancelled': return '#EF4444'
      default: return '#717171'
    }
  }

  const statusLabel = earning.status === 'Paid' ? t('host.earnings.paid') : earning.status === 'Pending' ? t('host.earnings.pending') : earning.status

  return (
    <>
      <Head title={t('host.earnings.earning_details')} />
      <HostLayout title={t('host.earnings.earning_details')}>
      <Button
        startIcon={isRtl ? <ArrowForwardIcon /> : <ArrowBackIcon />}
        onClick={() => router.visit('/host/earnings')}
        sx={{
          mb: 3,
          color: '#717171',
          textTransform: 'none',
          gap: 1,
          '& .MuiButton-startIcon': { marginInlineEnd: 0, marginInlineStart: 0 },
          '&:hover': { bgcolor: '#F9FAFB', color: '#222222' }
        }}
      >
        {t('host.earnings.back_to_earnings')}
      </Button>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>
                {t('host.earnings.earning_details')} #{earning.bookingId}
              </Typography>
              <Chip
                label={statusLabel}
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
                {earning.nights} {earning.nights === 1 ? t('host.earnings.night') : t('host.earnings.nights')}
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
                {t('host.earnings.booking_information')}
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.earnings.guest')}</Typography>
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.earnings.property')}</Typography>
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.earnings.date')}</Typography>
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
                {t('host.earnings.payout_details')}
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.earnings.total_amount_label')}</Typography>
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.earnings.commission')} ({earning.commissionRate}%)</Typography>
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
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.earnings.net_amount')}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                      {earning.netAmount}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Box>
                  <Typography sx={{ fontSize: 12, color: '#717171', mb: 1 }}>{t('host.earnings.payout_date')}</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                    {earning.payoutDate !== '-' ? earning.payoutDate : t('host.earnings.pending')}
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
