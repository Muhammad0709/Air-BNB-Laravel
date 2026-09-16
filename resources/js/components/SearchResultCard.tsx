import { useState, useEffect } from 'react'
import { Box, IconButton, Paper, Typography } from '@mui/material'
import { router, usePage } from '@inertiajs/react'
import StarIcon from '@mui/icons-material/Star'
import CardFavoriteIcon from './CardFavoriteIcon'
import LoginRequiredModal from './LoginRequiredModal'
import PropertyImageCarousel from './PropertyImageCarousel'
import { useLanguage } from '../hooks/use-language'

type SearchResultCardProps = {
  image: string
  images?: string[]
  title: string
  location: string
  description?: string
  bedrooms?: number | null
  beds?: number | null
  bathrooms?: number | null
  price: number
  originalPrice?: number
  nights?: number | null
  checkin?: string
  checkout?: string
  propertyCheckin?: string | null
  propertyCheckout?: string | null
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
  bathrooms,
  price,
  originalPrice,
  nights,
  checkin,
  checkout,
  propertyCheckin,
  propertyCheckout,
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
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { props } = usePage()
  const isAuthenticated = Boolean((props as any)?.auth?.user)

  useEffect(() => {
    setIsFavorited(isGuestFavorite)
  }, [isGuestFavorite])

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

  const formatStayDates = () => {
    const dates = [propertyCheckin || checkin, propertyCheckout || checkout].filter(Boolean) as string[]
    if (dates.length === 0) return null

    const formatted = dates.map((date) => {
      const parsed = new Date(`${date.slice(0, 10)}T12:00:00`)
      return Number.isNaN(parsed.getTime())
        ? null
        : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    })

    return formatted.every(Boolean) ? formatted.join(' – ') : formatted[0] || null
  }

  const propertyDetails = [
    bedrooms != null ? `${bedrooms} bedroom${bedrooms === 1 ? '' : 's'}` : null,
    beds != null ? `${beds} bed${beds === 1 ? '' : 's'}` : null,
    bathrooms != null ? `${bathrooms} bath${bathrooms === 1 ? '' : 's'}` : null,
  ].filter(Boolean)

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
      <Box sx={{ position: 'relative', height: 300, borderRadius: '12px', overflow: 'hidden', mb: 1.5 }}>
        <PropertyImageCarousel image={image} images={images} fallbackImage={fallbackImage} alt={title} />
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
        {propertyDetails.length > 0 && (
          <Typography sx={{ fontSize: '0.9375rem', color: '#222222', mb: 0.5 }}>
            {propertyDetails.join(' · ')}
          </Typography>
        )}
        {formatStayDates() && (
          <Typography sx={{ fontSize: '0.9375rem', color: '#222222', mb: 1 }}>
            {formatStayDates()}
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap' }}>
          {originalPrice && originalPrice > price && (
            <Typography sx={{ fontSize: '0.9375rem', color: '#717171', textDecoration: 'line-through' }}>
              ${originalPrice}
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#222222' }}>${price}</Typography>
          {nights != null && nights > 0 && (
            <Typography sx={{ fontSize: '0.9375rem', color: '#717171' }}>
              {t('listing.for')} {nights} {t(nights === 1 ? 'listing.night' : 'listing.nights')}
            </Typography>
          )}
        </Box>
      </Box>
      </Paper>
      <LoginRequiredModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}
