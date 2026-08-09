import React, { useState, useMemo } from 'react'
import { Box, Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography, Modal, IconButton } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/Admin/Toast';
import { useLanguage } from '../hooks/use-language'
import { useCurrency } from '../contexts/CurrencyContext'
import { formatPrice as formatPriceUtil } from '../utils/currency'
import FeaturedCard from '../components/FeaturedCard'
import { Container as RBContainer, Row, Col } from 'react-bootstrap'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import StarIcon from '@mui/icons-material/Star'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import BedIcon from '@mui/icons-material/Bed'
import BathroomIcon from '@mui/icons-material/Bathroom'
import PeopleIcon from '@mui/icons-material/People'
import HomeIcon from '@mui/icons-material/Home'
import { router, Head, usePage } from '@inertiajs/react'
import MessageIcon from '@mui/icons-material/Message'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TourIcon from '@mui/icons-material/Tour'
import ScheduleIcon from '@mui/icons-material/Schedule'
import CloseIcon from '@mui/icons-material/Close'

const PLACEHOLDER_IMAGE = '/images/popular-stay-1.svg'

type PropertyHost = {
  id: number
  name: string
  profile_picture: string | null
  created_at: string
}

type Property = {
  id: number
  title: string
  location: string
  timezone?: string
  cancellation_policy?: string
  cancellation_policy_description?: string
  price: number | string
  bedrooms: number | null
  bathrooms: number | null
  guests: number
  property_type: string
  listing_category?: string
  duration_hours?: number | null
  description: string
  amenities: string[]
  image: string | null
  images: string[]
  host: PropertyHost
  airport_pickup_enabled?: boolean
  airport?: string | null
  pickup_start_time?: string | null
  pickup_end_time?: string | null
  airport_pickup_price?: number | null
  guided_tours_enabled?: boolean
  guided_tours_description?: string | null
  guided_tours_duration?: string | null
  guided_tours_price?: number | null
}

type Review = {
  id: number
  rating: number
  comment: string
  created_at: string
  user: { id: number; name: string; profile_picture: string | null }
}

type RelatedProperty = {
  id: number
  title: string
  location: string
  price: number | string
  image: string | null
  rating?: number
}

type RatingStats = {
  average: number
  total: number
  breakdown: Record<number, number>
}

type ListingDetailProps = {
  property: Property
  relatedProperties: RelatedProperty[]
  reviews: Review[]
  ratingStats: RatingStats
  defaultCheckin?: string
  defaultCheckout?: string
  searchGuests?: {
    adults?: string | null
    children?: string | null
    rooms?: string | null
  }
  reviewEligibility?: 'guest' | 'eligible' | 'already_reviewed' | 'no_completed_stay'
}

function parseDateFromBackend(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { year: y ?? new Date().getFullYear(), month: (m ?? new Date().getMonth() + 1) - 1, day: d ?? 1 }
}

