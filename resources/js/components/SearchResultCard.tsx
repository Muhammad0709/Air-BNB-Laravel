import { useState, useEffect, useMemo } from 'react'
import { Box, IconButton, Paper, Typography } from '@mui/material'
import { router, usePage } from '@inertiajs/react'
import StarIcon from '@mui/icons-material/Star'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import CardFavoriteIcon from './CardFavoriteIcon'
import LoginRequiredModal from './LoginRequiredModal'
import { useLanguage } from '../hooks/use-language'

type SearchResultCardProps = {
  image: string
  images?: string[]
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
  images,
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
  const [activeImage, setActiveImage] = useState(0)
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({})
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { props } = usePage()
  const isAuthenticated = Boolean((props as any)?.auth?.user)

  useEffect(() => {
    setIsFavorited(isGuestFavorite)
  }, [isGuestFavorite])

  const imageSources = useMemo(() => {
    const availableImages = (images ?? []).filter(Boolean)
    return availableImages.length > 0 ? availableImages : [image || fallbackImage]
  }, [images, image, fallbackImage])

  useEffect(() => {
    setActiveImage(0)
    setFailedImages({})
  }, [imageSources])

  const hasMultipleImages = imageSources.length > 1
  const currentImage = imageSources[activeImage] || fallbackImage

  const changeImage = (direction: number) => {
    setActiveImage((current) => (current + direction + imageSources.length) % imageSources.length)
  }

  const handleImageError = () => {
    setFailedImages((current) => ({ ...current, [activeImage]: true }))
  }

  const handleClick = () => {
    const suffix = detailQuery ? `?${detailQuery}` : ''
    router.visit(`/detail/${id}${suffix}`)
  }

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

  const formatDates = () => {
    if (!checkin || !checkout) return null
    const a = new Date(`${checkin}T12:00:00`)
    const b = new Date(`${checkout}T12:00:00`)
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
    const o: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    return `${a.toLocaleDateString('en-US', o)} – ${b.toLocaleDateString('en-US', o)}`
  }

  return (
    <>
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
          src={failedImages[activeImage] ? fallbackImage : currentImage}
          alt={`${title} - image ${activeImage + 1}`}
          onError={handleImageError}
          sx={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: '12px', mb: 1.5, display: 'block' }}
        />
        {hasMultipleImages && (
          <>
            <IconButton
              onClick={(e) => { e.stopPropagation(); changeImage(-1) }}
              aria-label="Previous property image"
              size="small"
              sx={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 34,
                height: 34,
                bgcolor: 'rgba(255,255,255,0.95)',
                color: '#222222',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                '&:hover': { bgcolor: '#FFFFFF' },
              }}
            >
              <ChevronLeftRoundedIcon fontSize="medium" />
            </IconButton>
            <IconButton
              onClick={(e) => { e.stopPropagation(); changeImage(1) }}
              aria-label="Next property image"
              size="small"
              sx={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 34,
                height: 34,
                bgcolor: 'rgba(255,255,255,0.95)',
                color: '#222222',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                '&:hover': { bgcolor: '#FFFFFF' },
              }}
            >
              <ChevronRightRoundedIcon fontSize="medium" />
            </IconButton>
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '5px',
                pointerEvents: 'none',
              }}
            >
              {imageSources.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: index === activeImage ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  }}
                />
              ))}
            </Box>
          </>
        )}
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
      <LoginRequiredModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}
