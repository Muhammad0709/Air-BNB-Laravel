import React from 'react'
import { Avatar, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import { router, useForm, usePage } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function EditUser() {
  const { user } = usePage().props as any
  const { data, setData, put, processing, errors } = useForm({
    name: user?.name || '',
    email: user?.email || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`/admin/users/${user.id}`, {
      onSuccess: () => {
        router.visit('/admin/users')
      }
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (!user) {
    return (
      <AdminLayout title="Edit User">
        <Typography>User not found</Typography>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Edit User">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.visit('/admin/users')}
        sx={{
          mb: 3,
          color: '#6B7280',
          textTransform: 'none',
          '&:hover': { bgcolor: '#F9FAFB', color: '#111827' }
        }}
      >
        Back to Users
      </Button>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 4 }}>
            User Information
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Profile Picture */}
            <Row className="mb-4">
              <Col xs={12}>
                <Stack direction="row" spacing={3} useFlexGap alignItems="center">
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: '#AD542D',
                      fontSize: '2rem',
                      fontWeight: 700
                    }}
                  >
                    {getInitials(data.name)}
                  </Avatar>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Profile picture is generated from user initials
                    </Typography>
                  </Stack>
                </Stack>
              </Col>
            </Row>

            <Row>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px !important',
                        '& fieldset': {
                          borderColor: '#E5E7EB',
                          borderRadius: '10px !important',
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px !important',
                        '& fieldset': {
                          borderColor: '#E5E7EB',
                          borderRadius: '10px !important',
                        },
                      },
                    }}
                  />
                </Stack>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap justifyContent="flex-end" sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.visit('/admin/users')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '12px',
                      borderColor: '#D1D5DB',
                      color: '#6B7280',
                      '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={processing}
                    sx={{
                      bgcolor: '#AD542D',
                      textTransform: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#78381C' }
                    }}
                  >
                    {processing ? 'Updating...' : 'Update User'}
                  </Button>
                </Stack>
              </Col>
            </Row>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

