import { useState, useEffect } from 'react'
import { Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment, Chip } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import Toast from '../../../Components/Admin/Toast';
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

type BookingsProp = { data: BookingRow[]; current_page: number; last_page: number }

export default function HostBookings() {
  const { t } = useLanguage()
  const props = usePage().props as { bookings?: BookingsProp; filters?: { search?: string }; flash?: { success?: string } }
  const bookingsProp = props.bookings
  const filters = props.filters ?? {}
  const flashSuccess = props.flash?.success
  const [search, setSearch] = useState(filters.search ?? '')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<{ id: number; guest: string } | null>(null)
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    if (flashSuccess) setToastOpen(true)
  }, [flashSuccess])

  const list = bookingsProp?.data ?? []
  const currentPage = bookingsProp?.current_page ?? 1
  const lastPage = bookingsProp?.last_page ?? 1

  const handleSearchChange = (value: string) => {
    setSearch(value)
    router.get('/host/bookings', { search: value, page: 1 }, { preserveState: true, replace: true })
  }

  const handlePageChange = (page: number) => {
    router.get('/host/bookings', { search, page }, { preserveState: true })
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
      case 'confirmed': return t('host.bookings.status_confirmed')
      case 'pending': return t('host.bookings.status_pending')
      case 'cancelled': return t('host.bookings.status_cancelled')
      case 'completed': return t('host.earnings.completed')
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
      <Head title={t('host.bookings.title')} />
      <HostLayout title={t('host.bookings.title')}>
      <Row>
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                  {t('host.bookings.my_bookings')}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <TextField
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={t('host.bookings.search_placeholder')}
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
                    onClick={() => router.visit('/host/bookings/create')}
                    fullWidth={window.innerWidth < 600}
                    sx={{
                      bgcolor: '#AD542D',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#78381C' }
                    }}
                  >
                    {t('host.bookings.add_booking')}
                  </Button>
                </Stack>
              </Stack>

              <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table sx={{ minWidth: 800, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.bookings.guest')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.bookings.property')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.bookings.check_in')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.bookings.check_out')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.bookings.status')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.bookings.amount')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.bookings.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {list.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{ color: '#6B7280' }}>{t('host.bookings.no_bookings_found')}</Typography>
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
                            sx={{
                              bgcolor: `${getStatusColor(booking.status)}15`,
                              color: getStatusColor(booking.status),
                              fontWeight: 600,
                              fontSize: 12
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222' }}>{booking.amount}</TableCell>
                        <TableCell>
                          <ActionsMenu
                            onView={() => router.visit(`/host/bookings/${booking.id}`)}
                            onEdit={() => router.visit(`/host/bookings/${booking.id}/edit`)}
                            onDelete={() => handleDeleteClick({ id: booking.id, guest: booking.guest })}
                            viewLabel={t('host.bookings.view')}
                            editLabel={t('host.bookings.edit')}
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
        title={t('host.bookings.delete_confirm')}
        itemName={t('host.bookings.item_name')}
      />
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={flashSuccess ?? 'Success'}
        severity="success"
      />
      </HostLayout>
    </>
  )
}
