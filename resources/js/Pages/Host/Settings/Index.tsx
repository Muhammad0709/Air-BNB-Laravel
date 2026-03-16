import React from 'react'
import { Box, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import { Head, router } from '@inertiajs/react'
import { Button, Card, CardContent, Stack } from '@mui/material'
import { useLanguage } from '../../../hooks/use-language'

export default function HostSettingsIndex() {
  const { t } = useLanguage()
  return (
    <>
      <Head title={t('host.settings.title')} />
      <HostLayout title={t('host.settings.title')}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>{t('host.settings.title')}</Typography>
          <Typography variant="body1" sx={{ color: '#717171' }}>{t('host.settings.manage_profile_desc')}</Typography>
        </Box>
        <Row>
          <Col xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>{t('host.settings.profile')}</Typography>
                <Typography variant="body2" sx={{ color: '#717171', mb: 3 }}>{t('host.settings.update_profile_desc')}</Typography>
                <Button variant="contained" onClick={() => router.visit('/host/settings/profile')} sx={{ bgcolor: '#AD542D', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}>{t('host.settings.go_to_profile')}</Button>
              </CardContent>
            </Card>
          </Col>
        </Row>
      </HostLayout>
    </>
  )
}
