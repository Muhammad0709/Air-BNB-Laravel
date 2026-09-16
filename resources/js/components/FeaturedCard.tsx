import React, { useState, useEffect } from 'react'
import { Box, IconButton, Paper, Typography } from '@mui/material'
import { router, usePage } from '@inertiajs/react'
import StarIcon from '@mui/icons-material/Star'
import CardFavoriteIcon from './CardFavoriteIcon'
import LoginRequiredModal from './LoginRequiredModal'
import PropertyImageCarousel from './PropertyImageCarousel'
import { useLanguage } from '../hooks/use-language'
import { useCurrency } from '../contexts/CurrencyContext'
import { formatPrice } from '../utils/currency'

type FeaturedCardProps = {
  image: string
  images?: string[]
  title: string
  location: string
  price: number
  nights?: number | null
  id?: number | string
  rating?: number
  reviews?: number
  isGuestFavorite?: boolean
  fallbackImage?: string
  showFavoriteButton?: boolean
  showImageCarousel?: boolean
}

export default function FeaturedCard({ 
  image, 
  images,
  title, 
  location: _location, 
  price,
  nights,
  id = 1,
  rating = 4.93,
  reviews: _reviews,
  isGuestFavorite = false,
  fallbackImage = '/images/popular-stay-1.svg',
  showFavoriteButton = true,
  showImageCarousel = true,
}: FeaturedCardProps) {
  const { t } = useLanguage()
  const { currency } = useCurrency()
  const [isFavorited, setIsFavorited] = useState(isGuestFavorite)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { props } = usePage()
  const isAuthenticated = Boolean((props as any)?.auth?.user)

  useEffect(() => {
    setIsFavorited(isGuestFavorite)
  }, [isGuestFavorite])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!isAuthenticated) {
      setLoginModalOpen(true)
      return
    }
    const propertyId = String(id)
    if (isFavorited) {
      router.delete(`/wishlist/${propertyId}`, { preserveScroll: true })
      setIsFavorited(false)
    } else {
      router.post(`/wishlist/${propertyId}`, {}, { preserveScroll: true })
      setIsFavorited(true)
    }
  }

  const handleClick = () => {
    router.visit(`/detail/${id}`)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.visit(`/detail/${id}`)
  }

  return (
    <>
      <Paper
      className="airbnb-card" 
      elevation={0} 
      sx={{ cursor: 'pointer' }} 
      onClick={handleClick}
    >
      <Box 
        className="airbnb-card-image-wrapper" 
        onClick={handleImageClick} 
        sx={{ cursor: 'pointer' }}
      >
        {showImageCarousel ? (
          <PropertyImageCarousel
            image={image}
            images={images}
            fallbackImage={fallbackImage}
            alt={title}
            imageClassName="airbnb-card-image"
            sx={{ position: 'absolute', inset: 0 }}
          />
        ) : (
          <Box
            component="img"
            src={image || fallbackImage}
            alt={title}
            className="airbnb-card-image"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}

        {showFavoriteButton && (
          <IconButton
            className="airbnb-favorite-button"
            onClick={handleFavoriteClick}
            size="small"
            aria-label={isFavorited ? t('wishlist.remove_from_wishlist') : t('wishlist.add_to_wishlist')}
            sx={{
              position: 'absolute',
              top: { xs: 4, sm: 8 },
              right: { xs: 6, sm: 8 },
              padding: '6px',
              bgcolor: 'transparent',
              color: '#222222',
              '&:hover': { bgcolor: 'transparent', color: '#222222' },
            }}
          >
            <CardFavoriteIcon isFavorited={isFavorited} />
          </IconButton>
        )}
      </Box>

      <Box className="airbnb-card-body">
        <Typography className="airbnb-card-title" component="h3" title={title}>
          {title}
        </Typography>
        <Box className="airbnb-card-price-rating">
          <div>
            <Typography component="span" className="airbnb-card-price-text">
              {formatPrice(Number(price), currency)}
            </Typography>
            {nights != null && nights > 0 && (
              <Typography component="span" className="airbnb-card-night-text">
                {' '}{t('listing.for')} {nights} {t(nights === 1 ? 'listing.night' : 'listing.nights')}
              </Typography>
            )}
          </div>
          {rating > 0 && (
            <Box className="airbnb-card-rating-inline">
              <StarIcon sx={{ fontSize: 11, color: '#717171', marginInlineStart: 1 }} />
              <Typography component="span" sx={{ fontSize: 13, fontWeight: 600, color: '#717171', marginInlineStart: 0.5 }}>
                {rating.toFixed(2)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      </Paper>
      <LoginRequiredModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}
