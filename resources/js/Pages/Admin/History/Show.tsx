import React from 'react'
import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import { Head, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

type BookingRow = {
  id: number
  customer: string
  nights: number
  property: string
  total_amount_formatted: string
  commission_formatted: string
  host_earning_formatted: string
}

type PageProps = {
  host: { id: number; name: string }
  bookings: BookingRow[]
  total_commission_formatted: string
  total_host_earning_formatted: string
}

export default function AdminHistoryShow() {
  const { t } = useLanguage()
  const { host, bookings = [], total_commission_formatted, total_host_earning_formatted } = (usePage().props as PageProps) ?? {}

  return (
    <>
      <Head title={`${t('admin.history.title')} – ${host?.name ?? ''}`} />
      <AdminLayout title={t('admin.history.detail_title')}>
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.visit('/admin/history')}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#717171' }}
          >
            {t('admin.history.back')}
          </Button>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>
          {t('admin.history.host')}: {host?.name ?? '—'}
        </Typography>

        <Row>
          <Col xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#222222' }}>{t('admin.history.customer')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222' }}>{t('admin.history.nights')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222' }}>{t('admin.history.property')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222' }}>{t('admin.history.total_amount')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222' }}>{t('admin.history.host_earning')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222' }}>{t('admin.history.admin_commission')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ py: 4, textAlign: 'center', color: '#717171' }}>
                            {t('admin.history.no_completed_bookings')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((row) => (
                          <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                            <TableCell sx={{ fontWeight: 600, color: '#222222' }}>{row.customer}</TableCell>
                            <TableCell sx={{ color: '#717171' }}>{row.nights}</TableCell>
                            <TableCell sx={{ color: '#717171' }}>{row.property}</TableCell>
                            <TableCell sx={{ color: '#717171' }}>{row.total_amount_formatted}</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#222222' }}>{row.host_earning_formatted}</TableCell>
                            <TableCell sx={{ color: '#717171' }}>{row.commission_formatted}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {bookings.length > 0 && (
                  <Box sx={{ mt: 3, p: 2.5, bgcolor: '#FFF5F7', borderRadius: 2, border: '1px solid #FED7D7' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222222' }}>
                        {t('admin.history.total_admin_commission')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#AD542D' }}>
                        {total_commission_formatted}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222222' }}>
                        {t('admin.history.total_host_earning')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#222222' }}>
                        {total_host_earning_formatted}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Col>
        </Row>
      </AdminLayout>
    </>
  )
}
