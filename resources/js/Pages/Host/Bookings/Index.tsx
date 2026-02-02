import { useState } from 'react'
import { Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment, Chip } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import SearchIcon from '@mui/icons-material/Search'
import { Head, router } from '@inertiajs/react'

export default function HostBookings() {
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<{ id: number; guest: string } | null>(null)

  const bookings = [
    { id: 1, guest: 'John Doe', property: 'Luxury Beachfront Villa', checkin: '2025-01-15', checkout: '2025-01-20', status: 'Confirmed', amount: '$1,495' },
    { id: 2, guest: 'Jane Smith', property: 'Modern Apartment', checkin: '2025-01-18', checkout: '2025-01-22', status: 'Pending', amount: '$899' },
    { id: 3, guest: 'Mike Johnson', property: 'Cozy Studio', checkin: '2025-01-20', checkout: '2025-01-25', status: 'Confirmed', amount: '$625' },
    { id: 4, guest: 'Sarah Williams', property: 'Luxury Beachfront Villa', checkin: '2025-01-22', checkout: '2025-01-28', status: 'Confirmed', amount: '$1,794' },
    { id: 5, guest: 'David Brown', property: 'Modern Apartment', checkin: '2025-01-25', checkout: '2025-01-30', status: 'Cancelled', amount: '$899' },
    { id: 6, guest: 'Emily Davis', property: 'Cozy Studio', checkin: '2025-02-01', checkout: '2025-02-05', status: 'Pending', amount: '$596' },
  ]

  const filteredBookings = bookings.filter(booking =>
    booking.guest.toLowerCase().includes(search.toLowerCase()) ||
    booking.property.toLowerCase().includes(search.toLowerCase()) ||
    booking.status.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return '#10B981'
      case 'Pending': return '#F59E0B'
      case 'Cancelled': return '#EF4444'
      default: return '#717171'
    }
  }

  const handleDeleteClick = (booking: { id: number; guest: string }) => {
    setBookingToDelete(booking)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (bookingToDelete) {
      // Handle delete logic here
      console.log('Deleting booking:', bookingToDelete.id)
      // In real app: API call to delete booking
      // After successful delete, update the bookings list
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
      {/* Bookings Table */}
      <Row>
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                  My Bookings
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
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
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                        <TableCell sx={{ fontWeight: 600, color: '#222222' }}>{booking.guest}</TableCell>
                        <TableCell sx={{ color: '#717171' }}>{booking.property}</TableCell>
                        <TableCell sx={{ color: '#717171' }}>{booking.checkin}</TableCell>
                        <TableCell sx={{ color: '#717171' }}>{booking.checkout}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Are you sure you want to delete this booking?"
        itemName="the booking"
      />
      </HostLayout>
    </>
  )
}

