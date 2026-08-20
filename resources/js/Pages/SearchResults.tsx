import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { router, usePage } from '@inertiajs/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SearchResultCard from '../components/SearchResultCard'
import Pagination from '../components/Pagination'
import { Container as RBContainer, Row, Col } from 'react-bootstrap'
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Head } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

const PropertyMap = lazy(() => import('../components/PropertyMap'))

type SearchResultItem = {
  id: number
  title: string
  location: string
  price: number
  rating?: number
  reviews?: number
  image: string | null
  /** Matches ListingResource / wishlist */
  isGuestFavorite?: boolean
}

type SearchResultsPageProps = {
  properties: {
    data: SearchResultItem[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  filters: {
    location?: string
    checkin?: string
    checkout?: string
    adults?: string
    children?: string
    rooms?: string
    guests?: string
    sort_by?: string
    min_price?: string
    max_price?: string
  }
  nights: number | null
}

export default function SearchResults() {
  const { t } = useLanguage()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const { props } = usePage<SearchResultsPageProps>()
  const { properties, filters = {}, nights: propsNights } = props
  const items = properties?.data ?? []
  const paginator = properties
  const nights = propsNights ?? 5
  const checkin = filters?.checkin
  const checkout = filters?.checkout

  const detailQuery = useMemo(() => {
    const q = new URLSearchParams()
    if (filters?.adults !== undefined && filters?.adults !== '') q.set('adults', filters.adults)
    if (filters?.children !== undefined && filters?.children !== '') q.set('children', filters.children)
    if (filters?.rooms !== undefined && filters?.rooms !== '') q.set('rooms', filters.rooms)
    return q.toString()
  }, [filters?.adults, filters?.children, filters?.rooms])

  const [viewMode] = useState<'list' | 'map'>('map')
  const [mapMounted, setMapMounted] = useState(false)

  useEffect(() => {
    setMapMounted(true)
  }, [])

  const getMapCenter = (): [number, number] => {
    if (items.length === 0) return [31.5204, 74.3587]
    if (items.some(i => i.location?.toLowerCase().includes('new york'))) return [40.7128, -74.006]
    if (items.some(i => i.location?.toLowerCase().includes('madinah') || i.location?.toLowerCase().includes('prophet'))) return [24.5247, 39.5692]
    if (items.some(i => i.location?.toLowerCase().includes('makkah') || i.location?.toLowerCase().includes('great mosque'))) return [21.3891, 39.8579]
    if (items.some(i => i.location?.toLowerCase().includes('islamabad'))) return [33.6844, 73.0479]
    return [34.0522, -118.2437]
  }

  const loc = filters?.location ?? ''
  const searchLabel =
    loc &&
    (loc.toLowerCase().includes('islamabad') ||
      loc.toLowerCase().includes('lahore') ||
      loc.toLowerCase().includes('madinah') ||
      loc.toLowerCase().includes('makkah') ||
      loc.toLowerCase().includes('new york') ||
      loc.toLowerCase().includes('prophet') ||
      loc.toLowerCase().includes('great mosque'))

  const handlePageChange = (page: number) => {
    const params: Record<string, string | number> = { page }
    if (filters?.location) params.location = filters.location
    if (filters?.checkin) params.checkin = filters.checkin
    if (filters?.checkout) params.checkout = filters.checkout
    if (filters?.adults) params.adults = filters.adults
    if (filters?.children) params.children = filters.children
    if (filters?.rooms) params.rooms = filters.rooms
    if (filters?.guests) params.guests = filters.guests
    if (filters?.sort_by) params.sort_by = filters.sort_by
    if (filters?.min_price) params.min_price = filters.min_price
    if (filters?.max_price) params.max_price = filters.max_price
    router.get('/search', params, { preserveState: true })
  }

  return (
    <Box className="search-page" sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 600, color: '#222222', fontSize: '1.375rem', mb: 0.5 }}>
                  {(paginator?.total ?? 0) > 0
                    ? searchLabel
                      ? (t('search_results.over_homes_in') as string)
                          .replace(':count', String(paginator.total))
                          .replace(':location', filters?.location ?? '')
                      : (t('search_results.over_homes') as string).replace(':count', String(paginator.total))
                    : t('search_results.no_homes_found')}
                </Typography>
              </Box>
              {items.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#717171', mb: 1, fontWeight: 600 }}>
                    {t('search_results.no_data_found')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    {t('search_results.try_adjusting')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Row className="g-3">
                    {items.map((i) => (
                      <Col key={i.id} xs={12} sm={6} md={6}>
                        <SearchResultCard
                          image={i.image ?? ''}
                          title={i.title}
                          location={i.location}
                          price={i.price}
                          nights={nights}
                          checkin={checkin || undefined}
                          checkout={checkout || undefined}
                          id={i.id}
                          rating={i.rating}
                          reviews={i.reviews}
                          isGuestFavorite={i.isGuestFavorite}
                          detailQuery={detailQuery || undefined}
                        />
                      </Col>
                    ))}
                  </Row>
                  {paginator && paginator.last_page > 1 && (
                    <Pagination
                      currentPage={paginator.current_page}
                      lastPage={paginator.last_page}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
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
                <Suspense
                  fallback={
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: '#F7F7F7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px'
                      }}
                    >
                      <Typography sx={{ color: '#717171' }}>{t('search_results.loading_map')}</Typography>
                    </Box>
                  }
                >
                  <PropertyMap
                    properties={items.map((item) => ({
                      id: item.id,
                      title: item.title,
                      location: item.location,
                      price: item.price,
                      image: item.image ?? undefined,
                      rating: item.rating,
                      reviews: item.reviews,
                      nights,
                      checkin: checkin || undefined,
                      checkout: checkout || undefined,
                      isGuestFavorite: item.isGuestFavorite,
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
