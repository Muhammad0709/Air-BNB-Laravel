import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment, Chip } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import SearchIcon from '@mui/icons-material/Search'
import { Head, router } from '@inertiajs/react'

export default function AdminSupportTickets() {
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<{ id: number; subject: string } | null>(null)

  const tickets = [
    { id: 1, subject: 'Payment issue with booking', user: 'John Doe', email: 'john@example.com', status: 'Open', priority: 'High', createdAt: '2025-01-15', updatedAt: '2025-01-16' },
    { id: 2, subject: 'Cancellation request', user: 'Jane Smith', email: 'jane@example.com', status: 'In Progress', priority: 'Medium', createdAt: '2025-01-14', updatedAt: '2025-01-15' },
    { id: 3, subject: 'Property inquiry', user: 'Mike Johnson', email: 'mike@example.com', status: 'Resolved', priority: 'Low', createdAt: '2025-01-13', updatedAt: '2025-01-14' },
    { id: 4, subject: 'Account access problem', user: 'Sarah Williams', email: 'sarah@example.com', status: 'Open', priority: 'High', createdAt: '2025-01-12', updatedAt: '2025-01-12' },
    { id: 5, subject: 'Refund request', user: 'David Brown', email: 'david@example.com', status: 'In Progress', priority: 'Medium', createdAt: '2025-01-11', updatedAt: '2025-01-12' },
    { id: 6, subject: 'Technical support needed', user: 'Emily Davis', email: 'emily@example.com', status: 'Resolved', priority: 'Low', createdAt: '2025-01-10', updatedAt: '2025-01-11' },
  ]

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
    ticket.user.toLowerCase().includes(search.toLowerCase()) ||
    ticket.email.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#EF4444'
      case 'In Progress': return '#F59E0B'
      case 'Resolved': return '#10B981'
      case 'Closed': return '#717171'
      default: return '#717171'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#EF4444'
      case 'Medium': return '#F59E0B'
      case 'Low': return '#10B981'
      default: return '#717171'
    }
  }

  const handleDeleteClick = (ticket: { id: number; subject: string }) => {
    setTicketToDelete(ticket)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (ticketToDelete) {
      setDeleteDialogOpen(false)
      setTicketToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTicketToDelete(null)
  }

  return (
    <>
      <Head title="Support Tickets" />
      <AdminLayout title="Support Tickets">
        <Row>
          <Col xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>All Support Tickets</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..." size="small" sx={{ width: { xs: '100%', sm: 250 } }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} /></InputAdornment> }} />
                    <Button variant="contained" onClick={() => router.visit('/admin/support-tickets/create')} sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}>Create Ticket</Button>
                  </Stack>
                </Stack>
                <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <Table sx={{ minWidth: 800, width: '100%' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Created</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ border: 'none', py: 8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}><Typography variant="body1" sx={{ color: '#717171', fontWeight: 600 }}>No data found</Typography></Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTickets.map((ticket) => (
                          <TableRow key={ticket.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                            <TableCell><Typography sx={{ fontWeight: 600, color: '#222222' }}>{ticket.subject}</Typography></TableCell>
                            <TableCell sx={{ color: '#717171' }}>{ticket.user}</TableCell>
                            <TableCell sx={{ color: '#717171' }}>{ticket.email}</TableCell>
                            <TableCell><Chip label={ticket.status} size="small" sx={{ bgcolor: `${getStatusColor(ticket.status)}15`, color: getStatusColor(ticket.status), fontWeight: 600, fontSize: 12 }} /></TableCell>
                            <TableCell><Chip label={ticket.priority} size="small" sx={{ bgcolor: `${getPriorityColor(ticket.priority)}15`, color: getPriorityColor(ticket.priority), fontWeight: 600, fontSize: 12 }} /></TableCell>
                            <TableCell sx={{ color: '#717171' }}>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <ActionsMenu onView={() => router.visit(`/admin/support-tickets/${ticket.id}`)} onEdit={() => router.visit(`/admin/support-tickets/${ticket.id}/edit`)} onDelete={() => handleDeleteClick({ id: ticket.id, subject: ticket.subject })} viewLabel="View" editLabel="Edit" />
                            </TableCell>
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
        <DeleteConfirmationDialog open={deleteDialogOpen} onClose={handleDeleteCancel} onConfirm={handleDeleteConfirm} title="Are you sure you want to delete this ticket?" itemName="the ticket" />
      </AdminLayout>
    </>
  )
}
