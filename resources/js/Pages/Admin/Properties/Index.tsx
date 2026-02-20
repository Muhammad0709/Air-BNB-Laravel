import React, { useState } from 'react'
import { Box, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment, Chip } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import Pagination from '../../../components/Pagination'
import SearchIcon from '@mui/icons-material/Search'
import { router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'

const DEFAULT_IMAGE = '/images/filter-1.svg'

export default function AdminProperties() {
  const { t } = useLanguage()
  const { properties, filters } = usePage().props as any
  const [search, setSearch] = useState(filters?.search || '')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    router.get('/admin/properties', { search: value, page: 1 }, {
      preserveState: true,
      replace: true
    })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/properties', { search, page }, { preserveState: true })
  }

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#10B981'
      case 'Rejected': return '#EF4444'
      case 'Pending': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const getApprovalStatusLabel = (status: string) => {
    switch (status) {
      case 'Approved': return t('admin.properties.approved')
      case 'Rejected': return t('admin.properties.rejected')
      case 'Pending': return t('admin.properties.pending')
      default: return status
    }
  }


  const propertiesList = properties?.data || []
  const currentPage = properties?.current_page ?? 1
  const lastPage = properties?.last_page ?? 1

  return (
    <AdminLayout title={t('admin.properties.title')}>
      {/* Properties Table */}
      <Row>
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {t('admin.properties.manage_properties')}
                </Typography>
                <TextField
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('admin.properties.search_placeholder')}
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
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.properties.property')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.properties.location')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.properties.price')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.properties.approval')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{t('admin.common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {propertiesList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{ color: '#6B7280' }}>{t('admin.properties.no_properties_found')}</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      propertiesList.map((property: any) => (
                        <TableRow key={property.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                          <TableCell>
                            <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                              <Box
                                component="img"
                                src={property.image || DEFAULT_IMAGE}
                                alt={property.title}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  objectFit: 'cover',
                                  borderRadius: 1
                                }}
                              />
                              <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                                {property.title}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ color: '#6B7280' }}>{property.location}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#111827' }}>
                            ${property.price}/night
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getApprovalStatusLabel(property.approval_status)}
                              size="small"
                              sx={{
                                bgcolor: `${getApprovalStatusColor(property.approval_status)}15`,
                                color: getApprovalStatusColor(property.approval_status),
                                fontWeight: 600,
                                fontSize: 12
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <ActionsMenu
                              onView={() => router.visit(`/admin/properties/${property.id}`)}
                              onEdit={() => router.visit(`/admin/properties/${property.id}/edit`)}
                              onApprove={property.approval_status === 'Pending' ? () => router.patch(`/admin/properties/${property.id}/approve`) : undefined}
                              onReject={property.approval_status === 'Pending' ? () => router.patch(`/admin/properties/${property.id}/reject`) : undefined}
                              viewLabel={t('admin.common.view')}
                              editLabel={t('admin.common.edit')}
                              approveLabel={t('admin.properties.approve')}
                              rejectLabel={t('admin.properties.reject')}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {lastPage > 1 && (
                <Pagination
                  currentPage={currentPage}
                  lastPage={lastPage}
                  onPageChange={handlePageChange}
                />
              )}
            </CardContent>
          </Card>
        </Col>
      </Row>

    </AdminLayout>
  )
}



