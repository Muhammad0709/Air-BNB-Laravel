import React, { useState } from 'react'
import { Box, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import Pagination from '../../../components/Pagination'
import SearchIcon from '@mui/icons-material/Search'
import { Head, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'

type ContactRow = {
  id: number
  name: string
  email: string
  subject: string
  created_at: string | null
  account_user_name?: string | null
}

type ContactsProp =
  | ContactRow[]
  | {
      data: ContactRow[]
      current_page: number
      last_page: number
    }

export default function AdminContactsIndex() {
  const { t } = useLanguage()
  const props = usePage().props as { contacts?: ContactsProp; filters?: { search?: string } }
  const contactsProp = props.contacts
  const filters = props.filters ?? {}
  const [search, setSearch] = useState(filters.search ?? '')

  const list = Array.isArray(contactsProp) ? contactsProp : (contactsProp?.data ?? [])
  const currentPage = (contactsProp as { current_page?: number })?.current_page ?? 1
  const lastPage = (contactsProp as { last_page?: number })?.last_page ?? 1

  const handleSearchChange = (value: string) => {
    setSearch(value)
    router.get('/admin/contacts', { search: value, page: 1 }, { preserveState: true, replace: true })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/contacts', { search, page }, { preserveState: true })
  }

  return (
    <>
      <Head title={t('admin.contacts.title')} />
      <AdminLayout title={t('admin.contacts.title')}>
        <Row>
          <Col xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  sx={{ mb: 3, gap: 2 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                    {t('admin.contacts.all_messages')}
                  </Typography>
                  <TextField
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={t('admin.contacts.search_placeholder')}
                    size="small"
                    sx={{ width: { xs: '100%', sm: 280 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
                <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <Table sx={{ minWidth: 720, width: '100%' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>
                          {t('admin.contacts.name')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>
                          {t('admin.contacts.email')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>
                          {t('admin.contacts.subject')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>
                          {t('admin.contacts.account_user')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>
                          {t('admin.contacts.received_at')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>
                          {t('admin.common.actions')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {list.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ border: 'none', py: 8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                              <Typography variant="body1" sx={{ color: '#717171', fontWeight: 600 }}>
                                {t('admin.contacts.no_messages')}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        list.map((row) => (
                          <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                            <TableCell>
                              <Typography sx={{ fontWeight: 600, color: '#222222' }}>{row.name}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: '#717171' }}>{row.email}</TableCell>
                            <TableCell sx={{ color: '#717171', maxWidth: 280 }}>{row.subject}</TableCell>
                            <TableCell sx={{ color: '#717171' }}>
                              {row.account_user_name ?? '—'}
                            </TableCell>
                            <TableCell sx={{ color: '#717171', whiteSpace: 'nowrap' }}>
                              {row.created_at
                                ? new Date(row.created_at).toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '—'}
                            </TableCell>
                            <TableCell>
                              <ActionsMenu
                                onView={() => router.visit(`/admin/contacts/${row.id}`)}
                                viewLabel={t('admin.common.view')}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {lastPage > 1 && (
                  <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />
                )}
              </CardContent>
            </Card>
          </Col>
        </Row>
      </AdminLayout>
    </>
  )
}
