import React, { useState } from 'react'
import { Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import Pagination from '../../../components/Pagination'
import SearchIcon from '@mui/icons-material/Search'
import { Head, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'

type HostRow = {
  host_id: number
  host_name: string
  bookings_count: number
  total_amount_formatted: string
  total_commission_formatted: string
  total_host_earning_formatted: string
}

type PageProps = {
  hosts: HostRow[]
  current_page?: number
  last_page?: number
  filters?: { search?: string }
}

export default function AdminHistoryIndex() {
  const { t } = useLanguage()
  const { hosts = [], current_page = 1, last_page = 1, filters = {} } = (usePage().props as PageProps) ?? {}
  const [search, setSearch] = useState(filters.search ?? '')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    router.get('/admin/history', { search: value, page: 1 }, { preserveState: true, replace: true })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/history', { search, page }, { preserveState: true })
  }

  return (
    <>
      <Head title={t('admin.history.title')} />
      <AdminLayout title={t('admin.history.title')}>
        <Row>
          <Col xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                    {t('admin.history.manage_history')}
                  </Typography>
                  <TextField
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={t('admin.history.search_placeholder')}
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
                </Stack>

                <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <Table sx={{ minWidth: 800, width: '100%' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.history.host')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.history.bookings_count')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.history.total_amount')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.history.host_earning')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.history.admin_commission')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.common.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hosts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                            <Typography sx={{ color: '#6B7280' }}>{t('admin.history.no_completed_bookings')}</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        hosts.map((host) => (
                          <TableRow key={host.host_id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                            <TableCell sx={{ fontWeight: 600, color: '#111827' }}>{host.host_name}</TableCell>
                            <TableCell sx={{ color: '#6B7280' }}>{host.bookings_count}</TableCell>
                            <TableCell sx={{ color: '#6B7280' }}>{host.total_amount_formatted}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>{host.total_host_earning_formatted}</TableCell>
                            <TableCell sx={{ color: '#6B7280' }}>{host.total_commission_formatted}</TableCell>
                            <TableCell>
                              <ActionsMenu
                                onView={() => router.visit(`/admin/history/${host.host_id}`)}
                                viewLabel={t('admin.common.view')}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {last_page > 1 && (
                  <Pagination
                    currentPage={current_page}
                    lastPage={last_page}
                    onPageChange={handlePageChange}
                  />
                )}
              </CardContent>
            </Card>
          </Col>
        </Row>
      </AdminLayout>
    </>
  )
}
