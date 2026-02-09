import React, { useState, useMemo } from 'react'
import { Box, Button, Checkbox, FormControlLabel, Paper, Stack, Typography } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
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

const PLACEHOLDER_IMAGE = '/images/popular-stay-1.svg'

type PropertyHost = {
  id: number
  name: string
  email: string
  profile_picture: string | null
  created_at: string
}

type Property = {
  id: number
  title: string
  location: string
  price: number | string
  bedrooms: number
  bathrooms: number
  guests: number
  property_type: string
  description: string
  amenities: string[]
  image: string | null
  images: string[]
  host: PropertyHost
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
}

export default function ListingDetail() {
  const { property, relatedProperties, reviews, ratingStats } = usePage<ListingDetailProps>().props

  const [calendar1Month, setCalendar1Month] = useState(new Date(2025, 7, 1))
  const [calendar2Month, setCalendar2Month] = useState(new Date(2025, 7, 1))
  const [selectedDate1, setSelectedDate1] = useState(6)
  const [selectedDate2, setSelectedDate2] = useState(11)
  const [bookPickupService, setBookPickupService] = useState(false)
  const [bookGuidedTour, setBookGuidedTour] = useState(false)

  // Airport Pickup / Guided Tours (mock – backend could pass these later)
  const airportPickupService = {
    enabled: true,
    airport: 'Los Angeles International Airport (LAX)',
    pickupStartTime: '08:00',
    pickupEndTime: '22:00',
    price: '$50',
  }
  const guidedToursService = {
    enabled: true,
    description: 'Explore the beautiful city with our expert local guide. Visit historical landmarks, cultural sites, and hidden gems.',
    duration: 'Half Day (4-5 hours)',
    price: '$75',
  }

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

  const handlePrevMonth = (calendar: number) => {
    const current = calendar === 1 ? calendar1Month : calendar2Month
    const newDate = new Date(current)
    newDate.setMonth(newDate.getMonth() - 1)
    if (calendar === 1) setCalendar1Month(newDate)
    else setCalendar2Month(newDate)
  }

  const handleNextMonth = (calendar: number) => {
    const current = calendar === 1 ? calendar1Month : calendar2Month
    const newDate = new Date(current)
    newDate.setMonth(newDate.getMonth() + 1)
    if (calendar === 1) setCalendar1Month(newDate)
    else setCalendar2Month(newDate)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days: { day: number; isOtherMonth: boolean }[] = []
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isOtherMonth: true })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isOtherMonth: false })
    }
    while (days.length < 42) {
      days.push({ day: days.length - daysInMonth - firstDay + 1, isOtherMonth: true })
    }
    return days
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'short', year: 'numeric' })
  }

  const calendar1Days = getDaysInMonth(calendar1Month)
  const calendar2Days = getDaysInMonth(calendar2Month)

  const priceDisplay = typeof property.price === 'number' ? property.price : Number(property.price) || 0
  const hostJoinedYear = property.host?.created_at ? new Date(property.host.created_at).getFullYear() : ''

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
                  <Row className="align-items-center">
                    <Col md={10}>
                      <Typography className="property-title" component="h1">
                        {property.title}
                      </Typography>
                      <Box className="property-meta">
                        <Box className="location">
                          <LocationOnIcon sx={{ fontSize: 16 }} />
                          <span>{property.location}</span>
                        </Box>
                        <Box className="rating">
                          <Box className="stars">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} sx={{ fontSize: 14, color: i < Math.round(ratingStats.average) ? '#FFD700' : '#e9ecef' }} />
                            ))}
                          </Box>
                          <Typography className="rating-text">({ratingStats.total})</Typography>
                        </Box>
                      </Box>
                    </Col>
                    <Col md={2}>
                      <Box className="booking-info">
                        <Box className="price">
                          <Typography component="span" className="price-amount">${priceDisplay}</Typography>
                          <Typography component="span" className="price-period">/night</Typography>
                        </Box>
                        <Button
                          variant="contained"
                          className="btn-book"
                          onClick={() => router.visit(`/booking?property_id=${property.id}`)}
                        >
                         Book
                        </Button>
                      </Box>
                    </Col>
                  </Row>
                </Paper>
              </Col>
            </Row>
          </RBContainer>
        </section>

        {/* Image Gallery Section */}
        <section className="gallery-section">
          <RBContainer>
            <Box className="gallery-grid-container">
                <Box className="gallery-top-section">
                <Box className="gallery-large-item">
                  <button type="button" className="gallery-image-button">
                    <img
                      src={displayedImages[0]}
                      alt={`${property.title} - 1`}
                      className="gallery-image"
                    />
                  </button>
                </Box>
                <Box className="gallery-right-section">
                  <Box className="gallery-medium-item">
                    <button type="button" className="gallery-image-button">
                      <img
                        src={displayedImages[1]}
                        alt={`${property.title} - 2`}
                        className="gallery-image"
                      />
                    </button>
                  </Box>
                  <Box className="gallery-medium-item">
                    <button type="button" className="gallery-image-button">
                      <img
                        src={displayedImages[2]}
                        alt={`${property.title} - 3`}
                        className="gallery-image"
                      />
                    </button>
                  </Box>
                </Box>
              </Box>

              <Box className="gallery-bottom-section">
                {displayedImages.slice(3, 8).map((image, idx) => (
                  <Box key={idx + 3} className="gallery-small-item">
                    <button type="button" className="gallery-image-button">
                      <img
                        src={image}
                        alt={`${property.title} - ${idx + 4}`}
                        className="gallery-image"
                      />
                      {idx === 4 && remainingCount > 0 && (
                        <Box className="gallery-more-overlay">
                          <Typography component="span">+{remainingCount} photos</Typography>
                        </Box>
                      )}
                    </button>
                  </Box>
                ))}
              </Box>
            </Box>
          </RBContainer>
        </section>

        {/* Quick Info Section */}
        <section>
          <RBContainer className="mt-4">
            <Paper className="quick-info-section" elevation={0}>
              <Typography className="section-title" component="h2">Quick Info</Typography>
              <Row className="g-4">
                <Col md={6} sm={6}>
                  <Box className="info-item d-flex gap-2">
                      <Box className="info-icon">
                     <BedIcon sx={{ color: '#AD542D', fontSize: '24px', width: '24px', height: '24px',mr: 1.5 }} />
                      </Box>
                    <Box className="info-text">
                      <Typography component="span" className="info-number">{property.bedrooms}</Typography>
                      <Typography component="span" className="info-label">Bedrooms</Typography>
                    </Box>
                  </Box>
                </Col>
                <Col md={6} sm={6}>
                  <Box className="info-item d-flex gap-2">
                    <Box className="info-icon">
                    <BathroomIcon sx={{ color: '#AD542D', fontSize: '24px', width: '24px', height: '24px',mr: 1.5 }} />
                    </Box>
                    <Typography component="span" className="info-number">{property.bathrooms}</Typography>
                    <Typography component="span" className="info-label">Bathrooms</Typography>
                  </Box>
                </Col>
              </Row>
              <Row className="g-4 mt-2">
                <Col md={6} sm={6}>
                  <Box className="info-item d-flex gap-2">
                    <Box className="info-icon">
                    <PeopleIcon sx={{ color: '#AD542D', fontSize: '24px', width: '24px', height: '24px',mr: 1.5 }} />
                    </Box>
                    <Box className="info-text">
                      <Typography component="span" className="info-number">{property.guests}</Typography>
                      <Typography component="span" className="info-label">Guests</Typography>
                    </Box>
                  </Box>
                </Col>
                <Col md={6} sm={6}>
                  <Box className="info-item d-flex gap-2">
                    <Box className="info-icon">
                    <HomeIcon sx={{ color: '#AD542D', fontSize: '24px', width: '24px', height: '24px',mr: 1.5 }} />
                    </Box>
                    <Typography component="span" className="info-label">{property.property_type || 'Entire place'}</Typography>
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
                  <Typography className="section-title" component="h2">About Your Host</Typography>
                  <Box className="host-info">
                    <Box className="host-avatar">
                      <img
                        src={property.host?.profile_picture || '/images/popular-stay-1.svg'}
                        alt={property.host?.name || 'Host'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    </Box>
                    <Box className="host-details" sx={{ flex: 1 }}>
                      <Typography className="host-name" component="h5">Hosted by {property.host?.name || 'Host'}</Typography>
                      <Typography className="host-joined">{hostJoinedYear ? `joined in ${hostJoinedYear}` : ''}</Typography>
                      <Typography className="host-description">
                        Your host is committed to providing a comfortable stay. Feel free to message for any questions about the property or the area.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<MessageIcon />}
                        onClick={() => router.visit(`/chat?host=${encodeURIComponent(property.host?.name || '')}&property=${encodeURIComponent(property.title)}`)}
                        sx={{
                          mt: 2,
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
                        Message
                      </Button>
                    </Box>
                  </Box>
                </Paper>
                {/* About Section */}
                <Paper className="about-section mt-4" elevation={0}>
                  <Typography className="section-title" component="h2">About the Property</Typography>
                  <Typography className="about-text">
                    {property.description || 'No description available.'}
                  </Typography>
                </Paper>

                {/* Airport Pickup Service Section */}
                {airportPickupService.enabled && (
                  <Paper className="about-section mt-4" elevation={0} sx={{ bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <Typography className="section-title" component="h2">Airport Pickup Service</Typography>
                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={bookPickupService}
                            onChange={(e) => setBookPickupService(e.target.checked)}
                            sx={{ color: '#AD542D', '&.Mui-checked': { color: '#AD542D' } }}
                          />
                        }
                        label="Are you booking a pickup service?"
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
                                  {airportPickupService.airport}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <AccessTimeIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>Pickup Time</Typography>
                                <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                                  {airportPickupService.pickupStartTime} - {airportPickupService.pickupEndTime}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <AttachMoneyIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>Price</Typography>
                                <Typography sx={{ fontWeight: 600, color: '#222222', fontSize: '1.125rem' }}>
                                  {airportPickupService.price}
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                )}

                {/* Guided Tours Service Section */}
                {guidedToursService.enabled && (
                  <Paper className="about-section mt-4" elevation={0} sx={{ bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <Typography className="section-title" component="h2">Guided Tours Service</Typography>
                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={bookGuidedTour}
                            onChange={(e) => setBookGuidedTour(e.target.checked)}
                            sx={{ color: '#AD542D', '&.Mui-checked': { color: '#AD542D' } }}
                          />
                        }
                        label="Are you booking a guided tour?"
                        sx={{ mb: bookGuidedTour ? 3 : 0 }}
                      />

                      {bookGuidedTour && (
                        <Box sx={{ mt: 2 }}>
                          <Stack spacing={3}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <TourIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>Tour Description</Typography>
                                <Typography sx={{ fontWeight: 400, color: '#222222', fontSize: '0.9rem' }}>
                                  {guidedToursService.description}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <ScheduleIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>Duration</Typography>
                                <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                                  {guidedToursService.duration}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <AttachMoneyIcon sx={{ color: '#AD542D', fontSize: 24, mt: 0.5 }} />
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', color: '#717171', mb: 0.5 }}>Price</Typography>
                                <Typography sx={{ fontWeight: 600, color: '#222222', fontSize: '1.125rem' }}>
                                  {guidedToursService.price}
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
                  <Typography className="section-title" component="h2">Roles</Typography>
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
                  <Row>
                    <Col md={6}>
                      <Paper className="calendar-widget" elevation={0}>
                        <Box className="calendar-header">
                          <Button size="small" onClick={() => handlePrevMonth(1)}><ChevronLeftIcon /></Button>
                          <Typography component="span" className="month-year">{formatMonthYear(calendar1Month)}</Typography>
                          <Button size="small" onClick={() => handleNextMonth(1)}><ChevronRightIcon /></Button>
                        </Box>
                        <Box className="calendar-grid">
                          <Box className="calendar-weekdays">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                              <Box key={day}>{day}</Box>
                            ))}
                          </Box>
                          <Box className="calendar-days">
                            {calendar1Days.slice(0, 35).map((d, idx) => (
                              <Box
                                key={idx}
                                className={`day ${d.isOtherMonth ? 'other-month' : ''} ${!d.isOtherMonth && d.day === selectedDate1 ? 'selected start-range' : ''}`}
                                onClick={() => !d.isOtherMonth && setSelectedDate1(d.day)}
                              >
                                {d.day}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Paper>
                    </Col>
                    <Col md={6}>
                      <Paper className="calendar-widget" elevation={0}>
                        <Box className="calendar-header">
                          <Button size="small" onClick={() => handlePrevMonth(2)}><ChevronLeftIcon /></Button>
                          <Typography component="span" className="month-year">{formatMonthYear(calendar2Month)}</Typography>
                          <Button size="small" onClick={() => handleNextMonth(2)}><ChevronRightIcon /></Button>
                        </Box>
                        <Box className="calendar-grid">
                          <Box className="calendar-weekdays">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                              <Box key={day}>{day}</Box>
                            ))}
                          </Box>
                          <Box className="calendar-days">
                            {calendar2Days.slice(0, 35).map((d, idx) => (
                              <Box
                                key={idx}
                                className={`day ${d.isOtherMonth ? 'other-month' : ''} ${!d.isOtherMonth && d.day === selectedDate2 ? 'selected single' : ''}`}
                                onClick={() => !d.isOtherMonth && setSelectedDate2(d.day)}
                              >
                                {d.day}
                              </Box>
                            ))}
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
                    <Col lg={8}>
                      <Box className="reviews-list">
                        {reviews.length > 0 ? reviews.map((review) => (
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
                              <Typography className="helpful-text">Was this review helpful to you?</Typography>
                            </Box>
                          </Box>
                        )) : (
                          <Typography sx={{ color: '#717171' }}>No reviews yet.</Typography>
                        )}
                      </Box>
                    </Col>
                    <Col lg={4}>
                      <Paper className="rating-summary" elevation={0}>
                        <Box className="average-rating">
                          <Typography className="rating-title">Average rating</Typography>
                          <Typography className="rating-score">{ratingStats.average}/5</Typography>
                          <Box className="stars">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} sx={{ fontSize: 16, color: i < Math.round(ratingStats.average) ? '#ffc107' : '#e9ecef' }} />
                            ))}
                          </Box>
                          <Typography className="total-reviews">({ratingStats.total} reviews)</Typography>
                        </Box>
                        <Box className="rating-breakdown">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count = ratingStats.breakdown[stars] ?? 0
                            const pct = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0
                            return (
                              <Box key={stars} className="rating-bar">
                                <Typography className="rating-label">{stars} star</Typography>
                                <Box className="bar-container">
                                  <Box className="bar-fill" sx={{ width: `${pct}%` }}></Box>
                                </Box>
                                <Typography className="rating-count">{count}</Typography>
                              </Box>
                            )
                          })}
                        </Box>
                      </Paper>
                    </Col>
                  </Row>
                  <Box className="text-center mt-4">
                    <Button className="explore-more" variant="contained">Explore More</Button>
                  </Box>
                </Box>

              </Col>
            </Row>
          </RBContainer>
        </section>

        {/* Popular Stays Section */}
        <section className="popular-stays-section">
          <RBContainer>
            <Typography className="section-title" component="h2">Popular Stays Near You</Typography>
            <Row className="g-4">
              {relatedProperties.length > 0 ? relatedProperties.map((stay) => (
                <Col key={stay.id} lg={4} md={6}>
                  <FeaturedCard
                    image={stay.image || PLACEHOLDER_IMAGE}
                    title={stay.title}
                    location={stay.location}
                    price={typeof stay.price === 'number' ? stay.price : Number(stay.price) || 0}
                    id={stay.id}
                  />
                </Col>
              )) : (
                <Col lg={12}>
                  <Typography sx={{ color: '#717171' }}>No related properties at the moment.</Typography>
                </Col>
              )}
            </Row>
          </RBContainer>
        </section>
      </main>
      <Footer />
    </Box>
  )
}
