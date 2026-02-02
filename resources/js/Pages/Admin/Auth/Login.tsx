import React from 'react'
import { Box, Button, Paper, Stack, TextField, Typography, Link } from '@mui/material'
import { Container, Row, Col } from 'react-bootstrap'
import { Head, Link as InertiaLink, useForm } from '@inertiajs/react'

const logoUrl = '/images/lipabnb-logo.svg'
const socialIcon = '/images/Social-icon.svg'

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '24px' },
  '& .MuiOutlinedInput-root fieldset': { borderRadius: '24px' },
}

export default function AdminLogin() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/login', { onSuccess: () => {} })
  }

  return (
    <>
      <Head title="Login" />
      <Box className="auth-login-page" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F9FAFB' }}>
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
                  <Box component="img" src={logoUrl} alt="lipabnb" sx={{ height: 40, mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#222222', mb: 1 }}>
                    Login
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#717171' }}>
                    Sign in to access the admin dashboard
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Email"
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
                      label="Password"
                      name="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      error={!!errors.password}
                      helperText={errors.password}
                      required
                      variant="outlined"
                      sx={inputSx}
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
                      {processing ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      type="button"
                      startIcon={<Box component="img" src={socialIcon} alt="Google" sx={{ width: 24, height: 24 }} />}
                      sx={{
                        borderRadius: '24px',
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: 16,
                        borderColor: '#D0D5DD',
                        color: '#344054',
                        bgcolor: '#FFFFFF',
                        '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' },
                      }}
                    >
                      Sign in with Google
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" sx={{ color: '#717171' }}>
                        Don't have an account?{' '}
                        <Link
                          component={InertiaLink}
                          href="/register"
                          sx={{ color: '#AD542D', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          Sign Up
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
