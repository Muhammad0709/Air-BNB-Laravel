import { Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import { Container, Row, Col } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PrintIcon from '@mui/icons-material/Print'
import RtlBackArrowIcon from '../components/RtlBackArrowIcon'
import { Head, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'
import { useCurrency } from '../contexts/CurrencyContext'
import { formatPrice } from '../utils/currency'

type Receipt = {
  reference: string
  guest: string
  property: string
  propertyLocation: string
  checkin: string
  checkout: string
  nights: number
  nightlyRate: number
  cleaningFee: number
  serviceFee: number
  total: number
  status: string
  statusLabel: string
  paymentStatus: string
  bookedOn: string
}

export default function BookingReceipt() {
  const { t } = useLanguage()
  const { currency } = useCurrency()
  const { receipt } = usePage().props as { receipt: Receipt }

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const paymentLabel = (status: string) => {
    switch (status) {
      case 'paid': return t('receipt.payment_paid')
      case 'pending': return t('receipt.payment_pending')
      case 'unpaid': return t('receipt.payment_unpaid')
      default: return status
    }
  }

  const paymentColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10B981'
      case 'pending': return '#F59E0B'
      case 'unpaid': return '#EF4444'
      default: return '#717171'
    }
  }

  const subtotal = receipt.nightlyRate * receipt.nights

  return (
    <>
      <Head title={t('receipt.title')} />
      <Box className="receipt-page" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box className="no-print">
          <Navbar />
        </Box>
        <Box sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} md={9} lg={7}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} className="no-print">
                  <Button
                    startIcon={<RtlBackArrowIcon />}
                    onClick={() => router.visit('/bookings')}
                    sx={{ color: '#717171', textTransform: 'none', '&:hover': { bgcolor: '#F9FAFB', color: '#222222' } }}
                  >
                    {t('receipt.back_to_bookings')}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={() => window.print()}
                    sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}
                  >
                    {t('receipt.print')}
                  </Button>
                </Stack>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #E5E7EB', borderRadius: '16px' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222' }}>{t('receipt.title')}</Typography>
                      <Typography sx={{ color: '#717171', fontSize: 14, mt: 0.5 }}>{t('receipt.subtitle')}</Typography>
                    </Box>
                    <Chip
                      label={paymentLabel(receipt.paymentStatus)}
                      sx={{ bgcolor: `${paymentColor(receipt.paymentStatus)}15`, color: paymentColor(receipt.paymentStatus), fontWeight: 700 }}
                    />
                  </Stack>

                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('receipt.booking_reference')}</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#222222', fontFamily: 'monospace' }}>{receipt.reference}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('receipt.guest')}</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#222222' }}>{receipt.guest}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('receipt.property')}</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#222222', textAlign: 'right' }}>
                        {receipt.property}{receipt.propertyLocation ? `, ${receipt.propertyLocation}` : ''}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('receipt.check_in')}</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#222222' }}>{formatDate(receipt.checkin)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('receipt.check_out')}</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#222222' }}>{formatDate(receipt.checkout)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('receipt.booking_status')}</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#222222' }}>{receipt.statusLabel}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('receipt.booked_on')}</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#222222' }}>{formatDate(receipt.bookedOn)}</Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#717171', fontSize: 14 }}>
                        {formatPrice(receipt.nightlyRate, currency)} &times; {receipt.nights} {t('receipt.nights').toLowerCase()}
                      </Typography>
                      <Typography sx={{ color: '#222222' }}>{formatPrice(subtotal, currency)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('receipt.cleaning_fee')}</Typography>
                      <Typography sx={{ color: '#222222' }}>{formatPrice(receipt.cleaningFee, currency)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('receipt.service_fee')}</Typography>
                      <Typography sx={{ color: '#222222' }}>{formatPrice(receipt.serviceFee, currency)}</Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>{t('receipt.total')}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#AD542D' }}>{formatPrice(receipt.total, currency)}</Typography>
                  </Stack>
                </Paper>
              </Col>
            </Row>
          </Container>
        </Box>
        <Box className="no-print">
          <Footer />
        </Box>
      </Box>
    </>
  )
}
