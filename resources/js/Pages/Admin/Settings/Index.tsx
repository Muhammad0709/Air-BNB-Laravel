import React, { useState } from 'react'
import { Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import Toast from '../../../Components/Admin/Toast'
import { Head } from '@inertiajs/react'
import SaveIcon from '@mui/icons-material/Save'

export default function SystemSettings() {
  const [toastOpen, setToastOpen] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'LipaBnb',
    siteEmail: 'admin@lipabnb.com',
    sitePhone: '+1 (555) 123-4567',
    siteAddress: '123 Main Street, City, State, ZIP',
    timezone: 'America/New_York',
    taxRate: 8.5,
    serviceFee: 10
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToastOpen(true)
  }

  return (
    <>
      <Head title="System Settings" />
      <AdminLayout title="System Settings">
        <form onSubmit={handleSubmit}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>General Settings</Typography>
              <Row>
                <Col xs={12} md={6}>
                  <Stack spacing={3} sx={{ mb: { xs: 3, md: 0 } }}>
                    <TextField label="Site Name" name="siteName" value={settings.siteName} onChange={handleChange} fullWidth required />
                    <TextField label="Site Email" name="siteEmail" type="email" value={settings.siteEmail} onChange={handleChange} fullWidth required />
                    <TextField label="Phone Number" name="sitePhone" value={settings.sitePhone} onChange={handleChange} fullWidth />
                  </Stack>
                </Col>
                <Col xs={12} md={6}>
                  <Stack spacing={3}>
                    <TextField label="Site Address" name="siteAddress" value={settings.siteAddress} onChange={handleChange} fullWidth multiline rows={2} />
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select value={settings.timezone} onChange={(e) => handleSelectChange('timezone', e.target.value)} label="Timezone">
                        <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                        <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                        <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                        <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                        <MenuItem value="Asia/Karachi">Pakistan Standard Time (PKT)</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Col>
              </Row>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>Payment Settings</Typography>
              <Row>
                <Col xs={12} md={6}>
                  <Stack spacing={3}>
                    <TextField label="Tax Rate (%)" name="taxRate" type="number" value={settings.taxRate} onChange={handleChange} fullWidth inputProps={{ min: 0, max: 100, step: 0.1 }} />
                  </Stack>
                </Col>
                <Col xs={12} md={6}>
                  <Stack spacing={3}>
                    <TextField label="Service Fee (%)" name="serviceFee" type="number" value={settings.serviceFee} onChange={handleChange} fullWidth inputProps={{ min: 0, max: 100, step: 0.1 }} />
                  </Stack>
                </Col>
              </Row>
            </CardContent>
          </Card>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: '#AD542D', textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: '#78381C' } }}>Save Settings</Button>
          </Box>
        </form>
        <Toast open={toastOpen} onClose={() => setToastOpen(false)} message="Settings saved successfully!" severity="success" />
      </AdminLayout>
    </>
  )
}
