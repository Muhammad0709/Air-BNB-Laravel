import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import { router, usePage } from '@inertiajs/react'
import RtlBackArrowIcon from '../../../components/RtlBackArrowIcon'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BedIcon from '@mui/icons-material/Bed'
import BathtubIcon from '@mui/icons-material/Bathtub'
import PeopleIcon from '@mui/icons-material/People'
import HomeIcon from '@mui/icons-material/Home'
import DeleteIcon from '@mui/icons-material/Delete'
import StarIcon from '@mui/icons-material/Star'
import { adminButtonStartIconSx } from '../../../utils/adminButtonStartIconSx'
import { useLanguage } from '../../../hooks/use-language'

const DEFAULT_IMAGE = '/images/filter-1.svg'

type PropertyReview = {
  id: number
  rating: number
  comment: string | null
  created_at: string
  user?: { name: string } | null
}

export default function ViewProperty() {
  const { t, language } = useLanguage()
  const { property } = usePage().props as any
  const reviews: PropertyReview[] = property?.reviews || []

  const handleDeleteReview = (reviewId: number) => {
    if (!window.confirm(t('admin.properties.confirm_delete_review'))) return
    router.delete(`/admin/reviews/${reviewId}`, { preserveScroll: true })
  }
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
      <AdminLayout title={t('admin.properties.view_property')}>
        <Typography>{t('admin.properties.property_not_found')}</Typography>
      </AdminLayout>
    )
  }

  const propertyImage = property.image || DEFAULT_IMAGE

  return (
    <AdminLayout title={t('admin.properties.view_property')}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 4, gap: 2 }}>
        <Button
          startIcon={<RtlBackArrowIcon />}
          onClick={() => router.visit('/admin/properties')}
          sx={{
            color: '#6B7280',
            textTransform: 'none',
            '&:hover': { bgcolor: '#F9FAFB', color: '#111827' },
            ...adminButtonStartIconSx,
          }}
        >
          {t('admin.properties.back_to_properties')}
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
              },
              ...adminButtonStartIconSx,
            }}
          >
            {currentStatus === 'Active' ? t('admin.properties.deactivate') : t('admin.properties.activate')}
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
              '&:hover': { bgcolor: '#78381C' },
              ...adminButtonStartIconSx,
            }}
          >
            {t('admin.properties.edit_property')}
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
                {property.description || t('admin.properties.no_description')}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                ${property.price}
                <Typography component="span" sx={{ fontSize: 20, color: '#6B7280', fontWeight: 400, marginInlineStart: 0.5 }}>
                  {t('admin.properties.per_night')}
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
                {t('admin.properties.property_details')}
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
                    <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 0.5, fontWeight: 500 }}>{t('admin.properties.property_type')}</Typography>
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
                    <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 0.5, fontWeight: 500 }}>{t('admin.properties.bedrooms')}</Typography>
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
                    <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 0.5, fontWeight: 500 }}>{t('admin.properties.bathrooms')}</Typography>
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
                    <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 0.5, fontWeight: 500 }}>{t('admin.properties.guests')}</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: 17 }}>{property.guests}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Box>
                  <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 1, fontWeight: 500 }}>{t('admin.properties.created_at')}</Typography>
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

      {/* Reviews */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mt: 4 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
            {t('admin.properties.reviews')}
          </Typography>

          {reviews.length === 0 ? (
            <Typography sx={{ color: '#6B7280' }}>{t('admin.properties.no_reviews')}</Typography>
          ) : (
            <Stack spacing={2.5} divider={<Divider />}>
              {reviews.map((review) => (
                <Stack key={review.id} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} useFlexGap alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, color: '#111827' }}>{review.user?.name || '—'}</Typography>
                      <Stack direction="row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon key={star} sx={{ fontSize: 16, color: star <= review.rating ? '#ffc107' : '#e9ecef' }} />
                        ))}
                      </Stack>
                    </Stack>
                    {review.comment && (
                      <Typography sx={{ color: '#4A5568', fontSize: 14, mb: 0.5 }}>{review.comment}</Typography>
                    )}
                    <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
                      {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteReview(review.id)}
                    sx={{
                      color: '#EF4444',
                      textTransform: 'none',
                      flexShrink: 0,
                      '&:hover': { bgcolor: '#FEF2F2' },
                      ...adminButtonStartIconSx,
                    }}
                  >
                    {t('admin.properties.delete_review')}
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
