import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Avatar } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import Toast from '../../../Components/Admin/Toast'
import { Head, usePage, router } from '@inertiajs/react'
import SaveIcon from '@mui/icons-material/Save'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

type UserProp = { id: number; name: string; email: string; profile_picture?: string | null }
type PageProps = { user?: UserProp; flash?: { success?: string; error?: string } }

export default function ProfileSettings() {
  const { url, props } = usePage<PageProps>()
  const user = props.user
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const [profileData, setProfileData] = useState({
    name: user?.name ?? '',
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
      setProfileData({
        name: user.name ?? '',
        email: user.email ?? '',
        profileImage: user.profile_picture ?? null
      })
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
    router.post('/admin/settings/picture', fd, { preserveScroll: true })
    e.target.value = ''
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.put('/admin/settings/profile', {
      name: profileData.name,
      email: profileData.email
    }, { preserveScroll: true })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.put('/admin/settings/password', {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      new_password_confirmation: passwordData.confirmPassword
    }, {
      preserveScroll: true,
      onSuccess: () => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    })
  }

  const getInitials = (name: string) => (name || '').split(' ').map(n => n[0]).join('').slice(0, 2)
  const profilePictureUrl = profileData.profileImage || user?.profile_picture || null

  const settingsTabs = [
    { id: 'profile', label: 'Profile', path: '/admin/settings/profile' },
    { id: 'password', label: 'Password', path: '/admin/settings/password' },
  ]
  const currentActiveTab = url.includes('profile') ? 'profile' : url.includes('password') ? 'password' : 'profile'
  const getPageTitle = () => currentActiveTab === 'profile' ? 'Profile settings' : currentActiveTab === 'password' ? 'Password settings' : 'Settings'

  return (
    <>
      <Head title={getPageTitle()} />
      <AdminLayout title={getPageTitle()}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>Settings</Typography>
          <Typography variant="body1" sx={{ color: '#717171' }}>Manage your profile and account settings</Typography>
        </Box>
        <Row>
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
                          bgcolor: isActive ? '#FFF5F7' : 'transparent',
                          borderRadius: 0,
                          borderLeft: isActive ? '3px solid #AD542D' : '3px solid transparent',
                          '&:hover': { bgcolor: isActive ? '#FFF5F7' : '#F9FAFB' }
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
          <Col xs={12} md={9}>
            {currentActiveTab === 'profile' && (
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', width: '100%', maxWidth: '800px' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>Profile</Typography>
                  <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>Update your profile details</Typography>
                  <form onSubmit={handleProfileSubmit}>
                    <Stack spacing={4}>
                      <Box>
                        <Stack direction="row" spacing={3} alignItems="center">
                          <Box sx={{ position: 'relative' }}>
                            <Avatar src={profilePictureUrl || undefined} sx={{ width: 100, height: 100, bgcolor: '#AD542D', fontSize: '2rem', fontWeight: 700 }}>
                              {!profilePictureUrl && getInitials(profileData.name)}
                            </Avatar>
                            <Box sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#AD542D', borderRadius: '50%', p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <PhotoCameraIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />
                            </Box>
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                          </Box>
                          <Box>
                            <Button variant="outlined" component="label" sx={{ borderColor: '#D0D5DD', color: '#344054', textTransform: 'none', borderRadius: 2, '&:hover': { borderColor: '#D0D5DD', bgcolor: '#F9FAFB' } }}>
                              Upload picture
                              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                            </Button>
                            <Typography variant="body2" sx={{ color: '#717171', mt: 1 }}>JPG, PNG or GIF. 2MB max.</Typography>
                          </Box>
                        </Stack>
                      </Box>
                      <TextField label="Name" name="name" value={profileData.name} onChange={handleProfileChange} fullWidth required />
                      <TextField label="Email address" name="email" type="email" value={profileData.email} onChange={handleProfileChange} fullWidth required />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: '#AD542D', textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: '#78381C' } }}>Save</Button>
                      </Box>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            )}
            {currentActiveTab === 'password' && (
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', width: '100%', maxWidth: '800px' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>Update password</Typography>
                  <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>Ensure your account is using a long, random password to stay secure</Typography>
                  <form onSubmit={handlePasswordSubmit}>
                    <Stack spacing={3}>
                      <TextField label="Current password" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} fullWidth required />
                      <TextField label="New password" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} fullWidth required />
                      <TextField label="Confirm password" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} fullWidth required />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: '#AD542D', textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: '#78381C' } }}>Save password</Button>
                      </Box>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            )}
          </Col>
        </Row>
        <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} severity={toast.severity} />
      </AdminLayout>
    </>
  )
}
