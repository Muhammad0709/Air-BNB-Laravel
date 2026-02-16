import React from 'react'
import { Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Box } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import SearchIcon from '@mui/icons-material/Search'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import HotelIcon from '@mui/icons-material/Hotel'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AdminLayout from '../../Components/Admin/AdminLayout'
import { usePage } from '@inertiajs/react'
import { useLanguage } from '../../hooks/use-language'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const { stats, recentBookings } = usePage().props as any

  const statsData = [
    { titleKey: 'admin.dashboard.total_bookings', value: stats?.totalBookings?.toLocaleString() || '0', icon: DashboardIcon, color: '#AD542D', change: '+12%' },
    { titleKey: 'admin.dashboard.total_users', value: stats?.totalUsers?.toLocaleString() || '0', icon: PeopleIcon, color: '#4F46E5', change: '+8%' },
    { titleKey: 'admin.dashboard.properties', value: stats?.totalProperties?.toLocaleString() || '0', icon: HotelIcon, color: '#10B981', change: '+5%' },
    { titleKey: 'admin.dashboard.revenue', value: stats?.revenue ? `$${stats.revenue.toLocaleString()}` : '$0', icon: TrendingUpIcon, color: '#F59E0B', change: '+15%' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return '#10B981'
      case 'Pending': return '#F59E0B'
      case 'Cancelled': return '#EF4444'
      default: return '#6B7280'
    }
  }

  return (
    <AdminLayout title={t('admin.dashboard.title')}>
      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        {statsData.map((stat, idx) => (
          <Col key={idx} xs={12} sm={6} lg={3}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
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
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#10B981',
                      fontWeight: 700,
                      bgcolor: '#ECFDF5',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    {stat.change}
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  {t(stat.titleKey)}
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
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {t('admin.dashboard.recent_bookings')}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  sx={{
                    borderColor: '#D0D5DD',
                    color: '#344054',
                    textTransform: 'none',
                    borderRadius: '12px',
                    '&:hover': { borderColor: '#D0D5DD', bgcolor: '#F9FAFB' }
                  }}
                >
                  {t('admin.dashboard.search')}
                </Button>
              </Stack>

              <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table sx={{ minWidth: 650, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.dashboard.guest')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.dashboard.property')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.dashboard.check_in')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.dashboard.check_out')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.dashboard.status')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.dashboard.amount')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentBookings && recentBookings.length > 0 ? (
                      recentBookings.map((booking: any) => (
                        <TableRow key={booking.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                          <TableCell>{booking.guest}</TableCell>
                          <TableCell>{booking.property}</TableCell>
                          <TableCell>{booking.checkin}</TableCell>
                          <TableCell>{booking.checkout}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: `${getStatusColor(booking.status)}15`,
                                color: getStatusColor(booking.status),
                                fontWeight: 600,
                                fontSize: 12
                              }}
                            >
                              {booking.status}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#111827' }}>{booking.amount}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{ color: '#6B7280' }}>{t('admin.dashboard.no_bookings_found')}</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  )
}

