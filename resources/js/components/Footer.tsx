import { Box, Container as MUIContainer, Divider, Stack, Typography } from '@mui/material'
import { Link } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

export default function Footer() {
  const { t } = useLanguage()
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Box component="footer" sx={{ bgcolor: '#F7F7F7', color: '#222222', mt: 8, borderTop: '1px solid #DDDDDD' }}>
      <MUIContainer maxWidth={false} sx={{ maxWidth: { xs: '100%', md: 1160, xl: 1440 }, px: { xs: 2, md: 3 }, py: { xs: 5, md: 6 }, mx: 'auto' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 4, md: 6 }, mb: 4 }}>
          <Box>
            <Typography sx={{ color: '#222222', fontWeight: 600, mb: 2.5, fontSize: '0.875rem' }}>{t('footer.support')}</Typography>
            <Stack spacing={1.5}>
              <Box component={Link} href="/contact" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.contact_us')}</Box>
              <Box component={Link} href="/auth/login" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.log_in')}</Box>
              <Box component={Link} href="/auth/register" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.sign_up')}</Box>
            </Stack>
          </Box>
          <Box>
            <Typography sx={{ color: '#222222', fontWeight: 600, mb: 2.5, fontSize: '0.875rem' }}>{t('footer.hosting')}</Typography>
            <Stack spacing={1.5}>
              <Box component={Link} href="/auth/register" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.become_host')}</Box>
              <Box component={Link} href="/host/dashboard" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.host_resources')}</Box>
              <Box component={Link} href="/host/dashboard" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.host_dashboard')}</Box>
            </Stack>
          </Box>
          <Box>
            <Typography sx={{ color: '#222222', fontWeight: 600, mb: 2.5, fontSize: '0.875rem' }}>{t('footer.lipabnb')}</Typography>
            <Stack spacing={1.5}>
              <Box component={Link} href="/" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.home')}</Box>
              <Box component={Link} href="/about" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.about_us')}</Box>
              <Box component={Link} href="/listing" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.stays')}</Box>
            </Stack>
          </Box>
          <Box>
            <Typography sx={{ color: '#222222', fontWeight: 600, mb: 2.5, fontSize: '0.875rem' }}>{t('footer.community')}</Typography>
            <Stack spacing={1.5}>
              <Box component={Link} href="/wishlist" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.wishlist')}</Box>
              <Box component={Link} href="/bookings" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.bookings')}</Box>
              <Box component={Link} href="/chat" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.messages')}</Box>
              <Box component={Link} href="/profile/settings" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.profile')}</Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: '#DDDDDD' }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 3 }, alignItems: 'center', justifyContent: 'center', textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography sx={{ color: '#222222', fontSize: '0.875rem' }}>
              © {new Date().getFullYear()} {t('footer.lipabnb')}, Inc.
            </Typography>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: '#717171' }}>·</Box>
            <Box component={Link} href="/privacy-policy" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.privacy')}</Box>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: '#717171' }}>·</Box>
            <Box component={Link} href="/terms" onClick={scrollToTop} sx={{ color: '#222222', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>{t('footer.terms')}</Box>
          </Box>
        </Box>
      </MUIContainer>
    </Box>
  )
}
