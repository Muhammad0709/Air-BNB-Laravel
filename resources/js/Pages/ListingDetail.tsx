import { useState } from 'react'
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
import { router, Head } from '@inertiajs/react'
import MessageIcon from '@mui/icons-material/Message'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TourIcon from '@mui/icons-material/Tour'
import ScheduleIcon from '@mui/icons-material/Schedule'

// Images served from public directory
const img1 = '/images/popular-stay-1.svg'
const img2 = '/images/popular-stay-2.svg'
const img3 = '/images/popular-stay-3.svg'

export default function ListingDetail() {
  const [calendar1Month, setCalendar1Month] = useState(new Date(2025, 7, 1))
  const [calendar2Month, setCalendar2Month] = useState(new Date(2025, 7, 1))
  const [selectedDate1, setSelectedDate1] = useState(6)
  const [selectedDate2, setSelectedDate2] = useState(11)
  const [bookPickupService, setBookPickupService] = useState(false)
  const [bookGuidedTour, setBookGuidedTour] = useState(false)

  // Airport Pickup Service Data (mock data - in real app, fetch from API)
  const airportPickupService = {
    enabled: true,
    airport: 'Los Angeles International Airport (LAX)',
    pickupStartTime: '08:00',
    pickupEndTime: '22:00',
    price: '$50'
  }

  // Guided Tours Service Data (mock data - in real app, fetch from API)
  const guidedToursService = {
    enabled: true,
    description: 'Explore the beautiful city with our expert local guide. Visit historical landmarks, cultural sites, and hidden gems. Experience authentic local cuisine and learn about the rich history and traditions of the area.',
    duration: 'Half Day (4-5 hours)',
    price: '$75'
  }

  const galleryImages = [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585152915-d208bec867a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ]

  // Get images for grid layout: 1 large + 2 medium + 5 small = 8 images
  const displayedImages = galleryImages.slice(0, 8)
  const remainingCount = galleryImages.length - displayedImages.length

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

    const days = []
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

  const reviews = [
    { name: 'Chirstina Perry', date: '14 Nov, 2021', rating: 4, text: 'Thank you very fast shipping from Poland only 3days. Very Greateful.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'John Smith', date: '10 Nov, 2021', rating: 5, text: 'Amazing property with beautiful views. Highly recommended!', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Sarah Johnson', date: '5 Nov, 2021', rating: 4, text: 'Great location and excellent amenities. Will definitely come back.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
  ]

  const popularStays = [
    { image: img1, title: 'Luxury Beachfront Villa Luxury Bea...', location: 'Malibu, California', price: 299 },
    { image: img2, title: 'Luxury Beachfront Villa Luxury Bea...', location: 'Malibu, California', price: 299 },
    { image: img3, title: 'Luxury Beachfront Villa Luxury Bea...', location: 'Malibu, California', price: 299 },
  ]

  return (
    <Box>
      <Head title="Property Detail" />
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
                        Luxury Beachfront Villa Luxury <br /> Beachfront Vi
                      </Typography>
                      <Box className="property-meta">
                        <Box className="location">
                          <LocationOnIcon sx={{ fontSize: 16 }} />
                          <span>Malibu, California</span>
                        </Box>
                        <Box className="rating">
                          <Box className="stars">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} sx={{ fontSize: 14, color: '#FFD700' }} />
                            ))}
                          </Box>
                          <Typography className="rating-text">(123)</Typography>
                        </Box>
                      </Box>
                    </Col>
                    <Col md={2}>
                      <Box className="booking-info">
                        <Box className="price">
                          <Typography component="span" className="price-amount">$299</Typography>
                          <Typography component="span" className="price-period">/night</Typography>
                        </Box>
                        <Button
                          variant="contained"
                          className="btn-book"
                          onClick={() => router.visit('/booking')}
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
                      alt="Property 1"
                      className="gallery-image"
                    />
                  </button>
                </Box>
                <Box className="gallery-right-section">
                  <Box className="gallery-medium-item">
                    <button type="button" className="gallery-image-button">
                      <img
                        src={displayedImages[1]}
                        alt="Property 2"
                        className="gallery-image"
                      />
                    </button>
                  </Box>
                  <Box className="gallery-medium-item">
                    <button type="button" className="gallery-image-button">
                      <img
                        src={displayedImages[2]}
                        alt="Property 3"
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
                        alt={`Property ${idx + 4}`}
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
                      <Typography component="span" className="info-number">2</Typography>
                      <Typography component="span" className="info-label">Bedrooms</Typography>
                    </Box>
                  </Box>
                </Col>
                <Col md={6} sm={6}>
                  <Box className="info-item d-flex gap-2">
                    <Box className="info-icon">
                    <BathroomIcon sx={{ color: '#AD542D', fontSize: '24px', width: '24px', height: '24px',mr: 1.5 }} />
                    </Box>
                    <Typography component="span" className="info-number">3</Typography>
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
                      <Typography component="span" className="info-number">4</Typography>
                      <Typography component="span" className="info-label">Guests</Typography>
                    </Box>
                  </Box>
                </Col>
                <Col md={6} sm={6}>
                  <Box className="info-item d-flex gap-2">
                    <Box className="info-icon">
                    <HomeIcon sx={{ color: '#AD542D', fontSize: '24px', width: '24px', height: '24px',mr: 1.5 }} />
                    </Box>
                    <Typography component="span" className="info-label">Entire apartment</Typography>
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
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Aisha M." style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    </Box>
                    <Box className="host-details" sx={{ flex: 1 }}>
                      <Typography className="host-name" component="h5">Hosted by Aisha M.</Typography>
                      <Typography className="host-joined">joined in 2021</Typography>
                      <Typography className="host-description">
                        Aisha is a passionate traveler and local expert in Lahore, dedicated to providing guests with exceptional stays. She takes pride in ensuring her properties are clean, comfortable, and well-equipped for a memorable experience. Aisha is always available to offer recommendations and assistance during your visit.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<MessageIcon />}
                        onClick={() => router.visit('/chat?host=Aisha M.&property=Luxury Beachfront Villa')}
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
                    Experience unparalleled comfort and convenience in our modern apartment located right in the heart of Lahore. Designed with sophisticated aesthetics and equipped with all essential amenities, this apartment offers a serene escape amidst the bustling city. Perfect for families, business travelers, or anyone looking to explore Lahore with ease, our property ensures a memorable stay with its prime location and luxurious features. Enjoy spacious living areas, a fully equipped kitchen, and breathtaking city views from large windows.
                  </Typography>
                  <Typography className="about-text">
                    Experience unparalleled comfort and convenience in our modern apartment located right in the heart of Lahore. Designed with sophisticated aesthetics and equipped with all essential amenities, this apartment offers a serene escape amidst the bustling city.
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
                    <Typography className="reviews-title" component="h2">Reviews (120)</Typography>
                    <Col lg={8}>
                      <Box className="reviews-list">
                        {reviews.map((review, idx) => (
                          <Box key={idx} className="review-item">
                            <Box className="reviewer-info">
                              <Box className="reviewer-avatar">
                                <img src={review.avatar} alt={review.name} />
                              </Box>
                              <Typography className="reviewer-name">{review.name}</Typography>
                              <Typography className="review-date">{review.date}</Typography>
                            </Box>
                            <Box className="review-content">
                              <Box className="stars">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon key={i} sx={{ fontSize: 14, color: i < review.rating ? '#ffc107' : '#e9ecef' }} />
                                ))}
                              </Box>
                              <Typography className="review-text">{review.text}</Typography>
                              <Typography className="helpful-text">Was this review helpful to you?</Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Col>
                    <Col lg={4}>
                      <Paper className="rating-summary" elevation={0}>
                        <Box className="average-rating">
                          <Typography className="rating-title">Average rating</Typography>
                          <Typography className="rating-score">4/5</Typography>
                          <Box className="stars">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} sx={{ fontSize: 16, color: i < 4 ? '#ffc107' : '#e9ecef' }} />
                            ))}
                          </Box>
                          <Typography className="total-reviews">(8.24kreviews)</Typography>
                        </Box>
                        <Box className="rating-breakdown">
                          {[
                            { label: '5 star', width: 40, count: '32K' },
                            { label: '4 star', width: 60, count: '54K' },
                            { label: '3 star', width: 45, count: '37K' },
                            { label: '2 star', width: 50, count: '42K' },
                            { label: '1 star', width: 70, count: '65K' },
                          ].map((r, idx) => (
                            <Box key={idx} className="rating-bar">
                              <Typography className="rating-label">{r.label}</Typography>
                              <Box className="bar-container">
                                <Box className="bar-fill" sx={{ width: `${r.width}%` }}></Box>
                              </Box>
                              <Typography className="rating-count">{r.count}</Typography>
                            </Box>
                          ))}
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
              {popularStays.map((stay, idx) => (
                <Col key={idx} lg={4} md={6}>
                  <FeaturedCard image={stay.image} title={stay.title} location={stay.location} price={stay.price} id={idx + 1} />
                </Col>
              ))}
            </Row>
          </RBContainer>
        </section>
      </main>
      <Footer />
    </Box>
  )
}
