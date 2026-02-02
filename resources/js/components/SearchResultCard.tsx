import { Box, Paper, Typography } from '@mui/material'
import { router } from '@inertiajs/react'
import StarIcon from '@mui/icons-material/Star'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'

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
  isNew = false
}: SearchResultCardProps) {
  const handleClick = () => {
    router.visit(`/detail/${id}`)
  }

  const formatDates = () => {
    if (checkin && checkout) {
      const checkinDate = new Date(checkin)
      const checkoutDate = new Date(checkout)
      const checkinStr = checkinDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const checkoutStr = checkoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `${checkinStr}-${checkoutStr}`
    }
    return null
  }

  const getLocationPrefix = () => {
    if (title.toLowerCase().includes('home')) return 'Home'
    if (title.toLowerCase().includes('apartment')) return 'Apartment'
    if (title.toLowerCase().includes('condo')) return 'Condo'
    if (title.toLowerCase().includes('hotel')) return 'Hotel'
    if (title.toLowerCase().includes('guesthouse')) return 'Guesthouse'
    return 'Place to stay'
  }

  const displayTitle = title.includes(' in ') ? title : `${getLocationPrefix()} in ${location.split(',')[0]}`

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
          src={image}
          alt={title}
          sx={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: '12px', mb: 1.5 }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            cursor: 'pointer',
            zIndex: 2,
            '&:hover': { transform: 'scale(1.1)', transition: 'transform 0.2s' }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteBorderIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
        </Box>
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#222222', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayTitle}
        </Typography>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            {originalPrice && originalPrice > price && (
              <Typography sx={{ fontSize: '0.9375rem', color: '#717171', textDecoration: 'line-through' }}>
                ${originalPrice}
              </Typography>
            )}
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#222222' }}>${price}</Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: '#717171' }}>for {nights} nights</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
