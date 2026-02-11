import React from 'react'
import { Head } from '@inertiajs/react'
import { Box, Typography } from '@mui/material'
import { useLanguage } from '../hooks/use-language'

export default function Welcome() {
  const { t } = useLanguage()
  return (
    <>
      <Head title={t('welcome.title')} />
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          {t('welcome.heading')}
        </Typography>
        <Typography variant="body1">
          {t('welcome.subtitle')}
        </Typography>
      </Box>
    </>
  )
}

