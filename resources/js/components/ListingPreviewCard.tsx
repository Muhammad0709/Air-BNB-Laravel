import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import StarIcon from '@mui/icons-material/Star'

interface ListingPreviewCardProps {
  image: string
  title: string
  location: string
  reviews: number
  rating: number
}

export default function ListingPreviewCard({ image, title, location, reviews, rating }: ListingPreviewCardProps) {
  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon 
          key={i} 
          sx={{ 
            fontSize: 14, 
            color: i <= rating ? '#FFD700' : '#E5E7EB' 
          }} 
        />
      )
    }
    return stars
  }

  return (
    <Paper elevation={0} className="listing-preview-card" sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box 
          sx={{ 
            width: 120, 
            height: 90, 
            borderRadius: 2, 
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          <img 
            src={image} 
            alt={title} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#111827', 
              mb: 1,
              fontSize: '1.125rem'
            }}
          >
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: '#6B7280' }} />
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {renderStars()}
            </Box>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              ({reviews} reviews)
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
