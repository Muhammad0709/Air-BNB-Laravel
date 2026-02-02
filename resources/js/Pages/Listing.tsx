import React, { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FeaturedCard from '../components/FeaturedCard'
import Pagination from '../components/Pagination'
import PropertyMap from '../components/PropertyMap'
import { Container as RBContainer, Row, Col } from 'react-bootstrap'
import { Box, Button, Checkbox, Divider, IconButton, InputAdornment, MenuItem, Paper, Select, Slider, Stack, TextField, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import MapIcon from '@mui/icons-material/Map'
import ListIcon from '@mui/icons-material/List'
import { Head, router, usePage } from '@inertiajs/react'

/** Fallback when DB image is null or fails to load */
const DEFAULT_IMAGE = '/images/popular-stay-1.svg'

type Property = {
  id: number
  title: string
  location: string
  price: number
  guests?: number
  bedrooms?: number
  bathrooms?: number
  property_type?: string
  image: string | null
  amenities?: string[]
  rating?: number | null
  reviews?: number
  is_guest_favorite?: boolean
}

type ListingProps = {
  properties: {
    data: Property[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
    first_page_url: string
    last_page_url: string
    prev_page_url: string | null
    next_page_url: string | null
  }
  filters: {
    search: string
    min_price: number
    max_price: number
    property_type: string
    guests: number
    checkin: string | null
    checkout: string | null
    locations: string[]
    amenities: string[]
    sort_by: string
  }
  priceRange: { min: number; max: number }
  propertyTypes: string[]
  availableLocations: string[]
  availableAmenities: string[]
}

export default function Listing() {
  const { props } = usePage()
  const {
    properties = { data: [], current_page: 1, last_page: 1, per_page: 12, total: 0, from: null, to: null, first_page_url: '', last_page_url: '', prev_page_url: null, next_page_url: null },
    filters = { search: '', min_price: 0, max_price: 1000, property_type: '', guests: 1, checkin: null, checkout: null, locations: [], amenities: [], sort_by: 'featured' },
    priceRange = { min: 0, max: 1000 },
    availableLocations = [],
  } = (props as unknown as ListingProps) || {}

  const [search, setSearch] = useState(filters.search || '')
  const [sortBy, setSortBy] = useState(filters.sort_by || 'featured')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCheckin, setSelectedCheckin] = useState<Date | null>(null)
  const [selectedCheckout, setSelectedCheckout] = useState<Date | null>(null)
  const [guests, setGuests] = useState(filters.guests ?? 1)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [localPriceRange, setLocalPriceRange] = useState<number[]>([
    filters.min_price ?? priceRange.min,
    filters.max_price ?? priceRange.max,
  ])
  const [selectedLocations, setSelectedLocations] = useState<string[]>(filters.locations || [])

  useEffect(() => {
    if (filters.checkin) {
      const d = new Date(filters.checkin)
      if (!isNaN(d.getTime())) setSelectedCheckin(d)
    }
    if (filters.checkout) {
      const d = new Date(filters.checkout)
      if (!isNaN(d.getTime())) setSelectedCheckout(d)
    }
  }, [])

  const updateFilters = useCallback((overrides?: Record<string, unknown>) => {
    const params: Record<string, unknown> = {
      search: search || undefined,
      min_price: localPriceRange[0] !== priceRange.min ? localPriceRange[0] : undefined,
      max_price: localPriceRange[1] !== priceRange.max ? localPriceRange[1] : undefined,
      checkin: selectedCheckin ? selectedCheckin.toISOString().split('T')[0] : undefined,
      checkout: selectedCheckout ? selectedCheckout.toISOString().split('T')[0] : undefined,
      guests: guests > 1 ? guests : undefined,
      sort_by: sortBy !== 'featured' ? sortBy : undefined,
      locations: selectedLocations.length > 0 ? selectedLocations : undefined,
    }
    Object.assign(params, overrides)
    router.get('/listing', params, { preserveState: true })
  }, [search, localPriceRange, priceRange.min, priceRange.max, selectedCheckin, selectedCheckout, guests, sortBy, selectedLocations])

  useEffect(() => {
    const timer = setTimeout(() => updateFilters(), 400)
    return () => clearTimeout(timer)
  }, [search, sortBy, guests, selectedLocations, localPriceRange, selectedCheckin, selectedCheckout])

  const handleLocationChange = (location: string, checked: boolean) => {
    const next = checked ? [...selectedLocations, location] : selectedLocations.filter((l) => l !== location)
    setSelectedLocations(next)
  }

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentMonth(newDate)
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
    for (let i = 1; i <= 42 - days.length; i++) {
      days.push({ day: i, isOtherMonth: true })
    }
    return days
  }

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
    if (!date) return { isSelected: false, isInRange: false, isPast: false }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isPast = date < today
    const isSelected =
      (selectedCheckin && date.getTime() === selectedCheckin.getTime()) ||
      (selectedCheckout && date.getTime() === selectedCheckout.getTime())
    const isInRange =
      selectedCheckin && selectedCheckout && date > selectedCheckin && date < selectedCheckout
    return { isSelected, isInRange, isPast }
  }

  const calendarDays = getDaysInMonth(currentMonth)
  const items = properties.data || []
  const minPrice = priceRange.min ?? 0
  const maxPrice = priceRange.max ?? 1000

  return (
    <>
      <Head title="Listing" />
      <Box>
        <Navbar />
        <Box className="listing-page">
          <RBContainer>
            <Row>
              <Col xs={12} md={3}>
                <Paper className="filter-card" elevation={0}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography className="filter-title">Filters</Typography>
                    <IconButton size="small"><ExpandMoreIcon /></IconButton>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />

                  <Typography className="filter-group">Location</Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {availableLocations.length > 0 ? (
                      availableLocations.map((location) => {
                        const count = items.filter((p) =>
                          p.location.toLowerCase().includes(location.toLowerCase())
                        ).length
                        return (
                          <Stack
                            key={location}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            className="check-row"
                          >
                            <Stack direction="row" alignItems="center" spacing={1.2}>
                              <Checkbox
                                size="small"
                                checked={selectedLocations.includes(location)}
                                onChange={(e) => handleLocationChange(location, e.target.checked)}
                              />
                              <Typography className="check-label">{location}</Typography>
                            </Stack>
                            <Typography className="check-count">{count}</Typography>
                          </Stack>
                        )
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary">No locations yet</Typography>
                    )}
                  </Stack>

                  <Typography className="filter-group">Price Range</Typography>
                  <Box sx={{ px: 1 }}>
                    <Slider
                      size="small"
                      value={localPriceRange}
                      onChange={(_, v) => setLocalPriceRange(v as number[])}
                      min={minPrice}
                      max={maxPrice}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `$${v}`}
                      className="price-slider"
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ color: '#9CA3AF', fontSize: 12, mt: 1, mb: 2 }}>
                      <span>${minPrice}</span>
                      <span>${maxPrice}</span>
                    </Stack>
                  </Box>

                  <Typography className="filter-group">Checkin / Checkout</Typography>
                  <Box className="mini-calendar">
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <IconButton size="small" onClick={() => changeMonth(-1)}><RemoveIcon fontSize="small" /></IconButton>
                      <Typography className="cal-month">
                        {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                      </Typography>
                      <IconButton size="small" onClick={() => changeMonth(1)}><AddIcon fontSize="small" /></IconButton>
                    </Stack>
                    <Box className="cal-grid">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <span key={day} className="cal-cell head">{day}</span>
                      ))}
                      {calendarDays.map((d, idx) => {
                        const { isSelected, isInRange, isPast } = getDateState(d.date)
                        const isDisabled = d.isOtherMonth || isPast
                        return (
                          <span
                            key={idx}
                            className={`cal-cell ${d.isOtherMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''} ${isDisabled ? 'disabled' : ''}`}
                            onClick={() => !isDisabled && d.date && handleDateClick(d.date)}
                          >
                            {d.day}
                          </span>
                        )
                      })}
                    </Box>
                  </Box>

                  <Typography className="filter-group">Guest</Typography>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <IconButton size="small" className="guest-btn" onClick={() => setGuests((g) => Math.max(1, g - 1))}><RemoveIcon fontSize="small" /></IconButton>
                    <Box className="guest-count">{guests}</Box>
                    <IconButton size="small" className="guest-btn" onClick={() => setGuests((g) => g + 1)}><AddIcon fontSize="small" /></IconButton>
                  </Stack>
                </Paper>
              </Col>

              <Col xs={12} md={9}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
                  <Typography className="results-text">
                    Showing {properties.from ?? 0}-{properties.to ?? 0} of {properties.total ?? 0} results
                  </Typography>
                  <Stack direction="row" spacing={1.5} flex={1} sx={{ maxWidth: 560, ml: { sm: 'auto' } }}>
                    <TextField
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="search"
                      size="small"
                      fullWidth
                      className="listing-search"
                      InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                    />
                    <Select size="small" value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={{ minWidth: 170 }} className="listing-sort">
                      <MenuItem value="featured">Sort by: Featured</MenuItem>
                      <MenuItem value="price_low">Price: Low to High</MenuItem>
                      <MenuItem value="price_high">Price: High to Low</MenuItem>
                      <MenuItem value="newest">Newest First</MenuItem>
                    </Select>
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        variant={viewMode === 'list' ? 'contained' : 'outlined'}
                        onClick={() => setViewMode('list')}
                        sx={{
                          minWidth: 48, px: 1.5, borderColor: '#DDDDDD',
                          color: viewMode === 'list' ? '#FFFFFF' : '#222222',
                          bgcolor: viewMode === 'list' ? '#AD542D' : 'transparent',
                          '&:hover': { bgcolor: viewMode === 'list' ? '#78381C' : '#F7F7F7', borderColor: '#AD542D' },
                        }}
                      >
                        <ListIcon fontSize="small" />
                      </Button>
                      <Button
                        variant={viewMode === 'map' ? 'contained' : 'outlined'}
                        onClick={() => setViewMode('map')}
                        sx={{
                          minWidth: 48, px: 1.5, borderColor: '#DDDDDD',
                          color: viewMode === 'map' ? '#FFFFFF' : '#222222',
                          bgcolor: viewMode === 'map' ? '#AD542D' : 'transparent',
                          '&:hover': { bgcolor: viewMode === 'map' ? '#78381C' : '#F7F7F7', borderColor: '#AD542D' },
                        }}
                      >
                        <MapIcon fontSize="small" />
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>

                {items.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: '#717171', mb: 1, fontWeight: 600 }}>No properties found</Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Try adjusting your search or filter criteria</Typography>
                  </Box>
                ) : viewMode === 'list' ? (
                  <>
                    <Row className="g-3">
                      {items.map((p) => (
                        <Col key={p.id} xs={12} md={6} lg={6}>
                          <FeaturedCard
                            image={p.image || DEFAULT_IMAGE}
                            title={p.title}
                            location={p.location}
                            price={p.price}
                            id={p.id}
                            rating={p.rating ?? undefined}
                            reviews={p.reviews ?? undefined}
                            isGuestFavorite={p.is_guest_favorite}
                            fallbackImage={DEFAULT_IMAGE}
                          />
                        </Col>
                      ))}
                    </Row>
                    {properties.last_page > 1 && (
                      <Pagination
                        currentPage={properties.current_page}
                        lastPage={properties.last_page}
                        onPageChange={(page) => updateFilters({ page })}
                      />
                    )}
                  </>
                ) : (
                  <Box sx={{ height: 'calc(100vh - 300px)', minHeight: 600, borderRadius: 2, overflow: 'hidden', border: '1px solid #DDDDDD' }}>
                    <PropertyMap
                      properties={items.map((p) => ({
                        id: p.id,
                        title: p.title,
                        location: p.location,
                        price: p.price,
                        image: p.image || undefined,
                        rating: p.rating ?? undefined,
                        reviews: p.reviews ?? undefined,
                      }))}
                    />
                  </Box>
                )}
              </Col>
            </Row>
          </RBContainer>
        </Box>
        <Footer />
      </Box>
    </>
  )
}
