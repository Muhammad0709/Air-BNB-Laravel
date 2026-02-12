import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import { router, usePage } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BedIcon from '@mui/icons-material/Bed'
import BathtubIcon from '@mui/icons-material/Bathtub'
import PeopleIcon from '@mui/icons-material/People'
import HomeIcon from '@mui/icons-material/Home'

const DEFAULT_IMAGE = '/images/filter-1.svg'

export default function ViewProperty() {
  const { property } = usePage().props as any
  const [currentStatus, setCurrentStatus] = useState(property?.status || 'Active')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10B981'
      case 'Inactive': return '#6B7280'
      case 'Pending': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      apartment: 'Apartment',
      house: 'House',
      villa: 'Villa',
      studio: 'Studio',
      condo: 'Condo'
    }
    return types[type?.toLowerCase()] || type
  }

  const handleStatusChange = () => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
    setCurrentStatus(newStatus)
    router.put(`/admin/properties/${property.id}`, {
      status: newStatus
    }, {
      preserveScroll: true
    })
  }

  if (!property) {
    return (
      <AdminLayout title="View Property">
        <Typography>Property not found</Typography>
      </AdminLayout>
    )
  }

  const propertyImage = property.image || DEFAULT_IMAGE

  return (
    <AdminLayout title="View Property">
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 4, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.visit('/admin/properties')}
          sx={{
            color: '#6B7280',
            textTransform: 'none',
            '&:hover': { bgcolor: '#F9FAFB', color: '#111827' }
          }}
        >
          Back to Properties
        </Button>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={currentStatus === 'Active' ? <VisibilityOffIcon /> : <VisibilityIcon />}
            onClick={handleStatusChange}
            sx={{
              borderColor: currentStatus === 'Active' ? '#EF4444' : '#10B981',
              color: currentStatus === 'Active' ? '#EF4444' : '#10B981',
              textTransform: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              '&:hover': {
                borderColor: currentStatus === 'Active' ? '#DC2626' : '#059669',
                bgcolor: currentStatus === 'Active' ? '#FEF2F2' : '#ECFDF5'
              }
            }}
          >
            {currentStatus === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => router.visit(`/admin/properties/${property.id}/edit`)}
            sx={{
              bgcolor: '#AD542D',
              textTransform: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              '&:hover': { bgcolor: '#78381C' }
            }}
          >
            Edit Property
          </Button>
        </Stack>
      </Stack>

      {/* Property Image */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 4, overflow: 'hidden' }}>
        <Box
          component="img"
          src={propertyImage}
          alt={property.title}
          sx={{
            width: '100%',
            height: { xs: 300, md: 500 },
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </Card>

      {/* Property Header */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 4, bgcolor: '#FAFBFC' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-start' }} spacing={3} useFlexGap>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
                {property.title}
              </Typography>
              <Stack direction="row" spacing={2} useFlexGap alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} useFlexGap alignItems="center">
                  <LocationOnIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                  <Typography sx={{ color: '#4A5568', fontSize: 16, fontWeight: 500 }}>{property.location}</Typography>
                </Stack>
                <Chip
                  label={currentStatus}
                  size="small"
                  sx={{
                    bgcolor: `${getStatusColor(currentStatus)}15`,
                    color: getStatusColor(currentStatus),
                    fontWeight: 600,
                    fontSize: 12,
                    height: 28
                  }}
                />
              </Stack>
              <Typography sx={{ color: '#4A5568', lineHeight: 1.8, fontSize: 16, whiteSpace: 'pre-line' }}>
                {property.description || 'No description available.'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                ${property.price}
                <Typography component="span" sx={{ fontSize: 20, color: '#6B7280', fontWeight: 400, marginInlineStart: 0.5 }}>
                  /night
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Row>
        <Col xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, position: 'sticky', top: 20 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
                Property Details
              </Typography>

              <Stack spacing={2.5}>
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <HomeIcon sx={{ fontSize: 28, color: '#6B7280' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 0.5, fontWeight: 500 }}>Property Type</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: 17 }}>
                      {getPropertyTypeLabel(property.property_type)}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <BedIcon sx={{ fontSize: 28, color: '#6B7280' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 0.5, fontWeight: 500 }}>Bedrooms</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: 17 }}>{property.bedrooms}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <BathtubIcon sx={{ fontSize: 28, color: '#6B7280' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 0.5, fontWeight: 500 }}>Bathrooms</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: 17 }}>{property.bathrooms}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 28, color: '#6B7280' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 0.5, fontWeight: 500 }}>Guests</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: 17 }}>{property.guests}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Box>
                  <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 1, fontWeight: 500 }}>Created At</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: 15 }}>
                    {new Date(property.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  )
}
