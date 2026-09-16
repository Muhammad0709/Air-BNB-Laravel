import { useEffect, useMemo, useState } from 'react'
import { Box, IconButton } from '@mui/material'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

type PropertyImageCarouselProps = {
  image?: string | null
  images?: (string | null | undefined)[]
  fallbackImage?: string
  alt: string
  className?: string
  imageClassName?: string
  sx?: Record<string, unknown>
}

export default function PropertyImageCarousel({
  image,
  images,
  fallbackImage = '/images/popular-stay-1.svg',
  alt,
  className,
  imageClassName,
  sx,
}: PropertyImageCarouselProps) {
  const imageSources = useMemo(() => {
    const sources = [...(images?.length ? images : [image])]
      .filter((source): source is string => Boolean(source?.trim()))
    return [...new Set(sources)]
  }, [images, image])
  const galleryImages = imageSources.length > 0 ? imageSources : [fallbackImage]
  const [activeIndex, setActiveIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setActiveIndex(0)
    setImageError(false)
  }, [galleryImages.join('|')])

  const changeImage = (event: React.MouseEvent, direction: -1 | 1) => {
    event.preventDefault()
    event.stopPropagation()
    setImageError(false)
    setActiveIndex((current) => (current + direction + galleryImages.length) % galleryImages.length)
  }

  const hasMultipleImages = galleryImages.length > 1
  const displayedImage = imageError ? fallbackImage : galleryImages[activeIndex]

  return (
    <Box
      className={`property-image-carousel${className ? ` ${className}` : ''}`}
      sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...sx }}
    >
      <Box
        component="img"
        src={displayedImage}
        alt={alt}
        className={imageClassName}
        onError={() => setImageError(true)}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      {hasMultipleImages && (
        <>
          <IconButton
            className="property-image-carousel-arrow"
            aria-label="Previous image"
            onClick={(event) => changeImage(event, -1)}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              bgcolor: 'rgba(255,255,255,0.92)',
              color: '#222',
              zIndex: 2,
              opacity: { xs: 1, sm: 0 },
              transition: 'opacity 150ms ease',
              '.property-image-carousel:hover &': { opacity: 1 },
              '.property-image-carousel:focus-within &': { opacity: 1 },
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            className="property-image-carousel-arrow"
            aria-label="Next image"
            onClick={(event) => changeImage(event, 1)}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              bgcolor: 'rgba(255,255,255,0.92)',
              color: '#222',
              zIndex: 2,
              opacity: { xs: 1, sm: 0 },
              transition: 'opacity 150ms ease',
              '.property-image-carousel:hover &': { opacity: 1 },
              '.property-image-carousel:focus-within &': { opacity: 1 },
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            <ChevronRightRoundedIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  )
}
