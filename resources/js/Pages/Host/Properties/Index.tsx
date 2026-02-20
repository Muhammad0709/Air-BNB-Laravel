import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment, Chip } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import Toast from '../../../Components/Admin/Toast'
import SearchIcon from '@mui/icons-material/Search'
import { router, usePage } from '@inertiajs/react'

const DEFAULT_IMAGE = '/images/popular-stay-1.svg'

interface Property {
  id: number
  title: string
  location: string
  price: number
  status: string
  approval_status: string
  property_type: string
  bedrooms: number
  bathrooms: number
  guests: number
  image?: string
  created_at: string
}

interface PaginatedProperties {
  data: Property[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface Filters {
  search?: string
  status?: string
  approval_status?: string
}

export default function HostProperties() {
  const { properties, filters, statusOptions, approvalStatusOptions, flash } = usePage<{
    properties: PaginatedProperties
    filters: Filters
    statusOptions: string[]
    approvalStatusOptions: string[]
    flash?: { success?: string; error?: string }
  }>().props

  const [search, setSearch] = useState(filters.search || '')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: number; title: string } | null>(null)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  useEffect(() => {
    if (flash?.success) setToast({ open: true, message: flash.success, severity: 'success' })
    if (flash?.error) setToast({ open: true, message: flash.error, severity: 'error' })
  }, [flash?.success, flash?.error])

  const handleSearch = () => {
    router.get('/host/properties', { search }, { preserveState: true })
  }

  const filteredProperties = properties.data

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#10B981'
      case 'Rejected': return '#EF4444'
      case 'Pending': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const handleDeleteClick = (property: { id: number; title: string }) => {
    setPropertyToDelete(property)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (propertyToDelete) {
      router.delete(`/host/properties/${propertyToDelete.id}`, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setPropertyToDelete(null)
        }
      })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setPropertyToDelete(null)
  }

  return (
    <HostLayout title="Properties">
      {/* Properties Table */}
      <Row>
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  My Properties
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <TextField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                  <Button
                    variant="contained"
                    onClick={() => router.visit('/host/properties/create')}
                    fullWidth={window.innerWidth < 600}
                    sx={{
                      bgcolor: '#AD542D',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#78381C' }
                    }}
                  >
                    Add Property
                  </Button>
                </Stack>
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
                    {filteredProperties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{ color: '#6B7280' }}>No Property Found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProperties.map((property) => (
                      <TableRow key={property.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                        <TableCell>
                          <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                            <Box
                              component="img"
                              src={property.image || DEFAULT_IMAGE}
                              alt={property.title}
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                // Prevent infinite loop - only set default if not already using it
                                if (!target.src.includes(DEFAULT_IMAGE)) {
                                  target.src = DEFAULT_IMAGE
                                } else {
                                  // If default also fails, hide the image
                                  target.style.display = 'none'
                                }
                              }}
                              sx={{
                                width: 60,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: 1,
                                bgcolor: '#F3F4F6',
                                flexShrink: 0
                              }}
                            />
                            <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                              {property.title}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ color: '#6B7280' }}>{property.location}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
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
                            onView={() => router.visit(`/host/properties/${property.id}`)}
                            onEdit={() => router.visit(`/host/properties/${property.id}/edit`)}
                            onDelete={() => handleDeleteClick({ id: property.id, title: property.title })}
                            viewLabel="View"
                            editLabel="Edit"
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Are you sure you want to delete this property?"
        itemName="the property"
      />

      <Toast
        open={toast.open}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        message={toast.message}
        severity={toast.severity}
      />
    </HostLayout>
  )
}

