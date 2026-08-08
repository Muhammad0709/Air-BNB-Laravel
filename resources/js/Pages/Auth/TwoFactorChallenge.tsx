import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { Container } from 'react-bootstrap'
import { useLanguage } from '../../hooks/use-language'
import InputError from '../../components/InputError'
const logoUrl = '/images/Logo.png'

export default function TwoFactorChallenge() {
  const { t } = useLanguage()
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const { data, setData, post, processing, errors } = useForm({ code: '', recovery_code: '' })
  const formWidth = 400

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/two-factor-challenge')
  }

  return (
    <>
      <Head title={t('auth.two_factor.title')} />
      <Box sx={{ minHeight: '100vh' }}>
        <Container>
          <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: 500, width: '100%', mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 4, md: 6 } }}>
              <Stack alignItems="center" sx={{ mb: { xs: 3, md: 4 } }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
                  <Box component="img" src={logoUrl} alt="Bondoqi" sx={{ height: 70, width: 'auto', maxWidth: 380, objectFit: 'contain', display: 'block', cursor: 'pointer', margin: '0 auto' }} />
                </Link>
              </Stack>
              <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 1.5, fontSize: { xs: 26, md: 32 } }}>
                {t('auth.two_factor.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                {useRecoveryCode ? t('auth.two_factor.recovery_subtitle') : t('auth.two_factor.subtitle')}
              </Typography>
              <Paper elevation={0} sx={{ bgcolor: 'transparent', maxWidth: formWidth, mx: 'auto' }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    {!useRecoveryCode ? (
                      <Box>
                        <TextField
                          name="code"
                          value={data.code}
                          onChange={(e) => setData('code', e.target.value)}
                          error={!!errors.code}
                          placeholder={t('auth.two_factor.code_placeholder')}
                          autoFocus
                          inputProps={{ inputMode: 'numeric', maxLength: 6, style: { textAlign: 'center', fontSize: 24, letterSpacing: 8 } }}
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { height: 64, bgcolor: '#FFFFFF', borderRadius: '8px' } }}
                        />
                        <InputError message={errors.code} />
                      </Box>
                    ) : (
                      <Box>
                        <TextField
                          name="recovery_code"
                          value={data.recovery_code}
                          onChange={(e) => setData('recovery_code', e.target.value)}
                          error={!!errors.code}
                          placeholder={t('auth.two_factor.recovery_code_placeholder')}
                          autoFocus
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { height: 52, bgcolor: '#FFFFFF', borderRadius: '8px' } }}
                        />
                        <InputError message={errors.code} />
                      </Box>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={processing || (!useRecoveryCode && !data.code) || (useRecoveryCode && !data.recovery_code)}
                      sx={{ height: 52, borderRadius: 999, textTransform: 'none', fontWeight: 700, fontSize: 16, bgcolor: '#AD542D', boxShadow: 'none', '&:hover': { bgcolor: '#78381C', boxShadow: 'none' } }}
                    >
                      {processing ? t('auth.two_factor.verifying') : t('auth.two_factor.verify')}
                    </Button>

                    <Button
                      type="button"
                      variant="text"
                      onClick={() => { setUseRecoveryCode((p) => !p); setData({ code: '', recovery_code: '' }) }}
                      sx={{ textTransform: 'none', color: '#717171', fontWeight: 600 }}
                    >
                      {useRecoveryCode ? t('auth.two_factor.use_code_instead') : t('auth.two_factor.use_recovery_code')}
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  )
}
