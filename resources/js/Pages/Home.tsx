import React, { useState, useRef, useMemo, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PopularStays from '../components/PopularStays'
import HorizontalScrollSection from '../components/HorizontalScrollSection'
import { useLanguage } from '../hooks/use-language'
import { Box, Button, TextField, Popover, Stack, Typography, IconButton, Paper, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import HomeDatePicker from '../components/HomeDatePicker'
import { Container, Row, Col, Container as RBContainer } from 'react-bootstrap'
import { router, usePage } from '@inertiajs/react'

interface Property {
  id: number | string
  title: string
  location: string
  price: number
  rating?: number
  reviews?: number
  image: string
  isGuestFavorite?: boolean
}

interface Destination {
  name: string
  location: string
}

export default function Home() {
  const { t, isRtl } = useLanguage()
  const pageProps = usePage().props as {
    featuredProperties?: Property[]
    popularProperties?: Property[]
    popularDestinations?: Destination[]
  }
  
  const featuredProperties = pageProps.featuredProperties || []
  const popularProperties = pageProps.popularProperties || []
  const popularDestinations = pageProps.popularDestinations || []
  const guestsAnchorRef = useRef<HTMLDivElement>(null)
  const destinationAnchorRef = useRef<HTMLDivElement>(null)
  const destinationPopoverPaperRef = useRef<HTMLElement | null>(null)
  /** After closing popover, Modal restores focus to the anchor — that re-fires onFocus and reopens. */
  const ignoreDestinationFocusOpenRef = useRef(false)
  const [destination, setDestination] = useState('')
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [guestsOpen, setGuestsOpen] = useState(false)
  const [destinationOpen, setDestinationOpen] = useState(false)
  const [datesOpen, setDatesOpen] = useState(false)
  const [adults, setAdults] = useState(0)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(0)

  // Calculate number of nights between check-in and check-out
  const calculateNights = () => {
    if (!checkin || !checkout) return undefined
    const checkInDate = new Date(checkin)
    const checkOutDate = new Date(checkout)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : undefined
  }

  const nights = calculateNights()

  // Use dynamic popular destinations from backend, fallback to default if empty
  const defaultDestinations: Destination[] = [
    { name: 'Madinah', location: 'Al Madinah Province, Saudi Arabia' },
    { name: 'Makkah', location: 'Makkah Province, Saudi Arabia' },
    { name: 'Great Mosque of Makkah', location: 'Makkah Province, Saudi Arabia' },
    { name: 'Prophet\'s Mosque', location: 'Al Madinah Province, Saudi Arabia' },
    { name: 'New York', location: 'New York, United States of America' },
    { name: 'Islamabad', location: 'Federal Capital Territory, Pakistan' },
  ]
  
  const displayDestinations = popularDestinations.length > 0 ? popularDestinations : defaultDestinations

  const filteredDestinations = useMemo(() => {
    const q = destination.trim().toLowerCase()
    if (!q) return displayDestinations
    return displayDestinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
    )
  }, [displayDestinations, destination])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination) params.set('location', destination)
    if (checkin) params.set('checkin', checkin)
    if (checkout) params.set('checkout', checkout)
    params.set('adults', adults.toString())
    if (children > 0) params.set('children', children.toString())
    params.set('rooms', rooms.toString())
    router.visit(`/search?${params.toString()}`)
  }

  const handleGuestsClick = () => {
    setDestinationOpen(false)
    setDatesOpen(false)
    setGuestsOpen((current) => !current)
  }

  const handleGuestsClose = () => {
    setGuestsOpen(false)
  }

  const handleDestinationClose = () => {
    setDestinationOpen(false)
  }


  useEffect(() => {
    if (!destinationOpen) return

    const isInsideDestinationUi = (target: Node) =>
      Boolean(
        destinationAnchorRef.current?.contains(target) ||
          destinationPopoverPaperRef.current?.contains(target)
      )

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!target || !(target instanceof Node)) return
      if (isInsideDestinationUi(target)) return
      ignoreDestinationFocusOpenRef.current = true
      setDestinationOpen(false)
      window.setTimeout(() => {
        ignoreDestinationFocusOpenRef.current = false
      }, 200)
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [destinationOpen])

  useEffect(() => {
    if (!datesOpen && !guestsOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      if (
        datesOpen &&
        !target.closest('.search-field-when') &&
        !target.closest('.home-calendar-popover')
      ) {
        setDatesOpen(false)
      }

      if (
        guestsOpen &&
        !target.closest('.search-field-guests') &&
        !target.closest('.home-guests-popover')
      ) {
        setGuestsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [datesOpen, guestsOpen])

  const handleDestinationSelect = (name: string) => {
    setDestination(name)
    setDestinationOpen(false)
  }

  const handleIncrement = (type: 'adults' | 'children' | 'rooms') => {
    if (type === 'adults') setAdults(prev => prev + 1)
    if (type === 'children') setChildren(prev => prev + 1)
    if (type === 'rooms') setRooms(prev => prev + 1)
  }

  const handleDecrement = (type: 'adults' | 'children' | 'rooms') => {
    if (type === 'adults') setAdults(prev => Math.max(0, prev - 1))
    if (type === 'children') setChildren(prev => Math.max(0, prev - 1))
    if (type === 'rooms') setRooms(prev => Math.max(0, prev - 1))
  }

  const getGuestsText = () => {
    const parts: string[] = []
    parts.push(`${adults} ${adults === 1 ? t('home.adult') : t('home.adults')}`)
    if (children > 0) parts.push(`${children} ${children === 1 ? t('home.child') : t('home.children')}`)
    parts.push(`${rooms} ${rooms === 1 ? t('home.room') : t('home.rooms')}`)
    return parts.join(' · ')
  }

  // Use dynamic properties from backend
  const featuredItems = featuredProperties.map(property => ({
    id: property.id,
    image: property.image || '/images/filter-1.svg',
    title: property.title,
    location: property.location,
    price: property.price,
    rating: property.rating || 0,
    reviews: property.reviews || 0,
    isGuestFavorite: property.isGuestFavorite || false,
    nights: nights,
  }))

  const popularItems = popularProperties.map(property => ({
    id: property.id,
    image: property.image || '/images/filter-1.svg',
    title: property.title,
    location: property.location,
    price: property.price,
    rating: property.rating || 0,
    reviews: property.reviews || 0,
    isGuestFavorite: property.isGuestFavorite || false,
    nights: nights,
  }))

  return (
    <div className="index-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      {/* Hero Section */}
      <section className="hero-section">
        {/* <Container>
          <Box className="hero-content">
            <Row className="justify-content-center">
              <Col lg={8} className="text-center">
                <h1 className="hero-title">Find Your Perfect Stay, Anytime, Anywhere</h1>
                <p className="hero-subtitle">Discover a diverse selection of rentals, from cozy apartments to luxurious villas, tailored to your preferences.</p>
              </Col>
            </Row>
          </Box>
        </Container> */}

        {/* Search Form - Positioned at bottom */}
        <Box className="hero-search-wrapper">
          <Container>
            <Row className="justify-content-center">
              <Col lg={12}>
                <Box className="hero-search-form">
                  <form className="search-form" onSubmit={handleSearch}>
                    <Box className="search-input-group">
                      <Box
                        className={`search-field search-field-destination${destination ? ' has-value' : ''}${destinationOpen ? ' active' : ''}`}
                        ref={destinationAnchorRef}
                        onClick={() => {
                          setDatesOpen(false)
                          setGuestsOpen(false)
                          setDestinationOpen(true)
                        }}
                      >
                        <label className="search-field-label" htmlFor="destination">{t('home.where_to')}</label>
                        <TextField
                          id="destination"
                          name="destination"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          onFocus={() => {
                            if (ignoreDestinationFocusOpenRef.current) return
                            setDatesOpen(false)
                            setGuestsOpen(false)
                            setDestinationOpen(true)
                          }}
                          placeholder={t('home.search_destinations_placeholder')}
                          variant="standard"
                          autoComplete="off"
                          InputProps={{
                            disableUnderline: true,
                          }}
                          sx={{
                            '& .MuiInput-input': {
                              border: 'none',
                              padding: 0,
                              cursor: 'text',
                              fontWeight: 400,
                              color: destination ? '#222222' : '#717171',
                            },
                            '& .MuiInput-input::placeholder': { color: '#717171', opacity: 1 },
                          }}
                        />
                      </Box>
                      <HomeDatePicker checkin={checkin} checkout={checkout} onCheckinChange={setCheckin} onCheckoutChange={setCheckout} whenLabel={t('home.when')} addDatesLabel={t('home.add_dates')} checkinLabel={t('home.checkin')} checkoutLabel={t('home.checkout')} isRtl={isRtl} open={datesOpen} onOpenChange={(nextOpen) => { if (nextOpen) { setDestinationOpen(false); setGuestsOpen(false) } setDatesOpen(nextOpen) }} />
                      <Box className={`search-guests-action-group${guestsOpen ? ' active' : ''}`}>
                        <Box className={`search-field search-field-guests${(adults > 0 || children > 0 || rooms > 0) ? ' has-value' : ''}${guestsOpen ? ' active' : ''}`} ref={guestsAnchorRef} onClick={handleGuestsClick}>
                          <label className="search-field-label" htmlFor="guests">{t('home.who')}</label>
                          <Box className="search-field-guests-value" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', py: 0.5 }}>
                            <Typography component="span" sx={{ color: (adults === 0 && children === 0 && rooms === 0) ? '#717171' : '#222222', fontSize: '0.875rem', fontWeight: 400 }}>
                              {adults === 0 && children === 0 && rooms === 0 ? t('home.add_guests_placeholder') : getGuestsText()}
                            </Typography>
                          </Box>
                        </Box>
                        <Button type="submit" className="search-button" aria-label={t('home.search')}>
                          <SearchIcon sx={{ fontSize: '1.75rem' }} />
                          <span>{t('home.search')}</span>
                        </Button>
                      </Box>
                    </Box>
                    <Popover
                      open={destinationOpen}
                      anchorEl={() => destinationAnchorRef.current?.closest('.hero-search-form') as HTMLElement}
                      onClose={handleDestinationClose}
                      disableRestoreFocus
                      slotProps={{
                        root: {
                          sx: { zIndex: (theme) => (theme.vars || theme).zIndex.modal, pointerEvents: 'none' },
                        },
                        paper: {
                          ref: destinationPopoverPaperRef,
                          className: 'home-destination-popover',
                          sx: {
                            pointerEvents: 'auto',
                            mt: 1,
                            borderRadius: { xs: '22px', sm: '28px' },
                            boxShadow: '0 18px 48px rgba(16,24,40,0.16)',
                            width: { xs: 'calc(100vw - 32px)', sm: 560 },
                            maxWidth: 'calc(100vw - 32px)',
                          },
                        },
                      }}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                    >
                      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, overflow: 'hidden' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 2, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          Suggested destinations
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={t('home.search_destinations_placeholder')}
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          autoComplete="off"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#717171', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                          }}
                        />
                        <Stack className="home-destination-list" spacing={0} sx={{ maxHeight: { xs: 360, sm: 430 }, overflow: 'auto' }}>
                          {filteredDestinations.length === 0 && destination.trim() ? (
                            <Typography variant="body2" sx={{ color: '#717171', py: 1.5, px: 0.5 }}>
                              {t('home.search_no_suggestions')}
                            </Typography>
                          ) : null}
                          {filteredDestinations.map((dest, index) => (
                            <Box
                              key={index}
                              className={`home-destination-option tone-${index % 4}`}
                              onClick={() => handleDestinationSelect(dest.name)}
                              sx={{
                                cursor: 'pointer',
                                borderRadius: 2,
                                transition: 'background-color 0.2s',
                                minWidth: 0,
                                '&:hover': {
                                  bgcolor: '#F7F7F7'
                                }
                              }}
                            >
                              <Stack direction="row" spacing={2} useFlexGap alignItems="flex-start" sx={{ minWidth: 0 }}>
                                <Box className="home-destination-icon"><LocationOnIcon /></Box>
                                <Stack spacing={0.5} sx={{ minWidth: 0, overflow: 'hidden' }}>
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#222222', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                    {dest.name}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#717171', fontSize: '0.875rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                    {dest.location}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    </Popover>
                    <Popover
                      open={guestsOpen}
                      anchorEl={() => guestsAnchorRef.current?.closest('.hero-search-form') as HTMLElement}
                      onClose={handleGuestsClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: isRtl ? 'left' : 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: isRtl ? 'left' : 'right',
                      }}
                      marginThreshold={16}
                      slotProps={{
                        root: {
                          sx: { zIndex: (theme) => (theme.vars || theme).zIndex.modal, pointerEvents: 'none' },
                        },
                        paper: {
                          className: 'home-guests-popover',
                          sx: {
                            pointerEvents: 'auto',
                            mt: 1,
                            boxSizing: 'border-box',
                            width: { xs: 'calc(100vw - 32px)', sm: 560 },
                            maxWidth: 'calc(100vw - 32px)',
                            borderRadius: { xs: '22px', sm: '28px' },
                            boxShadow: '0 18px 48px rgba(16,24,40,0.16)',
                            p: { xs: 2.5, sm: 4 },
                          },
                        },
                      }}
                    >
                      <Stack className="home-guests-list" useFlexGap>
                        <Box className="home-guest-row">
                          <Typography className="home-guest-label">{t('home.adults')}</Typography>
                          <Box className="home-guest-counter">
                            <IconButton
                              size="small"
                              onClick={() => handleDecrement('adults')}
                              disabled={adults <= 0}
                              className="home-guest-stepper"
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: '#222222' }}>
                              {adults}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleIncrement('adults')}
                              className="home-guest-stepper"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box className="home-guest-row">
                          <Typography className="home-guest-label">{t('home.children')}</Typography>
                          <Box className="home-guest-counter">
                            <IconButton
                              size="small"
                              onClick={() => handleDecrement('children')}
                              disabled={children <= 0}
                              className="home-guest-stepper"
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: '#222222' }}>
                              {children}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleIncrement('children')}
                              className="home-guest-stepper"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box className="home-guest-row">
                          <Typography className="home-guest-label">{t('home.rooms')}</Typography>
                          <Box className="home-guest-counter">
                            <IconButton
                              size="small"
                              onClick={() => handleDecrement('rooms')}
                              disabled={rooms <= 0}
                              className="home-guest-stepper"
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: '#222222' }}>
                              {rooms}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleIncrement('rooms')}
                              className="home-guest-stepper"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Stack>
                    </Popover>
                  </form>
                </Box>
              </Col>
            </Row>
          </Container>
        </Box>
      </section>

      <section className="featured-section">
        <RBContainer fluid>
          <HorizontalScrollSection 
            title={t('home.hotels')}
            items={featuredItems}
            emptyMessage={t('home.no_hotels')}
            emptySubtext={t('home.no_hotels_sub')}
          />
        </RBContainer>
      </section>
      <section className="popular-stays-section">
        <RBContainer fluid>
          <PopularStays items={popularItems} />
        </RBContainer>
      </section>
      <Footer />
    </div>
  )
}
