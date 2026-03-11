import React from 'react'
import { Box } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'

/**
 * Favorite icon: two layers so outline always shows.
 * isFavorited = false → dark fill + white outline
 * isFavorited = true  → red fill + white outline
 * Smaller on mobile (xs), default size on sm+.
 */
const sizeDesktop = 26
const sizeMobile = 20
const fillFavorited = '#E31C5F'
const fillDefault = '#222222'

type CardFavoriteIconProps = {
  isFavorited?: boolean
}

export default function CardFavoriteIcon({ isFavorited = false }: CardFavoriteIconProps) {
  const fill = isFavorited ? fillFavorited : fillDefault

  return (
    <Box
      className="card-favorite-icon-wrapper"
      sx={{
        position: 'relative',
        width: { xs: sizeMobile, sm: sizeDesktop },
        height: { xs: sizeMobile, sm: sizeDesktop },
        display: 'inline-flex',
      }}
    >
      {/* Layer 1: white outline only */}
      <FavoriteIcon
        className="card-favorite-icon-outline"
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          fontSize: { xs: sizeMobile, sm: sizeDesktop },
          fill: 'transparent',
          stroke: '#ffffff',
          strokeWidth: 2.5,
        }}
      />
      {/* Layer 2: fill (dark or red) */}
      <FavoriteIcon
        className="card-favorite-icon-fill"
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          fontSize: { xs: sizeMobile, sm: sizeDesktop },
          fill,
          stroke: 'none',
        }}
      />
    </Box>
  )
}
