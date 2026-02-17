import React, { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PopularStays from '../components/PopularStays'
import HorizontalScrollSection from '../components/HorizontalScrollSection'
import { useLanguage } from '../hooks/use-language'
import { Box, Button, TextField, Popover, Stack, Typography, IconButton, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LocationOnIcon from '@mui/icons-material/LocationOn'
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
  const { t } = useLanguage()
  const pageProps = usePage().props as {
    featuredProperties?: Property[]
    favoriteProperties?: Property[]
    popularProperties?: Property[]
    popularDestinations?: Destination[]
  }
  
  const featuredProperties = pageProps.featuredProperties || []
  const favoriteProperties = pageProps.favoriteProperties || []
  const popularProperties = pageProps.popularProperties || []
  const popularDestinations = pageProps.popularDestinations || []
  const guestsAnchorRef = useRef<HTMLDivElement>(null)
  const destinationAnchorRef = useRef<HTMLDivElement>(null)
  const [destination, setDestination] = useState('California')
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [guestsOpen, setGuestsOpen] = useState(false)
  const [destinationOpen, setDestinationOpen] = useState(false)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)

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
    setGuestsOpen(!guestsOpen)
  }

  const handleGuestsClose = () => {
    setGuestsOpen(false)
  }

  const handleDestinationClick = () => {
    setDestinationOpen(!destinationOpen)
  }

  const handleDestinationClose = () => {
    setDestinationOpen(false)
  }

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
    if (type === 'adults') setAdults(prev => Math.max(1, prev - 1))
    if (type === 'children') setChildren(prev => Math.max(0, prev - 1))
    if (type === 'rooms') setRooms(prev => Math.max(1, prev - 1))
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
  }))

  const favoritesItems = favoriteProperties.map(property => ({
    id: property.id,
    image: property.image || '/images/popular-stay-1.svg',
    title: property.title,
    location: property.location,
    price: property.price,
    rating: property.rating || 0,
    reviews: property.reviews || 0,
    isGuestFavorite: property.isGuestFavorite || false,
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
                      <Box className="search-field" ref={destinationAnchorRef} onClick={handleDestinationClick}>
                        <label htmlFor="destination">Destination</label>
                        <TextField
                          id="destination"
                          name="destination"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="Where are you going?"
                          variant="standard"
                          InputProps={{ 
                            disableUnderline: true,
                            readOnly: true,
                            endAdornment: <KeyboardArrowDownIcon sx={{ color: '#717171', fontSize: 20 }} />
                          }}
                          sx={{ 
                            '& .MuiInput-input': { border: 'none', padding: 0, cursor: 'pointer' },
                            cursor: 'pointer'
                          }}
                        />
                      </Box>
                      <Popover
                        open={destinationOpen}
                        anchorEl={destinationAnchorRef.current}
                        onClose={handleDestinationClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left',
                        }}
                        PaperProps={{
                          sx: {
                            mt: 1,
                            borderRadius: 3,
                            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                            width: { xs: 'calc(100vw - 32px)', sm: 400 },
                            maxWidth: 600
                          }
                        }}
                      >
                        <Paper elevation={0} sx={{ p: 3, overflow: 'hidden' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {t('home.where_to')}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222222', mb: 2, fontSize: '0.875rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {t('home.popular_destinations_label')}
                          </Typography>
                          <Stack spacing={0}>
                            {displayDestinations.map((dest, index) => (
                              <Box
                                key={index}
                                onClick={() => handleDestinationSelect(dest.name)}
                                sx={{
                                  p: 2,
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
                                  <LocationOnIcon sx={{ color: '#222222', fontSize: 20, mt: 0.5, flexShrink: 0 }} />
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
                      <Box className="search-field">
                        <label htmlFor="checkin">{t('home.checkin')}</label>
                        <TextField
                          id="checkin"
                          name="checkin"
                          type="date"
                          value={checkin}
                          onChange={(e) => setCheckin(e.target.value)}
                          variant="standard"
                          InputProps={{ disableUnderline: true }}
                          sx={{ '& .MuiInput-input': { border: 'none', padding: 0 } }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      <Box className="search-field">
                        <label htmlFor="checkout">{t('home.checkout')}</label>
                        <TextField
                          id="checkout"
                          name="checkout"
                          type="date"
                          value={checkout}
                          onChange={(e) => setCheckout(e.target.value)}
                          variant="standard"
                          InputProps={{ disableUnderline: true }}
                          sx={{ '& .MuiInput-input': { border: 'none', padding: 0 } }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      <Box className="search-field" ref={guestsAnchorRef}>
                        <label htmlFor="guests">{t('home.guests')}</label>
                        <Box
                          onClick={handleGuestsClick}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            py: 0.5
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 18, color: '#717171' }} />
                          <Typography sx={{ color: '#222222', fontSize: '0.875rem', fontWeight: 400 }}>
                            {getGuestsText()}
                          </Typography>
                          <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#717171' }} />
                        </Box>
                      </Box>
                      <Popover
                        open={guestsOpen}
                        anchorEl={guestsAnchorRef.current}
                        onClose={handleGuestsClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left',
                        }}
                        PaperProps={{
                          sx: {
                            mt: 1,
                            minWidth: 320,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            p: 3
                          }
                        }}
                      >
                        <Stack spacing={3} useFlexGap>
                          {/* Adults */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 600, color: '#222222' }}>{t('home.adults')}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #E5E7EB', borderRadius: 2, px: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleDecrement('adults')}
                                disabled={adults <= 1}
                                sx={{
                                  color: adults <= 1 ? '#D1D5DB' : '#AD542D',
                                  '&:hover': { bgcolor: adults <= 1 ? 'transparent' : '#FFF5F7' },
                                  '&.Mui-disabled': { color: '#D1D5DB' }
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: '#222222' }}>
                                {adults}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleIncrement('adults')}
                                sx={{
                                  color: '#AD542D',
                                  '&:hover': { bgcolor: '#FFF5F7' }
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Children */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 600, color: '#222222' }}>{t('home.children')}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #E5E7EB', borderRadius: 2, px: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleDecrement('children')}
                                disabled={children <= 0}
                                sx={{
                                  color: children <= 0 ? '#D1D5DB' : '#AD542D',
                                  '&:hover': { bgcolor: children <= 0 ? 'transparent' : '#FFF5F7' },
                                  '&.Mui-disabled': { color: '#D1D5DB' }
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: '#222222' }}>
                                {children}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleIncrement('children')}
                                sx={{
                                  color: '#AD542D',
                                  '&:hover': { bgcolor: '#FFF5F7' }
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Rooms */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 600, color: '#222222' }}>{t('home.rooms')}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #E5E7EB', borderRadius: 2, px: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleDecrement('rooms')}
                                disabled={rooms <= 1}
                                sx={{
                                  color: rooms <= 1 ? '#D1D5DB' : '#AD542D',
                                  '&:hover': { bgcolor: rooms <= 1 ? 'transparent' : '#FFF5F7' },
                                  '&.Mui-disabled': { color: '#D1D5DB' }
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: '#222222' }}>
                                {rooms}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleIncrement('rooms')}
                                sx={{
                                  color: '#AD542D',
                                  '&:hover': { bgcolor: '#FFF5F7' }
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Done Button */}
                          <Button
                            onClick={handleGuestsClose}
                            variant="outlined"
                            fullWidth
                            sx={{
                              borderColor: '#AD542D',
                              color: '#AD542D',
                              borderRadius: 2,
                              py: 1.5,
                              fontWeight: 600,
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: '#78381C',
                                bgcolor: '#FFF5F7'
                              }
                            }}
                          >
                            {t('home.done')}
                          </Button>
                        </Stack>
                      </Popover>
                      <Button type="submit" className="search-button">
                        <SearchIcon sx={{ fontSize: '1.3rem' }} />
                        <span>{t('home.search')}</span>
                      </Button>
                    </Box>
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
      <section className="favorites-section" style={{ flex: 1 }}>
        <RBContainer fluid>
          <HorizontalScrollSection 
            title={t('home.favorites')}
            items={favoritesItems}
            emptyMessage={t('home.no_favorites')}
            emptySubtext={t('home.no_favorites_sub')}
          />
        </RBContainer>
      </section>
      <Footer />
    </div>
  )
}


