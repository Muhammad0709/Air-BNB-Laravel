import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
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

interface Property {
  id: number
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  guests: number
  property_type: string
  status: string
  approval_status: string
  description: string
  image?: string
  created_at: string
}

export default function ViewProperty() {
  const { property } = usePage<{ property: Property }>().props
  const [localStatus, setLocalStatus] = useState(property.status)


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10B981'
      case 'Inactive': return '#6B7280'
      default: return '#6B7280'
    }
  }

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#10B981'
      case 'Rejected': return '#EF4444'
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
    return types[type.toLowerCase()] || type
  }

  const handleStatusChange = () => {
    const newStatus = property.status === 'Active' ? 'Inactive' : 'Active'
    setLocalStatus(newStatus)
    // Here you would typically make an API call to update the status
    // router.patch(`/host/properties/${property.id}`, { status: newStatus })
    // In real app: API call to update status
    console.log('Status changed to:', newStatus)
  }

  return (
    <HostLayout title="View Property">
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.visit('/host/properties')}
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
            startIcon={property.status === 'Active' ? <VisibilityOffIcon /> : <VisibilityIcon />}
            onClick={handleStatusChange}
            sx={{
              borderColor: property.status === 'Active' ? '#EF4444' : '#10B981',
              color: property.status === 'Active' ? '#EF4444' : '#10B981',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: property.status === 'Active' ? '#DC2626' : '#059669',
                bgcolor: property.status === 'Active' ? '#FEF2F2' : '#ECFDF5'
              }
            }}
          >
            {property.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => router.visit(`/host/properties/${property.id}/edit`)}
            sx={{
              bgcolor: '#AD542D',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#78381C' }
            }}
          >
            Edit Property
          </Button>
        </Stack>
      </Stack>

      {/* Property Image */}
      {property.image ? (
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 4, overflow: 'hidden' }}>
          <Box
            component="img"
            src={property.image.startsWith('http') || property.image.startsWith('/') ? property.image : `/storage/${property.image}`}
            alt={property.title}
            sx={{
              width: '100%',
              height: { xs: 300, md: 500 },
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </Card>
      ) : (
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              width: '100%',
              height: { xs: 300, md: 500 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F3F4F6',
              color: '#6B7280'
            }}
          >
            <Typography variant="h6">No Image Available</Typography>
          </Box>
        </Card>
      )}

      {/* Property Header */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-start' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
                {property.title}
              </Typography>
              <Stack direction="row" spacing={2} useFlexGap alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} useFlexGap alignItems="center">
                  <LocationOnIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                  <Typography sx={{ color: '#6B7280' }}>{property.location}</Typography>
                </Stack>
                  <Stack direction="row" spacing={1} useFlexGap>
                    <Chip
                      label={property.status}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(property.status)}15`,
                        color: getStatusColor(property.status),
                        fontWeight: 600,
                        fontSize: 12
                      }}
                    />
                  </Stack>
              </Stack>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                ${property.price}
                <Typography component="span" sx={{ fontSize: 16, color: '#6B7280', fontWeight: 400, marginInlineStart: 0.5 }}>
                  /night
                </Typography>
              </Typography>
            </Box>
          </Stack>

        </CardContent>
      </Card>

      {/* Property Details */}
      <Row>
        <Col xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
                About the Property
              </Typography>
              <Typography sx={{ color: '#4A5568', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {property.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Approval Status Section */}
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', mt: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
                Approval Status
              </Typography>
              <Stack spacing={2}>
                <Chip
                  label={property.approval_status}
                  size="medium"
                  sx={{
                    bgcolor: `${getApprovalStatusColor(property.approval_status)}15`,
                    color: getApprovalStatusColor(property.approval_status),
                    fontWeight: 600,
                    fontSize: 14,
                    px: 2,
                    py: 1,
                    width: 'fit-content'
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
                Property Details
              </Typography>

              <Stack spacing={3}>
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <HomeIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#6B7280', mb: 0.5 }}>Property Type</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                      {getPropertyTypeLabel(property.property_type)}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <BedIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#6B7280', mb: 0.5 }}>Bedrooms</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#111827' }}>{property.bedrooms}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <BathtubIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#6B7280', mb: 0.5 }}>Bathrooms</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#111827' }}>{property.bathrooms}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#6B7280', mb: 0.5 }}>Guests</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#111827' }}>{property.guests}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Box>
                  <Typography sx={{ fontSize: 12, color: '#6B7280', mb: 1 }}>Total Bookings</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                    0
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography sx={{ fontSize: 12, color: '#6B7280', mb: 1 }}>Created At</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#111827' }}>
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
    </HostLayout>
  )
}

