import { useState } from 'react'
import { Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import Toast from '../../../Components/Admin/Toast'
import { router, useForm } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'

export default function AddProperty() {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    guests: '',
    property_type: '',
    status: 'Pending',
    description: '',
    image: null as File | null
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMainImage = () => {
    setData('image', null)
    setImagePreview(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/properties', {
      forceFormData: true,
      onSuccess: () => {
        router.visit('/admin/properties')
      }
    })
  }

  return (
    <AdminLayout title="Add Property">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.visit('/admin/properties')}
        sx={{
          mb: 3,
          color: '#6B7280',
          textTransform: 'none',
          '&:hover': { bgcolor: '#F9FAFB', color: '#111827' }
        }}
      >
        Back to Properties
      </Button>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 4 }}>
            Property Information
          </Typography>

          <form onSubmit={handleSubmit}>
            <Row>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <TextField
                    label="Property Title"
                    name="title"
                    value={data.title}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Location"
                    name="location"
                    value={data.location}
                    onChange={handleChange}
                    required
                    fullWidth
                    placeholder="e.g., Malibu, California"
                    error={!!errors.location}
                    helperText={errors.location}
                  />
                  <TextField
                    label="Price per Night"
                    name="price"
                    type="number"
                    value={data.price}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: '#6B7280' }}>$</Typography>
                    }}
                  />
                </Stack>
              </Col>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <FormControl fullWidth required error={!!errors.property_type}>
                    <InputLabel>Property Type</InputLabel>
                    <Select
                      value={data.property_type}
                      onChange={(e) => handleSelectChange('property_type', e.target.value)}
                      label="Property Type"
                    >
                      <MenuItem value="apartment">Apartment</MenuItem>
                      <MenuItem value="house">House</MenuItem>
                      <MenuItem value="villa">Villa</MenuItem>
                      <MenuItem value="studio">Studio</MenuItem>
                      <MenuItem value="condo">Condo</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Bedrooms"
                    name="bedrooms"
                    type="number"
                    value={data.bedrooms}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.bedrooms}
                    helperText={errors.bedrooms}
                  />
                  <TextField
                    label="Bathrooms"
                    name="bathrooms"
                    type="number"
                    value={data.bathrooms}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.bathrooms}
                    helperText={errors.bathrooms}
                  />
                  <TextField
                    label="Guests"
                    name="guests"
                    type="number"
                    value={data.guests}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.guests}
                    helperText={errors.guests}
                  />
                </Stack>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Describe the property in detail..."
                  error={!!errors.description}
                  helperText={errors.description}
                />
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={data.status}
                    onChange={(e) => handleSelectChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Col>
            </Row>

            {/* Main Image Upload */}
            <Row className="mt-4">
              <Col xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
                  Property Image
                </Typography>
                {imagePreview ? (
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        height: 300,
                        objectFit: 'cover',
                              borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
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
                          '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
                        }}
                      >
                        Change Image
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
                          '&:hover': { borderColor: '#DC2626', bgcolor: '#FEF2F2' }
                        }}
                      >
                        Remove
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
                      Click to upload image
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#6B7280' }}>
                      PNG, JPG, GIF up to 2MB
                    </Typography>
                  </Box>
                )}
                {errors.image && (
                  <Typography sx={{ color: '#EF4444', fontSize: 12, mt: 1 }}>
                    {errors.image}
                  </Typography>
                )}
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" sx={{ width: '100%' }}>
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
                    Cancel
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
                    {processing ? 'Creating...' : 'Add Property'}
                  </Button>
                </Stack>
              </Col>
            </Row>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}



