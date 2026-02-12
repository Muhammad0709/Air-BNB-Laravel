import React, { useState, useEffect } from 'react'
import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import Toast from '../../../Components/Admin/Toast'
import { Head, usePage, router } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function EditSupportTicket() {
  const { id } = (usePage().props as { id?: string }) || {}
  const [toastOpen, setToastOpen] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    user: '',
    email: '',
    priority: 'Medium',
    status: 'Open',
    description: '',
    category: 'Technical'
  })

  useEffect(() => {
    const mockTicket = { subject: 'Payment issue with booking', user: 'John Doe', email: 'john@example.com', priority: 'High', status: 'Open', description: 'I am experiencing issues with my payment for booking ID #12345.', category: 'Billing' }
    setFormData(mockTicket)
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToastOpen(true)
    setTimeout(() => router.visit('/admin/support-tickets'), 1500)
  }

  return (
    <>
      <Head title="Edit Support Ticket" />
      <AdminLayout title="Edit Support Ticket">
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.visit('/admin/support-tickets')} sx={{ mb: 3, color: '#717171', textTransform: 'none', '&:hover': { bgcolor: '#F9FAFB', color: '#222222' } }}>Back to Support Tickets</Button>
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222', mb: 4 }}>Edit Ticket Information</Typography>
            <form onSubmit={handleSubmit}>
              <Row>
                <Col xs={12} md={6}>
                  <Stack spacing={3} sx={{ mb: { xs: 3, md: 0 } }}>
                    <TextField label="Subject" name="subject" value={formData.subject} onChange={handleChange} required fullWidth />
                    <TextField label="User Name" name="user" value={formData.user} onChange={handleChange} required fullWidth />
                    <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required fullWidth />
                  </Stack>
                </Col>
                <Col xs={12} md={6}>
                  <Stack spacing={3}>
                    <FormControl fullWidth required><InputLabel>Category</InputLabel><Select value={formData.category} onChange={(e) => handleSelectChange('category', e.target.value)} label="Category"><MenuItem value="Technical">Technical</MenuItem><MenuItem value="Billing">Billing</MenuItem><MenuItem value="Booking">Booking</MenuItem><MenuItem value="Account">Account</MenuItem><MenuItem value="General">General</MenuItem></Select></FormControl>
                    <FormControl fullWidth required><InputLabel>Priority</InputLabel><Select value={formData.priority} onChange={(e) => handleSelectChange('priority', e.target.value)} label="Priority"><MenuItem value="Low">Low</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="High">High</MenuItem></Select></FormControl>
                    <FormControl fullWidth required><InputLabel>Status</InputLabel><Select value={formData.status} onChange={(e) => handleSelectChange('status', e.target.value)} label="Status"><MenuItem value="Open">Open</MenuItem><MenuItem value="In Progress">In Progress</MenuItem><MenuItem value="Resolved">Resolved</MenuItem><MenuItem value="Closed">Closed</MenuItem></Select></FormControl>
                  </Stack>
                </Col>
              </Row>
              <Row className="mt-3"><Col xs={12}><TextField label="Description" name="description" value={formData.description} onChange={handleChange} required fullWidth multiline rows={6} /></Col></Row>
              <Row className="mt-4">
                <Col xs={12}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap justifyContent="flex-end" sx={{ width: '100%' }}>
                    <Button variant="outlined" type="button" onClick={() => router.visit('/admin/support-tickets')} sx={{ textTransform: 'none', borderColor: '#D1D5DB', color: '#717171', '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>Cancel</Button>
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}>Update Ticket</Button>
                  </Stack>
                </Col>
              </Row>
            </form>
          </CardContent>
        </Card>
        <Toast open={toastOpen} onClose={() => setToastOpen(false)} message="Support ticket updated successfully!" severity="success" />
      </AdminLayout>
    </>
  )
}
