import { useState, useEffect } from 'react'
import { Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment, Chip } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import Toast from '../../../Components/Admin/Toast'
import Pagination from '../../../components/Pagination'
import SearchIcon from '@mui/icons-material/Search'
import { Head, router, usePage } from '@inertiajs/react'

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
      case 'confirmed': return 'Confirmed'
      case 'pending': return 'Pending'
      case 'cancelled': return 'Cancelled'
      case 'completed': return 'Completed'
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
      <Head title="Bookings" />
      <HostLayout title="Bookings">
      <Row>
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                  My Bookings
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <TextField
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
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
                    Add Booking
                  </Button>
                </Stack>
              </Stack>

              <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table sx={{ minWidth: 800, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Guest</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Property</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Check-in</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Check-out</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {list.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{ color: '#6B7280' }}>No bookings found</Typography>
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
                            viewLabel="View"
                            editLabel="Edit"
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
        title="Are you sure you want to delete this booking?"
        itemName="the booking"
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
