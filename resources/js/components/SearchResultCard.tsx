import { useState, useEffect } from 'react'
import { Box, IconButton, Paper, Typography } from '@mui/material'
import { router } from '@inertiajs/react'
import StarIcon from '@mui/icons-material/Star'
import CardFavoriteIcon from './CardFavoriteIcon'
import { useLanguage } from '../hooks/use-language'

type SearchResultCardProps = {
  image: string
  title: string
  location: string
  description?: string
  bedrooms?: number
  beds?: number
  price: number
  originalPrice?: number
  nights?: number
  checkin?: string
  checkout?: string
  id?: number | string
  rating?: number
  reviews?: number
  isNew?: boolean
  isGuestFavorite?: boolean
  /** Query string (no leading ?) e.g. adults=2&rooms=1 — passed to /detail/:id so booking can pre-fill guests */
  detailQuery?: string
  fallbackImage?: string
}

export default function SearchResultCard({
  image,
  title,
  location,
  description,
  bedrooms,
  beds,
  price,
  originalPrice,
  nights = 5,
  checkin,
  checkout,
  id = 1,
  rating,
  reviews,
  isNew = false,
  isGuestFavorite = false,
  detailQuery,
  fallbackImage = '/images/popular-stay-1.svg',
}: SearchResultCardProps) {
  const { t } = useLanguage()
  const [isFavorited, setIsFavorited] = useState(isGuestFavorite)
  const [imgSrc, setImgSrc] = useState(image || fallbackImage)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setIsFavorited(isGuestFavorite)
  }, [isGuestFavorite])

  useEffect(() => {
    setImgSrc(image || fallbackImage)
    setImgError(false)
  }, [image])

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
      setImgSrc(fallbackImage)
    }
  }

  const handleClick = () => {
    const suffix = detailQuery ? `?${detailQuery}` : ''
    router.visit(`/detail/${id}${suffix}`)
  }

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

  const formatDates = () => {
    if (!checkin || !checkout) return null
    const a = new Date(`${checkin}T12:00:00`)
    const b = new Date(`${checkout}T12:00:00`)
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
    const o: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    return `${a.toLocaleDateString('en-US', o)} – ${b.toLocaleDateString('en-US', o)}`
  }

  return (
    <Paper
      elevation={0}
      sx={{
        cursor: 'pointer',
        '&:hover': { transform: 'scale(1.01)', transition: 'transform 0.2s' }
      }}
      onClick={handleClick}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={imgSrc}
          alt={title}
          onError={handleImageError}
          sx={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: '12px', mb: 1.5 }}
        />
        <IconButton
          className="airbnb-favorite-button"
          onClick={handleFavoriteClick}
          size="small"
          aria-label={isFavorited ? t('wishlist.remove_from_wishlist') : t('wishlist.add_to_wishlist')}
          sx={{
            position: 'absolute',
            top: { xs: 6, sm: 12 },
            right: { xs: 8, sm: 12 },
            padding: '6px',
            bgcolor: 'transparent',
            color: '#222222',
            '&:hover': { bgcolor: 'transparent', color: '#222222' },
          }}
        >
          <CardFavoriteIcon isFavorited={isFavorited} />
        </IconButton>
      </Box>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
          <Typography
            component="span"
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: '#222222',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, pt: '1px' }}>
            {isNew ? (
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#222222' }}>★ New</Typography>
            ) : (
              <>
                <StarIcon sx={{ fontSize: 14, color: '#222222' }} />
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#222222' }}>
                  {rating?.toFixed(1) || '5.0'}
                </Typography>
                {reviews !== undefined && (
                  <Typography sx={{ fontSize: '0.9375rem', color: '#717171' }}>({reviews})</Typography>
                )}
              </>
            )}
          </Box>
        </Box>
        {description && (
          <Typography sx={{ fontSize: '0.9375rem', color: '#222222', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {description}
          </Typography>
        )}
        <Typography sx={{ fontSize: '0.9375rem', color: '#717171', mb: 0.5 }}>
          {bedrooms && beds ? `${bedrooms} bedroom${bedrooms > 1 ? 's' : ''} · ${beds} bed${beds > 1 ? 's' : ''}` : ''}
        </Typography>
        {formatDates() && (
          <Typography sx={{ fontSize: '0.9375rem', color: '#222222', mb: 1, textDecoration: 'underline' }}>
            {formatDates()}
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap' }}>
          {originalPrice && originalPrice > price && (
            <Typography sx={{ fontSize: '0.9375rem', color: '#717171', textDecoration: 'line-through' }}>
              ${originalPrice}
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#222222' }}>${price}</Typography>
          <Typography sx={{ fontSize: '0.9375rem', color: '#717171' }}>for {nights} nights</Typography>
        </Box>
      </Box>
    </Paper>
  )
}
