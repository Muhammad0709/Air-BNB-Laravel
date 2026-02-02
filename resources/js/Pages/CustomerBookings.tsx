import { useState } from 'react'
import { Box, Card, CardContent, Chip, Paper, Stack, Tab, Tabs, TextField, Typography, InputAdornment } from '@mui/material'
import { Container, Row, Col } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SearchIcon from '@mui/icons-material/Search'
import { router, Head } from '@inertiajs/react'
import HotelIcon from '@mui/icons-material/Hotel'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const img1 = '/images/popular-stay-1.svg'
const img2 = '/images/popular-stay-2.svg'
const img3 = '/images/popular-stay-3.svg'

interface Booking {
  id: number
  property: string
  propertyLocation: string
  image: string
  checkin: string
  checkout: string
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed'
  amount: string
  nights: number
  guests: number
}

export default function CustomerBookings() {
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')

  const allBookings: Booking[] = [
    { id: 1, property: 'Luxury Beachfront Villa', propertyLocation: 'Malibu, California', image: img1, checkin: '2025-02-15', checkout: '2025-02-20', status: 'Confirmed', amount: '$1,495', nights: 5, guests: 2 },
    { id: 2, property: 'Modern Apartment', propertyLocation: 'Los Angeles, California', image: img2, checkin: '2025-03-01', checkout: '2025-03-05', status: 'Confirmed', amount: '$899', nights: 4, guests: 3 },
    { id: 3, property: 'Cozy Studio', propertyLocation: 'San Francisco, California', image: img3, checkin: '2025-01-10', checkout: '2025-01-15', status: 'Completed', amount: '$625', nights: 5, guests: 2 },
    { id: 4, property: 'Luxury Beachfront Villa', propertyLocation: 'Malibu, California', image: img1, checkin: '2024-12-20', checkout: '2024-12-25', status: 'Completed', amount: '$1,794', nights: 5, guests: 4 },
    { id: 5, property: 'Modern Apartment', propertyLocation: 'Los Angeles, California', image: img2, checkin: '2025-04-01', checkout: '2025-04-07', status: 'Pending', amount: '$1,299', nights: 6, guests: 2 },
    { id: 6, property: 'Mountain View Cabin', propertyLocation: 'Lake Tahoe, California', image: img3, checkin: '2024-11-15', checkout: '2024-11-18', status: 'Completed', amount: '$596', nights: 3, guests: 2 },
  ]

  const upcomingBookings = allBookings.filter(b => b.status === 'Pending')
  const pastBookings = allBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return '#10B981'
      case 'Pending': return '#F59E0B'
      case 'Cancelled': return '#EF4444'
      case 'Completed': return '#6366F1'
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
      booking.status.toLowerCase().includes(search.toLowerCase())
    )
  }

  const displayBookings = getDisplayBookings()

  return (
    <Box>
      <Head title="My Bookings" />
      <Navbar />
      <Box className="customer-bookings-page" sx={{ minHeight: 'calc(100vh - 200px)', py: 4 }}>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#222222', mb: 2 }}>My Bookings</Typography>
            <Typography variant="body1" sx={{ color: '#717171', fontSize: '1.125rem', maxWidth: 600, mx: 'auto' }}>
              View and manage your upcoming and past bookings
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
                      <Tab label={`Upcoming (${upcomingBookings.length})`} />
                      <Tab label={`Past (${pastBookings.length})`} />
                    </Tabs>
                  </Box>
                  <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
                    <TextField
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search bookings..."
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
                          No {activeTab === 0 ? 'upcoming' : 'past'} bookings found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                          {activeTab === 0 ? 'Start exploring properties to make your first booking!' : 'Your past bookings will appear here.'}
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
                            onClick={() => router.visit('/bookings')}
                          >
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                              <Box component="img" src={booking.image} alt={booking.property} sx={{ width: { xs: '100%', md: 200 }, height: { xs: 200, md: 150 }, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                              <Stack spacing={2} sx={{ flex: 1 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                                  <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 0.5 }}>{booking.property}</Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                      <LocationOnIcon sx={{ fontSize: 16, color: '#717171' }} />
                                      <Typography variant="body2" sx={{ color: '#717171' }}>{booking.propertyLocation}</Typography>
                                    </Stack>
                                  </Box>
                                  <Chip label={booking.status} size="small" sx={{ bgcolor: `${getStatusColor(booking.status)}15`, color: getStatusColor(booking.status), fontWeight: 600, fontSize: 12, height: 28 }} />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 1 }}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarTodayIcon sx={{ fontSize: 18, color: '#717171' }} />
                                    <Box>
                                      <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>Check-in</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{formatDate(booking.checkin)}</Typography>
                                    </Box>
                                  </Stack>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarTodayIcon sx={{ fontSize: 18, color: '#717171' }} />
                                    <Box>
                                      <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>Check-out</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{formatDate(booking.checkout)}</Typography>
                                    </Box>
                                  </Stack>
                                  <Box>
                                    <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>Guests</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>Nights</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</Typography>
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
