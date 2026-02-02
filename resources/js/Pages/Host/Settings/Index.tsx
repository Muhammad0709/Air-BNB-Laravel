import React from 'react'
import { Box, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import { Head, router } from '@inertiajs/react'
import { Button, Card, CardContent, Stack } from '@mui/material'

export default function HostSettingsIndex() {
  return (
    <>
      <Head title="Settings" />
      <HostLayout title="Settings">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>Settings</Typography>
          <Typography variant="body1" sx={{ color: '#717171' }}>Manage your profile and account</Typography>
        </Box>
        <Row>
          <Col xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>Profile</Typography>
                <Typography variant="body2" sx={{ color: '#717171', mb: 3 }}>Update your profile and verification details</Typography>
                <Button variant="contained" onClick={() => router.visit('/host/settings/profile')} sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}>Go to Profile</Button>
              </CardContent>
            </Card>
          </Col>
        </Row>
      </HostLayout>
    </>
  )
}
