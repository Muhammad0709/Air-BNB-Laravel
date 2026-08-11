import React from 'react'
import { Container } from 'react-bootstrap'
import { Box, Button, Typography } from '@mui/material'
import { Link } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

export default function CtaReady() {
  const { t } = useLanguage()
  return (
    <Box className="cta-ready">
      <Container>
        <Typography component="h2" className="cta-title">{t('about.cta_title')}</Typography>
        <Typography className="cta-sub">{t('about.cta_sub')}</Typography>
        <Button
          component={Link}
          href="/listing"
          variant="contained"
          className="cta-btn"
          disableElevation
        >
          {t('about.cta_button')}
        </Button>
      </Container>
    </Box>
  )
}

