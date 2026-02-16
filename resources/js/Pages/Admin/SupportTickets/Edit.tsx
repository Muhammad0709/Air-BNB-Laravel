import React, { useState, useEffect } from 'react'
import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import Toast from '../../../Components/Admin/Toast'
import { Head, usePage, router } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useLanguage } from '../../../hooks/use-language'

export default function EditSupportTicket() {
  const { t } = useLanguage()
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
      <Head title={t('admin.support_tickets.edit')} />
      <AdminLayout title={t('admin.support_tickets.edit')}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.visit('/admin/support-tickets')} sx={{ mb: 3, color: '#717171', textTransform: 'none', '&:hover': { bgcolor: '#F9FAFB', color: '#222222' } }}>{t('admin.support_tickets.back_to_tickets')}</Button>
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222', mb: 4 }}>{t('admin.support_tickets.edit_ticket_information')}</Typography>
            <form onSubmit={handleSubmit}>
              <Row>
                <Col xs={12} md={6}>
                  <Stack spacing={3} sx={{ mb: { xs: 3, md: 0 } }}>
                    <TextField label={t('admin.support_tickets.subject')} name="subject" value={formData.subject} onChange={handleChange} required fullWidth />
                    <TextField label={t('admin.support_tickets.user_name')} name="user" value={formData.user} onChange={handleChange} required fullWidth />
                    <TextField label={t('admin.support_tickets.email')} name="email" type="email" value={formData.email} onChange={handleChange} required fullWidth />
                  </Stack>
                </Col>
                <Col xs={12} md={6}>
                  <Stack spacing={3}>
                    <FormControl fullWidth required><InputLabel>{t('admin.support_tickets.category')}</InputLabel><Select value={formData.category} onChange={(e) => handleSelectChange('category', e.target.value)} label={t('admin.support_tickets.category')}><MenuItem value="Technical">{t('admin.support_tickets.technical')}</MenuItem><MenuItem value="Billing">{t('admin.support_tickets.billing')}</MenuItem><MenuItem value="Booking">{t('admin.support_tickets.booking')}</MenuItem><MenuItem value="Account">{t('admin.support_tickets.account')}</MenuItem><MenuItem value="General">{t('admin.support_tickets.general')}</MenuItem></Select></FormControl>
                    <FormControl fullWidth required><InputLabel>{t('admin.support_tickets.priority')}</InputLabel><Select value={formData.priority} onChange={(e) => handleSelectChange('priority', e.target.value)} label={t('admin.support_tickets.priority')}><MenuItem value="Low">{t('admin.support_tickets.low')}</MenuItem><MenuItem value="Medium">{t('admin.support_tickets.medium')}</MenuItem><MenuItem value="High">{t('admin.support_tickets.high')}</MenuItem></Select></FormControl>
                    <FormControl fullWidth required><InputLabel>{t('admin.support_tickets.status')}</InputLabel><Select value={formData.status} onChange={(e) => handleSelectChange('status', e.target.value)} label={t('admin.support_tickets.status')}><MenuItem value="Open">{t('admin.support_tickets.open')}</MenuItem><MenuItem value="In Progress">{t('admin.support_tickets.in_progress')}</MenuItem><MenuItem value="Resolved">{t('admin.support_tickets.resolved')}</MenuItem><MenuItem value="Closed">{t('admin.support_tickets.closed')}</MenuItem></Select></FormControl>
                  </Stack>
                </Col>
              </Row>
              <Row className="mt-3"><Col xs={12}><TextField label={t('admin.support_tickets.description')} name="description" value={formData.description} onChange={handleChange} required fullWidth multiline rows={6} /></Col></Row>
              <Row className="mt-4">
                <Col xs={12}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap justifyContent="flex-end" sx={{ width: '100%' }}>
                    <Button variant="outlined" type="button" onClick={() => router.visit('/admin/support-tickets')} sx={{ textTransform: 'none', borderColor: '#D1D5DB', color: '#717171', '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>{t('admin.common.cancel')}</Button>
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}>{t('admin.support_tickets.update_ticket')}</Button>
                  </Stack>
                </Col>
              </Row>
            </form>
          </CardContent>
        </Card>
        <Toast open={toastOpen} onClose={() => setToastOpen(false)} message={t('admin.support_tickets.updated_success')} severity="success" />
      </AdminLayout>
    </>
  )
}
