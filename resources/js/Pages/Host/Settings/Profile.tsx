import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Avatar } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import Toast from '../../../Components/Admin/Toast'
import SaveIcon from '@mui/icons-material/Save'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { Head, router, usePage } from '@inertiajs/react'

type UserProp = { id: number; name: string; email: string; profile_picture?: string | null }
type PageProps = { user?: UserProp; flash?: { success?: string; error?: string } }

function nameToFirstLast(name: string) {
  const parts = (name || '').trim().split(/\s+/)
  return { first: parts[0] || '', last: parts.slice(1).join(' ') || '' }
}

export default function HostProfileSettings() {
  const { url, props } = usePage<PageProps>()
  const user = props.user
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const { first: initialFirst, last: initialLast } = nameToFirstLast(user?.name ?? '')
  const [profileData, setProfileData] = useState({
    firstName: initialFirst || 'Host',
    lastName: initialLast || 'User',
    email: user?.email ?? '',
    profileImage: (user?.profile_picture ?? null) as string | null
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      const { first, last } = nameToFirstLast(user.name ?? '')
      setProfileData(prev => ({
        ...prev,
        firstName: first || prev.firstName,
        lastName: last || prev.lastName,
        email: user.email ?? '',
        profileImage: user.profile_picture ?? null
      }))
    }
  }, [user?.id, user?.name, user?.email, user?.profile_picture])

  useEffect(() => {
    if (props.flash?.success) setToast({ open: true, message: props.flash.success, severity: 'success' })
    if (props.flash?.error) setToast({ open: true, message: props.flash.error, severity: 'error' })
  }, [props.flash?.success, props.flash?.error])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setToast({ open: true, message: 'Image must be 2MB or less.', severity: 'error' })
      e.target.value = ''
      return
    }
    const fd = new FormData()
    fd.append('profile_picture', file)
    router.post('/host/settings/picture', fd, { preserveScroll: true })
    e.target.value = ''
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.put('/host/settings/profile', {
      name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      email: profileData.email,
      phone: profileData.phone || null
    }, { preserveScroll: true })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.put('/host/settings/password', {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      new_password_confirmation: passwordData.confirmPassword
    }, {
      preserveScroll: true,
      onSuccess: () => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    })
  }

  const getInitials = (firstName: string, lastName: string) =>
    `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || 'HU'
  const profilePictureUrl = profileData.profileImage || user?.profile_picture || null

  const settingsTabs = [
    { id: 'profile', label: 'Profile', path: '/host/settings/profile' },
    { id: 'password', label: 'Password', path: '/host/settings/password' },
  ]

  // Determine active tab from URL
  const currentPath = url
  const currentActiveTab = settingsTabs.find(tab => currentPath.includes(tab.id))?.id || 'profile'

  // Get page title based on active tab
  const getPageTitle = () => {
    switch (currentActiveTab) {
      case 'profile':
        return 'Profile settings'
      case 'password':
        return 'Password settings'
      default:
        return 'Settings'
    }
  }

  return (
    <>
      <Head title={getPageTitle()} />
      <HostLayout title={getPageTitle()}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#717171' }}>
          Manage your profile and account settings
        </Typography>
      </Box>

      <Row>
        {/* Settings Navigation */}
        <Col xs={12} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Stack spacing={0}>
                {settingsTabs.map((tab) => {
                  const isActive = currentActiveTab === tab.id
                  return (
                    <Button
                      key={tab.id}
                      fullWidth
                      onClick={() => router.visit(tab.path)}
                      sx={{
                        justifyContent: 'flex-start',
                        px: 3,
                        py: 2,
                        textTransform: 'none',
                        color: isActive ? '#AD542D' : '#717171',
                        fontWeight: isActive ? 700 : 500,
                        bgcolor: isActive ? '#FFF5F5' : 'transparent',
                        borderRadius: 0,
                        borderLeft: isActive ? '3px solid #AD542D' : '3px solid transparent',
                        '&:hover': {
                          bgcolor: isActive ? '#FFF5F5' : '#F9FAFB'
                        }
                      }}
                    >
                      {tab.label}
                    </Button>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        </Col>

        {/* Settings Content */}
        <Col xs={12} md={9}>
          {currentActiveTab === 'profile' && (
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', width: '100%', maxWidth: '800px' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>
                  Profile
                </Typography>
                <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>
                  Update your profile details
                </Typography>

                <form onSubmit={handleProfileSubmit}>
                  <Stack spacing={4}>
                    {/* Profile Picture */}
                    <Box>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={profilePictureUrl || undefined}
                            sx={{
                              width: 100,
                              height: 100,
                              bgcolor: '#AD542D',
                              fontSize: '2rem',
                              fontWeight: 700
                            }}
                          >
                            {!profilePictureUrl && getInitials(profileData.firstName, profileData.lastName)}
                          </Avatar>
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              bgcolor: '#AD542D',
                              borderRadius: '50%',
                              p: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              id="profile-image-upload"
                              onChange={handleImageChange}
                            />
                            <label htmlFor="profile-image-upload">
                              <PhotoCameraIcon sx={{ fontSize: 20, color: '#FFFFFF' }} />
                            </label>
                          </Box>
                        </Box>
                        <Box>
                          <Button
                            variant="outlined"
                            component="label"
                            htmlFor="profile-image-upload"
                            sx={{
                              borderColor: '#D0D5DD',
                              color: '#344054',
                              textTransform: 'none',
                              borderRadius: 2,
                              py: 1,
                              px: 2,
                              '&:hover': { borderColor: '#D0D5DD', bgcolor: '#F9FAFB' }
                            }}
                          >
                            Upload picture
                          </Button>
                          <Typography variant="body2" sx={{ color: '#717171', mt: 1 }}>
                            JPG, PNG or GIF. 2MB max.
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Name Fields */}
                    <Stack direction="row" spacing={2}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Stack>

                    {/* Email Field */}
                    <TextField
                      fullWidth
                      label="Email address"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        sx={{
                          bgcolor: '#AD542D',
                          textTransform: 'none',
                          fontWeight: 700,
                          py: 1,
                          '&:hover': { bgcolor: '#78381C' }
                        }}
                      >
                        Save
                      </Button>
                    </Box>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          )}

          {currentActiveTab === 'password' && (
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', width: '100%', maxWidth: '800px' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>
                  Update password
                </Typography>
                <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>
                  Ensure your account is using a long, random password to stay secure
                </Typography>

                <form onSubmit={handlePasswordSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Current password"
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                      fullWidth
                      label="New password"
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                      fullWidth
                      label="Confirm password"
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        sx={{
                          bgcolor: '#AD542D',
                          textTransform: 'none',
                          fontWeight: 700,
                          py: 1,
                          '&:hover': { bgcolor: '#78381C' }
                        }}
                      >
                        Save password
                      </Button>
                    </Box>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          )}
        </Col>
      </Row>

      <Toast
        open={toast.open}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        message={toast.message}
        severity={toast.severity}
      />
      </HostLayout>
    </>
  )
}

