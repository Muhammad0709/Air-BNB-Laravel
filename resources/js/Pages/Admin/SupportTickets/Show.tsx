import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import { Head, usePage, router } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import CategoryIcon from '@mui/icons-material/Category'
import PriorityIcon from '@mui/icons-material/PriorityHigh'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

export default function ShowSupportTicket() {
  const { id } = (usePage().props as { id?: string }) || {}
  const [ticket, setTicket] = useState({ id: '', subject: '', user: '', email: '', status: '', priority: '', category: '', description: '', createdAt: '', updatedAt: '' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const mockTicket = { id: id || '1', subject: 'Payment issue with booking', user: 'John Doe', email: 'john@example.com', status: 'Open', priority: 'High', category: 'Billing', description: 'I am experiencing issues with my payment for booking ID #12345. The payment was deducted from my account but the booking status shows as pending.', createdAt: '2025-01-15', updatedAt: '2025-01-16' }
    setTicket(mockTicket)
  }, [id])

  const getStatusColor = (status: string) => { switch (status) { case 'Open': return '#EF4444'; case 'In Progress': return '#F59E0B'; case 'Resolved': return '#10B981'; case 'Closed': return '#717171'; default: return '#717171' } }
  const getPriorityColor = (priority: string) => { switch (priority) { case 'High': return '#EF4444'; case 'Medium': return '#F59E0B'; case 'Low': return '#10B981'; default: return '#717171' } }

  const handleDeleteConfirm = () => { setDeleteDialogOpen(false); router.visit('/admin/support-tickets') }
  const handleDeleteCancel = () => setDeleteDialogOpen(false)

  return (
    <>
      <Head title="View Support Ticket" />
      <AdminLayout title="View Support Ticket">
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.visit('/admin/support-tickets')} sx={{ color: '#717171', textTransform: 'none', '&:hover': { bgcolor: '#F9FAFB', color: '#222222' } }}>Back to Support Tickets</Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => router.visit(`/admin/support-tickets/${id}/edit`)} sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}>Edit Ticket</Button>
        </Stack>

        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>{ticket.subject}</Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip label={ticket.status} size="small" sx={{ bgcolor: `${getStatusColor(ticket.status)}15`, color: getStatusColor(ticket.status), fontWeight: 600, fontSize: 12 }} />
              <Chip label={ticket.priority} size="small" sx={{ bgcolor: `${getPriorityColor(ticket.priority)}15`, color: getPriorityColor(ticket.priority), fontWeight: 600, fontSize: 12 }} />
              <Chip label={ticket.category} size="small" sx={{ bgcolor: '#F3F4F615', color: '#717171', fontWeight: 600, fontSize: 12 }} />
            </Stack>
          </CardContent>
        </Card>

        <Row>
          <Col xs={12} md={8}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>Description</Typography>
                <Typography sx={{ color: '#4A5568', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{ticket.description}</Typography>
              </CardContent>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>Ticket Details</Typography>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center"><Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PersonIcon sx={{ fontSize: 20, color: '#717171' }} /></Box><Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>User</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{ticket.user}</Typography></Box></Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} alignItems="center"><Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><EmailIcon sx={{ fontSize: 20, color: '#717171' }} /></Box><Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Email</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{ticket.email}</Typography></Box></Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} alignItems="center"><Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CategoryIcon sx={{ fontSize: 20, color: '#717171' }} /></Box><Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Category</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{ticket.category}</Typography></Box></Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} alignItems="center"><Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PriorityIcon sx={{ fontSize: 20, color: '#717171' }} /></Box><Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Priority</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{ticket.priority}</Typography></Box></Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} alignItems="center"><Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AccessTimeIcon sx={{ fontSize: 20, color: '#717171' }} /></Box><Box><Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>Created At</Typography><Typography sx={{ fontWeight: 600, color: '#222222' }}>{ticket.createdAt && new Date(ticket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography></Box></Stack>
                </Stack>
              </CardContent>
            </Card>
          </Col>
        </Row>
        <DeleteConfirmationDialog open={deleteDialogOpen} onClose={handleDeleteCancel} onConfirm={handleDeleteConfirm} title="Are you sure you want to delete this ticket?" itemName="the ticket" />
      </AdminLayout>
    </>
  )
}
