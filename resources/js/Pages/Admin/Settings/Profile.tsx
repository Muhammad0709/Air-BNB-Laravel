import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Avatar } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import Toast from '../../../Components/Admin/Toast'
import { Head, usePage, router } from '@inertiajs/react'
import SaveIcon from '@mui/icons-material/Save'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { useLanguage } from '../../../hooks/use-language'

type UserProp = { id: number; name: string; email: string; profile_picture?: string | null }
type PageProps = {
  user?: UserProp
  flash?: { success?: string; error?: string }
  configuration?: { commission_rate: number }
}

export default function ProfileSettings() {
  const { t } = useLanguage()
  const { url, props } = usePage<PageProps>()
  const user = props.user
  const config = props.configuration ?? { commission_rate: 10 }
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
  const [configurationData, setConfigurationData] = useState({
    commission_rate: config.commission_rate
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

  useEffect(() => {
    setConfigurationData({ commission_rate: config.commission_rate })
  }, [config.commission_rate])

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
      setToast({ open: true, message: t('admin.settings.image_size_error'), severity: 'error' })
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

  const handleConfigurationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.put('/admin/settings/configuration', {
      commission_rate: configurationData.commission_rate
    }, { preserveScroll: true })
  }

  const getInitials = (name: string) => (name || '').split(' ').map(n => n[0]).join('').slice(0, 2)
  const profilePictureUrl = profileData.profileImage || user?.profile_picture || null

  const mainTabs = [
    { id: 'profile', labelKey: 'admin.settings.profile', path: '/admin/settings/profile' },
    { id: 'settings', labelKey: 'admin.settings.settings_tab', path: '/admin/settings/configuration' },
  ]
  const currentMainTab = url.includes('configuration') ? 'settings' : 'profile'

  const settingsTabs = [
    { id: 'profile', labelKey: 'admin.settings.profile', path: '/admin/settings/profile' },
    { id: 'password', labelKey: 'admin.settings.password', path: '/admin/settings/password' },
  ]
  const currentActiveTab = url.includes('profile') ? 'profile' : url.includes('password') ? 'password' : 'profile'
  const getPageTitle = () => currentMainTab === 'settings' ? t('admin.settings.configuration_settings') : currentActiveTab === 'profile' ? t('admin.settings.profile_settings') : currentActiveTab === 'password' ? t('admin.settings.password_settings') : t('admin.settings.title')

  return (
    <>
      <Head title={getPageTitle()} />
      <AdminLayout title={getPageTitle()}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>{t('admin.settings.title')}</Typography>
          <Typography variant="body1" sx={{ color: '#717171' }}>{t('admin.settings.settings_subtitle')}</Typography>
        </Box>

        {/* Pill-style tabs (All / Admins style) - existing theme */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            p: 0.5,
            borderRadius: 3,
            bgcolor: '#F3F4F6',
            border: '1px solid #E5E7EB',
            mb: 4
          }}
        >
          {mainTabs.map((tab) => {
            const isActive = currentMainTab === tab.id
            return (
              <Button
                key={tab.id}
                onClick={() => router.visit(tab.path)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  px: 3,
                  py: 1.25,
                  borderRadius: 2.5,
                  minWidth: 120,
                  bgcolor: isActive ? '#AD542D' : 'transparent',
                  color: isActive ? '#fff' : '#717171',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  '&:hover': {
                    bgcolor: isActive ? '#78381C' : 'rgba(0,0,0,0.04)',
                    color: isActive ? '#fff' : '#222222'
                  }
                }}
              >
                {t(tab.labelKey)}
              </Button>
            )
          })}
        </Box>

        {currentMainTab === 'settings' && (
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', width: '100%', maxWidth: '800px' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>{t('admin.settings.configuration_settings')}</Typography>
              <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>{t('admin.settings.configuration_subtitle')}</Typography>
              <form onSubmit={handleConfigurationSubmit}>
                <Stack spacing={3}>
                  <TextField
                    label={t('admin.settings.commission_rate')}
                    name="commission_rate"
                    type="number"
                    value={configurationData.commission_rate}
                    onChange={(e) => setConfigurationData(prev => ({ ...prev, commission_rate: Number(e.target.value) || 0 }))}
                    fullWidth
                    inputProps={{ min: 0, max: 100, step: 0.5 }}
                    helperText={t('admin.settings.commission_rate_hint')}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: '#AD542D', textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: '#78381C' } }}>{t('admin.common.save')}</Button>
                  </Box>
                </Stack>
              </form>
            </CardContent>
          </Card>
        )}

        {currentMainTab === 'profile' && (
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
                        {t(tab.labelKey)}
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
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>{t('admin.settings.profile')}</Typography>
                  <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>{t('admin.settings.profile_subtitle')}</Typography>
                  <form onSubmit={handleProfileSubmit}>
                    <Stack spacing={4}>
                      <Box>
                        <Stack direction="row" spacing={3} useFlexGap alignItems="center">
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
                              {t('admin.settings.upload_picture')}
                              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                            </Button>
                            <Typography variant="body2" sx={{ color: '#717171', mt: 1 }}>{t('admin.settings.image_formats_note')}</Typography>
                          </Box>
                        </Stack>
                      </Box>
                      <TextField label={t('admin.settings.name')} name="name" value={profileData.name} onChange={handleProfileChange} fullWidth required />
                      <TextField label={t('admin.settings.email_address')} name="email" type="email" value={profileData.email} onChange={handleProfileChange} fullWidth required />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: '#AD542D', textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: '#78381C' } }}>{t('admin.common.save')}</Button>
                      </Box>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            )}
            {currentActiveTab === 'password' && (
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', width: '100%', maxWidth: '800px' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>{t('admin.settings.update_password')}</Typography>
                  <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>{t('admin.settings.password_description')}</Typography>
                  <form onSubmit={handlePasswordSubmit}>
                    <Stack spacing={3}>
                      <TextField label={t('admin.settings.current_password')} name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} fullWidth required />
                      <TextField label={t('admin.settings.new_password')} name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} fullWidth required />
                      <TextField label={t('admin.settings.confirm_password')} name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} fullWidth required />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: '#AD542D', textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: '#78381C' } }}>{t('admin.settings.save_password')}</Button>
                      </Box>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            )}
          </Col>
        </Row>
        )}
        <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} severity={toast.severity} />
      </AdminLayout>
    </>
  )
}
