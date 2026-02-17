import { useState } from 'react'
import { Box, Card, CardContent, Chip, Paper, Stack, Tab, Tabs, TextField, Typography, InputAdornment } from '@mui/material'
import { Container, Row, Col } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SearchIcon from '@mui/icons-material/Search'
import { Head, usePage } from '@inertiajs/react'
import HotelIcon from '@mui/icons-material/Hotel'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { useLanguage } from '../hooks/use-language'

interface Booking {
  id: number
  property: string
  propertyLocation: string
  image: string | null
  checkin: string
  checkout: string
  status: string
  status_label: string
  amount: string
  nights: number
  guests: number
}

interface CustomerBookingsPageProps {
  upcoming: Booking[]
  past: Booking[]
  upcoming_count: number
  past_count: number
}

export default function CustomerBookings() {
  const { t } = useLanguage()
  const { props: pageProps } = usePage<CustomerBookingsPageProps>()
  const { upcoming = [], past = [], upcoming_count = 0, past_count = 0 } = pageProps
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')

  const upcomingBookings: Booking[] = upcoming ?? []
  const pastBookings: Booking[] = past ?? []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981'
      case 'pending': return '#F59E0B'
      case 'cancelled': return '#EF4444'
      case 'completed': return '#6366F1'
      default: return '#717171'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setSearch('')
  }

  const getDisplayBookings = () => {
    const bookings = activeTab === 0 ? upcomingBookings : pastBookings
    if (!search) return bookings
    return bookings.filter(booking =>
      booking.property.toLowerCase().includes(search.toLowerCase()) ||
      booking.propertyLocation.toLowerCase().includes(search.toLowerCase()) ||
      (booking.status_label && booking.status_label.toLowerCase().includes(search.toLowerCase()))
    )
  }

  const displayBookings = getDisplayBookings()

  return (
    <Box>
      <Head title={t('customer_bookings.title')} />
      <Navbar />
      <Box className="customer-bookings-page" sx={{ minHeight: 'calc(100vh - 200px)', py: 4 }}>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#222222', mb: 2 }}>{t('customer_bookings.title')}</Typography>
            <Typography variant="body1" sx={{ color: '#717171', fontSize: '1.125rem', maxWidth: 600, mx: 'auto' }}>
              {t('customer_bookings.subtitle')}
            </Typography>
          </Box>
          <Row className="justify-content-center">
            <Col xs={12} lg={10}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      sx={{
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '1rem', color: '#717171', minHeight: 64, '&.Mui-selected': { color: '#AD542D' } },
                        '& .MuiTabs-indicator': { backgroundColor: '#AD542D', height: 3 }
                      }}
                    >
                      <Tab label={`${t('customer_bookings.upcoming')} (${upcoming_count})`} />
                      <Tab label={`${t('customer_bookings.past')} (${past_count})`} />
                    </Tabs>
                  </Box>
                  <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
                    <TextField
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('customer_bookings.search_placeholder')}
                      size="small"
                      fullWidth
                      sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#D0D5DD' } } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 3 }}>
                    {displayBookings.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <HotelIcon sx={{ fontSize: 64, color: '#D0D5DD', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#717171', mb: 1 }}>
                          {activeTab === 0 ? t('customer_bookings.no_upcoming') : t('customer_bookings.no_past')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                          {activeTab === 0 ? t('customer_bookings.no_upcoming_sub') : t('customer_bookings.no_past_sub')}
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={2}>
                        {displayBookings.map((booking) => (
                          <Paper
                            key={booking.id}
                            elevation={0}
                            sx={{
                              p: 3,
                              border: '1px solid #E5E7EB',
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              cursor: 'pointer',
                              '&:hover': { borderColor: '#AD542D', boxShadow: '0 2px 8px rgba(173, 82, 45, 0.1)' }
                            }}
                          >
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} useFlexGap>
                              <Box
                              component="img"
                              src={booking.image ?? '/images/popular-stay-1.svg'}
                              alt={booking.property}
                              sx={{ width: { xs: '100%', md: 200 }, height: { xs: 200, md: 150 }, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                            />
                              <Stack spacing={2} sx={{ flex: 1 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} useFlexGap>
                                  <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 0.5 }}>{booking.property}</Typography>
                                    <Stack direction="row" spacing={1} useFlexGap alignItems="center" sx={{ mb: 1 }}>
                                      <LocationOnIcon sx={{ fontSize: 16, color: '#717171' }} />
                                      <Typography variant="body2" sx={{ color: '#717171' }}>{booking.propertyLocation}</Typography>
                                    </Stack>
                                  </Box>
                                  <Chip label={booking.status_label} size="small" sx={{ bgcolor: `${getStatusColor(booking.status)}15`, color: getStatusColor(booking.status), fontWeight: 600, fontSize: 12, height: 28 }} />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} useFlexGap sx={{ mt: 1 }}>
                                  <Stack direction="row" spacing={1} useFlexGap alignItems="center">
                                    <CalendarTodayIcon sx={{ fontSize: 18, color: '#717171' }} />
                                    <Box>
                                      <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>{t('customer_bookings.checkin')}</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{formatDate(booking.checkin)}</Typography>
                                    </Box>
                                  </Stack>
                                  <Stack direction="row" spacing={1} useFlexGap alignItems="center">
                                    <CalendarTodayIcon sx={{ fontSize: 18, color: '#717171' }} />
                                    <Box>
                                      <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>{t('customer_bookings.checkout')}</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{formatDate(booking.checkout)}</Typography>
                                    </Box>
                                  </Stack>
                                  <Box>
                                    <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>{t('customer_bookings.guests')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{booking.guests} {booking.guests === 1 ? t('customer_bookings.guest') : t('customer_bookings.guests_plural')}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>{t('customer_bookings.nights')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{booking.nights} {booking.nights === 1 ? t('customer_bookings.night') : t('customer_bookings.nights')}</Typography>
                                  </Box>
                                </Stack>
                                <Box sx={{ pt: 1, borderTop: '1px solid #E5E7EB' }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>{booking.amount}</Typography>
                                </Box>
                              </Stack>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
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
