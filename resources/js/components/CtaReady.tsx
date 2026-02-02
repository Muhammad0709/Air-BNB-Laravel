import React from 'react'
import { Container } from 'react-bootstrap'
import { Box, Button, Typography } from '@mui/material'
import { Link } from '@inertiajs/react'

export default function CtaReady() {
  return (
    <Box className="cta-ready">
      <Container>
        <Typography component="h2" className="cta-title">Ready to Book Your Next Stay?</Typography>
        <Typography className="cta-sub">Join thousands of happy travelers who have found their perfect accommodations with us</Typography>
        <Button 
          component={Link} 
          href="/listing" 
          variant="contained" 
          className="cta-btn"
          disableElevation
          sx={{
            '&.cta-btn': {
              background: '#AD542D !important',
              color: '#fff !important',
              borderRadius: '999px !important',
              padding: '16px 34px !important',
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 10px 24px rgba(255, 56, 92, 0.35) !important',
              border: 'none !important',
              '& .MuiButton-root': {
                borderRadius: '999px !important',
              }
            },
            '&.cta-btn:hover': {
              background: '#78381C !important',
              boxShadow: '0 10px 24px rgba(255, 56, 92, 0.35) !important',
            }
          }}
        >
          Explore Listings
        </Button>
      </Container>
    </Box>
  )
}

