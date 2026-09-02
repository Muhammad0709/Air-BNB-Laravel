import { useState } from 'react'
import { Box, Button, Card, CardContent, Chip, Paper, Stack, Tab, Tabs, TextField, Typography, InputAdornment } from '@mui/material'
import { Container, Row, Col } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SearchIcon from '@mui/icons-material/Search'
import { Head, router, usePage } from '@inertiajs/react'
import HotelIcon from '@mui/icons-material/Hotel'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useLanguage } from '../hooks/use-language'
import { useCurrency } from '../contexts/CurrencyContext'
import { formatPrice } from '../utils/currency'
import Pagination from '../components/Pagination'
import { getBookingStatusColor, getBookingStatusLabel } from '../utils/bookingStatus'

interface Booking {
  id: number
  property: string
  propertyLocation: string
  image: string | null
  checkin: string
  checkout: string
  status: string
  status_label: string
  total_amount: number
  nights: number
  guests: number
}

interface PaginatedBookings {
  data: Booking[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  links: { url: string | null; label: string; active: boolean }[]
}

interface CustomerBookingsPageProps {
  upcoming: PaginatedBookings
  past: PaginatedBookings
}

export default function CustomerBookings() {
  const { t } = useLanguage()
  const { currency } = useCurrency()
  const { props: pageProps } = usePage<CustomerBookingsPageProps>()
  const { upcoming, past } = pageProps
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')

  const paginator = activeTab === 0 ? upcoming : past
  const bookings: Booking[] = paginator?.data ?? []
  const displayBookings = !search
    ? bookings
    : bookings.filter(b =>
        b.property.toLowerCase().includes(search.toLowerCase()) ||
        b.propertyLocation.toLowerCase().includes(search.toLowerCase()) ||
        (b.status_label && b.status_label.toLowerCase().includes(search.toLowerCase()))
      )

  const handlePageChange = (page: number) => {
    router.get('/bookings', { [activeTab === 0 ? 'upcoming_page' : 'past_page']: page }, { preserveState: true })
  }

  const getStatusColor = (status: string) => getBookingStatusColor(status)
  const getStatusLabelDisplay = (status: string) => getBookingStatusLabel(status)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setSearch('')
  }

