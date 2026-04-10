import React, { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, FormControlLabel, Stack, Switch, TextField, Typography, Avatar } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import Toast from '../../../Components/Admin/Toast'
import { useLanguage } from '../../../hooks/use-language'
import SaveIcon from '@mui/icons-material/Save'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { Head, router, usePage } from '@inertiajs/react'

type UserProp = { id: number; name: string; email: string; profile_picture?: string | null }
type PageProps = {
  user?: UserProp
  flash?: { success?: string; error?: string }
  auth?: { user?: { type?: string } | null }
  host_panel_preview?: boolean
}

function initialsFromName(name: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase()
  if (parts.length === 1 && parts[0].length === 1) return `${parts[0].toUpperCase()}`
  return 'HU'
}

export default function HostProfileSettings() {
  const { t } = useLanguage()
  const { url, props } = usePage<PageProps>()
  const user = props.user
  const isGuestPreview = props.auth?.user?.type === 'User'
  const hostPanelPreview = !!props.host_panel_preview
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
      setProfileData(prev => ({
        ...prev,
        name: user.name ?? '',
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
      setToast({ open: true, message: t('host.settings.image_size_error'), severity: 'error' })
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
      name: profileData.name.trim(),
      email: profileData.email,
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

  const profilePictureUrl = profileData.profileImage || user?.profile_picture || null

  return (
    <>
      <Head title={t('host.settings.profile_settings')} />
      <HostLayout title={t('host.settings.profile_settings')}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>
          {t('host.settings.title')}
        </Typography>
        <Typography variant="body1" sx={{ color: '#717171' }}>
          {t('host.settings.manage_profile_desc')}
        </Typography>
      </Box>

      <Row>
        {/* Settings Content */}
        <Col xs={12} md={10} lg={8} xl={7} className="mx-auto">
          {isGuestPreview && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                bgcolor: '#FFFBF8',
              }}
            >
              <FormControlLabel
                control={(
                  <Switch
                    checked={hostPanelPreview}
                    onChange={(_, checked) => {
                      if (checked) {
                        router.post('/switch-to-host')
                      } else {
                        router.post('/switch-to-customer-view')
                      }
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#AD542D' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#AD542D' },
                    }}
                  />
                )}
                label={t('profile_settings.switch_to_customer')}
                sx={{
                  m: 0,
                  alignItems: 'center',
                  '& .MuiFormControlLabel-label': { fontSize: '0.9375rem', color: '#374151' },
                }}
              />
              <Typography variant="body2" sx={{ color: '#717171', mt: 0.5, pl: { xs: 0, sm: 7 } }}>
                {t('profile_settings.switch_to_customer_hint')}
              </Typography>
            </Box>
          )}
          
          {/* Profile Section */}
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', width: '100%', mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>
                {t('host.settings.profile')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>
                {t('host.settings.update_profile_desc')}
              </Typography>

              <form onSubmit={handleProfileSubmit}>
                <Stack spacing={4}>
                  {/* Profile Picture */}
                  <Box>
                    <Stack direction="row" spacing={3} useFlexGap alignItems="center">
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
                          {!profilePictureUrl && initialsFromName(profileData.name)}
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
                          {t('host.settings.upload_picture')}
                        </Button>
                        <Typography variant="body2" sx={{ color: '#717171', mt: 1 }}>
                          {t('host.settings.image_formats_note')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <TextField
                    fullWidth
                    label={t('host.settings.name')}
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder={t('host.settings.name_placeholder')}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    fullWidth
                    label={t('host.settings.email_address')}
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
                      {t('host.settings.save')}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', width: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>
                {t('host.settings.update_password')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>
                {t('host.settings.password_description')}
              </Typography>

              <form onSubmit={handlePasswordSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label={t('host.settings.current_password')}
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label={t('host.settings.new_password')}
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label={t('host.settings.confirm_password')}
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
                      {t('host.settings.save_password')}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </CardContent>
          </Card>
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

