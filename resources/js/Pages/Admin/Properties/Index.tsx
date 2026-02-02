import React, { useState } from 'react'
import { Box, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment, Chip } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import SearchIcon from '@mui/icons-material/Search'
import { router, usePage } from '@inertiajs/react'

const DEFAULT_IMAGE = '/images/filter-1.svg'

export default function AdminProperties() {
  const { properties, filters } = usePage().props as any
  const [search, setSearch] = useState(filters?.search || '')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    router.get('/admin/properties', { search: value }, { 
      preserveState: true,
      replace: true 
    })
  }

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#10B981'
      case 'Rejected': return '#EF4444'
      case 'Pending': return '#F59E0B'
      default: return '#6B7280'
    }
  }


  const propertiesList = properties?.data || []

  return (
    <AdminLayout title="Properties">
      {/* Properties Table */}
      <Row>
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  Manage Properties
                </Typography>
                <TextField
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search properties..."
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
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Property</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Approval</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {propertiesList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{ color: '#6B7280' }}>No properties found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      propertiesList.map((property: any) => (
                        <TableRow key={property.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
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
                              label={property.approval_status}
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
                              viewLabel="View"
                              editLabel="Edit"
                              approveLabel="Approve"
                              rejectLabel="Reject"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Col>
      </Row>

    </AdminLayout>
  )
}



