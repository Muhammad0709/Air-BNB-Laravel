import React, { useState } from 'react'
import { Autocomplete, Box, Button, Card, CardContent, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import Toast from '../../../Components/Admin/Toast';
import InputError from '../../../components/InputError'
import { router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'
import RtlBackArrowIcon from '../../../components/RtlBackArrowIcon'
import { adminButtonStartIconSx } from '../../../utils/adminButtonStartIconSx'
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
  timezone?: string
  cancellation_policy?: string
  price: number
  deposit_amount?: number
  listing_category?: string
  duration_hours?: number | null
  bedrooms: number | null
  bathrooms: number | null
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
  // Experience-specific
  min_participants?: number | null
  guide_language?: string | null
  group_size?: string | null
  meeting_point?: string | null
  included_services?: string[] | null
  safety_info?: string | null
}

export default function EditProperty() {
  const { t } = useLanguage()
  const page = usePage<{
    property: Property
    propertyTypes: string[]
    timezones: string[]
    cancellationPolicies: string[]
    errors?: Record<string, string[] | string>
    validationErrors?: Record<string, string[]>
  }>()
  const { property, propertyTypes, timezones, cancellationPolicies } = page.props
  const pageErrors = page.props.validationErrors ?? page.props.errors ?? {}
  const isExperience = property.listing_category === 'experience'
  const [toastOpen, setToastOpen] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [submitErrors, setSubmitErrors] = useState<Record<string, string[] | string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    title: property.title,
    location: property.location,
    timezone: property.timezone || 'UTC',
    cancellation_policy: property.cancellation_policy || 'moderate',
    price: property.price.toString(),
    deposit_amount: property.deposit_amount != null ? String(property.deposit_amount) : '',
    bedrooms: property.bedrooms != null ? property.bedrooms.toString() : '',
    bathrooms: property.bathrooms != null ? property.bathrooms.toString() : '',
    duration_hours: property.duration_hours != null ? property.duration_hours.toString() : '',
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
    // Experience-specific fields
    min_participants: property.min_participants != null ? String(property.min_participants) : '',
    guide_language: property.guide_language ?? '',
    group_size: property.group_size ?? '',
    meeting_point: property.meeting_point ?? '',
    included_services: Array.isArray(property.included_services) ? property.included_services : [],
    safety_info: property.safety_info ?? '',
  })
  const isPresetDuration = TOUR_DURATION_OPTIONS.some((o) => o.value === (property.guided_tours_duration ?? ''))
  const [guidedToursDurationCustom, setGuidedToursDurationCustom] = useState(
    !isPresetDuration && property.guided_tours_duration ? String(property.guided_tours_duration) : ''
  )

  const activeErrors = hasSubmitted ? submitErrors : pageErrors

  const clearFieldError = (field: string) => {
    setSubmitErrors((current) => {
      if (!Object.prototype.hasOwnProperty.call(current, field)) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    clearFieldError(name)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    clearFieldError(name)
  }

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    e.target.value = ''
    if (!files.length) return

    const maxImageBytes = 2 * 1024 * 1024
    const oversizedImage = files.find((file) => file.size > maxImageBytes)
    if (oversizedImage) {
      setHasSubmitted(true)
      setSubmitErrors({ images: `${oversizedImage.name} is larger than 2MB.` })
      return
    }

    clearFieldError('images')
    setNewFiles(prev => [...prev, ...files])
  }

  const imageErrorText = (() => {
    const key = Object.keys(activeErrors).find((item) => item === 'images' || item.startsWith('images.'))
    const value = key ? activeErrors[key] : null
    return value ? (Array.isArray(value) ? value[0] : String(value)) : null
  })()

  const removeNew = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
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
    if (isExperience) {
      submitData.append('duration_hours', formData.duration_hours)
    } else {
      submitData.append('bedrooms', formData.bedrooms)
      submitData.append('bathrooms', formData.bathrooms)
    }
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
    // Experience-specific fields
    if (isExperience) {
      if (formData.min_participants) submitData.append('min_participants', formData.min_participants)
      if (formData.guide_language)   submitData.append('guide_language', formData.guide_language)
      if (formData.group_size)       submitData.append('group_size', formData.group_size)
      if (formData.meeting_point)    submitData.append('meeting_point', formData.meeting_point)
      if (formData.safety_info)      submitData.append('safety_info', formData.safety_info)
      formData.included_services.forEach((item, i) => {
        submitData.append(`included_services[${i}]`, item)
      })
    }
    submitData.append('_method', 'PUT')
    newFiles.forEach((file) => submitData.append('images[]', file))

    router.post(`/host/properties/${property.id}`, submitData, {
      forceFormData: true,
      preserveScroll: true,
      preserveState: true,
      onStart: () => {
        setHasSubmitted(true)
        setSubmitting(true)
        setSubmitErrors({})
        setSubmitError(null)
      },
      onError: (errors) => {
        setSubmitErrors(errors)
        setSubmitError(Object.keys(errors).length === 0 ? 'Property could not be updated. Please try again.' : null)
      },
      onSuccess: () => {
        setSubmitErrors({})
        setSubmitError(null)
        setToastOpen(true)
      },
      onFinish: () => setSubmitting(false),
      onException: () => setSubmitError('Property could not be updated. Please try again.'),
    })
  }

  const handleToastClose = () => {
    setToastOpen(false)
  }

  return (
    <HostLayout title={t('host.properties.edit_property')}>
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
            {t('host.properties.edit_property_information')}
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            {submitError && (
              <Typography sx={{ mb: 3, color: '#D32F2F', fontSize: '0.875rem', fontWeight: 600 }}>
                {submitError}
              </Typography>
            )}
            {Object.keys(activeErrors).length > 0 && !submitError && (
              <Box sx={{ mb: 3, color: '#D32F2F', fontSize: '0.875rem', fontWeight: 600 }}>
                {Array.from(new Set(Object.values(activeErrors).flat())).map((message) => (
                  <Typography key={message} sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
                    {message}
                  </Typography>
                ))}
              </Box>
            )}
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
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label={t('host.properties.location')}
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    fullWidth
                    placeholder={t('host.properties.location_placeholder')}
                  />
                  <Autocomplete
                    options={timezones}
                    value={formData.timezone}
                    onChange={(_, value) => handleSelectChange('timezone', value || 'UTC')}
                    renderInput={(params) => (
                      <TextField {...params} label={t('host.properties.timezone')} />
                    )}
                  />
                  <FormControl fullWidth>
                    <InputLabel>{t('host.properties.cancellation_policy')}</InputLabel>
                    <Select
                      value={formData.cancellation_policy}
                      label={t('host.properties.cancellation_policy')}
                      onChange={(e) => handleSelectChange('cancellation_policy', e.target.value)}
                    >
                      {cancellationPolicies.map((policy) => (
                        <MenuItem key={policy} value={policy}>
                          {t(`host.properties.cancellation_policy_${policy}`).split(' — ')[0]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Col>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <FormControl fullWidth required>
                    <InputLabel>{t('host.properties.property_type')}</InputLabel>
                    <Select
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
                  {isExperience ? (
                    <TextField
                      label={t('host.properties.duration_hours')}
                      name="duration_hours"
                      type="number"
                      value={formData.duration_hours}
                      onChange={handleChange}
                      required
                      fullWidth
                      helperText={t('host.properties.duration_hours_hint')}
                    />
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
                      />
                      <TextField
                        label={t('host.properties.bathrooms')}
                        name="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        required
                        fullWidth
                      />
                    </>
                  )}
                  <TextField
                    label={isExperience ? t('host.properties.max_participants') : t('host.properties.guests')}
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

            <Row className="mt-4">
              <Col xs={12} md={6}>
                <TextField
                  label={t('host.properties.price_per_night')}
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  fullWidth
                  helperText={t('host.properties.price_per_night_hint')}
                  InputProps={{
                    startAdornment: <Typography sx={{ marginInlineEnd: 1, color: '#6B7280' }}>$</Typography>
                  }}
                />
              </Col>
              <Col xs={12} md={6} className="mt-4 mt-md-0">
                <TextField
                  label={t('host.properties.deposit_amount')}
                  name="deposit_amount"
                  type="number"
                  value={formData.deposit_amount}
                  onChange={handleChange}
                  fullWidth
                  helperText={t('host.properties.deposit_amount_hint')}
                  InputProps={{
                    startAdornment: <Typography sx={{ marginInlineEnd: 1, color: '#6B7280' }}>$</Typography>
                  }}
                />
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
                />
              </Col>
            </Row>

            {/* Experience-specific fields */}
            {isExperience && (
              <Box sx={{ mt: 4, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#166534', mb: 3 }}>
                  Experience Details
                </Typography>
                <Row>
                  <Col xs={12} md={6}>
                    <Stack spacing={3}>
                      <TextField
                        label="Minimum Participants"
                        name="min_participants"
                        type="number"
                        value={formData.min_participants}
                        onChange={handleChange}
                        fullWidth
                        helperText="Minimum number of people required"
                        inputProps={{ min: 1 }}
                      />
                      <TextField
                        label="Guide Language(s)"
                        name="guide_language"
                        value={formData.guide_language}
                        onChange={handleChange}
                        fullWidth
                        placeholder="e.g. English, Swahili, French"
                        helperText="Languages spoken by the guide"
                      />
                      <TextField
                        label="Group Size / Composition"
                        name="group_size"
                        value={formData.group_size}
                        onChange={handleChange}
                        fullWidth
                        placeholder="e.g. Suitable for families, max 10 people"
                        helperText="Describe ideal group composition"
                      />
                    </Stack>
                  </Col>
                  <Col xs={12} md={6}>
                    <Stack spacing={3}>
                      <TextField
                        label="Meeting Point"
                        name="meeting_point"
                        value={formData.meeting_point}
                        onChange={handleChange}
                        fullWidth
                        placeholder="e.g. Nairobi National Museum entrance"
                        helperText="Where guests should meet you"
                      />
                      <TextField
                        label="Safety Information"
                        name="safety_info"
                        value={formData.safety_info}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="e.g. Wear comfortable shoes, bring water..."
                        helperText="Safety requirements and health considerations"
                      />
                    </Stack>
                  </Col>
                </Row>
                {/* Included Services */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#166534', mb: 1 }}>
                    What's Included
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                    Items included in this experience (e.g. "Lunch", "Transport", "Equipment")
                  </Typography>
                  <Stack spacing={1.5}>
                    {formData.included_services.map((item, index) => (
                      <Stack key={index} direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          fullWidth
                          value={item}
                          onChange={(e) => {
                            const updated = [...formData.included_services]
                            updated[index] = e.target.value
                            setFormData(prev => ({ ...prev, included_services: updated }))
                          }}
                          placeholder={`Item ${index + 1}`}
                        />
                        <IconButton
                          size="small"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            included_services: prev.included_services.filter((_, i) => i !== index)
                          }))}
                          sx={{ color: '#EF4444' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ))}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        included_services: [...prev.included_services, '']
                      }))}
                      sx={{
                        alignSelf: 'flex-start',
                        borderColor: '#166534',
                        color: '#166534',
                        '&:hover': { bgcolor: '#F0FDF4', borderColor: '#15803D' }
                      }}
                    >
                      + Add Item
                    </Button>
                  </Stack>
                </Box>
              </Box>
            )}

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
                  onClick={() => document.getElementById('image-upload-edit')?.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#9CA3AF', mb: 1 }} />
                  <Typography sx={{ color: '#374151' }}>{t('host.properties.add_more_images_hint')}</Typography>
                </Box>
                <input
                  id="image-upload-edit"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddImages}
                  style={{ display: 'none' }}
                />
                <InputError message={imageErrorText} />
                {property.images && property.images.length > 0 && (
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                    {t('host.properties.current_images')}
                  </Typography>
                )}
                <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                  {property.images?.map((url, index) => (
                    <Box
                      key={`existing-${index}`}
                      component="img"
                      src={url}
                      alt={`Image ${index + 1}`}
                      sx={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 2, border: '1px solid #E5E7EB' }}
                    />
                  ))}
                  {newFiles.map((file, index) => (
                    <Box key={`new-${index}`} sx={{ position: 'relative' }}>
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
                  {t('host.properties.first_image_main_thumbnail')}
                </Typography>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('host.properties.status')}</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleSelectChange('status', e.target.value)}
                    label={t('host.properties.status')}
                  >
                    <MenuItem value="Pending">{t('host.properties.status_pending')}</MenuItem>
                    <MenuItem value="Active">{t('host.properties.status_active')}</MenuItem>
                    <MenuItem value="Inactive">{t('host.properties.status_inactive')}</MenuItem>
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
                    {t('host.properties.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{
                      bgcolor: '#AD542D',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#78381C' }
                    }}
                  >
                    {submitting ? 'Updating...' : t('host.properties.update_property')}
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
        message={t('host.properties.property_updated_success')}
        severity="success"
      />
    </HostLayout>
  )
}
