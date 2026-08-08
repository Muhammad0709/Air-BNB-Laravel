import { Box, Container as MUIContainer, Divider, Stack, Typography } from '@mui/material'
import { Link, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

export default function Footer() {
  const { t } = useLanguage()
  const { auth } = usePage().props as { auth?: { user?: { type?: string } | null } }
  const isAuthenticated = !!auth?.user
  const isCustomer = auth?.user?.type === 'User'
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const becomeHost = () => {
    scrollToTop()
    router.post('/switch-to-host')
  }

  const columnHeadingSx = {
    color: '#111827',
    fontWeight: 700,
    mb: { xs: 1, md: 2.5 },
    fontSize: '0.9375rem',
    letterSpacing: '-0.005em',
  } as const

  /** Same visual as other footer links (Box+Link); avoids Typography body1/theme mismatch */
  const footerLinkSx = {
    color: '#4B5563',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 400,
    fontFamily: 'inherit',
    letterSpacing: 'normal',
    transition: 'color 0.15s ease',
    '&:hover': { color: '#AD542D', textDecoration: 'underline' },
  } as const

  return (
    <div className="footer-fix-bottom">
      <Box component="footer" sx={{ bgcolor: '#F7F7F7', color: '#222222', mt: { xs: 4, md: 8 }, borderTop: '1px solid #DDDDDD' }}>
        <MUIContainer
          maxWidth={false}
          sx={{
            maxWidth: { xs: '100%', md: 1160, xl: 1440 },
            px: { xs: 2, md: 3 },
            pt: { xs: 3, md: 6 },
            pb: { xs: 2, md: 6 },
            mx: 'auto',
          }}
        >
        <Box
          sx={{
            display: 'grid',
            alignItems: 'start',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            columnGap: { xs: 2, sm: 3, md: 6 },
            rowGap: { xs: 1.5, sm: 2, md: 4 },
            mb: { xs: 2, md: 4 },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={columnHeadingSx}>{t('footer.support')}</Typography>
            <Stack spacing={1.25} useFlexGap>
              <Box component={Link} href="/contact" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.contact_us')}</Box>
              {!isAuthenticated && (
                <>
                  <Box component={Link} href="/login" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.log_in')}</Box>
                  <Box component={Link} href="/register" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.sign_up')}</Box>
                </>
              )}
            </Stack>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={columnHeadingSx}>{t('footer.lipabnb')}</Typography>
            <Stack spacing={1.25} useFlexGap>
              <Box component={Link} href="/" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.home')}</Box>
              <Box component={Link} href="/listing" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.stays')}</Box>
              <Box component={Link} href="/about" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.about_us')}</Box>
              {isCustomer && (
                <>
                  <Box
                    component="span"
                    role="button"
                    tabIndex={0}
                    onClick={becomeHost}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        becomeHost()
                      }
                    }}
                    sx={{
                      ...footerLinkSx,
                      cursor: 'pointer',
                      userSelect: 'none',
                      display: 'block',
                      width: '100%',
                      pt: 0.5,
                    }}
                  >
                    {t('footer.become_host')}
                  </Box>
                </>
              )}
            </Stack>
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' }, minWidth: 0 }}>
            <Typography sx={columnHeadingSx}>{t('footer.community')}</Typography>
            <Stack spacing={1.25} useFlexGap>
              <Box component={Link} href="/wishlist" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.wishlist')}</Box>
              <Box component={Link} href="/bookings" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.bookings')}</Box>
              <Box component={Link} href="/chat" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.messages')}</Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 1.5, md: 3 }, borderColor: '#DDDDDD' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 1, sm: 2 },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap>
            <Box
              component="img"
              src="/images/Logo.png"
              alt=""
              aria-hidden
              sx={{ height: 20, width: 'auto', objectFit: 'contain', opacity: 0.85 }}
            />
            <Typography sx={{ color: '#6B7280', fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
              © {new Date().getFullYear()} {t('footer.lipabnb')}
            </Typography>
          </Stack>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Box
              component={Link}
              href="/privacy-policy"
              onClick={scrollToTop}
              sx={{
                color: '#4B5563',
                textDecoration: 'none',
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
                '&:hover': { color: '#AD542D', textDecoration: 'underline' },
              }}
            >
              {t('footer.privacy')}
            </Box>
            <Typography component="span" sx={{ color: '#C4C4C4', fontSize: '0.75rem', lineHeight: 1, userSelect: 'none' }} aria-hidden>
              ·
            </Typography>
            <Box
              component={Link}
              href="/terms"
              onClick={scrollToTop}
              sx={{
                color: '#4B5563',
                textDecoration: 'none',
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
                '&:hover': { color: '#AD542D', textDecoration: 'underline' },
              }}
            >
              {t('footer.terms')}
            </Box>
          </Box>
        </Box>
      </MUIContainer>
      </Box>
    </div>
  )
}
