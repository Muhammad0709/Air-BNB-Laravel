import React, { useEffect, useState } from 'react'
import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, InputAdornment, Link as MUILink, Menu, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CloseIcon from '@mui/icons-material/Close'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Container } from 'react-bootstrap'
import { useLanguage } from '../../hooks/use-language'
import InputError from '../../components/InputError'
import Toast from '../../components/shared/Toast'

const logoUrl = '/images/Logo.png'
const socialIcon = '/images/Social-icon.svg'
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'ku', name: 'Kurdish', flag: '🇮🇶' },
]

/** Laravel / Inertia may return a string or string[] per field */
function line(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined
  return Array.isArray(v) ? v[0] : v
}

type SignInPageProps = { status?: string; flash?: { success?: string } }

export default function SignIn({ status }: SignInPageProps) {
  const { t, language, switchLanguage, isRtl } = useLanguage()
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false)
  const currentLanguage = languages.find((l) => l.code === language) || languages[0]
  const { data, setData, post, processing, errors: formErrors } = useForm({ email: '', password: '', remember: false })
  const page = usePage<SignInPageProps>()
  const shared = page.props.errors as Record<string, string | string[]> | undefined
  const flashSuccess = page.props.flash?.success
  const statusFromPage = status ?? page.props.status
  const emailError = line(formErrors.email) ?? line(shared?.email)
  const passwordError = line(formErrors.password) ?? line(shared?.password)
  const loginErrorMessage = emailError || passwordError
  const [toastOpen, setToastOpen] = useState(false)
  const [successToastOpen, setSuccessToastOpen] = useState(false)
  const formWidth = 600

  useEffect(() => {
    if (loginErrorMessage) setToastOpen(true)
  }, [loginErrorMessage])

  useEffect(() => {
    if (flashSuccess || statusFromPage) setSuccessToastOpen(true)
  }, [flashSuccess, statusFromPage])

  const googleIconEl = <Box component="img" src={socialIcon} alt="Google" sx={{ width: 24, height: 24 }} />

  return (
    <>
      <Head title={t('auth.signin.title')} />
      <Box sx={{ minHeight: '100vh' }}>
        <Box sx={{ position: 'fixed', top: 16, ...(isRtl ? { left: 16 } : { right: 16 }), zIndex: 1300 }}>
          <Box
            onClick={(e: React.MouseEvent<HTMLElement>) => setLanguageAnchor(e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, borderRadius: 2,
              border: '1px solid #DDDDDD', cursor: 'pointer', bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              '&:hover': { borderColor: '#AD542D', bgcolor: '#F7F7F7' },
            }}
          >
            <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{currentLanguage.flag}</Typography>
            <Typography sx={{ color: '#222222', fontWeight: 600, fontSize: '0.875rem', marginInlineStart: 0.75 }}>{currentLanguage.code.toUpperCase()}</Typography>
            <ArrowDropDownIcon sx={{ fontSize: 22, color: '#222222' }} />
          </Box>
          <Menu
            anchorEl={languageAnchor}
            open={Boolean(languageAnchor)}
            onClose={() => setLanguageAnchor(null)}
            PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' } }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {languages.map((lang) => (
              <MenuItem key={lang.code} onClick={() => { switchLanguage(lang.code as any); setLanguageAnchor(null); }} sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#F7F7F7' } }}>
                <Stack direction="row" spacing={1.5} useFlexGap alignItems="center">
                  <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{lang.flag}</Typography>
                  <Typography sx={{ fontWeight: 400, fontSize: '0.875rem', color: '#222222' }}>{lang.name}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <Container>
          <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: 1160, width: '100%', mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 4, md: 6 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box>
                  <Stack alignItems="center" sx={{ mb: { xs: 3, md: 4 } }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
                      <Box component="img" src={logoUrl} alt="Bondoqi" sx={{ height: 70, width: 'auto', maxWidth: 380, objectFit: 'contain', display: 'block', cursor: 'pointer', margin: '0 auto' }} />
                    </Link>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: { xs: 1.5, md: 2 }, fontSize: { xs: 28, sm: 32, md: 44 }, lineHeight: 1.15 }}>{t('auth.signin.welcome')}</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: { xs: 4, md: 5 } }}>{t('auth.signin.subtitle')}</Typography>
                  <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
                    <form onSubmit={(e) => { e.preventDefault(); post('/login'); }}>
                      <Stack spacing={2.5}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signin.email')}</Typography>
                          <TextField name="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={!!emailError} sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }} placeholder={t('auth.signin.email_placeholder')} />
                          <InputError message={loginErrorMessage ? undefined : emailError} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signin.password')}</Typography>
                          <TextField
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={!!passwordError}
                            placeholder={t('auth.signin.password_placeholder')}
                            sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((p) => !p)} onMouseDown={(e) => e.preventDefault()} edge="end" sx={{ color: '#717171' }}>
                                    {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          <InputError message={loginErrorMessage ? undefined : passwordError} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <FormControlLabel control={<Checkbox size="small" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />} label={t('auth.signin.remember_me')} sx={{ color: '#151515' }} />
                          <MUILink component={Link} href="/forgot-password" underline="none" sx={{ color: '#667085', fontWeight: 600 }}>{t('auth.signin.forgot_password')}</MUILink>
                        </Box>
                        <Button type="submit" variant="contained" size="large" disabled={processing} sx={{ width: { xs: '100%', md: formWidth }, height: 52, borderRadius: 999, textTransform: 'none', fontWeight: 700, fontSize: 16, bgcolor: '#AD542D', boxShadow: 'none', '&:hover': { bgcolor: '#78381C', boxShadow: 'none' } }}>{processing ? t('auth.signin.signing_in') : t('auth.signin.submit')}</Button>
                        <Button type="button" variant="outlined" size="large" onClick={() => setGoogleDialogOpen(true)} {...(isRtl ? { endIcon: googleIconEl } : { startIcon: googleIconEl })} sx={{ width: { xs: '100%', md: formWidth }, height: 52, borderRadius: 999, borderColor: '#D0D5DD', color: '#344054', gap: 1, '& .MuiButton-startIcon, & .MuiButton-endIcon': { margin: 0 } }}>{t('auth.signin.sign_in_google')}</Button>
                      </Stack>
                    </form>
                  </Paper>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                    {t('auth.signin.no_account')}{' '}
                    <MUILink component={Link} href="/register" underline="none" sx={{ color: '#AD542D', fontWeight: 600 }}>{t('auth.signin.sign_up_link')}</MUILink>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
        <Dialog
          open={googleDialogOpen}
          onClose={() => setGoogleDialogOpen(false)}
          fullWidth
          maxWidth={false}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              overflow: 'hidden',
              width: '100%',
              maxWidth: { xs: 'min(420px, calc(100% - 32px))', md: 400 },
              mx: 2,
              border: '1px solid #ECEFF3',
              boxShadow: '0 12px 40px rgba(17, 24, 39, 0.12)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
              flexShrink: 0,
              px: 1.5,
              pt: 1.5,
              pb: 2.5,
            }}
          >
            <IconButton
              type="button"
              onClick={() => setGoogleDialogOpen(false)}
              aria-label={t('auth.signin.google_intent_cancel')}
              size="small"
              sx={{
                color: '#6B7280',
                '&:hover': { bgcolor: '#F3F4F6', color: '#111827' },
              }}
            >
              <CloseIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>
          <DialogTitle
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
              lineHeight: 1.35,
              color: '#111827',
              pt: 0,
              px: 2.5,
              pb: 2,
              borderBottom: '1px solid #F3F4F6',
              letterSpacing: '-0.01em',
            }}
          >
            {t('auth.signin.google_intent_title')}
          </DialogTitle>
          <DialogContent sx={{ px: 2.5, pt: 2.5, pb: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                fontSize: '0.875rem',
                lineHeight: 1.55,
                mb: 2.5,
              }}
            >
              {t('auth.signin.google_intent_subtitle')}
            </Typography>
            <Stack spacing={1.25}>
              <Button
                fullWidth
                variant="contained"
                disableElevation
                onClick={() => { window.location.href = '/auth/google?intent=customer' }}
                sx={{
                  py: 1.5,
                  minHeight: 48,
                  borderRadius: '999px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  bgcolor: '#AD542D',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#8a4224', boxShadow: 'none' },
                }}
              >
                {t('auth.signin.google_intent_customer')}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => { window.location.href = '/auth/google?intent=host' }}
                sx={{
                  py: 1.5,
                  minHeight: 48,
                  borderRadius: '999px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  borderColor: '#AD542D',
                  borderWidth: 1.5,
                  color: '#AD542D',
                  bgcolor: '#fff',
                  '&:hover': {
                    borderColor: '#78381C',
                    bgcolor: 'rgba(173, 84, 45, 0.06)',
                  },
                }}
              >
                {t('auth.signin.google_intent_host')}
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
        <Toast
          open={toastOpen && !!loginErrorMessage}
          onClose={() => setToastOpen(false)}
          message={loginErrorMessage ?? ''}
          severity="error"
          autoHideDuration={9000}
        />
        <Toast
          open={successToastOpen && !!(flashSuccess || statusFromPage)}
          onClose={() => setSuccessToastOpen(false)}
          message={flashSuccess ?? statusFromPage ?? ''}
          severity="success"
        />
      </Box>
    </>
  )
}
