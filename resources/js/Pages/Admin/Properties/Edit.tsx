import { useState } from 'react'
import { Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import Toast from '../../../Components/Admin/Toast'
import { router, useForm, usePage } from '@inertiajs/react'
import InputError from '../../../components/InputError'
import RtlBackArrowIcon from '../../../components/RtlBackArrowIcon'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import { adminButtonStartIconSx } from '../../../utils/adminButtonStartIconSx'
import { useLanguage } from '../../../hooks/use-language'

export default function EditProperty() {
  const { t } = useLanguage()
  const { property } = usePage().props as any
  const { data, setData, processing, errors } = useForm({
    title: property?.title || '',
    location: property?.location || '',
    price: property?.price?.toString() || '',
    bedrooms: property?.bedrooms?.toString() || '',
    bathrooms: property?.bathrooms?.toString() || '',
    guests: property?.guests?.toString() || '',
    property_type: property?.property_type || '',
    status: property?.status || 'Active',
    description: property?.description || '',
    image: null as File | null
  })

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(property?.image || null)
  const [toastOpen, setToastOpen] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData(name as any, value)
  }

  const handleSelectChange = (name: string, value: string) => {
    setData(name as any, value)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData('image', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMainImage = () => {
    setData('image', null)
    setMainImagePreview(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use post with _method for file uploads
    router.post(`/admin/properties/${property.id}`, {
      ...data,
      _method: 'PUT'
    }, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setToastOpen(true)
        setTimeout(() => {
          router.visit('/admin/properties')
        }, 1500)
      }
    })
  }

  return (
    <AdminLayout title={t('admin.properties.edit_property')}>
      <Button
        startIcon={<RtlBackArrowIcon />}
        onClick={() => router.visit('/admin/properties')}
        sx={{
          mb: 3,
          color: '#6B7280',
          textTransform: 'none',
          '&:hover': { bgcolor: '#F9FAFB', color: '#111827' },
          ...adminButtonStartIconSx,
        }}
      >
        {t('admin.properties.back_to_properties')}
      </Button>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 4 }}>
            {t('admin.properties.edit_property_information')}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Row>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <TextField
                    label={t('admin.properties.property_title')}
                    name="title"
                    value={data.title}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.title}
                    sx={{ mb: 2 }}
                  />
                  <InputError message={Array.isArray(errors.title) ? errors.title[0] : errors.title} />
                  <TextField
                    label={t('admin.properties.location')}
                    name="location"
                    value={data.location}
                    onChange={handleChange}
                    required
                    fullWidth
                    placeholder={t('admin.properties.location_placeholder')}
                    error={!!errors.location}
                  />
                  <InputError message={Array.isArray(errors.location) ? errors.location[0] : errors.location} />
                  <TextField
                    label={t('admin.properties.price_per_night')}
                    name="price"
                    type="number"
                    value={data.price}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.price}
                    InputProps={{
                      startAdornment: <Typography sx={{ marginInlineEnd: 1, color: '#6B7280' }}>$</Typography>
                    }}
                  />
                  <InputError message={Array.isArray(errors.price) ? errors.price[0] : errors.price} />
                </Stack>
              </Col>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <FormControl fullWidth required error={!!errors.property_type}>
                    <InputLabel>{t('admin.properties.property_type')}</InputLabel>
                    <Select
                      value={data.property_type}
                      onChange={(e) => handleSelectChange('property_type', e.target.value)}
                      label={t('admin.properties.property_type')}
                    >
                      <MenuItem value="apartment">{t('admin.properties.apartment')}</MenuItem>
                      <MenuItem value="house">{t('admin.properties.house')}</MenuItem>
                      <MenuItem value="villa">{t('admin.properties.villa')}</MenuItem>
                      <MenuItem value="studio">{t('admin.properties.studio')}</MenuItem>
                      <MenuItem value="condo">{t('admin.properties.condo')}</MenuItem>
                    </Select>
                  </FormControl>
                  <InputError message={Array.isArray(errors.property_type) ? errors.property_type[0] : errors.property_type} />
                  <TextField
                    label={t('admin.properties.bedrooms')}
                    name="bedrooms"
                    type="number"
                    value={data.bedrooms}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.bedrooms}
                  />
                  <InputError message={Array.isArray(errors.bedrooms) ? errors.bedrooms[0] : errors.bedrooms} />
                  <TextField
                    label={t('admin.properties.bathrooms')}
                    name="bathrooms"
                    type="number"
                    value={data.bathrooms}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.bathrooms}
                  />
                  <InputError message={Array.isArray(errors.bathrooms) ? errors.bathrooms[0] : errors.bathrooms} />
                  <TextField
                    label={t('admin.properties.guests')}
                    name="guests"
                    type="number"
                    value={data.guests}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.guests}
                  />
                  <InputError message={Array.isArray(errors.guests) ? errors.guests[0] : errors.guests} />
                </Stack>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col xs={12}>
                <TextField
                  label={t('admin.properties.description')}
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={6}
                  placeholder={t('admin.properties.description_placeholder')}
                  error={!!errors.description}
                />
                <InputError message={Array.isArray(errors.description) ? errors.description[0] : errors.description} />
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('admin.properties.status')}</InputLabel>
                  <Select
                    value={data.status}
                    onChange={(e) => handleSelectChange('status', e.target.value)}
                    label={t('admin.properties.status')}
                  >
                    <MenuItem value="Pending">{t('admin.properties.pending')}</MenuItem>
                    <MenuItem value="Active">{t('admin.properties.active')}</MenuItem>
                    <MenuItem value="Inactive">{t('admin.properties.inactive')}</MenuItem>
                  </Select>
                </FormControl>
              </Col>
            </Row>

            {/* Main Image Upload */}
            <Row className="mt-4">
              <Col xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
                  {t('admin.properties.property_image')}
                </Typography>
                {mainImagePreview ? (
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
                    <Box
                      component="img"
                      src={mainImagePreview}
                      alt=""
                      sx={{
                        width: '100%',
                        height: 300,
                        objectFit: 'cover',
                              borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Stack direction="row" spacing={2} useFlexGap sx={{ mt: 2 }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={(e) => e.preventDefault()}
                        sx={{
                          textTransform: 'none',
                              borderRadius: '12px',
                          borderColor: '#D1D5DD',
                          color: '#6B7280',
                          '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' },
                          ...adminButtonStartIconSx,
                        }}
                      >
                        {t('admin.properties.change_image')}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={removeMainImage}
                        sx={{
                          textTransform: 'none',
                              borderRadius: '12px',
                          borderColor: '#EF4444',
                          color: '#EF4444',
                          '&:hover': { borderColor: '#DC2626', bgcolor: '#FEF2F2' },
                          ...adminButtonStartIconSx,
                        }}
                      >
                        {t('admin.properties.remove')}
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    component="label"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: 300,
                      border: '2px dashed #D1D5DD',
                              borderRadius: '12px',
                      bgcolor: '#F9FAFB',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#AD542D',
                        bgcolor: '#FFF5F3'
                      }
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#9CA3AF', mb: 2 }} />
                    <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
                      {t('admin.properties.click_to_upload')}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#6B7280' }}>
                      {t('admin.properties.image_formats')}
                    </Typography>
                  </Box>
                )}
                <InputError message={Array.isArray(errors.image) ? errors.image[0] : errors.image} />
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap justifyContent="flex-end" sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.visit('/admin/properties')}
                    sx={{
                      textTransform: 'none',
                              borderRadius: '12px',
                      borderColor: '#D1D5DD',
                      color: '#6B7280',
                      '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
                    }}
                  >
                    {t('admin.common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={processing}
                    sx={{
                      bgcolor: '#AD542D',
                      textTransform: 'none',
                              borderRadius: '12px',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#78381C' }
                    }}
                  >
                    {processing ? t('admin.properties.updating') : t('admin.properties.update_property')}
                  </Button>
                </Stack>
              </Col>
            </Row>
          </form>
        </CardContent>
      </Card>
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={t('admin.properties.flash_updated')}
        severity="success"
      />
    </AdminLayout>
  )
}



