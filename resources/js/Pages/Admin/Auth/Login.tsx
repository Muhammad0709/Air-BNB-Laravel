import React, { useState } from 'react'
import { Box, Button, IconButton, InputAdornment, Link, Menu, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Container, Row, Col } from 'react-bootstrap'
import { Head, Link as InertiaLink, useForm } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'

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

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '24px' },
  '& .MuiOutlinedInput-root fieldset': { borderRadius: '24px' },
}

export default function AdminLogin() {
  const { t, language, switchLanguage, isRtl } = useLanguage()
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const currentLanguage = languages.find((l) => l.code === language) || languages[0]
  const { data, setData, post, processing, errors } = useForm({ email: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/login', { onSuccess: () => {} })
  }

  const googleIconEl = <Box component="img" src={socialIcon} alt="Google" sx={{ width: 24, height: 24 }} />

  return (
    <>
      <Head title={t('auth.admin_login.title')} />
      <Box className="auth-login-page" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F9FAFB' }}>
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
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '24px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  bgcolor: '#FFFFFF',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box component="img" src={logoUrl} alt="Bondoqi" sx={{ height: 100, width: 'auto', maxWidth: 380, objectFit: 'contain', display: 'block', margin: '0 auto', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#222222', mb: 1 }}>
                    {t('auth.admin_login.heading')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#717171' }}>
                    {t('auth.admin_login.subtitle')}
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label={t('auth.admin_login.email')}
                      name="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                      variant="outlined"
                      sx={inputSx}
                    />

                    <TextField
                      fullWidth
                      label={t('auth.admin_login.password')}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      error={!!errors.password}
                      helperText={errors.password}
                      required
                      variant="outlined"
                      sx={inputSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              onClick={() => setShowPassword((p) => !p)}
                              onMouseDown={(e) => e.preventDefault()}
                              edge="end"
                              sx={{ color: '#717171' }}
                            >
                              {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={processing}
                      sx={{
                        bgcolor: '#AD542D',
                        borderRadius: '24px',
                        py: 1.5,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: 16,
                        '&:hover': { bgcolor: '#78381C' },
                      }}
                    >
                      {processing ? t('auth.admin_login.signing_in') : t('auth.admin_login.submit')}
                    </Button>

                    <Button
                      component="a"
                      href="/auth/google"
                      fullWidth
                      variant="outlined"
                      {...(isRtl ? { endIcon: googleIconEl } : { startIcon: googleIconEl })}
                      sx={{
                        borderRadius: '24px',
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: 16,
                        borderColor: '#D0D5DD',
                        color: '#344054',
                        bgcolor: '#FFFFFF',
                        textDecoration: 'none',
                        gap: 1,
                        '& .MuiButton-startIcon, & .MuiButton-endIcon': { margin: 0 },
                        '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' },
                      }}
                    >
                      {t('auth.admin_login.sign_in_google')}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" sx={{ color: '#717171' }}>
                        {t('auth.admin_login.no_account')}{' '}
                        <Link
                          component={InertiaLink}
                          href="/register"
                          sx={{ color: '#AD542D', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {t('auth.admin_login.sign_up_link')}
                        </Link>
                      </Typography>
                    </Box>
                  </Stack>
                </form>
              </Paper>
            </Col>
          </Row>
        </Container>
      </Box>
    </>
  )
}
