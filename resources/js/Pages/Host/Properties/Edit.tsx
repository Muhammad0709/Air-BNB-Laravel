import React, { useState } from 'react'
import { Box, Button, Card, CardContent, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import Toast from '../../../Components/Admin/Toast'
import { router, usePage } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import { AIRPORT_OPTIONS, TOUR_DURATION_OPTIONS } from '../../../constants/hostPropertyOptions'

function toTimeInputValue(v: string | null | undefined): string {
  if (!v) return ''
  const s = String(v)
  return s.length >= 5 ? s.slice(0, 5) : s
}

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
  description: string
  image?: string
  images?: string[]
  airport_pickup_enabled?: boolean
  airport?: string | null
  pickup_start_time?: string | null
  pickup_end_time?: string | null
  airport_pickup_price?: number | string | null
  guided_tours_enabled?: boolean
  guided_tours_description?: string | null
  guided_tours_duration?: string | null
  guided_tours_price?: number | string | null
}

export default function EditProperty() {
  const { property, propertyTypes } = usePage<{ property: Property, propertyTypes: string[] }>().props
  const [toastOpen, setToastOpen] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    title: property.title,
    location: property.location,
    price: property.price.toString(),
    bedrooms: property.bedrooms.toString(),
    bathrooms: property.bathrooms.toString(),
    guests: property.guests.toString(),
    property_type: property.property_type,
    status: property.status,
    description: property.description,
    airport_pickup_enabled: Boolean(property.airport_pickup_enabled),
    airport: property.airport ?? '',
    pickup_start_time: toTimeInputValue(property.pickup_start_time),
    pickup_end_time: toTimeInputValue(property.pickup_end_time),
    airport_pickup_price: property.airport_pickup_price != null ? String(property.airport_pickup_price) : '',
    guided_tours_enabled: Boolean(property.guided_tours_enabled),
    guided_tours_description: property.guided_tours_description ?? '',
    guided_tours_duration: property.guided_tours_duration ?? '',
    guided_tours_price: property.guided_tours_price != null ? String(property.guided_tours_price) : '',
  })
  const isPresetDuration = TOUR_DURATION_OPTIONS.some((o) => o.value === (property.guided_tours_duration ?? ''))
  const [guidedToursDurationCustom, setGuidedToursDurationCustom] = useState(
    !isPresetDuration && property.guided_tours_duration ? String(property.guided_tours_duration) : ''
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length) setNewFiles(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removeNew = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
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
    submitData.append('status', formData.status)
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
    submitData.append('_method', 'PUT')
    newFiles.forEach((file) => submitData.append('images[]', file))

    router.post(`/host/properties/${property.id}`, submitData, {
      forceFormData: true,
      onSuccess: () => {
        setToastOpen(true)
      }
    })
  }

  const handleToastClose = () => {
    setToastOpen(false)
  }

  return (
    <HostLayout title="Edit Property">
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
            Edit Property Information
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
                          value={isPresetDuration ? formData.guided_tours_duration : 'Custom Duration'}
                          onChange={(e) => {
                            const v = e.target.value
                            setFormData(prev => ({ ...prev, guided_tours_duration: v }))
                            if (v !== 'Custom Duration') setGuidedToursDurationCustom('')
                          }}
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
                      {(formData.guided_tours_duration === 'Custom Duration' || (!isPresetDuration && formData.guided_tours_duration)) && (
                        <TextField label="Custom duration (e.g. 2.5 hours)" name="guided_tours_duration_custom" value={guidedToursDurationCustom} onChange={(e) => setGuidedToursDurationCustom(e.target.value)} fullWidth size="medium" placeholder="Enter custom duration" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                      )}
                      <TextField label="Guided Tour Price *" name="guided_tours_price" type="number" value={formData.guided_tours_price} onChange={handleChange} fullWidth size="medium" inputProps={{ min: 0, step: 0.01 }} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#6B7280' }}>$</Typography> }} placeholder="Enter price for guided tour service" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Property Images */}
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
                  onClick={() => document.getElementById('image-upload-edit')?.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#9CA3AF', mb: 1 }} />
                  <Typography sx={{ color: '#374151' }}>Add more images (PNG, JPG, GIF up to 2MB)</Typography>
                </Box>
                <input
                  id="image-upload-edit"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddImages}
                  style={{ display: 'none' }}
                />
                {property.images && property.images.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>Current images</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={2}>
                      {property.images.map((url, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={url}
                          alt={`Image ${index + 1}`}
                          sx={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 2, border: '1px solid #E5E7EB' }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  {newFiles.map((file, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        sx={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 2, border: '1px solid #E5E7EB' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeNew(index)}
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
                <Typography variant="caption" sx={{ color: '#6B7280', mt: 1, display: 'block' }}>
                  Add more images below. First image is the main thumbnail.
                </Typography>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
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
                    Update Property
                  </Button>
                </Stack>
              </Col>
            </Row>
          </form>
        </CardContent>
      </Card>
      <Toast
        open={toastOpen}
        onClose={handleToastClose}
        message="Property updated successfully!"
        severity="success"
      />
    </HostLayout>
  )
}

