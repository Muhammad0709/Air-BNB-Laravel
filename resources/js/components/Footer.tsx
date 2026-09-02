import { Box, Container as MUIContainer, Divider, IconButton, Stack, Typography } from '@mui/material'
import { Link, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'

export default function Footer() {
  const { t } = useLanguage()
  const { auth } = usePage().props as { auth?: { user?: { type?: string } | null } }
  const isCustomer = auth?.user?.type === 'User'
  const isLoggedIn = !!auth?.user
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const becomeHost = () => {
    scrollToTop()
    router.post('/switch-to-host')
  }

  /** Same visual as other footer links (Box+Link); avoids Typography body1/theme mismatch */
  const footerLinkSx = {
    color: '#222222',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 400,
    fontFamily: 'inherit',
    letterSpacing: 'normal',
    '&:hover': { textDecoration: 'underline' },
  } as const

  return (
    <div className="footer-fix-bottom">
      <Box component="footer" className="site-footer" sx={{ color: '#222222', mt: { xs: 4, md: 8 } }}>
        <MUIContainer
          maxWidth={false}
          sx={{
            maxWidth: { xs: '100%', md: 1160, xl: 1440 },
            px: { xs: 2, md: 3 },
            pt: { xs: 4, md: 7 },
            pb: { xs: 3, md: 4 },
            mx: 'auto',
          }}
        >
        <Box
          sx={{
            display: 'grid',
            alignItems: 'start',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: '1.35fr repeat(3, minmax(0, 1fr))' },
            columnGap: { xs: 2, sm: 3, md: 6 },
            rowGap: { xs: 3, md: 4 },
            mb: { xs: 3, md: 5 },
          }}
        >
          <Box className="footer-brand" sx={{ gridColumn: { xs: '1 / -1', md: 'auto' }, minWidth: 0 }}>
            <Box component={Link} href="/" onClick={scrollToTop} className="footer-logo-link">
              <Box component="img" src="/images/Logo.png" alt={t('footer.lipabnb')} className="footer-logo" />
            </Box>
            <Typography sx={{ color: '#667085', fontSize: '.875rem', lineHeight: 1.65, maxWidth: 260, mt: 2 }}>
              {t('footer.lipabnb')}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#222222', fontWeight: 600, mb: { xs: 1, md: 2.5 }, fontSize: '0.875rem' }}>{t('footer.support')}</Typography>
            <Stack spacing={1} useFlexGap>
              <Box component={Link} href="/contact" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.contact_us')}</Box>
              {!isLoggedIn && <Box component={Link} href="/login" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.log_in')}</Box>}
              {!isLoggedIn && <Box component={Link} href="/register" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.sign_up')}</Box>}
            </Stack>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#222222', fontWeight: 600, mb: { xs: 1, md: 2.5 }, fontSize: '0.875rem' }}>{t('footer.lipabnb')}</Typography>
            <Stack spacing={1} useFlexGap>
              <Box component={Link} href="/" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.home')}</Box>
              <Box component={Link} href="/about" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.about_us')}</Box>
              <Box component={Link} href="/listing" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.stays')}</Box>
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
                  {/*
                  Toggle: uncomment this block and add `Switch` to the @mui/material import above.
                  <Stack spacing={1} useFlexGap sx={{ alignItems: 'flex-start', width: '100%', pt: 0.5 }}>
                    <Box
                      sx={{
                        direction: 'ltr',
                        lineHeight: 0,
                        alignSelf: 'flex-start',
                        p: '2px',
                        borderRadius: '16px',
                        background: 'linear-gradient(180deg, #ffffff 0%, #f3f3f3 100%)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                      }}
                    >
                      <Switch
                        onChange={(_, checked) => {
                          if (checked) becomeHost()
                        }}
                        sx={{
                          m: 0,
                          p: 0,
                          width: 52,
                          height: 30,
                          '& .MuiSwitch-switchBase': {
                            p: 0,
                            top: 3,
                            left: 3,
                            '&.Mui-checked': {
                              transform: 'translateX(24px)',
                              '& + .MuiSwitch-track': {
                                background: 'linear-gradient(180deg, #c0603d 0%, #9a4528 100%)',
                                opacity: 1,
                                borderColor: 'rgba(0,0,0,0.12)',
                                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.15)',
                              },
                            },
                            '&.Mui-focusVisible .MuiSwitch-thumb': {
                              boxShadow: '0 0 0 3px rgba(173, 84, 45, 0.35)',
                            },
                          },
                          '& .MuiSwitch-thumb': {
                            width: 22,
                            height: 22,
                            background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
                            border: '1px solid rgba(0,0,0,0.08)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.18), 0 1px 1px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
                          },
                          '& .MuiSwitch-track': {
                            borderRadius: 15,
                            opacity: 1,
                            background: 'linear-gradient(180deg, #ebebeb 0%, #dedede 100%)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08), inset 0 -1px 0 rgba(255,255,255,0.5)',
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                  */}
                </>
              )}
            </Stack>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#222222', fontWeight: 600, mb: { xs: 1, md: 2.5 }, fontSize: '0.875rem' }}>{t('footer.community')}</Typography>
            <Stack spacing={1} useFlexGap>
              <Box component={Link} href="/wishlist" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.wishlist')}</Box>
              <Box component={Link} href="/bookings" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.bookings')}</Box>
              {isLoggedIn && <Box component={Link} href="/chat" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.messages')}</Box>}
              {isLoggedIn && <Box component={Link} href="/profile/settings" onClick={scrollToTop} sx={footerLinkSx}>{t('footer.profile')}</Box>}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 2, md: 3 }, borderColor: '#E4E7EC' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 0.75, md: 1.25 },
            textAlign: { xs: 'center', sm: 'start' },
          }}
        >
          <Typography sx={{ color: '#222222', fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
            © {new Date().getFullYear()} {t('footer.lipabnb')}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
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
                color: '#222222',
                textDecoration: 'none',
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                whiteSpace: 'nowrap',
                '&:hover': { textDecoration: 'underline' },
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
                color: '#222222',
                textDecoration: 'none',
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                whiteSpace: 'nowrap',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('footer.terms')}
            </Box>
          </Box>
          <IconButton onClick={scrollToTop} className="footer-top-button" aria-label="Back to top">
            <ArrowUpwardRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </MUIContainer>
      </Box>
    </div>
  )
}
