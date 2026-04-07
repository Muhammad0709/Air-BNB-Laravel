import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import StarIcon from '@mui/icons-material/Star'
import { router } from '@inertiajs/react'
import CardFavoriteIcon from './CardFavoriteIcon'
import { useLanguage } from '../hooks/use-language'

type Property = {
  id: number | string
  title: string
  location: string
  price: number
  lat?: number
  lng?: number
  image?: string
  description?: string
  rating?: number
  reviews?: number
  bedrooms?: number
  beds?: number
  nights?: number
  checkin?: string
  checkout?: string
  originalPrice?: number
  isNew?: boolean
  /** Sync with list cards / wishlist */
  isGuestFavorite?: boolean
}

function PropertyMapFavoriteButton({
  propertyId,
  isGuestFavorite,
}: {
  propertyId: number | string
  isGuestFavorite?: boolean
}) {
  const { t } = useLanguage()
  const [fav, setFav] = useState(!!isGuestFavorite)
  useEffect(() => {
    setFav(!!isGuestFavorite)
  }, [propertyId, isGuestFavorite])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const id = String(propertyId)
    if (fav) {
      router.delete(`/wishlist/${id}`, { preserveScroll: true })
      setFav(false)
    } else {
      router.post(`/wishlist/${id}`, {}, { preserveScroll: true })
      setFav(true)
    }
  }

  return (
    <IconButton
      size="small"
      onClick={handleClick}
      aria-label={fav ? t('wishlist.remove_from_wishlist') : t('wishlist.add_to_wishlist')}
      sx={{
        bgcolor: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.1)',
        width: 32,
        height: 32,
        padding: '4px',
        '&:hover': { bgcolor: '#F7F7F7' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0, transform: 'scale(0.92)' }}>
        <CardFavoriteIcon isFavorited={fav} />
      </Box>
    </IconButton>
  )
}

type PropertyMapProps = {
  properties: Property[]
  center?: [number, number]
  zoom?: number
}

const locationCoordinates: Record<string, [number, number]> = {
  'Malibu, California': [34.0259, -118.7798],
  'Los Angeles, California': [34.0522, -118.2437],
  'Lake Tahoe, California': [39.0968, -120.0324],
  'San Diego, California': [32.7157, -117.1611],
  'San Francisco, California': [37.7749, -122.4194],
  'Islamabad, Pakistan': [33.6844, 73.0479],
  'Islamabad': [33.6844, 73.0479],
  'Lahore, Pakistan': [31.5204, 74.3587],
  'Lahore': [31.5204, 74.3587],
  'Madinah': [24.5247, 39.5692],
  'Madinah, Saudi Arabia': [24.5247, 39.5692],
  'Al Madinah Province, Saudi Arabia': [24.5247, 39.5692],
  'Makkah': [21.3891, 39.8579],
  'Makkah, Saudi Arabia': [21.3891, 39.8579],
  'Makkah Province, Saudi Arabia': [21.3891, 39.8579],
  'Great Mosque of Makkah': [21.4225, 39.8262],
  "Prophet's Mosque": [24.4672, 39.6142],
  'New York': [40.7128, -74.0060],
  'New York, United States': [40.7128, -74.0060],
  'New York, United States of America': [40.7128, -74.0060],
}

