import React, { useMemo, useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import { AppBar, Avatar, Box, Button, Container, IconButton, Stack, Toolbar, Typography, Menu, MenuItem } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import MessageIcon from '@mui/icons-material/Message'
import { useLanguage } from '../hooks/use-language'
import { useCurrency } from '../contexts/CurrencyContext'
import { getSupportedCurrencies } from '../utils/currency'

const logoUrl = '/images/Logo.png'

export type NavbarLink = { label: string; href: string }

type NavbarProps = {
  links?: NavbarLink[]
  showAuth?: boolean
  brandTo?: string
}

const linkKeys: { key: string; href: string }[] = [
  { key: 'home', href: '/' },
  { key: 'stays', href: '/listing' },
]

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'ku', name: 'Kurdish', flag: '🇮🇶' },
]

export default function Navbar({ links: linksProp, showAuth = true, brandTo = '/' }: NavbarProps) {
  const { t, language, switchLanguage, isRtl } = useLanguage()
  const { currency, setCurrency } = useCurrency()

  const { url, props } = usePage<{ supportedCurrencies?: string[] }>()
  const supportedList = props.supportedCurrencies ?? [...getSupportedCurrencies()]

  const currencies = useMemo(
    () =>
      supportedList.map((code) => {
        const key = `nav.currency_${code.toLowerCase()}`
        const translated = t(key as never) as string
        const name = translated === key ? code : translated
        return { code, name }
      }),
    [t, supportedList]
  )
  const pathname = url.split('?')[0]
  const [open, setOpen] = useState(false)
  const [currencyAnchor, setCurrencyAnchor] = useState<null | HTMLElement>(null)
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null)
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)

  const user = (props as any)?.auth?.user || null
  const isAuthenticated = !!user

  const links: NavbarLink[] = linksProp ?? linkKeys.map((l) => ({ label: t('nav.' + l.key), href: l.href }))

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/booking') return pathname === '/booking'
    return pathname.startsWith(href)
  }

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0]

  const handleCurrencyClick = (event: React.MouseEvent<HTMLElement>) => {
    setCurrencyAnchor(event.currentTarget)
  }

  const handleCurrencyClose = () => {
    setCurrencyAnchor(null)
  }

  const handleCurrencySelect = (code: string) => {
    setCurrency(code)
    handleCurrencyClose()
  }

  const currentLanguage = languages.find((l) => l.code === language) || languages[0]

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchor(event.currentTarget)
  }

  const handleLanguageClose = () => {
    setLanguageAnchor(null)
  }

  const handleLanguageSelect = (code: string) => {
    const locale = code as 'en' | 'ar' | 'ur' | 'fa' | 'tr' | 'ku'
    handleLanguageClose()
    switchLanguage(locale)
  }

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget)
  }

  const handleProfileClose = () => {
    setProfileAnchor(null)
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    router.post('/logout')
  }

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: { xs: '#ffffff', md: 'transparent' }, color: 'inherit', boxShadow: { xs: '0 1px 3px rgba(0,0,0,0.06)', md: 'none' } }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.25, md: 1.5 }, maxWidth: { xs: '100%', md: 1160, xl: 1440 }, mx: 'auto' }}>
        <Toolbar
          disableGutters
          sx={{
            gap: 2,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0 }}>
            <Box component={Link} href={brandTo} sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <Box
                component="img"
                src={logoUrl}
                alt="Bondoqi"
                sx={{
                  height: { xs: 48, sm: 56 },
                  width: 'auto',
                  maxWidth: { xs: 160, sm: 220},
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={{ md: 3, lg: 5 }}
            useFlexGap
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: '0 0 auto',
              justifyContent: 'center',
              }}
          >
            {links.map((l) => (
              <Typography
                key={l.label}
                component={Link}
                href={l.href}
                style={{ textDecoration: 'none' }}
                sx={{ color: isActive(l.href) ? '#AD542D' : '#222222', fontWeight: 700 }}
              >
                {l.label}
              </Typography>
            ))}
          </Stack>

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 }}>
            <IconButton
              aria-label="Menu"
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#222222', p: 1.25 }}
              onClick={() => setOpen(true)}
            >
              <MenuIcon sx={{ fontSize: 28 }} />
            </IconButton>
          {showAuth && (
            <Stack direction="row" spacing={2} useFlexGap sx={{ display: { xs: 'none', md: 'flex' } }} alignItems="center">
              {isAuthenticated && (
                <>
                  <IconButton
                    component={Link}
                    href="/chat"
                    aria-label={t('nav.messages')}
                    sx={{
                      color: '#AD542D',
                      p: 1,
                      transition: 'all 0.2s',
                      '&:hover': { color: '#8a4224', bgcolor: 'rgba(173, 84, 45, 0.08)' }
                    }}
                  >
                    <MessageIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                </>
              )}
              <Box
                onClick={handleLanguageClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  border: '1px solid #DDDDDD',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#AD542D', bgcolor: '#F7F7F7' }
                }}
              >
                <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{currentLanguage.flag}</Typography>
                <Typography sx={{ color: '#222222', fontWeight: 600, fontSize: '0.875rem', marginInlineStart: 0.75 }}>
                  {currentLanguage.code.toUpperCase()}
                </Typography>
                <ArrowDropDownIcon sx={{ fontSize: 22, color: '#222222', ...(isRtl ? { mr: 0.25 } : { ml: 0.25 }) }} />
              </Box>
              <Menu
                anchorEl={languageAnchor}
                open={Boolean(languageAnchor)}
                onClose={handleLanguageClose}
                PaperProps={{
                  sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {languages.map((lang) => (
                  <MenuItem
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&.Mui-selected': { bgcolor: '#FFF5F7', '&:hover': { bgcolor: '#FFF5F7' } },
                      '&:hover': { bgcolor: '#F7F7F7' }
                    }}
                  >
                    <Stack direction="row" spacing={1.5} useFlexGap alignItems="center">
                      <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{lang.flag}</Typography>
                      <Typography sx={{ fontWeight: 400, fontSize: '0.875rem', color: '#222222' }}>
                        {lang.name}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Menu>
              <Box
                onClick={handleCurrencyClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  border: '1px solid #DDDDDD',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#AD542D', bgcolor: '#F7F7F7' }
                }}
              >
                <Typography sx={{ color: '#222222', fontWeight: 600, fontSize: '0.875rem' }}>
                  {currentCurrency.code}
                </Typography>
                <ArrowDropDownIcon sx={{ fontSize: 22, color: '#222222', ...(isRtl ? { mr: 0.25 } : { ml: 0.25 }) }} />
              </Box>
              <Menu
                anchorEl={currencyAnchor}
                open={Boolean(currencyAnchor)}
                onClose={handleCurrencyClose}
                PaperProps={{
                  sx: { mt: 1, minWidth: 160, borderRadius: 2, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {currencies.map((curr) => (
                  <MenuItem
                    key={curr.code}
                    onClick={() => handleCurrencySelect(curr.code)}
                    selected={currency === curr.code}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&.Mui-selected': { bgcolor: '#FFF5F7', '&:hover': { bgcolor: '#FFF5F7' } },
                      '&:hover': { bgcolor: '#F7F7F7' }
                    }}
                  >
                    <Stack>
                      <Typography sx={{ fontWeight: currency === curr.code ? 600 : 400, fontSize: '0.875rem', color: '#222222' }}>
                        {curr.code}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#717171' }}>{curr.name}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Menu>
              {isAuthenticated ? (
                <>
                  <IconButton
                    onClick={handleProfileClick}
                    sx={{ p: 0 }}
                    aria-label="Profile menu"
                  >
                    <Avatar
                      src={(user as any)?.profile_picture ?? undefined}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#AD542D',
                        fontSize: '1rem',
                        fontWeight: 700
                      }}
                    >
                      {(user as any)?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={profileAnchor}
                    open={Boolean(profileAnchor)}
                    onClose={handleProfileClose}
                    PaperProps={{
                      sx: { mt: 1.5, minWidth: 200, borderRadius: 2, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem
                      component={Link}
                      href="/profile/settings"
                      onClick={handleProfileClose}
                      sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#F7F7F7' } }}
                    >
                      <Typography sx={{ fontWeight: 400, fontSize: '0.875rem', color: '#222222' }}>{t('nav.profile')}</Typography>
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/wishlist"
                      onClick={handleProfileClose}
                      sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#F7F7F7' } }}
                    >
                      <Typography sx={{ fontWeight: 400, fontSize: '0.875rem', color: '#222222' }}>{t('nav.wishlist')}</Typography>
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/bookings"
                      onClick={handleProfileClose}
                      sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#F7F7F7' } }}
                    >
                      <Typography sx={{ fontWeight: 400, fontSize: '0.875rem', color: '#222222' }}>{t('nav.booking_history')}</Typography>
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/notifications"
                      onClick={handleProfileClose}
                      sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#F7F7F7' } }}
                    >
                      <Typography sx={{ fontWeight: 400, fontSize: '0.875rem', color: '#222222' }}>{t('nav.notifications')}</Typography>
                    </MenuItem>
                    {/* <MenuItem
                      component={Link}
                      href="/register"
                      onClick={handleProfileClose}
                      sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#F7F7F7' } }}
                    >
                      <Stack direction="row" spacing={1.5} useFlexGap alignItems="center">
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#FFF5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: '1rem' }}>🏠</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#222222' }}>{t('nav.become_host')}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#717171' }}>{t('nav.become_host_sub')}</Typography>
                        </Box>
                      </Stack>
                    </MenuItem> */}
                    <MenuItem
                      onClick={(e) => { handleProfileClose(); handleLogout(e) }}
                      sx={{ py: 1.5, px: 2, borderTop: '1px solid #E5E7EB', '&:hover': { bgcolor: '#F7F7F7' } }}
                    >
                      <Typography sx={{ fontSize: '0.875rem', color: '#222222', fontWeight: 600 }}>{t('nav.logout')}</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Typography component={Link} href="/login" sx={{ textDecoration: 'none', color: '#222222', fontWeight: 700 }}>{t('nav.log_in')}</Typography>
              )}
            </Stack>
          )}
          </Box>
        </Toolbar>
      </Container>

      {open && (
        <Box
          sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.45)', zIndex: 1200, backdropFilter: 'blur(2px)' }}
          onClick={() => setOpen(false)}
        >
          <Box
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              ...(isRtl ? { left: 0 } : { right: 0 }),
              width: { xs: 'min(76vw, 270px)', sm: 288 },
              maxWidth: '100%',
              height: '100%',
              bgcolor: '#fff',
              boxShadow: isRtl ? '4px 0 24px rgba(0,0,0,0.12)' : '-4px 0 24px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Stack
              sx={{
                flexShrink: 0,
                px: 2,
                pt: 1,
                pb: 1.25,
                borderBottom: '1px solid #E8E8E8',
                gap: 0.25,
              }}
            >
              {/* Menu then close in DOM: LTR = title inner-left / × outer-right; RTL = title inner-right / × outer-left */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ width: '100%', gap: 1 }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: '#222',
                    letterSpacing: '-0.02em',
                    fontSize: '1rem',
                    lineHeight: 1.25,
                  }}
                >
                  {t('nav.menu')}
                </Typography>
                <IconButton
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  sx={{
                    color: '#6B7280',
                    width: 40,
                    height: 40,
                    p: 0,
                    flexShrink: 0,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Stack>
            </Stack>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <Stack component="nav" spacing={0} sx={{ px: 1.5, py: 2 }}>
                {links.map((l) => (
                  <Box
                    key={l.label}
                    component={Link}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    sx={{
                      display: 'block',
                      width: '100%',
                      py: 1.25,
                      px: 1.5,
                      borderRadius: 2,
                      textDecoration: 'none',
                      color: isActive(l.href) ? '#AD542D' : '#222222',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      bgcolor: isActive(l.href) ? 'rgba(173, 84, 45, 0.08)' : 'transparent',
                      transition: 'background-color 0.15s',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    {l.label}
                  </Box>
                ))}
                {isAuthenticated && (
                  <>
                    {[
                      { href: '/chat', label: t('nav.messages') },
                      { href: '/wishlist', label: t('nav.wishlist') },
                      { href: '/profile/settings', label: t('nav.profile') },
                      { href: '/bookings', label: t('nav.booking_history') },
                      { href: '/notifications', label: t('nav.notifications') },
                    ].map((item) => (
                      <Box
                        key={item.href}
                        component={Link}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        sx={{
                          display: 'block',
                          width: '100%',
                          py: 1.25,
                          px: 1.5,
                          borderRadius: 2,
                          textDecoration: 'none',
                          color: isActive(item.href) ? '#AD542D' : '#222222',
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          bgcolor: isActive(item.href) ? 'rgba(173, 84, 45, 0.08)' : 'transparent',
                          transition: 'background-color 0.15s',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                        }}
                      >
                        {item.label}
                      </Box>
                    ))}
                  </>
                )}
              </Stack>
            </Box>

            {showAuth && (
              <Box
                sx={{
                  flexShrink: 0,
                  borderTop: '1px solid #E8E8E8',
                  bgcolor: '#FAFAFA',
                  px: 2,
                  py: 2,
                }}
              >
                <Stack spacing={2} useFlexGap>
                  <Box sx={{ width: '100%' }}>
                    <Typography sx={{ color: '#374151', fontWeight: 600, fontSize: '0.75rem', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {t('nav.language')}
                    </Typography>
                    <Box
                      onClick={handleLanguageClick}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        width: '100%',
                        px: 1.5,
                        py: 1.25,
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
                        bgcolor: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#AD542D', bgcolor: '#fff' },
                      }}
                    >
                      <Stack direction="row" spacing={1} useFlexGap alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>{currentLanguage.flag}</Typography>
                        <Typography sx={{ color: '#222222', fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {currentLanguage.name}
                        </Typography>
                      </Stack>
                      <ArrowDropDownIcon sx={{ fontSize: 22, color: '#6B7280', flexShrink: 0 }} />
                    </Box>
                    <Menu
                      anchorEl={languageAnchor}
                      open={Boolean(languageAnchor)}
                      onClose={handleLanguageClose}
                      PaperProps={{ sx: { mt: 1, minWidth: 220, maxWidth: 'min(100vw - 32px, 320px)', borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      {languages.map((lang) => (
                        <MenuItem
                          key={lang.code}
                          onClick={() => handleLanguageSelect(lang.code)}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&.Mui-selected': { bgcolor: '#FFF5F7', '&:hover': { bgcolor: '#FFF5F7' } },
                            '&:hover': { bgcolor: '#F7F7F7' },
                          }}
                        >
                          <Stack direction="row" spacing={1.5} useFlexGap alignItems="center">
                            <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{lang.flag}</Typography>
                            <Typography sx={{ fontWeight: 400, fontSize: '0.875rem', color: '#222222' }}>{lang.name}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <Typography sx={{ color: '#374151', fontWeight: 600, fontSize: '0.75rem', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {t('nav.currency')}
                    </Typography>
                    <Box
                      onClick={handleCurrencyClick}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        width: '100%',
                        px: 1.5,
                        py: 1.25,
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
                        bgcolor: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#AD542D', bgcolor: '#fff' },
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#222222',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          minWidth: 0,
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {currentCurrency.code} — {currentCurrency.name}
                      </Typography>
                      <ArrowDropDownIcon sx={{ fontSize: 22, color: '#6B7280', flexShrink: 0 }} />
                    </Box>
                    <Menu
                      anchorEl={currencyAnchor}
                      open={Boolean(currencyAnchor)}
                      onClose={handleCurrencyClose}
                      PaperProps={{ sx: { mt: 1, minWidth: 220, maxWidth: 'min(100vw - 32px, 320px)', borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      {currencies.map((curr) => (
                        <MenuItem
                          key={curr.code}
                          onClick={() => handleCurrencySelect(curr.code)}
                          selected={currency === curr.code}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&.Mui-selected': { bgcolor: '#FFF5F7', '&:hover': { bgcolor: '#FFF5F7' } },
                            '&:hover': { bgcolor: '#F7F7F7' },
                          }}
                        >
                          <Stack>
                            <Typography sx={{ fontWeight: currency === curr.code ? 600 : 400, fontSize: '0.875rem', color: '#222222' }}>{curr.code}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#717171' }}>{curr.name}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>

                  {isAuthenticated ? (
                    <Stack direction="row" spacing={1.5} useFlexGap alignItems="center" sx={{ width: '100%', pt: 0.5 }}>
                      <Avatar
                        src={(user as any)?.profile_picture ?? undefined}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: '#AD542D',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {(user as any)?.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#111', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(user as any)?.name ?? ''}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(user as any)?.email ?? ''}
                        </Typography>
                      </Box>
                    </Stack>
                  ) : null}
                  {isAuthenticated ? (
                    <Button
                      fullWidth
                      onClick={(e) => {
                        setOpen(false)
                        handleLogout(e)
                      }}
                      variant="contained"
                      sx={{
                        bgcolor: '#AD542D',
                        py: 1.25,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#78381C', boxShadow: 'none' },
                      }}
                    >
                      {t('nav.logout')}
                    </Button>
                  ) : (
                    <Button component={Link} href="/login" fullWidth variant="contained" onClick={() => setOpen(false)} sx={{ bgcolor: '#AD542D', py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#78381C' } }}>
                      {t('nav.log_in')}
                    </Button>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </AppBar>
  )
}
