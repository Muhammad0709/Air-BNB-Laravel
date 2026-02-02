import React, { useState } from 'react'
import { Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Box, TextField, InputAdornment } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import SearchIcon from '@mui/icons-material/Search'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HotelIcon from '@mui/icons-material/Hotel'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import HostLayout from '../../Components/Host/HostLayout'
import { usePage } from '@inertiajs/react'

interface Stats {
  total_properties: number
  total_bookings: number
  revenue: string
  upcoming_bookings: number
}

interface Booking {
  id: number
  guest: string
  property: string
  checkin: string
  checkout: string
  status: string
  amount: string
}

interface Host {
  name: string
  email: string
}

export default function HostDashboard() {
  const { stats, recentBookings, host } = usePage<{ stats: Stats, recentBookings: Booking[], host: Host }>().props
  const [search, setSearch] = useState('')
  
  // Add safety checks
  if (!stats || !recentBookings || !host) {
    return <HostLayout title="Dashboard">Loading...</HostLayout>
  }
  
  const statsCards = [
    { title: 'Total Properties', value: (stats.total_properties || 0).toString(), icon: HotelIcon, color: '#AD542D' },
    { title: 'Total Bookings', value: (stats.total_bookings || 0).toString(), icon: DashboardIcon, color: '#4F46E5' },
    { title: 'Revenue', value: stats.revenue || '$0', icon: TrendingUpIcon, color: '#10B981' },
    { title: 'Upcoming Bookings', value: (stats.upcoming_bookings || 0).toString(), icon: CalendarTodayIcon, color: '#F59E0B' },
  ]

  const filteredBookings = (recentBookings || []).filter(booking =>
    booking.guest.toLowerCase().includes(search.toLowerCase()) ||
    booking.property.toLowerCase().includes(search.toLowerCase()) ||
    booking.status.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return '#10B981'
      case 'Pending': return '#F59E0B'
      case 'Cancelled': return '#EF4444'
      default: return '#6B7280'
    }
  }

  return (
    <HostLayout title="Dashboard">
      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        {statsCards.map((stat, idx) => (
          <Col key={idx} xs={12} sm={6} lg={3}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <stat.icon sx={{ color: stat.color, fontSize: 24 }} />
                  </Box>
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Bookings Table */}
      <Row>
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  Recent Bookings
                </Typography>
                <TextField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bookings..."
                  size="small"
                  sx={{ width: { xs: '100%', sm: 250 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>

              <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table sx={{ minWidth: 650, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Guest</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Property</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Check-in</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Check-out</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ border: 'none', py: 8 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%'
                            }}
                          >
                            <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 600 }}>
                              No data found
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => (
                        <TableRow key={booking.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                          <TableCell>{booking.guest}</TableCell>
                          <TableCell>{booking.property}</TableCell>
                          <TableCell>{booking.checkin}</TableCell>
                          <TableCell>{booking.checkout}</TableCell>
                          <TableCell>
                            <Chip
                              label={booking.status}
                              size="small"
                              sx={{
                                bgcolor: `${getStatusColor(booking.status)}15`,
                                color: getStatusColor(booking.status),
                                fontWeight: 600,
                                fontSize: 12
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{booking.amount}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Col>
      </Row>
    </HostLayout>
  )
}

