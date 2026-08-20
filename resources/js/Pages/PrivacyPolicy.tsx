import { Box, Container, Paper, Stack, Typography } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Head } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

export default function PrivacyPolicy() {
  const { t, isRtl } = useLanguage()
  return (
    <Box>
      <Head title={t('privacy.title')} />
      <Navbar />
      <Box sx={{ minHeight: '80vh', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, md: 3 } }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#FFFFFF' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: '#222222' }}>{t('privacy.title')}</Typography>
            <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>
              {t('privacy.last_updated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>{t('privacy.intro_title')}</Typography>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>
                  {t('privacy.intro_text')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>{t('privacy.collect_title')}</Typography>
                <Typography variant="body1" sx={{ color: '#222222', mb: 1.5, lineHeight: 1.8 }}>{t('privacy.collect_intro')}</Typography>
                <Box component="ul" sx={{ ...(isRtl ? { pr: 3 } : { pl: 3 }), mb: 1.5 }}>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.collect_1')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.collect_2')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.collect_3')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.collect_4')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.collect_5')}</Typography></li>
                </Box>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>
                  {t('privacy.collect_auto')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>{t('privacy.use_title')}</Typography>
                <Typography variant="body1" sx={{ color: '#222222', mb: 1.5, lineHeight: 1.8 }}>{t('privacy.use_intro')}</Typography>
                <Box component="ul" sx={{ ...(isRtl ? { pr: 3 } : { pl: 3 }), mb: 1.5 }}>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.use_1')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.use_2')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.use_3')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.use_4')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.use_5')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.use_6')}</Typography></li>
                </Box>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>{t('privacy.sharing_title')}</Typography>
                <Typography variant="body1" sx={{ color: '#222222', mb: 1.5, lineHeight: 1.8 }}>{t('privacy.sharing_intro')}</Typography>
                <Box component="ul" sx={{ ...(isRtl ? { pr: 3 } : { pl: 3 }), mb: 1.5 }}>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.sharing_1')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.sharing_2')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.sharing_3')}</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.sharing_4')}</Typography></li>
                </Box>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>{t('privacy.sharing_no_sell')}</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>{t('privacy.security_title')}</Typography>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>
                  {t('privacy.security_text')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>{t('privacy.rights_title')}</Typography>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>
                  {t('privacy.rights_text')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>{t('privacy.contact_title')}</Typography>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>
                  {t('privacy.contact_text')}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}
