import { useState, useEffect } from 'react'
import { Box, IconButton, Typography, Stack } from '@mui/material'
import { Container, Row, Col } from 'react-bootstrap'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import FeaturedCard from '../Components/FeaturedCard'
import FavoriteIcon from '@mui/icons-material/Favorite'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Head, usePage, router } from '@inertiajs/react'
import Toast from '../Components/shared/Toast'

interface Property {
  id: number
  title: string
  location: string
  price: number
  image: string
  rating?: number
  reviews_count?: number
}

export default function Wishlist() {
  const { props } = usePage()
  const properties = (props as any).properties || []
  
  const [wishlistItems, setWishlistItems] = useState<Property[]>(properties)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Update wishlist items when props change
  useEffect(() => {
    if (properties) {
      setWishlistItems(properties)
    }
  }, [properties])

  // Show success message from backend redirect
  useEffect(() => {
    if ((props as any)?.flash?.success) {
      setToast({
        open: true,
        message: (props as any).flash.success,
        severity: 'success'
      })
      // Reload to get updated data
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
          message: 'Failed to remove property from wishlist. Please try again.',
          severity: 'error'
        })
      }
    })
  }

  return (
    <>
      <Head title="Wishlist" />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box className="wishlist-page" sx={{ flex: 1 }}>
          <Container>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 6, mt: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
                <Typography variant="h2" sx={{fontSize: '2.5rem', fontWeight: 800, color: '#222222' }}>
                  My Wishlist
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: '#717171', fontSize: '1.125rem', maxWidth: 600, mx: 'auto' }}>
                Your saved properties for future bookings
              </Typography>
            </Box>

            {wishlistItems.length === 0 ? (
              // Empty State
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <FavoriteIcon sx={{ color: '#D1D5DB', fontSize: 80, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>
                  Your wishlist is empty
                </Typography>
                <Typography variant="body1" sx={{ color: '#717171', mb: 3 }}>
                  Start exploring and save your favorite properties
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="body1" sx={{ color: '#717171', fontWeight: 600 }}>
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'property' : 'properties'} saved
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
