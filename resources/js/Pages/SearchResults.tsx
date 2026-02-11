import { useMemo, useState, useEffect, lazy, Suspense } from 'react'
import { usePage } from '@inertiajs/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SearchResultCard from '../components/SearchResultCard'
import { Container as RBContainer, Row, Col } from 'react-bootstrap'
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Head } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

const PropertyMap = lazy(() => import('../components/PropertyMap'))

const img1 = '/images/popular-stay-1.svg'
const img2 = '/images/popular-stay-2.svg'
const img3 = '/images/popular-stay-3.svg'

type Item = {
  image: string
  title: string
  location: string
  description?: string
  bedrooms?: number
  beds?: number
  price: number
  originalPrice?: number
  rating?: number
  reviews?: number
  isGuestFavorite?: boolean
  isNew?: boolean
}

const allItems: Item[] = [
  { image: img1, title: 'Luxury Beachfront Villa', location: 'Malibu, California', price: 299, rating: 4.93, reviews: 123, isGuestFavorite: true, bedrooms: 3, beds: 4 },
  { image: img2, title: 'Modern Downtown Apartment', location: 'Los Angeles, California', price: 199, rating: 4.87, reviews: 89, bedrooms: 2, beds: 2 },
  { image: img3, title: 'Cozy Mountain Cabin', location: 'Lake Tahoe, California', price: 399, rating: 4.95, reviews: 156, isGuestFavorite: true, bedrooms: 2, beds: 3 },
  { image: img1, title: 'Beachside Condo', location: 'San Diego, California', price: 149, rating: 4.82, reviews: 67, bedrooms: 1, beds: 1 },
  { image: img2, title: 'City Center Loft', location: 'San Francisco, California', price: 249, rating: 4.88, reviews: 98, bedrooms: 1, beds: 2 },
  { image: img3, title: 'Luxury Beachfront Villa', location: 'Malibu, California', price: 349, rating: 4.91, reviews: 134, isGuestFavorite: true, bedrooms: 4, beds: 5 },
  { image: img1, title: 'Home', location: 'Islamabad, Pakistan', description: 'Newly Furnished 2 Bed Upper Portion...', price: 290, originalPrice: 290, rating: 5.0, reviews: 4, isNew: true, bedrooms: 2, beds: 2 },
  { image: img2, title: 'Condo', location: 'Islamabad, Pakistan', description: 'Miso Suite 2.0 / Netflix-Cinema Room Free...', price: 474, rating: 5.0, reviews: 15, bedrooms: 1, beds: 1 },
  { image: img3, title: 'Apartment', location: 'Islamabad, Pakistan', description: 'atb Homes (A home away from home)', price: 432, rating: 4.5, reviews: 8, bedrooms: 1, beds: 1 },
  { image: img1, title: 'Apartment', location: 'Islamabad, Pakistan', description: 'Urban BHK with Balcony (Sofia)', price: 452, originalPrice: 531, rating: 5.0, reviews: 4, bedrooms: 1, beds: 1 },
  { image: img2, title: 'Apartment', location: 'Islamabad, Pakistan', description: 'The Layover - Modern Studio near Islamabad...', price: 564, originalPrice: 663, rating: 4.9, reviews: 12, isNew: true, bedrooms: 1, beds: 1 },
  { image: img3, title: 'Apartment', location: 'Islamabad, Pakistan', description: 'Comfortable & Cosy One Bedroom', price: 520, originalPrice: 571, rating: 4.93, reviews: 14, bedrooms: 1, beds: 1 },
  { image: img1, title: 'Apartment', location: 'Islamabad, Pakistan', price: 369, rating: 4.8, reviews: 6, bedrooms: 1, beds: 1 },
  { image: img2, title: 'Condo', location: 'Islamabad, Pakistan', price: 419, rating: 4.9, reviews: 10, bedrooms: 1, beds: 1 },
  { image: img3, title: 'Hotel', location: 'Islamabad, Pakistan', price: 552, rating: 5.0, reviews: 8, bedrooms: 1, beds: 1 },
  { image: img1, title: 'Apartment', location: 'Islamabad, Pakistan', description: 'Luxury Apartment with View', price: 734, rating: 4.95, reviews: 20, bedrooms: 2, beds: 2 },
  { image: img1, title: 'Hotel', location: 'Madinah, Saudi Arabia', description: 'Near Prophet\'s Mosque - Premium Stay', price: 350, rating: 4.9, reviews: 45, bedrooms: 2, beds: 2 },
  { image: img2, title: 'Apartment', location: 'Madinah, Saudi Arabia', description: 'Comfortable Stay Close to Mosque', price: 280, rating: 4.8, reviews: 32, bedrooms: 1, beds: 1 },
  { image: img3, title: 'Home', location: 'Madinah, Saudi Arabia', description: 'Spacious Family Accommodation', price: 420, originalPrice: 480, rating: 4.95, reviews: 28, bedrooms: 3, beds: 4 },
  { image: img1, title: 'Hotel', location: 'Makkah, Saudi Arabia', description: 'Luxury Hotel Near Grand Mosque', price: 450, rating: 5.0, reviews: 67, bedrooms: 2, beds: 2 },
  { image: img2, title: 'Apartment', location: 'Makkah, Saudi Arabia', description: 'Modern Apartment with Great Views', price: 320, rating: 4.85, reviews: 41, bedrooms: 1, beds: 2 },
  { image: img3, title: 'Condo', location: 'Makkah, Saudi Arabia', description: 'Premium Condo Near Haram', price: 520, originalPrice: 580, rating: 4.9, reviews: 56, bedrooms: 2, beds: 3 },
  { image: img1, title: 'Hotel', location: 'Great Mosque of Makkah', description: '5-Star Hotel with Haram View', price: 680, rating: 5.0, reviews: 89, bedrooms: 3, beds: 4 },
  { image: img2, title: 'Apartment', location: 'Great Mosque of Makkah', description: 'Luxury Apartment - Kaaba View', price: 750, rating: 4.95, reviews: 124, bedrooms: 2, beds: 3 },
  { image: img3, title: 'Hotel', location: 'Prophet\'s Mosque', description: 'Premium Hotel - Walking Distance', price: 420, rating: 4.9, reviews: 78, bedrooms: 2, beds: 2 },
  { image: img1, title: 'Apartment', location: 'Prophet\'s Mosque', description: 'Comfortable Stay Near Masjid Nabawi', price: 290, rating: 4.85, reviews: 52, bedrooms: 1, beds: 1 },
  { image: img2, title: 'Home', location: 'New York, United States of America', description: 'Modern Loft in Manhattan', price: 450, rating: 4.9, reviews: 156, bedrooms: 2, beds: 2 },
  { image: img3, title: 'Apartment', location: 'New York, United States of America', description: 'Stylish Apartment in Brooklyn', price: 320, originalPrice: 380, rating: 4.8, reviews: 98, bedrooms: 1, beds: 2 },
  { image: img1, title: 'Condo', location: 'New York, United States of America', description: 'Luxury Condo with City Views', price: 580, rating: 4.95, reviews: 203, bedrooms: 2, beds: 3 },
  { image: img2, title: 'Hotel', location: 'New York, United States of America', description: 'Boutique Hotel in Times Square', price: 420, rating: 4.85, reviews: 167, bedrooms: 1, beds: 1 },
]

