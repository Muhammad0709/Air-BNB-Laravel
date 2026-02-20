import { useState, useEffect } from 'react'
import { Box, IconButton, Typography, Stack } from '@mui/material'
import { Container, Row, Col } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FeaturedCard from '../components/FeaturedCard'
import Pagination from '../components/Pagination'
import FavoriteIcon from '@mui/icons-material/Favorite'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Head, usePage, router } from '@inertiajs/react'
import Toast from '../components/shared/Toast'
import { useLanguage } from '../hooks/use-language'

interface Property {
  id: number
  title: string
  location: string
  price: number
  image: string
  rating?: number
  reviews_count?: number
}

type WishlistProps = {
  properties: {
    data: Property[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function Wishlist() {
  const { t } = useLanguage()
  const { props } = usePage<WishlistProps>()
  const paginated = props.properties || { data: [], current_page: 1, last_page: 1, per_page: 9, total: 0 }
  const { data: propertiesData, current_page, last_page, total } = paginated

  const [wishlistItems, setWishlistItems] = useState<Property[]>(propertiesData)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Update wishlist items when props change
  useEffect(() => {
    if (propertiesData?.length !== undefined) {
      setWishlistItems(propertiesData)
    }
  }, [propertiesData])

  // Show success message from backend redirect
  useEffect(() => {
    if ((props as any)?.flash?.success) {
      setToast({
        open: true,
        message: (props as any).flash.success,
        severity: 'success'
      })
      router.reload({ only: ['properties'] })
    }
  }, [(props as any)?.flash?.success])

  const handleRemove = (id: number) => {
    router.delete(`/wishlist/${id}`, {
      onSuccess: () => {
        // Item will be removed from list after reload
        setWishlistItems(wishlistItems.filter(item => item.id !== id))
      },
      onError: () => {
        setToast({
          open: true,
          message: t('wishlist.remove_error'),
          severity: 'error'
        })
      }
    })
  }

  return (
    <>
      <Head title={t('wishlist.title')} />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box className="wishlist-page" sx={{ flex: 1 }}>
          <Container>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 6, mt: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} useFlexGap sx={{ mb: 2 }}>
                <Typography variant="h2" sx={{fontSize: '2.5rem', fontWeight: 800, color: '#222222' }}>
                  {t('wishlist.title')}
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: '#717171', fontSize: '1.125rem', maxWidth: 600, mx: 'auto' }}>
                {t('wishlist.subtitle')}
              </Typography>
            </Box>

            {total === 0 ? (
              // Empty State
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <FavoriteIcon sx={{ color: '#D1D5DB', fontSize: 80, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>
                  {t('wishlist.empty_title')}
                </Typography>
                <Typography variant="body1" sx={{ color: '#717171', mb: 3 }}>
                  {t('wishlist.empty_subtitle')}
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="body1" sx={{ color: '#717171', fontWeight: 600 }}>
                    {total} {total === 1 ? t('wishlist.property_saved') : t('wishlist.properties_saved')}
                  </Typography>
                </Box>

                <Row className="g-3">
                  {wishlistItems.map((item) => (
                    <Col key={item.id} xs={12} sm={6} md={6} lg={4}>
                      <Box sx={{ position: 'relative' }}>
                        <FeaturedCard
                          image={item.image}
                          title={item.title}
                          location={item.location}
                          price={item.price}
                          id={item.id}
                        />
                        <IconButton
                          onClick={() => handleRemove(item.id)}
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 1)'
                            },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                          aria-label="remove from wishlist"
                        >
                          <DeleteOutlineIcon sx={{ color: '#EF4444' }} />
                        </IconButton>
                      </Box>
                    </Col>
                  ))}
                </Row>

                {last_page > 1 && (
                  <Pagination
                    currentPage={current_page}
                    lastPage={last_page}
                    onPageChange={(page) => router.get('/wishlist', { page }, { preserveState: true })}
                  />
                )}
              </>
            )}
          </Container>
        </Box>
        <Footer />
        
        <Toast
          open={toast.open}
          onClose={() => setToast({ ...toast, open: false })}
          message={toast.message}
          severity={toast.severity}
        />
      </Box>
    </>
  )
}