export default function ListingDetail() {
  const { t } = useLanguage()
  const page = usePage<ListingDetailProps>().props
  const { property, relatedProperties, reviews, ratingStats, defaultCheckin, defaultCheckout, searchGuests, reviewEligibility } = page
  const authUser = (page as { auth?: { user?: { id: number; name: string } | null } }).auth?.user

  const today = new Date()
  const defaultStart = defaultCheckin ? parseDateFromBackend(defaultCheckin) : { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() }
  const defaultEnd = defaultCheckout ? parseDateFromBackend(defaultCheckout) : (() => { const d = new Date(today); d.setDate(d.getDate() + 7); return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() } })()
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(defaultStart.year, defaultStart.month, 1))
  const [selectedCheckin, setSelectedCheckin] = useState<Date | null>(() => new Date(defaultStart.year, defaultStart.month, defaultStart.day))
  const [selectedCheckout, setSelectedCheckout] = useState<Date | null>(() => new Date(defaultEnd.year, defaultEnd.month, defaultEnd.day))
  const [bookPickupService, setBookPickupService] = useState(false)
  const [bookGuidedTour, setBookGuidedTour] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'warning' as 'success' | 'error' | 'warning' | 'info' })
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

  // Airport Pickup / Guided Tours from property (host-configured)
  const { currency } = useCurrency()
  const airportPickupEnabled = Boolean(property.airport_pickup_enabled)
  const guidedToursEnabled = Boolean(property.guided_tours_enabled)
  const formatPrice = (value: number | string | null | undefined) =>
    value != null ? formatPriceUtil(Number(value), currency) : '—'

  // Gallery: use property images; fallback to single image or placeholder
  const galleryImages = useMemo(() => {
    const list = Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : property.image
        ? [property.image]
        : [PLACEHOLDER_IMAGE]
    return list
  }, [property.images, property.image])

  // Grid needs 8 slots: 1 large + 2 medium + 5 small. Pad with first image if fewer.
  const displayedImages = useMemo(() => {
    const need = 8
    const base = galleryImages.slice(0, need)
    const first = base[0] || PLACEHOLDER_IMAGE
    while (base.length < need) base.push(first)
    return base
  }, [galleryImages])
  const remainingCount = Math.max(0, galleryImages.length - 8)

  const changeMonth = (direction: number) => {
    const newDate = new Date(calendarMonth)
    newDate.setMonth(newDate.getMonth() + direction)
    setCalendarMonth(newDate)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days: { day: number; isOtherMonth: boolean; date?: Date }[] = []
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isOtherMonth: true })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isOtherMonth: false, date: new Date(year, month, i) })
    }
    while (days.length < 42) {
      days.push({ day: days.length - daysInMonth - firstDay + 1, isOtherMonth: true })
    }
    return days
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'short', year: 'numeric' })
  }

  const calendarDays = getDaysInMonth(calendarMonth)

  const handleDateClick = (date: Date) => {
    if (!selectedCheckin || selectedCheckout) {
      setSelectedCheckin(date)
      setSelectedCheckout(null)
    } else if (date < selectedCheckin) {
      setSelectedCheckin(date)
    } else {
      setSelectedCheckout(date)
    }
  }

  const getDateState = (date: Date | undefined) => {
    if (!date) return { isCheckin: false, isCheckout: false, isInRange: false, isPast: false }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isPast = date < today
    const isCheckin = !!selectedCheckin && date.getTime() === selectedCheckin.getTime()
    const isCheckout = !!selectedCheckout && date.getTime() === selectedCheckout.getTime()
    const isInRange = !!(selectedCheckin && selectedCheckout && date > selectedCheckin && date < selectedCheckout)
    return { isCheckin, isCheckout, isInRange, isPast }
  }

  const toIsoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  // Build check-in/check-out from calendar for Book button; backend validates/fixes and redirects
  const getCalendarCheckinCheckout = () => {
    const checkin = selectedCheckin ?? new Date()
    const checkout = selectedCheckout ?? (() => { const d = new Date(checkin); d.setDate(d.getDate() + 1); return d })()
    return { checkin: toIsoDate(checkin), checkout: toIsoDate(checkout) }
  }

  const bookingUrl = () => {
    const { checkin, checkout } = getCalendarCheckinCheckout()
    const params = new URLSearchParams({ property_id: String(property.id), checkin, checkout })
    const sg = searchGuests
    if (sg?.adults != null && String(sg.adults) !== '') params.set('adults', String(sg.adults))
    if (sg?.children != null && String(sg.children) !== '') params.set('children', String(sg.children))
    if (sg?.rooms != null && String(sg.rooms) !== '') params.set('rooms', String(sg.rooms))
    return `/booking/redirect?${params.toString()}`
  }

  const priceDisplay = typeof property.price === 'number' ? property.price : Number(property.price) || 0
  const hostJoinedYear = property.host?.created_at ? new Date(property.host.created_at).getFullYear() : ''

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewRating < 1 || reviewRating > 5) return
    setReviewSubmitting(true)
    router.post('/reviews', {
      property_id: property.id,
      rating: reviewRating,
      comment: reviewComment.trim() || '',
    }, {
      preserveScroll: true,
      onFinish: () => setReviewSubmitting(false),
    })
  }

  const errors: Record<string, string[]> = (page as unknown as { errors?: Record<string, string[]> }).errors ?? {}

  return (
    <Box>
      <Head title={property.title || 'Property Detail'} />
      <Navbar />
      <main className="property-detail-page">
        {/* Property Details Section */}
        <section className="property-details-section">
          <RBContainer>
            <Row>
              <Col lg={12}>
                <Paper className="property-info-card" elevation={0}>
                  <Row className="align-items-start property-info-top-row">
                    <Col xs={8} md={10}>
                      <Typography
                        className="property-title"
                        component="h1"
                        sx={{ fontWeight: 700 }}
                        title={property.title || undefined}
                      >
                        {property.title}
                      </Typography>
                      <Box className="property-meta">
                        <Box className="location">
                          <LocationOnIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                          <span className="property-location-text" title={property.location || undefined}>
                            {property.location}
                          </span>
                          {property.timezone && (
                            <span className="property-timezone-text" style={{ marginInlineStart: 8, opacity: 0.7 }}>
                              · {t('listing_detail.local_time_zone')}: {property.timezone}
                            </span>
                          )}
                        </Box>
                        <Box className="rating d-none d-md-flex">
                          <Box className="stars">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} sx={{ fontSize: 14, color: i < Math.round(ratingStats.average) ? '#FFD700' : '#e9ecef' }} />
                            ))}
                          </Box>
                          <Typography className="rating-text">({ratingStats.total})</Typography>
                        </Box>
                      </Box>
                    </Col>
                    <Col xs={4} md={2}>
                      <Box className="booking-info">
                        <Box className="price">
                          <Typography component="span" className="price-amount">{formatPriceUtil(priceDisplay, currency)}</Typography>
                          <Typography component="span" className="price-period">{property.listing_category === 'experience' ? t('listing_detail.per_person') : t('listing_detail.per_night')}</Typography>
                        </Box>
                        <Button
                          variant="contained"
                          className="btn-book"
                          onClick={() => {
                            if (!authUser) {
                              setToast({ open: true, message: t('listing_detail.login_to_book'), severity: 'warning' })
                              return
                            }
                            router.visit(bookingUrl())
                          }}
                        >
                         {t('listing_detail.book')}
                        </Button>
                      </Box>
                    </Col>
                  </Row>
                  <Row className="d-md-none property-info-rating-row">
                    <Col xs={12}>
                      <Box className="property-meta property-meta-mobile-rating">
                        <Box className="rating d-flex">
                          <Box className="stars">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={`m-${i}`} sx={{ fontSize: 14, color: i < Math.round(ratingStats.average) ? '#FFD700' : '#e9ecef' }} />
                            ))}
                          </Box>
                          <Typography className="rating-text">({ratingStats.total})</Typography>
                        </Box>
                      </Box>
                    </Col>
                  </Row>
                </Paper>
              </Col>
            </Row>
          </RBContainer>
        </section>

        {/* Image Gallery Section */}
        <section className="property-gallery-section">
          <RBContainer>
            {galleryImages.length === 1 ? (
              // Single image - full width, visible on all screens
              <Box sx={{ borderRadius: '12px', overflow: 'hidden', height: { xs: 280, sm: 320 }, width: '100%' }}>
                <img
                  src={galleryImages[0]}
                  alt={`${property.title} - 1`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            ) : galleryImages.length === 2 ? (
              // Two images - 1 col on mobile, 2 on desktop
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1, height: { xs: 'auto', sm: 320 }, minHeight: { xs: 280, sm: 0 } }}>
                <Box sx={{ borderRadius: { xs: '12px 12px 0 0', sm: '12px 0 0 12px' }, overflow: 'hidden', height: { xs: 280, sm: '100%' } }}>
                  <img
                    src={galleryImages[0]}
                    alt={`${property.title} - 1`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <Box sx={{ borderRadius: { xs: '0 0 12px 12px', sm: '0 12px 12px 0' }, overflow: 'hidden', position: 'relative', height: { xs: 280, sm: '100%' } }}>
                  <img
                    src={galleryImages[1]}
                    alt={`${property.title} - 2`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {galleryImages.length > 2 && (
                    <button 
                      type="button" 
                      className="property-gallery-show-all-btn"
                      onClick={() => setGalleryModalOpen(true)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M3 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
                      </svg>
                      {t('listing_detail.show_all_photos')}
                    </button>
                  )}
                </Box>
              </Box>
            ) : (
              <Box className="property-gallery-container" sx={{ maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
                <Box
                  className="property-gallery-main"
                  sx={{
                    height: { xs: 280, sm: '100%' },
                    minHeight: { xs: 280, sm: 0 },
                    maxHeight: { xs: 280, sm: 400 },
                  }}
                >
                  <button type="button" className="property-gallery-img-btn">
                    <img
                      src={galleryImages[0] || PLACEHOLDER_IMAGE}
                      alt={`${property.title} - 1`}
                      className="property-gallery-img"
                    />
                  </button>
                </Box>

                <Box className="property-gallery-grid">
                  {galleryImages.slice(1, 5).map((image, idx) => (
                    <Box key={idx + 1} className="property-gallery-item">
                      <button type="button" className="property-gallery-img-btn">
                        <img
                          src={image}
                          alt={`${property.title} - ${idx + 2}`}
                          className="property-gallery-img"
                        />
                        {idx === 3 && galleryImages.length > 5 && (
                          <button 
                            type="button" 
                            className="property-gallery-show-all-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setGalleryModalOpen(true)
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M3 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
                            </svg>
                            {t('listing_detail.show_all_photos')}
                          </button>
                        )}
                      </button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </RBContainer>
        </section>

        {/* Quick Info Section */}
        <section>
          <RBContainer className="mt-0 mt-md-4">
            <Paper className="quick-info-section" elevation={0}>
              <Typography className="section-title" component="h2">{t('listing_detail.quick_info')}</Typography>
              <Row className="g-4">
                {property.listing_category === 'experience' ? (
                  <Col md={6} sm={6}>
                    <Box className="info-item d-flex gap-2">
                      <Box className="info-icon">
                        <AccessTimeIcon sx={{ color: '#AD542D', fontSize: '30px', width: '30px', height: '30px', marginInlineEnd: 1.5 }} />
                      </Box>
                      <Box className="info-text">
                        <Typography component="span" className="info-number">{property.duration_hours}</Typography>
                        <Typography component="span" className="info-label">{t('listing_detail.duration_hours')}</Typography>
                      </Box>
                    </Box>
                  </Col>
                ) : (
                  <>
                    <Col md={6} sm={6}>
                      <Box className="info-item d-flex gap-2">
                          <Box className="info-icon">
                         <BedIcon sx={{ color: '#AD542D', fontSize: '30px', width: '30px', height: '30px', marginInlineEnd: 1.5 }} />
                          </Box>
                        <Box className="info-text">
                          <Typography component="span" className="info-number">{property.bedrooms}</Typography>
                          <Typography component="span" className="info-label">{t('listing_detail.bedrooms')}</Typography>
                        </Box>
                      </Box>
                    </Col>
                    <Col md={6} sm={6}>
                      <Box className="info-item d-flex gap-2">
                        <Box className="info-icon">
                        <BathroomIcon sx={{ color: '#AD542D', fontSize: '30px', width: '30px', height: '30px', marginInlineEnd: 1.5 }} />
                        </Box>
                        <Typography component="span" className="info-number">{property.bathrooms}</Typography>
                        <Typography component="span" className="info-label">{t('listing_detail.bathrooms')}</Typography>
                      </Box>
                    </Col>
                  </>
                )}
              </Row>
              <Row className="g-4 mt-2">
                <Col md={6} sm={6}>
                  <Box className="info-item d-flex gap-2">
                    <Box className="info-icon">
                    <PeopleIcon sx={{ color: '#AD542D', fontSize: '30px', width: '30px', height: '30px', marginInlineEnd: 1.5 }} />
                    </Box>
                    <Box className="info-text">
                      <Typography component="span" className="info-number">{property.guests}</Typography>
                      <Typography component="span" className="info-label">
                        {property.listing_category === 'experience' ? t('listing_detail.max_participants') : t('listing_detail.guests')}
                      </Typography>
                    </Box>
                  </Box>
                </Col>
                <Col md={6} sm={6}>
                  <Box className="info-item d-flex gap-2">
                    <Box className="info-icon">
                    <HomeIcon sx={{ color: '#AD542D', fontSize: '30px', width: '30px', height: '30px', marginInlineEnd: 1.5 }} />
                    </Box>
                    <Typography component="span" className="info-label">{property.property_type || t('listing_detail.entire_place')}</Typography>
                  </Box>
                </Col>
              </Row>
            </Paper>
          </RBContainer>
        </section>

        {/* Main Content Section */}
        <section>
          <RBContainer className="mt-4">
            <Row>
              <Col lg={12}>

                 {/* Host Section */}
                 <Paper className="host-section mt-4" elevation={0}>
                  <Typography className="section-title" component="h2">{t('listing_detail.about_host')}</Typography>
                  <Box className="host-info">
                    <Box className="host-avatar">
                      <img
                        src={property.host?.profile_picture || '/images/popular-stay-1.svg'}
                        alt={property.host?.name || 'Host'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    </Box>
                    <Box className="host-details" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                        <Box>
                          <Typography className="host-name" component="h5" sx={{ fontWeight: 700 }}>{property.host?.name || 'Host'}</Typography>
                          <Typography className="host-joined">{hostJoinedYear ? `${t('listing_detail.joined_in')} ${hostJoinedYear}` : ''}</Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          startIcon={<MessageIcon />}
                          onClick={() => router.visit(`/chat?property_id=${property.id}`)}
                          sx={{
                            flexShrink: 0,
                            borderColor: '#AD542D',
                            color: '#AD542D',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 3,
                            '&:hover': {
                              borderColor: '#78381C',
                              bgcolor: '#FFF5F7'
                            }
                          }}
                        >
                          {t('listing_detail.message')}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
                {/* About Section */}
                <Paper className="about-section mt-4" elevation={0}>
                  <Typography className="section-title" component="h2">{t('listing_detail.about_property')}</Typography>
                  <Typography className="about-text">
                    {property.description || t('listing_detail.no_description')}
                  </Typography>
                </Paper>

                {/* Cancellation Policy Section */}
                <Paper className="about-section mt-4" elevation={0}>
                  <Typography className="section-title" component="h2">{t('listing_detail.cancellation_policy')}</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                    {t(`listing_detail.cancellation_policy_${property.cancellation_policy || 'moderate'}`)}
                  </Typography>
                  <Typography className="about-text">
                    {property.cancellation_policy_description}
                  </Typography>
                </Paper>

                {/* Airport Pickup Service Section – from host property data */}
                {airportPickupEnabled && (
                  <Paper className="about-section mt-4" elevation={0} sx={{ bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <Typography className="section-title" component="h2">{t('listing_detail.airport_pickup')}</Typography>
                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={bookPickupService}
                            onChange={(e) => setBookPickupService(e.target.checked)}
                            sx={{ color: '#AD542D', '&.Mui-checked': { color: '#AD542D' } }}
                          />
                        }
                        label={t('listing_detail.pickup_question')}
                        sx={{ mb: bookPickupService ? 3 : 0 }}
                      />

                      {bookPickupService && (
                        <Box sx={{ mt: 2 }}>
                          <Stack spacing={3}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <FlightTakeoffIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>Airport</Typography>
                                <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                                  {property.airport || '—'}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <AccessTimeIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>{t('listing_detail.pickup_time')}</Typography>
                                <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                                  {property.pickup_start_time && property.pickup_end_time
                                    ? `${property.pickup_start_time} - ${property.pickup_end_time}`
                                    : '—'}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <AttachMoneyIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>{t('listing_detail.price')}</Typography>
                                <Typography sx={{ fontWeight: 600, color: '#222222', fontSize: '1.125rem' }}>
                                  {formatPrice(property.airport_pickup_price)}
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                )}

                {/* Guided Tours Service Section – from host property data */}
                {guidedToursEnabled && (
                  <Paper className="about-section mt-4" elevation={0} sx={{ bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <Typography className="section-title" component="h2">{t('listing_detail.guided_tours')}</Typography>
                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={bookGuidedTour}
                            onChange={(e) => setBookGuidedTour(e.target.checked)}
                            sx={{ color: '#AD542D', '&.Mui-checked': { color: '#AD542D' } }}
                          />
                        }
                        label={t('listing_detail.guided_tours_question')}
                        sx={{ mb: bookGuidedTour ? 3 : 0 }}
                      />

                      {bookGuidedTour && (
                        <Box sx={{ mt: 2 }}>
                          <Stack spacing={3}>
                            {property.guided_tours_description && (
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <TourIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                                <Box>
                                  <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>{t('listing_detail.tour_description')}</Typography>
                                  <Typography sx={{ fontWeight: 400, color: '#222222', fontSize: '0.9rem' }}>
                                    {property.guided_tours_description}
                                  </Typography>
                                </Box>
                              </Box>
                            )}

                            {property.guided_tours_duration && (
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <ScheduleIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                                <Box>
                                  <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>Duration</Typography>
                                  <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                                    {property.guided_tours_duration}
                                  </Typography>
                                </Box>
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <AttachMoneyIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>{t('listing_detail.price')}</Typography>
                                <Typography sx={{ fontWeight: 600, color: '#222222', fontSize: '1.125rem' }}>
                                  {formatPrice(property.guided_tours_price)}
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                )}

                {/* Rules Section */}
                <Paper className="rules-section mt-4" elevation={0}>
                  <Typography className="section-title" component="h2">Rules</Typography>
                  <Box className="rules-list">
                    {[
                      'Check-in: 3:00 PM - 10:00 PM',
                      'Check-out: 11:00 AM',
                      'No parties or events allowed',
                      'Pets allowed [with prior notification]',
                      'No smoking indoors',
                    ].map((rule, idx) => (
                      <Box key={idx} className="rule-item">
                        <CheckCircleIcon sx={{ color: '#28a745', fontSize: 16 }} />
                        <Typography component="span">{rule}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                {/* Availability Section */}
                <Paper className="availability-section mt-4" elevation={0}>
                  <Typography className="section-title" component="h2">Availability</Typography>
                  <Row className="availability-calendars-row justify-content-center">
                    <Col md={7}>
                      <Paper className="calendar-widget" elevation={0}>
                        <Box className="calendar-header">
                          <Button size="small" onClick={() => changeMonth(-1)}><ChevronLeftIcon /></Button>
                          <Typography component="span" className="month-year">{formatMonthYear(calendarMonth)}</Typography>
                          <Button size="small" onClick={() => changeMonth(1)}><ChevronRightIcon /></Button>
                        </Box>
                        <Box className="calendar-grid">
                          <Box className="calendar-weekdays">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                              <Box key={day}>{day}</Box>
                            ))}
                          </Box>
                          <Box className="calendar-days">
                            {calendarDays.map((d, idx) => {
                              const { isCheckin, isCheckout, isInRange, isPast } = getDateState(d.date)
                              const isDisabled = d.isOtherMonth || isPast
                              const isSelected = isCheckin || isCheckout
                              const rangeShapeClass = isCheckin
                                ? (selectedCheckout ? 'start-range' : '')
                                : isCheckout
                                  ? 'single'
                                  : ''
                              return (
                                <Box
                                  key={idx}
                                  className={`day ${d.isOtherMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${rangeShapeClass} ${isInRange ? 'in-range' : ''} ${isDisabled && !d.isOtherMonth ? 'disabled' : ''}`}
                                  onClick={() => !isDisabled && d.date && handleDateClick(d.date)}
                                >
                                  {d.day}
                                </Box>
                              )
                            })}
                          </Box>
                        </Box>
                      </Paper>
                    </Col>
                  </Row>
                </Paper>

                {/* Reviews Section */}
                <Box className="reviews-section mt-4">
                  <Row>
                    <Typography className="reviews-title" component="h2">Reviews ({ratingStats.total})</Typography>
                    <Col lg={12}>
                      {authUser && reviewEligibility === 'eligible' ? (
                        <Paper component="form" onSubmit={handleSubmitReview} elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                          <Typography sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2 }}>{t('listing_detail.write_review')}</Typography>
                          {(errors.error as string[])?.[0] && (
                            <Typography sx={{ color: '#d32f2f', fontSize: '0.875rem', mb: 2 }}>{errors.error[0]}</Typography>
                          )}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 0.25 }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Box
                                  key={star}
                                  component="button"
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  sx={{
                                    p: 0,
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    '&:hover .review-star': { color: '#ffdb4d' },
                                    '&:focus': { outline: 'none' },
                                  }}
                                  aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                                >
                                  <StarIcon
                                    className="review-star"
                                    sx={{
                                      fontSize: 36,
                                      color: star <= reviewRating ? '#ffc107' : '#e9ecef',
                                      transition: 'color 0.2s',
                                    }}
                                  />
                                </Box>
                              ))}
                            </Box>
                            {(errors.rating as string[])?.[0] && <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 0.5 }}>{errors.rating[0]}</Typography>}
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#222', mb: 1 }}>{t('listing_detail.your_comment')}</Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder={t('listing_detail.your_comment')}
                              variant="outlined"
                              size="small"
                              inputProps={{ maxLength: 5000 }}
                              error={Boolean((errors.comment as string[])?.[0])}
                              helperText={(errors.comment as string[])?.[0] || (reviewComment.length > 0 ? `${reviewComment.length} / 5000` : undefined)}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Box>
                          <Button type="submit" variant="contained" disabled={reviewSubmitting || reviewRating < 1} sx={{ bgcolor: '#AD542D', '&:hover': { bgcolor: '#78381C' }, textTransform: 'none', fontWeight: 600 }}>
                            {reviewSubmitting ? '...' : t('listing_detail.submit_review')}
                          </Button>
                        </Paper>
                      ) : authUser && reviewEligibility === 'no_completed_stay' ? (
                        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: '#F9FAFB' }}>
                          <Typography sx={{ color: '#4A5568', fontSize: '0.9375rem' }}>
                            {t('listing_detail.review_needs_completed_stay')}
                          </Typography>
                        </Paper>
                      ) : null}
                      <Box className="reviews-list">
                        {reviews.length > 0 ? displayedReviews.map((review) => (
                          <Box key={review.id} className="review-item">
                            <Box className="reviewer-info">
                              <Box className="reviewer-avatar">
                                <img src={review.user?.profile_picture || '/images/popular-stay-1.svg'} alt={review.user?.name || 'Reviewer'} />
                              </Box>
                              <Typography className="reviewer-name">{review.user?.name}</Typography>
                              <Typography className="review-date">{review.created_at}</Typography>
                            </Box>
                            <Box className="review-content">
                              <Box className="stars">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon key={i} sx={{ fontSize: 14, color: i < review.rating ? '#ffc107' : '#e9ecef' }} />
                                ))}
                              </Box>
                              <Typography className="review-text">{review.comment}</Typography>
                            </Box>
                          </Box>
                        )) : (
                          <Typography sx={{ color: '#717171' }}>{t('listing_detail.no_reviews')}</Typography>
                        )}
                      </Box>
                    </Col>
                  </Row>
                  {reviews.length > 3 && (
                  <Box className="text-center mt-4">
                    <Button
                      className="explore-more"
                      variant="contained"
                      onClick={() => setShowAllReviews((v) => !v)}
                    >
                      {showAllReviews ? t('listing_detail.show_less') : t('listing_detail.explore_more')}
                    </Button>
                  </Box>
                )}
                </Box>

              </Col>
            </Row>
          </RBContainer>
        </section>

        {/* Popular Stays Section */}
        <section className="popular-stays-section">
          <RBContainer>
            <Typography className="section-title" component="h2">{t('listing_detail.popular_near')}</Typography>
            <Row className="g-4">
              {relatedProperties.length > 0 ? relatedProperties.map((stay) => (
                <Col key={stay.id} lg={4} md={6}>
                  <FeaturedCard
                    image={stay.image || PLACEHOLDER_IMAGE}
                    title={stay.title}
                    location={stay.location}
                    price={typeof stay.price === 'number' ? stay.price : Number(stay.price) || 0}
                    id={stay.id}
                    rating={stay.rating != null ? Number(stay.rating) : undefined}
                  />
                </Col>
              )) : (
                <Col lg={12}>
                  <Typography sx={{ color: '#717171' }}>{t('listing_detail.no_related_properties')}</Typography>
                </Col>
              )}
            </Row>
          </RBContainer>
        </section>
      </main>
      <Footer />
      
      {/* Gallery Modal - responsive for all devices */}
      <Modal
        open={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 0, sm: 2 },
          backdropFilter: 'blur(4px)',
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: '100%', sm: '95%' },
            maxWidth: 1400,
            height: { xs: '100vh', sm: 'auto' },
            maxHeight: { xs: '100vh', sm: '95vh' },
            bgcolor: 'background.paper',
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              p: { xs: 1.5, sm: 2.5 },
              borderBottom: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#222222',
                fontSize: { xs: '0.9375rem', sm: '1.125rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {property.title}
            </Typography>
            <IconButton
              onClick={() => setGalleryModalOpen(false)}
              sx={{
                color: '#717171',
                flexShrink: 0,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#F7F7F7',
                  color: '#222222',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Scrollable Images Grid */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              p: { xs: 1.5, sm: 3 },
              bgcolor: '#F9FAFB',
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#F3F4F6',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#D1D5DB',
                borderRadius: '4px',
                '&:hover': {
                  background: '#9CA3AF',
                },
              },
            }}
          >
            {/* First 5 images: 1 large + 4 small grid — stack on mobile */}
            {galleryImages.length > 0 && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gridTemplateRows: { xs: 'auto auto', sm: '1fr' },
                  gap: 1.5,
                  mb: 2,
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Large image on left (top on mobile) */}
                <Box
                  sx={{
                    borderRadius: { xs: '12px 12px 0 0', sm: '12px 0 0 12px' },
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: { xs: 220, sm: 'auto' },
                  }}
                >
                  <img
                    src={galleryImages[0]}
                    alt={`${property.title} - 1`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>

                {/* Grid of 4 smaller images — 2x2 on all screens, full width row on mobile */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: '1fr 1fr',
                    gap: 1.5,
                  }}
                >
                  {galleryImages.slice(1, 5).map((image, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        borderRadius:
                          idx === 1 ? { xs: '0', sm: '0 12px 0 0' } :
                          idx === 3 ? { xs: '0 0 12px 0', sm: '0 0 12px 0' } :
                          '0',
                        overflow: 'hidden',
                        position: 'relative',
                        height: { xs: 120, sm: 250 },
                      }}
                    >
                      <img
                        src={image}
                        alt={`${property.title} - ${idx + 2}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* 6th image - Full width */}
            {galleryImages[5] && (
              <Box
                sx={{
                  mb: 2,
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Box
                  sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    height: { xs: 240, sm: 400 },
                  }}
                >
                  <img
                    src={galleryImages[5]}
                    alt={`${property.title} - 6`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Remaining images — 1 col on mobile, 2 on tablet+ */}
            {galleryImages.slice(6).map((image, idx) => {
              const imageIndex = idx + 6
              const isEven = idx % 2 === 0

              if (isEven) {
                const nextImage = galleryImages[imageIndex + 1]

                return (
                  <Box
                    key={imageIndex}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: nextImage ? '1fr 1fr' : '1fr' },
                      gap: 1.5,
                      mb: 2,
                      bgcolor: '#FFFFFF',
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: { xs: '12px', sm: nextImage ? '12px 0 0 12px' : '12px' },
                        overflow: 'hidden',
                        height: { xs: 240, sm: 400 },
                      }}
                    >
                      <img
                        src={image}
                        alt={`${property.title} - ${imageIndex + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </Box>

                    {nextImage && (
                      <Box
                        sx={{
                          borderRadius: { xs: '12px', sm: '0 12px 12px 0' },
                          overflow: 'hidden',
                          height: { xs: 240, sm: 400 },
                        }}
                      >
                        <img
                          src={nextImage}
                          alt={`${property.title} - ${imageIndex + 2}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                )
              }
              return null
            })}
          </Box>
        </Box>
      </Modal>

      <Toast
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        message={toast.message}
        severity={toast.severity}
      />
    </Box>
  )
}
