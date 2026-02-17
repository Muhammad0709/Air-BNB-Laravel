import React, { useState } from 'react'
import { Box, Button, Card, CardContent, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import { router, usePage } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import { AIRPORT_OPTIONS, TOUR_DURATION_OPTIONS } from '../../../constants/hostPropertyOptions'

export default function AddProperty() {
  const { propertyTypes, errors: pageErrors = {} } = usePage<{ propertyTypes: string[]; errors?: Record<string, string | string[]> }>().props
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    guests: '',
    property_type: '',
    description: '',
    images: [] as File[],
    airport_pickup_enabled: false,
    airport: '',
    pickup_start_time: '',
    pickup_end_time: '',
    airport_pickup_price: '',
    guided_tours_enabled: false,
    guided_tours_description: '',
    guided_tours_duration: '',
    guided_tours_price: '',
  })
  const [guidedToursDurationCustom, setGuidedToursDurationCustom] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    e.target.value = ''
    if (files.length) setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const imageError = pageErrors && typeof pageErrors === 'object'
    ? (Object.entries(pageErrors).find(([k]) => k.startsWith('images.'))?.[1] ?? null)
    : null
  const imageErrorText = Array.isArray(imageError) ? imageError[0] : imageError

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = new FormData()
    submitData.append('title', formData.title)
    submitData.append('location', formData.location)
    submitData.append('price', formData.price)
    submitData.append('bedrooms', formData.bedrooms)
    submitData.append('bathrooms', formData.bathrooms)
    submitData.append('guests', formData.guests)
    submitData.append('property_type', formData.property_type)
    submitData.append('description', formData.description)
    submitData.append('airport_pickup_enabled', formData.airport_pickup_enabled ? '1' : '0')
    if (formData.airport_pickup_enabled) {
      submitData.append('airport', formData.airport)
      submitData.append('pickup_start_time', formData.pickup_start_time)
      submitData.append('pickup_end_time', formData.pickup_end_time)
      submitData.append('airport_pickup_price', formData.airport_pickup_price)
    }
    submitData.append('guided_tours_enabled', formData.guided_tours_enabled ? '1' : '0')
    if (formData.guided_tours_enabled) {
      submitData.append('guided_tours_description', formData.guided_tours_description)
      const durationValue = formData.guided_tours_duration === 'Custom Duration' ? guidedToursDurationCustom : formData.guided_tours_duration
      submitData.append('guided_tours_duration', durationValue)
      submitData.append('guided_tours_price', formData.guided_tours_price)
    }
    formData.images.forEach((file) => {
      submitData.append('images[]', file)
    })

    router.post('/host/properties', submitData, {
      forceFormData: true,
    })
  }

  return (
    <HostLayout title="Add Property">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.visit('/host/properties')}
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
                <Stack spacing={3} sx={{ mb: { xs: 3, md: 0 } }}>
                  <TextField
                    label="Property Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    fullWidth
                    placeholder="e.g., Malibu, California"
                  />
                  <TextField
                    label="Price per Night"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: <Typography sx={{ marginInlineEnd: 1, color: '#6B7280' }}>$</Typography>
                    }}
                  />
                </Stack>
              </Col>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Property Type</InputLabel>
                    <Select
                      value={formData.property_type}
                      onChange={(e) => handleSelectChange('property_type', e.target.value)}
                      label="Property Type"
                    >
                      {propertyTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Bedrooms"
                    name="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Bathrooms"
                    name="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Guests"
                    name="guests"
                    type="number"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </Stack>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Describe the property in detail..."
                />
              </Col>
            </Row>

            {/* Service sections: separate cards, light grey background */}
            <Box sx={{ mt: 4, bgcolor: '#F9FAFB', borderRadius: '12px', p: 3 }}>
              {/* Airport Pickup Service – white card */}
              <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', mb: 3, overflow: 'visible' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>Airport Pickup Service</Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.airport_pickup_enabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, airport_pickup_enabled: e.target.checked }))}
                        sx={{ color: '#AD542D', '&.Mui-checked': { color: '#AD542D', bgcolor: '#FFF5F2' } }}
                      />
                    }
                    label={<Typography sx={{ color: '#374151', fontWeight: 500 }}>Enable Airport Pickup Service</Typography>}
                  />
                  {formData.airport_pickup_enabled && (
                    <Stack spacing={2.5} sx={{ mt: 3, width: '100%' }}>
                      <FormControl fullWidth size="medium" required>
                        <InputLabel sx={{ color: '#374151' }} shrink>Select Airport *</InputLabel>
                        <Select
                          value={formData.airport}
                          onChange={(e) => setFormData(prev => ({ ...prev, airport: e.target.value }))}
                          label="Select Airport *"
                          displayEmpty
                          renderValue={(v) => v || 'Select Airport'}
                          sx={{
                            bgcolor: '#FFFFFF',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#AD542D', borderWidth: 1 },
                            '& .MuiSelect-select': { py: 1.5 },
                          }}
                          variant="outlined"
                        >
                          <MenuItem value="">Select Airport</MenuItem>
                          {AIRPORT_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Stack direction="row" spacing={2}>
                        <TextField label="Pickup Start Time *" name="pickup_start_time" value={formData.pickup_start_time} onChange={handleChange} type="time" fullWidth size="medium" InputLabelProps={{ shrink: true }} placeholder="--:--" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                        <TextField label="Pickup End Time *" name="pickup_end_time" value={formData.pickup_end_time} onChange={handleChange} type="time" fullWidth size="medium" InputLabelProps={{ shrink: true }} placeholder="--:--" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                      </Stack>
                      <TextField label="Airport Pickup Price *" name="airport_pickup_price" type="number" value={formData.airport_pickup_price} onChange={handleChange} fullWidth size="medium" inputProps={{ min: 0, step: 0.01 }} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#6B7280' }}>$</Typography> }} placeholder="Enter price for airport pickup service" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* Guided Tours Service – white card */}
              <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'visible' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>Guided Tours Service</Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.guided_tours_enabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, guided_tours_enabled: e.target.checked }))}
                        sx={{ color: '#AD542D', '&.Mui-checked': { color: '#AD542D', bgcolor: '#FFF5F2' } }}
                      />
                    }
                    label={<Typography sx={{ color: '#374151', fontWeight: 500 }}>Enable Guided Tours Service</Typography>}
                  />
                  {formData.guided_tours_enabled && (
                    <Stack spacing={2.5} sx={{ mt: 3, width: '100%' }}>
                      <TextField label="Tour Description *" name="guided_tours_description" value={formData.guided_tours_description} onChange={handleChange} fullWidth multiline rows={3} size="medium" placeholder="Describe the tour experience..." variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                      <FormControl fullWidth size="medium" required>
                        <InputLabel sx={{ color: '#374151' }} shrink>Tour Duration *</InputLabel>
                        <Select
                          value={formData.guided_tours_duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, guided_tours_duration: e.target.value }))}
                          label="Tour Duration *"
                          displayEmpty
                          renderValue={(v) => v || 'Select duration'}
                          sx={{
                            bgcolor: '#FFFFFF',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#AD542D', borderWidth: 1 },
                            '& .MuiSelect-select': { py: 1.5 },
                          }}
                          variant="outlined"
                        >
                          <MenuItem value="">Select duration</MenuItem>
                          {TOUR_DURATION_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {formData.guided_tours_duration === 'Custom Duration' && (
                        <TextField label="Custom duration (e.g. 2.5 hours)" name="guided_tours_duration_custom" value={guidedToursDurationCustom} onChange={(e) => setGuidedToursDurationCustom(e.target.value)} fullWidth size="medium" placeholder="Enter custom duration" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                      )}
                      <TextField label="Guided Tour Price *" name="guided_tours_price" type="number" value={formData.guided_tours_price} onChange={handleChange} fullWidth size="medium" inputProps={{ min: 0, step: 0.01 }} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#6B7280' }}>$</Typography> }} placeholder="Enter price for guided tour service" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Multiple images */}
            <Row className="mt-4">
              <Col xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
                  Property Images
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed #D1D5DB',
                    borderRadius: '12px',
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    mb: 2,
                    '&:hover': { borderColor: '#AD542D', bgcolor: '#FFF7F5' }
                  }}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#9CA3AF', mb: 1 }} />
                  <Typography sx={{ color: '#374151' }}>Add images (PNG, JPG, GIF up to 2MB)</Typography>
                </Box>
                {imageErrorText && (
                  <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    {imageErrorText}
                  </Typography>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  {formData.images.map((file, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        sx={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 2, border: '1px solid #E5E7EB' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap justifyContent="flex-end" sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.visit('/host/properties')}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#D1D5DB',
                      color: '#6B7280',
                      '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
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
              </Col>
            </Row>
          </form>
        </CardContent>
      </Card>
    </HostLayout>
  )
}