  return (
    <Box>
      <Head title={t('customer_bookings.title')} />
      <Navbar />
      <Box className="customer-bookings-page" sx={{ py: { xs: 3, md: 6 }, flex: 1, minHeight: '70vh' }}>
        <Container>
          <Box sx={{ mb: { xs: 3, md: 5 }, maxWidth: 720 }}>
            <Chip label={t('customer_bookings.title')} size="small" sx={{ mb: 2, bgcolor: '#FBEDE7', color: '#8A4022', fontWeight: 700 }} />
            <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }, lineHeight: 1.12, letterSpacing: '-0.035em', fontWeight: 800, color: '#171717', mb: 1.5 }}>{t('customer_bookings.title')}</Typography>
            <Typography variant="body1" sx={{ color: '#667085', fontSize: { xs: '0.9375rem', md: '1.0625rem' } }}>
              {t('customer_bookings.subtitle')}
            </Typography>
          </Box>
          <Row className="justify-content-center">
            <Col xs={12}>
              <Card elevation={0} sx={{ border: '1px solid #EAECF0', borderRadius: { xs: '18px', md: '24px' }, overflow: 'hidden', bgcolor: 'rgba(255,255,255,.94)' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ px: { xs: 1, sm: 3 }, borderBottom: '1px solid #EAECF0' }}>
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      sx={{
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: { xs: '.875rem', sm: '1rem' }, color: '#667085', minHeight: 66, px: { xs: 1.5, sm: 2.5 }, '&.Mui-selected': { color: '#AD542D' } },
                        '& .MuiTabs-indicator': { backgroundColor: '#AD542D', height: 3 }
                      }}
                    >
                      <Tab label={`${t('customer_bookings.upcoming')} (${upcoming?.total ?? 0})`} />
                      <Tab label={`${t('customer_bookings.past')} (${past?.total ?? 0})`} />
                    </Tabs>
                  </Box>
                  <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid #EAECF0', bgcolor: '#FCFCFD' }}>
                    <TextField
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('customer_bookings.search_placeholder')}
                      size="small"
                      fullWidth
                      sx={{ maxWidth: 440, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '12px', '& fieldset': { borderColor: '#D0D5DD' } } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>
                  <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
                    {displayBookings.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: { xs: 7, md: 10 }, px: 2 }}>
                        <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#FBEDE7', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2.5 }}>
                          <HotelIcon sx={{ fontSize: 34, color: '#AD542D' }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: '#1D2939', fontWeight: 700, mb: 1 }}>
                          {activeTab === 0 ? t('customer_bookings.no_upcoming') : t('customer_bookings.no_past')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#667085', maxWidth: 420, mx: 'auto' }}>
                          {activeTab === 0 ? t('customer_bookings.no_upcoming_sub') : t('customer_bookings.no_past_sub')}
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Stack spacing={2}>
                          {displayBookings.map((booking) => (
                            <Paper
                              key={booking.id}
                              elevation={0}
                              sx={{
                                p: { xs: 1.25, sm: 2 },
                                border: '1px solid #EAECF0',
                                borderRadius: { xs: '14px', sm: '18px' },
                                transition: 'border-color .2s ease, box-shadow .2s ease, transform .2s ease',
                                '&:hover': { borderColor: '#D7A38A', boxShadow: '0 12px 32px rgba(16,24,40,.08)', transform: 'translateY(-2px)' }
                              }}
                            >
                              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} useFlexGap>
                                <Box sx={{ width: { xs: '100%', md: 260 }, height: { xs: 190, sm: 240, md: 210 }, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, bgcolor: '#F2F4F7' }}>
                                  <Box component="img" src={booking.image ?? '/images/popular-stay-1.svg'} alt={booking.property} sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s ease', '.MuiPaper-root:hover &': { transform: 'scale(1.035)' } }} />
                                </Box>
                                <Stack spacing={2} sx={{ flex: 1, p: { xs: .5, sm: 1 }, minWidth: 0 }}>
                                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} useFlexGap>
                                    <Box>
                                      <Typography variant="h6" sx={{ fontWeight: 750, color: '#101828', mb: 0.5, lineHeight: 1.3 }}>{booking.property}</Typography>
                                      <Stack direction="row" spacing={1} useFlexGap alignItems="center" sx={{ mb: 1 }}>
                                        <LocationOnIcon sx={{ fontSize: 16, color: '#717171' }} />
                                        <Typography variant="body2" sx={{ color: '#717171' }}>{booking.propertyLocation}</Typography>
                                      </Stack>
                                    </Box>
                                    <Chip label={booking.status_label || getStatusLabelDisplay(booking.status)} size="small" sx={{ bgcolor: `${getStatusColor(booking.status)}15`, color: getStatusColor(booking.status), fontWeight: 700, fontSize: 12, height: 30, border: `1px solid ${getStatusColor(booking.status)}25` }} />
                                  </Stack>
                                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 1.25 }}>
                                    <Stack direction="row" spacing={1} useFlexGap alignItems="center">
                                      <CalendarTodayIcon sx={{ fontSize: 18, color: '#AD542D' }} />
                                      <Box>
                                        <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>{t('customer_bookings.checkin')}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{formatDate(booking.checkin)}</Typography>
                                      </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1} useFlexGap alignItems="center">
                                      <CalendarTodayIcon sx={{ fontSize: 18, color: '#AD542D' }} />
                                      <Box>
                                        <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>{t('customer_bookings.checkout')}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{formatDate(booking.checkout)}</Typography>
                                      </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <PeopleAltOutlinedIcon sx={{ fontSize: 19, color: '#AD542D' }} />
                                      <Box>
                                      <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>{t('customer_bookings.guests')}</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{booking.guests} {booking.guests === 1 ? t('customer_bookings.guest') : t('customer_bookings.guests_plural')}</Typography>
                                      </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <NightsStayOutlinedIcon sx={{ fontSize: 19, color: '#AD542D' }} />
                                      <Box>
                                      <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>{t('customer_bookings.nights')}</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{booking.nights} {booking.nights === 1 ? t('customer_bookings.night') : t('customer_bookings.nights')}</Typography>
                                      </Box>
                                    </Stack>
                                  </Box>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} sx={{ pt: 1.5, mt: 'auto', borderTop: '1px solid #EAECF0' }}>
                                    <Box>
                                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#101828' }}>{formatPrice(booking.total_amount, currency)}</Typography>
                                    </Box>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<ReceiptLongOutlinedIcon />}
                                      endIcon={<ArrowForwardRoundedIcon />}
                                      onClick={() => router.visit(`/bookings/${booking.id}/receipt`)}
                                      sx={{ bgcolor: '#AD542D', borderRadius: '999px', px: { xs: 1.75, sm: 2.25 }, py: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#8A4022', boxShadow: 'none' } }}
                                    >
                                      {t('customer_bookings.view_receipt')}
                                    </Button>
                                  </Stack>
                                </Stack>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                        {paginator && paginator.last_page > 1 && (
                          <Pagination
                            currentPage={paginator.current_page}
                            lastPage={paginator.last_page}
                            onPageChange={handlePageChange}
                            sx={{ mt: 3, mb: 0 }}
                          />
                        )}
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Col>
          </Row>
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}
