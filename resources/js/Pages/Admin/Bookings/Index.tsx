import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment, Chip } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import Pagination from '../../../components/Pagination'
import SearchIcon from '@mui/icons-material/Search'
import { Head, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'

type BookingRow = {
  id: number
  guest: string
  property: string
  checkin: string
  checkout: string
  status: string
  amount: string
}

type BookingsProp = BookingRow[] | { data: BookingRow[]; current_page: number; last_page: number }

export default function AdminBookings() {
  const { t } = useLanguage()
  const props = usePage().props as { bookings?: BookingsProp; filters?: { search?: string } }
  const bookingsProp = props.bookings
  const filters = props.filters ?? {}
  const [search, setSearch] = useState(filters.search ?? '')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<{ id: number; guest: string } | null>(null)

  const list = Array.isArray(bookingsProp) ? bookingsProp : (bookingsProp?.data ?? [])
  const currentPage = (bookingsProp as any)?.current_page ?? 1
  const lastPage = (bookingsProp as any)?.last_page ?? 1

  const handleSearchChange = (value: string) => {
    setSearch(value)
    router.get('/admin/bookings', { search: value, page: 1 }, { preserveState: true, replace: true })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/bookings', { search, page }, { preserveState: true })
  }

  const getStatusColor = (status: string) => {
    switch (String(status).toLowerCase()) {
      case 'confirmed': return '#10B981'
      case 'pending': return '#F59E0B'
      case 'cancelled': return '#EF4444'
      case 'completed': return '#6366F1'
      default: return '#717171'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (String(status).toLowerCase()) {
      case 'confirmed': return t('admin.bookings.confirmed')
      case 'pending': return t('admin.bookings.pending')
      case 'cancelled': return t('admin.bookings.cancelled')
      case 'completed': return t('admin.bookings.completed') || 'Completed'
      default: return status
    }
  }

  const handleDeleteClick = (booking: { id: number; guest: string }) => {
    setBookingToDelete(booking)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (bookingToDelete) {
      setDeleteDialogOpen(false)
      setBookingToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setBookingToDelete(null)
  }

  return (
    <>
      <Head title={t('admin.bookings.title')} />
      <AdminLayout title={t('admin.bookings.title')}>
        <Row>
          <Col xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                    {t('admin.bookings.all_bookings')}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <TextField
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={t('admin.bookings.search_placeholder')}
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
                    <Button
                      variant="contained"
                      onClick={() => router.visit('/admin/bookings/create')}
                      sx={{
                        bgcolor: '#AD542D',
                        textTransform: 'none',
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#78381C' }
                      }}
                    >
                      {t('admin.bookings.add_booking')}
                    </Button>
                  </Stack>
                </Stack>

                <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <Table sx={{ minWidth: 800, width: '100%' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.bookings.guest')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.bookings.property')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.bookings.check_in')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.bookings.check_out')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.bookings.status')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.bookings.amount')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.common.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {list.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ border: 'none', py: 8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                              <Typography variant="body1" sx={{ color: '#717171', fontWeight: 600 }}>{t('admin.bookings.no_bookings_found')}</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        list.map((booking) => (
                          <TableRow key={booking.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                            <TableCell sx={{ fontWeight: 600, color: '#222222' }}>{booking.guest}</TableCell>
                            <TableCell sx={{ color: '#717171' }}>{booking.property}</TableCell>
                            <TableCell sx={{ color: '#717171' }}>{booking.checkin}</TableCell>
                            <TableCell sx={{ color: '#717171' }}>{booking.checkout}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(booking.status)}
                                size="small"
                                sx={{ bgcolor: `${getStatusColor(booking.status)}15`, color: getStatusColor(booking.status), fontWeight: 600, fontSize: 12 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#222222' }}>{booking.amount}</TableCell>
                            <TableCell>
                              <ActionsMenu
                                onView={() => router.visit(`/admin/bookings/${booking.id}`)}
                                onEdit={() => router.visit(`/admin/bookings/${booking.id}/edit`)}
                                onDelete={() => handleDeleteClick({ id: booking.id, guest: booking.guest })}
                                viewLabel={t('admin.common.view')}
                                editLabel={t('admin.common.edit')}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {lastPage > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </CardContent>
            </Card>
          </Col>
        </Row>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title={t('admin.bookings.delete_confirm')}
          itemName={t('admin.bookings.item_name')}
        />
      </AdminLayout>
    </>
  )
}