export default function PropertyMap({ properties, center = [34.0522, -118.2437], zoom = 10 }: PropertyMapProps) {
  const getCoordinates = (location: string, index: number): [number, number] => {
    const baseCoords = locationCoordinates[location] || center
    const variation = 0.015
    const angle = (index * 137.508) % 360
    const radius = variation * Math.sqrt(index + 1)
    const latOffset = radius * Math.cos(angle * Math.PI / 180)
    const lngOffset = radius * Math.sin(angle * Math.PI / 180)
    return [baseCoords[0] + latOffset, baseCoords[1] + lngOffset]
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const mapElement = document.querySelector('.leaflet-container') as HTMLElement
      if (mapElement && (window as any).L) {
        const map = (mapElement as any)._leaflet_id
        if (map && (window as any).L.Map.prototype.getSize) {
          // Map will auto-invalidate on resize
        }
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [properties, center, zoom])

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      '& .leaflet-container': {
        height: '100%',
        width: '100%',
        zIndex: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        borderRadius: '12px',
        overflow: 'hidden'
      },
      '& .custom-price-marker-container': {
        background: 'transparent !important',
        border: 'none !important'
      },
      '& .leaflet-popup-content-wrapper': {
        borderRadius: '12px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.15)'
      }
    }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0, minHeight: '100%' }}
        scrollWheelZoom={true}
        key={`map-${center[0]}-${center[1]}-${zoom}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map data ©2025'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((property, index) => {
          const [lat, lng] = getCoordinates(property.location, index)
          const priceText = `$${property.price}`
          const priceIcon = L.divIcon({
            className: 'custom-price-marker-container',
            html: `
              <div style="
                background-color: #00A699;
                color: #FFFFFF;
                padding: 6px 12px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 14px;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                border: none;
                cursor: pointer;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.2;
                display: inline-block;
                pointer-events: auto;
              ">
                ${priceText}
              </div>
            `,
            iconSize: [80, 32],
            iconAnchor: [40, 16],
            popupAnchor: [0, -16]
          })

          const formatDates = () => {
            const ci = property.checkin
            const co = property.checkout
            if (!ci || !co) return null
            const a = new Date(`${ci}T12:00:00`)
            const b = new Date(`${co}T12:00:00`)
            if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
            const o: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
            return `${a.toLocaleDateString('en-US', o)} – ${b.toLocaleDateString('en-US', o)}`
          }

          return (
            <Marker key={property.id} position={[lat, lng]} icon={priceIcon}>
              <Popup maxWidth={320} className="custom-popup">
                <Box sx={{
                  width: 320,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                  bgcolor: '#FFFFFF'
                }}>
                  <Box sx={{ position: 'relative', width: '100%', height: 240 }}>
                    {property.image ? (
                      <Box
                        component="img"
                        src={property.image}
                        alt={property.title}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <Box sx={{
                        width: '100%', height: '100%', bgcolor: '#DDDDDD',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Typography sx={{ color: '#717171' }}>No Image</Typography>
                      </Box>
                    )}
                    <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5, zIndex: 10 }}>
                      <PropertyMapFavoriteButton propertyId={property.id} isGuestFavorite={property.isGuestFavorite} />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          const popup = document.querySelector('.leaflet-popup')
                          if (popup) {
                            const closeButton = popup.querySelector('.leaflet-popup-close-button') as HTMLElement
                            if (closeButton) closeButton.click()
                          }
                        }}
                        sx={{ bgcolor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', width: 32, height: 32, '&:hover': { bgcolor: '#F7F7F7' } }}
                      >
                        <CloseIcon sx={{ fontSize: 16, color: '#222222' }} />
                      </IconButton>
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.5, zIndex: 10 }}>
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <Box key={i} sx={{ width: i === 0 ? 24 : 6, height: 6, borderRadius: i === 0 ? '3px' : '50%', bgcolor: i === 0 ? '#222222' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }} />
                      ))}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      pt: 1.25,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      '& .MuiTypography-root': { margin: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        width: '100%',
                      }}
                    >
                      <Typography
                        component="div"
                        sx={{
                          flex: '1 1 auto',
                          minWidth: 0,
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#222222',
                          lineHeight: 1.25,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {property.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        <StarIcon sx={{ fontSize: 14, color: '#222222' }} />
                        <Typography component="div" sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#222222', whiteSpace: 'nowrap' }}>
                          {property.rating?.toFixed(1) || '4.8'}
                        </Typography>
                        {property.reviews !== undefined && (
                          <Typography component="div" sx={{ fontSize: '0.875rem', color: '#717171', whiteSpace: 'nowrap' }}>
                            ({property.reviews})
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {property.description && (
                      <Typography component="div" sx={{ fontSize: '0.875rem', color: '#717171', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {property.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap' }}>
                      <Typography component="span" sx={{ fontSize: '1rem', fontWeight: 600, color: '#222222' }}>
                        ${property.price}
                      </Typography>
                      {property.nights !== undefined && property.nights > 0 && (
                        <Typography component="span" sx={{ fontSize: '1rem', fontWeight: 400, color: '#717171' }}>
                          for {property.nights} nights
                        </Typography>
                      )}
                    </Box>
                    {formatDates() && (
                      <Typography component="div" sx={{ fontSize: '0.875rem', color: '#717171' }}>
                        {formatDates()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </Box>
  )
}