export default function SearchResults() {
  const { t } = useLanguage()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const { url } = usePage()
  const [search, setSearch] = useState('')
  const [viewMode] = useState<'list' | 'map'>('map')
  const [mapMounted, setMapMounted] = useState(false)

  useEffect(() => {
    setMapMounted(true)
  }, [])

  const searchParams = useMemo(() => {
    const q = url.includes('?') ? url.split('?')[1] : ''
    return new URLSearchParams(q)
  }, [url])

  useEffect(() => {
    const location = searchParams.get('location')
    if (location) setSearch(location)
  }, [searchParams])

  const checkin = searchParams.get('checkin')
  const checkout = searchParams.get('checkout')
  const nights = checkin && checkout
    ? Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24))
    : 5

  const minPrice = Math.min(...allItems.map(item => item.price))
  const maxPrice = Math.max(...allItems.map(item => item.price))
  const [priceRange] = useState<number[]>([minPrice, maxPrice])

  const filtered = useMemo(() => {
    return allItems.filter(i => {
      const matchesSearch = !search ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.location.toLowerCase().includes(search.toLowerCase())
      const matchesPrice = i.price >= priceRange[0] && i.price <= priceRange[1]
      return matchesSearch && matchesPrice
    })
  }, [search, priceRange])

  const getMapCenter = (): [number, number] => {
    if (filtered.length === 0) return [31.5204, 74.3587]
    if (filtered.some(i => i.location.toLowerCase().includes('new york'))) return [40.7128, -74.0060]
    if (filtered.some(i => i.location.toLowerCase().includes('madinah') || i.location.toLowerCase().includes('prophet'))) return [24.5247, 39.5692]
    if (filtered.some(i => i.location.toLowerCase().includes('makkah') || i.location.toLowerCase().includes('great mosque'))) return [21.3891, 39.8579]
    if (filtered.some(i => i.location.toLowerCase().includes('islamabad'))) return [33.6844, 73.0479]
    return [34.0522, -118.2437]
  }

  const searchLabel = search && (search.toLowerCase().includes('islamabad') || search.toLowerCase().includes('lahore') || search.toLowerCase().includes('madinah') || search.toLowerCase().includes('makkah') || search.toLowerCase().includes('new york') || search.toLowerCase().includes('prophet') || search.toLowerCase().includes('great mosque'))

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head title={t('search_results.title')} />
      <Navbar />
      <Box sx={{ flex: 1, width: '100%' }}>
        <Row className="g-0" style={{ margin: 0, minHeight: 'calc(100vh - 64px)' }}>
          <Col
            xs={12}
            lg={viewMode === 'map' ? 6 : 12}
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              overflowY: 'auto',
              maxHeight: viewMode === 'map' ? 'calc(100vh - 64px)' : 'none',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            className="hide-scrollbar"
          >
            <RBContainer fluid className="px-0">
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography sx={{ fontWeight: 600, color: '#222222', fontSize: '1.375rem', mb: 0.5 }}>
                  {filtered.length > 0
                    ? (searchLabel
                        ? (t('search_results.over_homes_in') as string).replace(':count', String(filtered.length)).replace(':location', search)
                        : (t('search_results.over_homes') as string).replace(':count', String(filtered.length)))
                    : t('search_results.no_homes_found')}
                </Typography>
                <Typography sx={{ color: '#717171', fontSize: '0.875rem', flexShrink: 0, ml: 2 }}>{t('search_results.prices_include_fees')}</Typography>
              </Box>
              {filtered.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#717171', mb: 1, fontWeight: 600 }}>{t('search_results.no_data_found')}</Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{t('search_results.try_adjusting')}</Typography>
                </Box>
              ) : (
                <Row className="g-3">
                  {filtered.map((i, idx) => (
                    <Col key={idx} xs={12} sm={6} md={6}>
                      <SearchResultCard
                        image={i.image}
                        title={i.title}
                        location={i.location}
                        description={i.description}
                        bedrooms={i.bedrooms}
                        beds={i.beds}
                        price={i.price}
                        originalPrice={i.originalPrice}
                        nights={nights}
                        checkin={checkin || undefined}
                        checkout={checkout || undefined}
                        id={idx + 1}
                        rating={i.rating}
                        reviews={i.reviews}
                        isNew={i.isNew}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </RBContainer>
          </Col>
          {viewMode === 'map' && (
            <Col
              xs={12}
              lg={6}
              style={{
                position: isDesktop ? 'sticky' : 'relative',
                top: isDesktop ? '64px' : 'auto',
                height: isDesktop ? 'calc(100vh - 64px)' : '400px',
                overflow: 'hidden',
                borderTop: !isDesktop ? '1px solid #DDDDDD' : 'none',
                padding: isDesktop ? '24px 24px 24px 0' : '24px',
                backgroundColor: '#FFFFFF'
              }}
            >
              {mapMounted && (
              <Suspense fallback={<Box sx={{ width: '100%', height: '100%', bgcolor: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><Typography sx={{ color: '#717171' }}>{t('search_results.loading_map')}</Typography></Box>}>
                <PropertyMap
                  properties={filtered.map((item, idx) => ({
                    id: idx + 1,
                    title: item.title,
                    location: item.location,
                    price: item.price,
                    image: item.image,
                    description: item.description,
                    rating: item.rating,
                    reviews: item.reviews,
                    bedrooms: item.bedrooms,
                    beds: item.beds,
                    nights,
                    checkin: checkin || undefined,
                    checkout: checkout || undefined,
                    originalPrice: item.originalPrice,
                    isNew: item.isNew
                  }))}
                  center={getMapCenter()}
                  zoom={searchLabel ? 12 : 10}
                />
              </Suspense>
              )}
            </Col>
          )}
        </Row>
      </Box>
      <Footer />
    </Box>
  )
}
