import React, { useEffect, useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, Link as MUILink, Menu, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CloseIcon from '@mui/icons-material/Close'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Container } from 'react-bootstrap'
import { useLanguage } from '../../hooks/use-language'
import InputError from '../../components/InputError'

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

export default function SignUp() {
  const { t, language, switchLanguage, isRtl } = useLanguage()
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false)
  const currentLanguage = languages.find((l) => l.code === language) || languages[0]
  const { data, setData, post, processing, errors } = useForm({
    type: 'user' as 'user' | 'host' | 'company',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    tax_id: '',
  })
  const formWidth = 600

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const typeParam = params.get('type')
    if (typeParam === 'host' || typeParam === 'user' || typeParam === 'company') {
      setData('type', typeParam)
    }
  }, [setData])

  const googleIconEl = <Box component="img" src={socialIcon} alt="Google" sx={{ width: 24, height: 24 }} />

  return (
    <>
      <Head title={t('auth.signup.title')} />
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
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 2, fontSize: { xs: 32, md: 30 }, lineHeight: 1.15 }}>{t('auth.signup.heading')}</Typography>
                  <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
                    <form onSubmit={(e) => { e.preventDefault(); post('/register'); }}>
                      <Stack spacing={2.5}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.name')}</Typography>
                          <TextField name="name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={!!errors.name} sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }} placeholder={t('auth.signup.name_placeholder')} />
                          <InputError message={Array.isArray(errors.name) ? errors.name[0] : errors.name} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.email')}</Typography>
                          <TextField name="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={!!errors.email} sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }} placeholder={t('auth.signup.email_placeholder')} />
                          <InputError message={Array.isArray(errors.email) ? errors.email[0] : errors.email} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.type_label')}</Typography>
                          <TextField
                            select
                            name="type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value as 'user' | 'host' | 'company')}
                            error={!!errors.type}
                            sx={{
                              width: { xs: '100%', md: formWidth },
                              '& .MuiOutlinedInput-root': {
                                height: 52,
                                bgcolor: '#FFFFFF',
                                borderRadius: '8px',
                                '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' },
                                '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' },
                                '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' },
                              },
                            }}
                          >
                            <MenuItem value="user">{t('auth.signup.type_user')}</MenuItem>
                            <MenuItem value="host">{t('auth.signup.type_host')}</MenuItem>
                            <MenuItem value="company">{t('auth.signup.type_company')}</MenuItem>
                          </TextField>
                          <InputError message={Array.isArray(errors.type) ? errors.type[0] : errors.type} />
                        </Box>
                        {data.type === 'company' && (
                          <>
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.company_name')}</Typography>
                              <TextField name="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} error={!!errors.company_name} sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }} placeholder={t('auth.signup.company_name_placeholder')} />
                              <InputError message={Array.isArray(errors.company_name) ? errors.company_name[0] : errors.company_name} />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.tax_id')}</Typography>
                              <TextField name="tax_id" value={data.tax_id} onChange={(e) => setData('tax_id', e.target.value)} error={!!errors.tax_id} sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }} placeholder={t('auth.signup.tax_id_placeholder')} />
                              <InputError message={Array.isArray(errors.tax_id) ? errors.tax_id[0] : errors.tax_id} />
                            </Box>
                          </>
                        )}
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.password')}</Typography>
                          <TextField
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={!!errors.password}
                            placeholder={t('auth.signup.password_placeholder')}
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
                          <InputError message={Array.isArray(errors.password) ? errors.password[0] : errors.password} />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{t('auth.signup.password_hint')}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.confirm_password')}</Typography>
                          <TextField
                            name="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={!!errors.password_confirmation}
                            placeholder={t('auth.signup.confirm_password_placeholder')}
                            sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={() => setShowConfirmPassword((p) => !p)} onMouseDown={(e) => e.preventDefault()} edge="end" sx={{ color: '#717171' }}>
                                    {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          <InputError message={Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation} />
                        </Box>
                        <Button type="submit" variant="contained" size="large" disabled={processing} sx={{ width: { xs: '100%', md: formWidth }, height: 52, borderRadius: 999, textTransform: 'none', fontWeight: 700, fontSize: 16, bgcolor: '#AD542D', boxShadow: 'none', '&:hover': { bgcolor: '#78381C', boxShadow: 'none' } }}>{processing ? t('auth.signup.creating') : t('auth.signup.submit')}</Button>
                        <Button type="button" variant="outlined" size="large" onClick={() => setGoogleDialogOpen(true)} {...(isRtl ? { endIcon: googleIconEl } : { startIcon: googleIconEl })} sx={{ width: { xs: '100%', md: formWidth }, height: 52, borderRadius: 999, borderColor: '#D0D5DD', color: '#344054', gap: 1, '& .MuiButton-startIcon, & .MuiButton-endIcon': { margin: 0 } }}>{t('auth.signup.sign_up_google')}</Button>
                      </Stack>
                    </form>
                  </Paper>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', m: 4 }}>
                    {t('auth.signup.have_account')}{' '}
                    <MUILink component={Link} href="/login" underline="none" sx={{ color: '#AD542D', fontWeight: 600 }}>{t('auth.signup.log_in_link')}</MUILink>
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
      </Box>
    </>
  )
}
