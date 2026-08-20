import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Container } from 'react-bootstrap'
import { Box, Typography } from '@mui/material'
import { Head } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

export default function TermsOfService() {
  const { t } = useLanguage()
  return (
    <div>
      <Head title={t('terms.title')} />
      <Navbar />
      <Box sx={{ py: 8, minHeight: '60vh' }}>
        <Container>
          <Typography component="h1" sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#222222', mb: 4 }}>{t('terms.title')}</Typography>
          <Box sx={{ color: '#222222', fontSize: '1rem', lineHeight: 1.8 }}>
            <Typography sx={{ mb: 3 }}>{t('terms.welcome')}</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>{t('terms.acceptance_title')}</Typography>
            <Typography sx={{ mb: 3 }}>{t('terms.acceptance_text')}</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>{t('terms.use_title')}</Typography>
            <Typography sx={{ mb: 3 }}>{t('terms.use_text')}</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>{t('terms.accounts_title')}</Typography>
            <Typography sx={{ mb: 3 }}>{t('terms.accounts_text')}</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>{t('terms.booking_title')}</Typography>
            <Typography sx={{ mb: 3 }}>{t('terms.booking_text')}</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>{t('terms.liability_title')}</Typography>
            <Typography sx={{ mb: 3 }}>{t('terms.liability_text')}</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>{t('terms.contact_title')}</Typography>
            <Typography sx={{ mb: 3 }}>{t('terms.contact_text')}</Typography>
          </Box>
        </Container>
      </Box>
      <Footer />
    </div>
  )
}
