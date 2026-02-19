import React, { useState, useEffect } from 'react'
import { Box, IconButton, Paper, Typography } from '@mui/material'
import { router } from '@inertiajs/react'
import StarIcon from '@mui/icons-material/Star'
import CardFavoriteIcon from './CardFavoriteIcon'
import { useLanguage } from '../hooks/use-language'
import { useCurrency } from '../contexts/CurrencyContext'
import { formatPrice } from '../utils/currency'

type FeaturedCardProps = {
  image: string
  title: string
  location: string
  price: number
  id?: number | string
  rating?: number
  reviews?: number
  isGuestFavorite?: boolean
  fallbackImage?: string
}

export default function FeaturedCard({ 
  image, 
  title, 
  location: _location, 
  price, 
  id = 1,
  rating = 4.93,
  reviews: _reviews,
  isGuestFavorite = false,
  fallbackImage = '/images/popular-stay-1.svg',
}: FeaturedCardProps) {
  const { t } = useLanguage()
  const { currency } = useCurrency()
  const [imgSrc, setImgSrc] = useState(image)
  const [imgError, setImgError] = useState(false)
  const [isFavorited, setIsFavorited] = useState(isGuestFavorite)

  useEffect(() => {
    setImgSrc(image)
    setImgError(false)
  }, [image])

  useEffect(() => {
    setIsFavorited(isGuestFavorite)
  }, [isGuestFavorite])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
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

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
      setImgSrc(fallbackImage)
    }
  }

  return (
    <Paper 
      className="airbnb-card" 
      elevation={0} 
      sx={{ 
        cursor: 'pointer'
      }} 
      onClick={handleClick}
    >
      <Box 
        className="airbnb-card-image-wrapper" 
        onClick={handleImageClick} 
        sx={{ cursor: 'pointer' }}
      >
        <img 
          src={imgSrc} 
          alt={title} 
          className="airbnb-card-image"
          onError={handleImageError}
        />
        <IconButton
          className="airbnb-favorite-button"
          onClick={handleFavoriteClick}
          size="small"
          aria-label={isFavorited ? t('wishlist.remove_from_wishlist') : t('wishlist.add_to_wishlist')}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '6px',
            bgcolor: 'transparent',
            color: '#222222',
            '&:hover': { bgcolor: 'transparent', color: '#222222' },
          }}
        >
          <CardFavoriteIcon isFavorited={isFavorited} />
        </IconButton>
      </Box>
      <Box className="airbnb-card-body">
        <Typography className="airbnb-card-title" component="h3" title={title}>
          {title}
        </Typography>
        <Box className="airbnb-card-price-rating">
          <Typography component="span" className="airbnb-card-price-text">
            {formatPrice(Number(price), currency)}
          </Typography>
          <Typography component="span" className="airbnb-card-night-text">
            {' / '}{t('listing.night')}
          </Typography>
          <Box className="airbnb-card-rating-inline">
            <StarIcon sx={{ fontSize: 12, color: '#222222', marginInlineStart: 1 }} />
            <Typography component="span" sx={{ fontSize: 14, fontWeight: 600, color: '#222222', marginInlineStart: 0.5 }}>
              {rating.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
