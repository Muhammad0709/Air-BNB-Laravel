import React from 'react'
import { Box, Button, Paper, Stack, TextField, Typography, Link } from '@mui/material'
import { Container, Row, Col } from 'react-bootstrap'
import { Head, Link as InertiaLink, useForm } from '@inertiajs/react'

const logoUrl = '/images/lipabnb-logo.svg'
const socialIcon = '/images/Social-icon.svg'

export default function HostSignup() {
  const { data, setData, post, processing, errors } = useForm({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setData(name as keyof typeof data, value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/register', {
      onSuccess: () => {
        // Redirect will be handled by the controller
      }
    })
  }

  return (
    <>
      <Head title="Sign Up" />
      <Box className="auth-signup-page" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F9FAFB' }}>
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box component="img" src={logoUrl} alt="lipabnb" sx={{ height: 40, mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#222222', mb: 1 }}>
                    Sign Up
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#717171' }}>
                    Create your account to get started
                  </Typography>
                </Box>

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} useFlexGap>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={data.firstName}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px' }, '& .MuiOutlinedInput-root fieldset': { borderRadius: '24px' } }}
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={data.lastName}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px' }, '& .MuiOutlinedInput-root fieldset': { borderRadius: '24px' } }}
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px' }, '& .MuiOutlinedInput-root fieldset': { borderRadius: '24px' } }}
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={data.phone}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    error={!!errors.phone}
                    helperText={errors.phone}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px' }, '& .MuiOutlinedInput-root fieldset': { borderRadius: '24px' } }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={data.password}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    error={!!errors.password}
                    helperText={errors.password}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px' }, '& .MuiOutlinedInput-root fieldset': { borderRadius: '24px' } }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    error={!!errors.password_confirmation}
                    helperText={errors.password_confirmation}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px' }, '& .MuiOutlinedInput-root fieldset': { borderRadius: '24px' } }}
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
                      '&:hover': { bgcolor: '#78381C' }
                    }}
                  >
                    {processing ? 'Creating account...' : 'Sign Up'}
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
                      '&:hover': {
                        borderColor: '#9CA3AF',
                        bgcolor: '#F9FAFB'
                      }
                    }}
                  >
                    Sign up with Google
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#717171' }}>
                      Already have an account?{' '}
                      <Link
                        component={InertiaLink}
                        href="/login"
                        sx={{
                          color: '#AD542D',
                          fontWeight: 600,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Sign In
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
