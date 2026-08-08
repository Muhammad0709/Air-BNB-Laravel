import React, { useState } from 'react'
import { Autocomplete, Box, Button, Card, CardContent, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import InputError from '../../../components/InputError'
import { router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'
import RtlBackArrowIcon from '../../../components/RtlBackArrowIcon'
import { adminButtonStartIconSx } from '../../../utils/adminButtonStartIconSx'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import { AIRPORT_OPTIONS, TOUR_DURATION_OPTIONS } from '../../../constants/hostPropertyOptions'

export default function AddProperty() {
  const { t } = useLanguage()
  const page = usePage<{
    propertyTypes: string[]
    listingCategories: string[]
    timezones: string[]
    cancellationPolicies: string[]
    errors?: Record<string, string[] | string>
    validationErrors?: Record<string, string[]>
  }>()
  const { propertyTypes, listingCategories, timezones, cancellationPolicies } = page.props
  const pageErrors = page.props.validationErrors ?? page.props.errors ?? {}
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    cancellation_policy: 'moderate',
    price: '',
    deposit_amount: '',
    listing_category: 'stay',
    bedrooms: '',
    bathrooms: '',
    duration_hours: '',
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

  const err = (field: string): string | null =>
    (Array.isArray((pageErrors as Record<string, unknown>)[field])
      ? (pageErrors as Record<string, string[]>)[field][0]
      : (pageErrors as Record<string, string>)[field]) ?? null

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

  const imageErrorText = (() => {
    const key = Object.keys(pageErrors || {}).find((k) => k.startsWith('images.'))
    const r = key ? (pageErrors as Record<string, unknown>)[key] : null
    return r ? (Array.isArray(r) ? r[0] : String(r)) : null
  })()

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = new FormData()
    submitData.append('title', formData.title)
    submitData.append('location', formData.location)
    submitData.append('timezone', formData.timezone)
    submitData.append('cancellation_policy', formData.cancellation_policy)
    submitData.append('price', formData.price)
    submitData.append('deposit_amount', formData.deposit_amount || '0')
    submitData.append('listing_category', formData.listing_category)
    if (formData.listing_category === 'experience') {
      submitData.append('duration_hours', formData.duration_hours)
    } else {
      submitData.append('bedrooms', formData.bedrooms)
      submitData.append('bathrooms', formData.bathrooms)
    }
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
      preserveState: false, // ensure we get fresh props (including errors) after validation redirect
    })
  }

  return (
    <HostLayout title={t('host.properties.add_property')}>
      <Button
        startIcon={<RtlBackArrowIcon />}
        onClick={() => router.visit('/host/properties')}
        sx={{
          mb: 3,
          color: '#6B7280',
          textTransform: 'none',
          '&:hover': { bgcolor: '#F9FAFB', color: '#111827' },
          ...adminButtonStartIconSx,
        }}
      >
        {t('host.properties.back_to_properties')}
      </Button>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 4 }}>
            {t('host.properties.property_information')}
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <Row>
              <Col xs={12} md={6}>
                <Stack spacing={3} sx={{ mb: { xs: 3, md: 0 } }}>
                  <TextField
                    label={t('host.properties.property_title')}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!err('title')}
                    sx={{ mb: 2 }}
                  />
                  <InputError message={err('title')} />
                  <TextField
                    label={t('host.properties.location')}
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    fullWidth
                    placeholder={t('host.properties.location_placeholder')}
                    error={!!err('location')}
                  />
                  <InputError message={err('location')} />
                  <Autocomplete
                    options={timezones}
                    value={formData.timezone}
                    onChange={(_, value) => handleSelectChange('timezone', value || 'UTC')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('host.properties.timezone')}
                        error={!!err('timezone')}
                      />
                    )}
                  />
                  <InputError message={err('timezone')} />
                  <FormControl fullWidth error={!!err('cancellation_policy')}>
                    <InputLabel>{t('host.properties.cancellation_policy')}</InputLabel>
                    <Select
                      value={formData.cancellation_policy}
                      label={t('host.properties.cancellation_policy')}
                      onChange={(e) => handleSelectChange('cancellation_policy', e.target.value)}
                    >
                      {cancellationPolicies.map((policy) => (
                        <MenuItem key={policy} value={policy}>
                          {t(`host.properties.cancellation_policy_${policy}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <InputError message={err('cancellation_policy')} />
                  <TextField
                    label={t('host.properties.price_per_night')}
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!err('price')}
                    helperText={t('host.properties.price_per_night_hint')}
                    InputProps={{
                      startAdornment: <Typography sx={{ marginInlineEnd: 1, color: '#6B7280' }}>$</Typography>
                    }}
                  />
                  <InputError message={err('price')} />
                  <TextField
                    label={t('host.properties.deposit_amount')}
                    name="deposit_amount"
                    type="number"
                    value={formData.deposit_amount}
                    onChange={handleChange}
                    fullWidth
                    error={!!err('deposit_amount')}
                    helperText={t('host.properties.deposit_amount_hint')}
                    InputProps={{
                      startAdornment: <Typography sx={{ marginInlineEnd: 1, color: '#6B7280' }}>$</Typography>
                    }}
                  />
                  <InputError message={err('deposit_amount')} />
                </Stack>
              </Col>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <FormControl fullWidth required error={!!err('listing_category')}>
                    <InputLabel id="listing-category-label">{t('host.properties.listing_category')}</InputLabel>
                    <Select
                      labelId="listing-category-label"
                      value={formData.listing_category}
                      onChange={(e) => handleSelectChange('listing_category', e.target.value)}
                      label={t('host.properties.listing_category')}
                    >
                      {listingCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {t(`host.properties.listing_category_${category}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <InputError message={err('listing_category')} />
                  <FormControl fullWidth required error={!!err('property_type')}>
                    <InputLabel id="property-type-label">{t('host.properties.property_type')}</InputLabel>
                    <Select
                      labelId="property-type-label"
                      value={formData.property_type}
                      onChange={(e) => handleSelectChange('property_type', e.target.value)}
                      label={t('host.properties.property_type')}
                    >
                      {propertyTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <InputError message={err('property_type')} />
                  {formData.listing_category === 'experience' ? (
                    <>
                      <TextField
                        label={t('host.properties.duration_hours')}
                        name="duration_hours"
                        type="number"
                        value={formData.duration_hours}
                        onChange={handleChange}
                        required
                        fullWidth
                        error={!!err('duration_hours')}
                        helperText={t('host.properties.duration_hours_hint')}
                      />
                      <InputError message={err('duration_hours')} />
                    </>
                  ) : (
                    <>
                      <TextField
                        label={t('host.properties.bedrooms')}
                        name="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        required
                        fullWidth
                        error={!!err('bedrooms')}
                      />
                      <InputError message={err('bedrooms')} />
                      <TextField
                        label={t('host.properties.bathrooms')}
                        name="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        required
                        fullWidth
                        error={!!err('bathrooms')}
                      />
                      <InputError message={err('bathrooms')} />
                    </>
                  )}
                  <TextField
                    label={formData.listing_category === 'experience' ? t('host.properties.max_participants') : t('host.properties.guests')}
                    name="guests"
                    type="number"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!err('guests')}
                  />
                  <InputError message={err('guests')} />
                </Stack>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col xs={12}>
                <TextField
                  label={t('host.properties.description')}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  fullWidth
                  multiline
                  rows={6}
                  placeholder={t('host.properties.description_placeholder')}
                  error={!!err('description')}
                />
                <InputError message={err('description')} />
              </Col>
            </Row>

            {/* Service sections: separate cards, light grey background */}
            <Box sx={{ mt: 4, bgcolor: '#F9FAFB', borderRadius: '12px', p: 3 }}>
              {/* Airport Pickup Service – white card */}
              <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', mb: 3, overflow: 'visible' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>{t('host.properties.airport_pickup_service')}</Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.airport_pickup_enabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, airport_pickup_enabled: e.target.checked }))}
                        sx={{ color: '#AD542D', '&.Mui-checked': { color: '#AD542D', bgcolor: '#FFF5F2' } }}
                      />
                    }
                    label={<Typography sx={{ color: '#374151', fontWeight: 500 }}>{t('host.properties.enable_airport_pickup')}</Typography>}
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
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>{t('host.properties.guided_tours_service')}</Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.guided_tours_enabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, guided_tours_enabled: e.target.checked }))}
                        sx={{ color: '#AD542D', '&.Mui-checked': { color: '#AD542D', bgcolor: '#FFF5F2' } }}
                      />
                    }
                    label={<Typography sx={{ color: '#374151', fontWeight: 500 }}>{t('host.properties.enable_guided_tours')}</Typography>}
                  />
                  {formData.guided_tours_enabled && (
                    <Stack spacing={2.5} sx={{ mt: 3, width: '100%' }}>
                      <TextField label={`${t('host.properties.tour_description')} *`} name="guided_tours_description" value={formData.guided_tours_description} onChange={handleChange} fullWidth multiline rows={3} size="medium" placeholder={t('host.properties.tour_description_placeholder')} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
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
                  {t('host.properties.property_images')}
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
                  <Typography sx={{ color: '#374151' }}>{t('host.properties.add_images_hint')}</Typography>
                </Box>
                <InputError message={imageErrorText} />
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
                    {t('host.properties.cancel')}
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
                    {t('host.properties.add_property')}
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

