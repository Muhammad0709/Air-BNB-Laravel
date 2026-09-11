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
    beds: '',
    bathrooms: '',
    house_rules: '',
    check_in_time: '',
    check_out_time: '',
    minimum_stay: '1',
    maximum_stay: '30',
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
    // Experience-specific fields
    min_participants: '',
    guide_language: '',
    group_size: '',
    meeting_point: '',
    included_services: [] as string[],
    safety_info: '',
    experience_category: '',
    experience_available_dates: [''],
    experience_available_times: [''],
    experience_not_included: [] as string[],
    experience_guest_requirements: '',
  })
  const [guidedToursDurationCustom, setGuidedToursDurationCustom] = useState('')
  const [submitErrors, setSubmitErrors] = useState<Record<string, string[] | string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const err = (field: string): string | null => {
    const errors = hasSubmitted ? submitErrors : pageErrors
    const value = (errors as Record<string, string[] | string>)[field]
    return (Array.isArray(value) ? value[0] : value) ?? null
  }

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const imageErrorText = (() => {
    const errors = hasSubmitted ? submitErrors : pageErrors
    const key = Object.keys(errors || {}).find((k) => k === 'images' || k.startsWith('images.'))
    const r = key ? (errors as Record<string, unknown>)[key] : null
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
      submitData.append('beds', formData.beds)
      submitData.append('bathrooms', formData.bathrooms)
      submitData.append('house_rules', formData.house_rules)
      submitData.append('check_in_time', formData.check_in_time)
      submitData.append('check_out_time', formData.check_out_time)
      submitData.append('minimum_stay', formData.minimum_stay)
      submitData.append('maximum_stay', formData.maximum_stay)
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
    // Experience-specific fields
    if (formData.listing_category === 'experience') {
      if (formData.min_participants) submitData.append('min_participants', formData.min_participants)
      if (formData.guide_language)   submitData.append('guide_language', formData.guide_language)
      if (formData.group_size)       submitData.append('group_size', formData.group_size)
      if (formData.meeting_point)    submitData.append('meeting_point', formData.meeting_point)
      if (formData.safety_info)      submitData.append('safety_info', formData.safety_info)
      submitData.append('experience_category', formData.experience_category)
      formData.experience_available_dates.filter(Boolean).forEach((date, i) => submitData.append(`experience_available_dates[${i}]`, date))
      formData.experience_available_times.filter(Boolean).forEach((time, i) => submitData.append(`experience_available_times[${i}]`, time))
      formData.experience_not_included.filter(Boolean).forEach((item, i) => submitData.append(`experience_not_included[${i}]`, item))
      submitData.append('experience_guest_requirements', formData.experience_guest_requirements)
      formData.included_services.forEach((item, i) => {
        submitData.append(`included_services[${i}]`, item)
      })
    }
    formData.images.forEach((file) => {
      submitData.append('images[]', file)
    })

    router.post('/host/properties', submitData, {
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
        setSubmitError(Object.keys(errors).length === 0 ? 'Property could not be saved. Please try again.' : null)
        window.setTimeout(() => {
          const firstInvalidField = document.querySelector<HTMLElement>('[aria-invalid="true"]')
          firstInvalidField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          firstInvalidField?.focus()
        }, 0)
      },
      onSuccess: () => {
        setSubmitErrors({})
        setSubmitError(null)
      },
      onFinish: () => setSubmitting(false),
      onException: () => setSubmitError('Property could not be saved. Please try again.'),
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
            {submitError && (
              <Typography sx={{ mb: 3, color: '#D32F2F', fontSize: '0.875rem', fontWeight: 600 }}>
                {submitError}
              </Typography>
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
                        label={t('host.properties.beds')}
                        name="beds"
                        type="number"
                        value={formData.beds}
                        onChange={handleChange}
                        required
                        fullWidth
                        inputProps={{ min: 1 }}
                        error={!!err('beds')}
                      />
                      <InputError message={err('beds')} />
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

            {formData.listing_category !== 'experience' && (
              <Box sx={{ mt: 4, bgcolor: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '12px', p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
                  {t('host.properties.stay_details')}
                </Typography>
                <Row>
                  <Col xs={12} md={6}>
                    <TextField label={t('host.properties.check_in_time')} name="check_in_time" type="time" value={formData.check_in_time} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} error={!!err('check_in_time')} />
                    <InputError message={err('check_in_time')} />
                  </Col>
                  <Col xs={12} md={6} className="mt-3 mt-md-0">
                    <TextField label={t('host.properties.check_out_time')} name="check_out_time" type="time" value={formData.check_out_time} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} error={!!err('check_out_time')} />
                    <InputError message={err('check_out_time')} />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={12} md={6}>
                    <TextField label={t('host.properties.minimum_stay')} name="minimum_stay" type="number" value={formData.minimum_stay} onChange={handleChange} required fullWidth inputProps={{ min: 1, max: 365 }} error={!!err('minimum_stay')} />
                    <InputError message={err('minimum_stay')} />
                  </Col>
                  <Col xs={12} md={6} className="mt-3 mt-md-0">
                    <TextField label={t('host.properties.maximum_stay')} name="maximum_stay" type="number" value={formData.maximum_stay} onChange={handleChange} required fullWidth inputProps={{ min: 1, max: 365 }} error={!!err('maximum_stay')} />
                    <InputError message={err('maximum_stay')} />
                  </Col>
                </Row>
                <TextField sx={{ mt: 3 }} label={t('host.properties.house_rules')} name="house_rules" value={formData.house_rules} onChange={handleChange} required fullWidth multiline rows={4} placeholder={t('host.properties.house_rules_placeholder')} error={!!err('house_rules')} />
                <InputError message={err('house_rules')} />
              </Box>
            )}

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

            {/* Experience-specific fields */}
            {formData.listing_category === 'experience' && (
              <Box sx={{ mt: 4, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#166534', mb: 3 }}>
                  {t('host.properties.experience_details')}
                </Typography>
                <Row className="mb-3">
                  <Col xs={12} md={6}>
                    <TextField label="Experience category" name="experience_category" value={formData.experience_category} onChange={handleChange} required fullWidth error={!!err('experience_category')} placeholder="e.g. Guided tour" />
                    <InputError message={err('experience_category')} />
                  </Col>
                  <Col xs={12} md={6} className="mt-3 mt-md-0">
                    <TextField label="Guest requirements" name="experience_guest_requirements" value={formData.experience_guest_requirements} onChange={handleChange} required fullWidth multiline rows={2} error={!!err('experience_guest_requirements')} placeholder="Age, fitness, or other requirements" />
                    <InputError message={err('experience_guest_requirements')} />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#166534', mb: 1 }}>Available dates</Typography>
                    <Stack spacing={1}>
                      {formData.experience_available_dates.map((date, index) => (
                        <Stack key={index} direction="row" spacing={1} alignItems="center">
                          <TextField type="date" size="small" fullWidth value={date} onChange={(e) => setFormData(prev => ({ ...prev, experience_available_dates: prev.experience_available_dates.map((v, i) => i === index ? e.target.value : v) }))} inputProps={{ min: new Date().toISOString().slice(0, 10) }} error={!!err('experience_available_dates')} />
                          {formData.experience_available_dates.length > 1 && <IconButton size="small" onClick={() => setFormData(prev => ({ ...prev, experience_available_dates: prev.experience_available_dates.filter((_, i) => i !== index) }))}><DeleteIcon fontSize="small" /></IconButton>}
                        </Stack>
                      ))}
                      <Button size="small" onClick={() => setFormData(prev => ({ ...prev, experience_available_dates: [...prev.experience_available_dates, ''] }))} sx={{ alignSelf: 'flex-start', color: '#166534' }}>+ Add date</Button>
                    </Stack>
                    <InputError message={err('experience_available_dates')} />
                  </Col>
                  <Col xs={12} md={6} className="mt-3 mt-md-0">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#166534', mb: 1 }}>Available times</Typography>
                    <Stack spacing={1}>
                      {formData.experience_available_times.map((time, index) => (
                        <Stack key={index} direction="row" spacing={1} alignItems="center">
                          <TextField type="time" size="small" fullWidth value={time} onChange={(e) => setFormData(prev => ({ ...prev, experience_available_times: prev.experience_available_times.map((v, i) => i === index ? e.target.value : v) }))} InputLabelProps={{ shrink: true }} error={!!err('experience_available_times')} />
                          {formData.experience_available_times.length > 1 && <IconButton size="small" onClick={() => setFormData(prev => ({ ...prev, experience_available_times: prev.experience_available_times.filter((_, i) => i !== index) }))}><DeleteIcon fontSize="small" /></IconButton>}
                        </Stack>
                      ))}
                      <Button size="small" onClick={() => setFormData(prev => ({ ...prev, experience_available_times: [...prev.experience_available_times, ''] }))} sx={{ alignSelf: 'flex-start', color: '#166534' }}>+ Add time</Button>
                    </Stack>
                    <InputError message={err('experience_available_times')} />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={6}>
                    <Stack spacing={3}>
                      <Box>
                        <TextField
                          label={t('host.properties.min_participants')}
                          name="min_participants"
                          type="number"
                          value={formData.min_participants}
                          onChange={handleChange}
                          fullWidth
                          error={!!err('min_participants')}
                          helperText={t('host.properties.min_participants_hint')}
                          inputProps={{ min: 1 }}
                        />
                        <InputError message={err('min_participants')} />
                      </Box>
                      <Box>
                        <TextField
                          label={t('host.properties.guide_language')}
                          name="guide_language"
                          value={formData.guide_language}
                          onChange={handleChange}
                          fullWidth
                          error={!!err('guide_language')}
                          placeholder={t('host.properties.guide_language_placeholder')}
                          helperText={t('host.properties.guide_language_hint')}
                        />
                        <InputError message={err('guide_language')} />
                      </Box>
                      <Box>
                        <TextField
                          label={t('host.properties.group_size')}
                          name="group_size"
                          value={formData.group_size}
                          onChange={handleChange}
                          fullWidth
                          error={!!err('group_size')}
                          placeholder={t('host.properties.group_size_placeholder')}
                          helperText={t('host.properties.group_size_hint')}
                        />
                        <InputError message={err('group_size')} />
                      </Box>
                    </Stack>
                  </Col>
                  <Col xs={12} md={6}>
                    <Stack spacing={3}>
                      <Box>
                        <TextField
                          label={t('host.properties.meeting_point')}
                          name="meeting_point"
                          value={formData.meeting_point}
                          onChange={handleChange}
                          fullWidth
                          error={!!err('meeting_point')}
                          placeholder={t('host.properties.meeting_point_placeholder')}
                          helperText={t('host.properties.meeting_point_hint')}
                        />
                        <InputError message={err('meeting_point')} />
                      </Box>
                      <Box>
                        <TextField
                          label={t('host.properties.safety_information')}
                          name="safety_info"
                          value={formData.safety_info}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={3}
                          error={!!err('safety_info')}
                          placeholder={t('host.properties.safety_information_placeholder')}
                          helperText={t('host.properties.safety_information_hint')}
                        />
                        <InputError message={err('safety_info')} />
                      </Box>
                    </Stack>
                  </Col>
                </Row>

                {/* Included Services */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#166534', mb: 1 }}>
                    {t('host.properties.whats_included')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                    {t('host.properties.included_services_hint')}
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
                          placeholder={t('host.properties.item_placeholder').replace(':number', String(index + 1))}
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
                  <InputError message={err('included_services')} />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#166534', mb: 1 }}>Not included</Typography>
                  <Stack spacing={1.5}>
                    {formData.experience_not_included.map((item, index) => (
                      <Stack key={index} direction="row" spacing={1} alignItems="center">
                        <TextField size="small" fullWidth value={item} onChange={(e) => setFormData(prev => ({ ...prev, experience_not_included: prev.experience_not_included.map((v, i) => i === index ? e.target.value : v) }))} placeholder="e.g. Meals or transport" />
                        <IconButton size="small" onClick={() => setFormData(prev => ({ ...prev, experience_not_included: prev.experience_not_included.filter((_, i) => i !== index) }))} sx={{ color: '#EF4444' }}><DeleteIcon fontSize="small" /></IconButton>
                      </Stack>
                    ))}
                    <Button variant="outlined" size="small" onClick={() => setFormData(prev => ({ ...prev, experience_not_included: [...prev.experience_not_included, ''] }))} sx={{ alignSelf: 'flex-start', borderColor: '#166534', color: '#166534' }}>+ Add item</Button>
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
                      <FormControl fullWidth size="medium" required error={!!err('airport')}>
                        <InputLabel sx={{ color: '#374151' }} shrink>{t('host.properties.select_airport')} *</InputLabel>
                        <Select
                          value={formData.airport}
                          onChange={(e) => { setFormData(prev => ({ ...prev, airport: e.target.value })); clearFieldError('airport') }}
                          label={`${t('host.properties.select_airport')} *`}
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
                          <MenuItem value="">{t('host.properties.select_airport')}</MenuItem>
                          {AIRPORT_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <InputError message={err('airport')} />
                      <Stack direction="row" spacing={2}>
                        <TextField label={`${t('host.properties.pickup_start_time')} *`} name="pickup_start_time" value={formData.pickup_start_time} onChange={handleChange} type="time" fullWidth size="medium" error={!!err('pickup_start_time')} helperText={err('pickup_start_time')} InputLabelProps={{ shrink: true }} placeholder="--:--" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                        <TextField label={`${t('host.properties.pickup_end_time')} *`} name="pickup_end_time" value={formData.pickup_end_time} onChange={handleChange} type="time" fullWidth size="medium" error={!!err('pickup_end_time')} helperText={err('pickup_end_time')} InputLabelProps={{ shrink: true }} placeholder="--:--" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                      </Stack>
                        <TextField label={`${t('host.properties.airport_pickup_price')} *`} name="airport_pickup_price" type="number" value={formData.airport_pickup_price} onChange={handleChange} fullWidth size="medium" error={!!err('airport_pickup_price')} helperText={err('airport_pickup_price')} inputProps={{ min: 0, step: 0.01 }} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#6B7280' }}>$</Typography> }} placeholder={t('host.properties.airport_pickup_price_placeholder')} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
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
                      <TextField label={`${t('host.properties.tour_description')} *`} name="guided_tours_description" value={formData.guided_tours_description} onChange={handleChange} fullWidth multiline rows={3} size="medium" error={!!err('guided_tours_description')} helperText={err('guided_tours_description')} placeholder={t('host.properties.tour_description_placeholder')} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                      <FormControl fullWidth size="medium" required error={!!err('guided_tours_duration')}>
                        <InputLabel sx={{ color: '#374151' }} shrink>{t('host.properties.tour_duration')} *</InputLabel>
                        <Select
                          value={formData.guided_tours_duration}
                          onChange={(e) => { setFormData(prev => ({ ...prev, guided_tours_duration: e.target.value })); clearFieldError('guided_tours_duration') }}
                          label={`${t('host.properties.tour_duration')} *`}
                          displayEmpty
                          renderValue={(v) => v || t('host.properties.select_duration')}
                          sx={{
                            bgcolor: '#FFFFFF',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#AD542D', borderWidth: 1 },
                            '& .MuiSelect-select': { py: 1.5 },
                          }}
                          variant="outlined"
                        >
                          <MenuItem value="">{t('host.properties.select_duration')}</MenuItem>
                          {TOUR_DURATION_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <InputError message={err('guided_tours_duration')} />
                      {formData.guided_tours_duration === 'Custom Duration' && (
                        <TextField label={t('host.properties.custom_duration')} name="guided_tours_duration_custom" value={guidedToursDurationCustom} onChange={(e) => setGuidedToursDurationCustom(e.target.value)} fullWidth size="medium" placeholder={t('host.properties.custom_duration_placeholder')} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
                      )}
                      <TextField label={`${t('host.properties.guided_tour_price')} *`} name="guided_tours_price" type="number" value={formData.guided_tours_price} onChange={handleChange} fullWidth size="medium" error={!!err('guided_tours_price')} helperText={err('guided_tours_price')} inputProps={{ min: 0, step: 0.01 }} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#6B7280' }}>$</Typography> }} placeholder={t('host.properties.guided_tour_price_placeholder')} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#D1D5DB' }, '&.Mui-focused fieldset': { borderColor: '#AD542D' } }, '& .MuiInputLabel-root': { color: '#374151' } }} />
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
                    disabled={submitting}
                    sx={{
                      bgcolor: '#AD542D',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#78381C' }
                    }}
                  >
                    {submitting ? t('host.properties.saving') : t('host.properties.save')}
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
