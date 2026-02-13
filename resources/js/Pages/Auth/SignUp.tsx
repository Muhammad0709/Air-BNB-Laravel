import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { Box, Button, Link as MUILink, Menu, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Container } from 'react-bootstrap'
import { useLanguage } from '../../hooks/use-language'

const logoUrl = '/images/logo-main.png'
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
  const currentLanguage = languages.find((l) => l.code === language) || languages[0]
  const { data, setData, post, processing, errors } = useForm({ name: '', email: '', password: '', password_confirmation: '' })
  const formWidth = 600

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
                      <Box component="img" src={logoUrl} alt="Bondoqi" sx={{ height: { xs: 120, md: 150 }, width: 'auto', maxWidth: { xs: 450, md: 600 }, objectFit: 'contain', display: 'block', cursor: 'pointer', margin: '0 auto' }} />
                    </Link>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 2, fontSize: { xs: 32, md: 30 }, lineHeight: 1.15 }}>{t('auth.signup.heading')}</Typography>
                  <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
                    <form onSubmit={(e) => { e.preventDefault(); post('/auth/register'); }}>
                      <Stack spacing={2.5}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.name')}</Typography>
                          <TextField name="name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={!!errors.name} helperText={errors.name} sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }} placeholder={t('auth.signup.name_placeholder')} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.email')}</Typography>
                          <TextField name="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={!!errors.email} helperText={errors.email} sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }} placeholder={t('auth.signup.email_placeholder')} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.password')}</Typography>
                          <TextField name="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={!!errors.password} helperText={errors.password} sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }} placeholder={t('auth.signup.password_placeholder')} />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{t('auth.signup.password_hint')}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6B7280', fontSize: 14, fontWeight: 600 }}>{t('auth.signup.confirm_password')}</Typography>
                          <TextField name="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} error={!!errors.password_confirmation} helperText={errors.password_confirmation} sx={{ width: { xs: '100%', md: formWidth }, '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px', '& fieldset': { borderColor: '#E6E8EC', borderRadius: '8px' }, '&:hover fieldset': { borderColor: '#D1D5DB', borderRadius: '8px' }, '&.Mui-focused fieldset': { borderColor: '#C7CBD4', borderRadius: '8px' }, }, '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 } }} placeholder={t('auth.signup.confirm_password_placeholder')} />
                        </Box>
                        <Button type="submit" variant="contained" size="large" disabled={processing} sx={{ width: { xs: '100%', md: formWidth }, height: 52, borderRadius: 999, textTransform: 'none', fontWeight: 700, fontSize: 16, bgcolor: '#AD542D', boxShadow: 'none', '&:hover': { bgcolor: '#78381C', boxShadow: 'none' } }}>{processing ? t('auth.signup.creating') : t('auth.signup.submit')}</Button>
                        <Button type="button" variant="outlined" size="large" {...(isRtl ? { endIcon: googleIconEl } : { startIcon: googleIconEl })} sx={{ width: { xs: '100%', md: formWidth }, height: 52, borderRadius: 999, borderColor: '#D0D5DD', color: '#344054', gap: 1, '& .MuiButton-startIcon, & .MuiButton-endIcon': { margin: 0 } }}>{t('auth.signup.sign_up_google')}</Button>
                      </Stack>
                    </form>
                  </Paper>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', m: 4 }}>
                    {t('auth.signup.have_account')}{' '}
                    <MUILink component={Link} href="/auth/login" underline="none" sx={{ color: '#AD542D', fontWeight: 600 }}>{t('auth.signup.log_in_link')}</MUILink>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  )
}
