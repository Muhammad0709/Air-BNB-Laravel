import React, { useState, useEffect } from 'react'
import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import Toast from '../../../Components/Admin/Toast'
import { Head, usePage, router } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function EditBooking() {
  const { id } = (usePage().props as { id?: string }) || {}
  const [toastOpen, setToastOpen] = useState(false)
  const [formData, setFormData] = useState({
    guest: '',
    guestEmail: '',
    guestPhone: '',
    property: '',
    checkin: '',
    checkout: '',
    status: 'Pending',
    amount: ''
  })

  useEffect(() => {
    const mockBooking = {
      guest: 'John Doe',
      guestEmail: 'john.doe@example.com',
      guestPhone: '+1 (555) 123-4567',
      property: 'Luxury Beachfront Villa',
      checkin: '2025-01-15',
      checkout: '2025-01-20',
      status: 'Confirmed',
      amount: '1495'
    }
    setFormData(mockBooking)
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToastOpen(true)
    setTimeout(() => router.visit('/admin/bookings'), 1500)
  }

  return (
    <>
      <Head title="Edit Booking" />
      <AdminLayout title="Edit Booking">
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.visit('/admin/bookings')} sx={{ mb: 3, color: '#717171', textTransform: 'none', '&:hover': { bgcolor: '#F9FAFB', color: '#222222' } }}>
          Back to Bookings
        </Button>
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222', mb: 4 }}>Edit Booking Information</Typography>
            <form onSubmit={handleSubmit}>
              <Row>
                <Col xs={12} md={6}>
                  <Stack spacing={3} sx={{ mb: { xs: 3, md: 0 } }}>
                    <TextField label="Guest Name" name="guest" value={formData.guest} onChange={handleChange} required fullWidth />
                    <TextField label="Email Address" name="guestEmail" type="email" value={formData.guestEmail} onChange={handleChange} required fullWidth />
                    <TextField label="Phone Number" name="guestPhone" value={formData.guestPhone} onChange={handleChange} required fullWidth />
                  </Stack>
                </Col>
                <Col xs={12} md={6}>
                  <Stack spacing={3}>
                    <TextField label="Property" name="property" value={formData.property} onChange={handleChange} required fullWidth />
                    <TextField label="Check-in Date" name="checkin" type="date" value={formData.checkin} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
                    <TextField label="Check-out Date" name="checkout" type="date" value={formData.checkout} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
                  </Stack>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col xs={12} md={6}>
                  <TextField label="Total Amount" name="amount" type="number" value={formData.amount} onChange={handleChange} required fullWidth InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#717171' }}>$</Typography> }} sx={{ mb: { xs: 3, md: 0 } }} />
                </Col>
                <Col xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select value={formData.status} onChange={(e) => handleSelectChange(e.target.value)} label="Status">
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Confirmed">Confirmed</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col xs={12}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" sx={{ width: '100%' }}>
                    <Button variant="outlined" type="button" onClick={() => router.visit('/admin/bookings')} sx={{ textTransform: 'none', borderColor: '#D1D5DB', color: '#717171', '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>Cancel</Button>
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}>Update Booking</Button>
                  </Stack>
                </Col>
              </Row>
            </form>
          </CardContent>
        </Card>
        <Toast open={toastOpen} onClose={() => setToastOpen(false)} message="Booking updated successfully!" severity="success" />
      </AdminLayout>
    </>
  )
}
