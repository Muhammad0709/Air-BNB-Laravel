import React, { useRef, useState, useEffect } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FeaturedCard from './FeaturedCard'

type PropertyItem = {
  image: string
  title: string
  location: string
  price: number
  id?: number | string
  rating?: number
  reviews?: number
  isGuestFavorite?: boolean
}

type HorizontalScrollSectionProps = {
  title: string
  items: PropertyItem[]
  showScrollButtons?: boolean
}

export default function HorizontalScrollSection({ 
  title, 
  items, 
  showScrollButtons = true 
}: HorizontalScrollSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftButton(scrollLeft > 0)
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
      return () => {
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [items])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    // Scroll by approximately 4 cards (310px * 4 + gaps)
    const scrollAmount = 310 * 4 + 16 * 3
    const newScrollLeft = 
      direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  return (
    <Box className="airbnb-horizontal-section">
      <Box className="airbnb-section-header">
        <Typography className="airbnb-section-title" component="h2">
          {title}
        </Typography>
        {showScrollButtons && items.length >= 7 && (
          <Box className="airbnb-scroll-buttons">
            <IconButton
              className="airbnb-scroll-button"
              onClick={() => scroll('left')}
              disabled={!showLeftButton}
              sx={{
                width: 32,
                height: 32,
                border: '1px solid #DDDDDD',
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: '#F7F7F7',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.18)'
                },
                '&.Mui-disabled': {
                  opacity: 0.3
                }
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18, color: '#222222' }} />
            </IconButton>
            <IconButton
              className="airbnb-scroll-button"
              onClick={() => scroll('right')}
              disabled={!showRightButton}
              sx={{
                width: 32,
                height: 32,
                border: '1px solid #DDDDDD',
                backgroundColor: 'white',
                marginLeft: 1,
                '&:hover': {
                  backgroundColor: '#F7F7F7',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.18)'
                },
                '&.Mui-disabled': {
                  opacity: 0.3
                }
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 18, color: '#222222' }} />
            </IconButton>
          </Box>
        )}
      </Box>
      <Box 
        className="airbnb-scroll-container"
        ref={scrollContainerRef}
      >
        <Box className="airbnb-cards-wrapper">
          {items.map((item, idx) => (
            <Box key={idx} className="airbnb-card-item">
              <FeaturedCard
                image={item.image}
                title={item.title}
                location={item.location}
                price={item.price}
                id={item.id || idx + 1}
                rating={item.rating}
                reviews={item.reviews}
                isGuestFavorite={item.isGuestFavorite}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
