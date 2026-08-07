import React, { useState, useEffect } from 'react'
import { Box, Button, FormControlLabel, Paper, Stack, Switch, TextField, Typography, Avatar } from '@mui/material'
import PhoneCountrySelect from '../components/PhoneCountrySelect'
import { combinePhoneE164, splitStoredPhone } from '../utils/phone'
import { Container, Row, Col } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/Admin/Toast';
import DeleteConfirmationDialog from '../components/Admin/DeleteConfirmationDialog';
import SaveIcon from '@mui/icons-material/Save'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { Head, useForm, usePage, router } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'
import InputError from '../components/InputError'

type ProfilePageProps = {
  user?: Record<string, unknown>
  auth?: { user?: { type?: string } | null }
  host_panel_preview?: boolean
  flash?: { success?: string; error?: string }
  errors?: Record<string, string | string[]>
}

const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#AD542D' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#AD542D' },
}

export default function ProfileSettings() {
  const { t } = useLanguage()
  const { props } = usePage<ProfilePageProps>()
  const user = props.user
  const isCustomer = props.auth?.user?.type === 'User'
  const hostPanelPreview = !!props.host_panel_preview
  const initialPhone = splitStoredPhone(user?.phone ?? '')

  const { data: profileData, setData: setProfileData, patch: patchProfile, processing: profileProcessing, errors: profileErrors, transform } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    phone: initialPhone.phone,
    phone_code: initialPhone.phoneCode,
    bio: user?.bio || '',
  })

  // Register once: on submit Inertia passes current form `data` into this callback (not a stale closure).
  useEffect(() => {
    transform((data) => ({
      name: data.name,
      email: data.email,
      bio: data.bio,
      // Single field for DB: users.phone (E.164-style). Do not send phone_code to the server.
      phone: combinePhoneE164(data.phone_code, data.phone),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- transform must be registered once
  }, [])

  useEffect(() => {
    const u = props.user
    if (!u) return
    const p = splitStoredPhone(u.phone ?? '')
    setProfileData('phone', p.phone)
    setProfileData('phone_code', p.phoneCode)
  }, [props.user?.phone])

  const { data: passwordData, setData: setPasswordData, patch: patchPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })

  const { data: deleteData, setData: setDeleteData, delete: deleteAccount, processing: deleteProcessing, errors: deleteErrors, reset: resetDelete } = useForm({
    password: ''
  })

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notifyBookings, setNotifyBookings] = useState(user?.notify_bookings !== false)
  const [notifyProperties, setNotifyProperties] = useState(user?.notify_properties !== false)

  const handleNotificationPreferenceChange = (field: 'notify_bookings' | 'notify_properties', checked: boolean) => {
    const setter = field === 'notify_bookings' ? setNotifyBookings : setNotifyProperties
    const previous = field === 'notify_bookings' ? notifyBookings : notifyProperties
    setter(checked)
    router.patch('/profile/notifications', {
      notify_bookings: field === 'notify_bookings' ? checked : notifyBookings,
      notify_properties: field === 'notify_properties' ? checked : notifyProperties,
    }, {
      preserveScroll: true,
      preserveState: true,
      onError: () => setter(previous),
    })
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData(name as keyof typeof profileData, value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(name as keyof typeof passwordData, value)
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patchProfile('/profile/update')
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patchPassword('/profile/password', {
      onSuccess: () => {
        resetPassword()
      }
    })
  }

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteDialogOpen(true)
  }

  const handleDeleteAccountConfirm = () => {
    deleteAccount('/profile/delete', {
      preserveScroll: true,
      onSuccess: () => setDeleteDialogOpen(false),
      onError: () => setDeleteDialogOpen(false)
    })
  }

  const pageDeletePasswordError = props.errors?.password
  useEffect(() => {
    if (pageDeletePasswordError) {
      const message = Array.isArray(pageDeletePasswordError) ? pageDeletePasswordError[0] : pageDeletePasswordError
      setToast({ open: true, message, severity: 'error' })
      resetDelete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageDeletePasswordError])

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setToast({ open: true, message: t('profile_settings.file_size_error'), severity: 'error' })
      e.target.value = ''
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setToast({ open: true, message: t('profile_settings.file_type_error'), severity: 'error' })
      e.target.value = ''
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('profile_picture', file)
    
    router.post('/profile/picture', formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setUploading(false)
        e.target.value = ''
      },
      onError: (errors) => {
        setUploading(false)
        const errorMessage = errors?.profile_picture?.[0] || errors?.message || 'Failed to upload profile picture.'
        setToast({ open: true, message: errorMessage, severity: 'error' })
        e.target.value = ''
      }
    })
  }

  return (
    <>
      <Head title={t('profile_settings.title')} />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box className="profile-settings-page" sx={{ flex: 1 }}>
          <Container>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 6, mt: 4 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, fontWeight: 800, color: '#111827', mb: 2 }}>
                {t('profile_settings.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280', fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' }, maxWidth: 600, mx: 'auto' }}>
                {t('profile_settings.subtitle')}
              </Typography>
            </Box>

            <Row className="g-4 justify-content-center">
              <Col xs={12} md={10} lg={8} xl={7}>
                {/* Profile Picture Section */}
                <Paper elevation={0} sx={{ p: 4, border: '1px solid #E5E7EB', borderRadius: '16px', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
                    {t('profile_settings.profile_picture')}
                  </Typography>
                  <Stack direction="row" spacing={3} useFlexGap alignItems="center">
                    <Avatar
                      src={user?.profile_picture}
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#AD542D',
                        fontSize: '2.5rem',
                        fontWeight: 700
                      }}
                    >
                      {!user?.profile_picture && 
                        (profileData.name || user?.name || '')
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      }
                    </Avatar>
                    <Stack spacing={2} sx={{ flex: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PhotoCameraIcon />}
                        component="label"
                        disabled={uploading}
                        sx={{
                          borderColor: '#D0D5DD',
                          color: '#344054',
                          textTransform: 'none',
                          borderRadius: '12px',
                          alignSelf: 'flex-start',
                          '&:hover': { borderColor: '#D0D5DD', bgcolor: '#F9FAFB' },
                          '&:disabled': { 
                            borderColor: '#D1D5DB', 
                            color: '#9CA3AF',
                            cursor: 'not-allowed'
                          }
                        }}
                      >
                        {uploading ? t('profile_settings.saving') : t('profile_settings.upload_photo')}
                        <input 
                          type="file" 
                          hidden 
                          accept="image/jpeg,image/jpg,image/png,image/gif" 
                          onChange={handleProfilePictureUpload}
                          disabled={uploading}
                        />
                      </Button>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        {t('profile_settings.file_hint')}
                      </Typography>
                      {isCustomer && (
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
                            mt: 0.5,
                            alignItems: 'center',
                            alignSelf: 'flex-start',
                            '& .MuiFormControlLabel-label': { fontSize: '0.9375rem', color: '#374151' },
                          }}
                        />
                      )}
                      {isCustomer && (
                        <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.25, alignSelf: 'flex-start', maxWidth: 360 }}>
                          {t('profile_settings.switch_to_customer_hint')}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Paper>

                {/* Profile Information */}
                <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, border: '1px solid #E5E7EB', borderRadius: '16px', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3, fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
                    {t('profile_settings.personal_info')}
                  </Typography>
                  
                  <form onSubmit={handleProfileSubmit}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                          {t('profile_settings.name')}
                        </Typography>
                        <TextField
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          placeholder={t('profile_settings.name_placeholder')}
                          fullWidth
                          required
                          size="small"
                          error={!!profileErrors.name}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: profileErrors.name ? '#EF4444' : '#D0D5DD'
                              },
                              '&:hover fieldset': {
                                borderColor: profileErrors.name ? '#EF4444' : '#D0D5DD'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: profileErrors.name ? '#EF4444' : '#AD542D'
                              }
                            }
                          }}
                        />
                        <InputError message={Array.isArray(profileErrors.name) ? profileErrors.name[0] : profileErrors.name} />
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                          {t('profile_settings.email_address')}
                        </Typography>
                        <TextField
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          placeholder={t('profile_settings.email_placeholder')}
                          fullWidth
                          required
                          size="small"
                          error={!!profileErrors.email}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: profileErrors.email ? '#EF4444' : '#D0D5DD'
                              },
                              '&:hover fieldset': {
                                borderColor: profileErrors.email ? '#EF4444' : '#D0D5DD'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: profileErrors.email ? '#EF4444' : '#AD542D'
                              }
                            }
                          }}
                        />
                        <InputError message={Array.isArray(profileErrors.email) ? profileErrors.email[0] : profileErrors.email} />
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                          {t('profile_settings.phone_number')}
                        </Typography>
                        <Stack direction="row" spacing={1.5} useFlexGap>
                          <PhoneCountrySelect
                            value={profileData.phone_code}
                            onChange={(code) => setProfileData('phone_code', code)}
                          />
                          <TextField
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            placeholder={t('profile_settings.phone_national_placeholder')}
                            fullWidth
                            size="small"
                            inputProps={{ inputMode: 'tel', autoComplete: 'tel-national' }}
                            error={!!profileErrors.phone}
                            sx={{
                              flex: 1,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                '& fieldset': {
                                  borderColor: profileErrors.phone ? '#EF4444' : '#D0D5DD'
                                },
                                '&:hover fieldset': {
                                  borderColor: profileErrors.phone ? '#EF4444' : '#D0D5DD'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: profileErrors.phone ? '#EF4444' : '#AD542D'
                                }
                              }
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mt: 0.75 }}>
                          {t('profile_settings.phone_save_hint')}
                        </Typography>
                        <InputError message={Array.isArray(profileErrors.phone) ? profileErrors.phone[0] : profileErrors.phone} />
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                          {t('profile_settings.bio')}
                        </Typography>
                        <TextField
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          placeholder={t('profile_settings.bio_placeholder')}
                          fullWidth
                          multiline
                          rows={4}
                          error={!!profileErrors.bio}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: profileErrors.bio ? '#EF4444' : '#D0D5DD'
                              },
                              '&:hover fieldset': {
                                borderColor: profileErrors.bio ? '#EF4444' : '#D0D5DD'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: profileErrors.bio ? '#EF4444' : '#AD542D'
                              }
                            }
                          }}
                        />
                        <InputError message={Array.isArray(profileErrors.bio) ? profileErrors.bio[0] : profileErrors.bio} />
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={profileProcessing}
                        sx={{
                          bgcolor: '#AD542D',
                          borderRadius: '999px',
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          alignSelf: 'flex-start',
                          '&:hover': {
                            bgcolor: '#78381C'
                          },
                          '&:disabled': {
                            bgcolor: '#D1D5DB',
                            color: '#9CA3AF'
                          }
                        }}
                      >
                        {profileProcessing ? t('profile_settings.saving') : t('profile_settings.save_changes')}
                      </Button>
                    </Stack>
                  </form>
                </Paper>

                {/* Notification Preferences */}
                <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, border: '1px solid #E5E7EB', borderRadius: '16px', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 1, fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
                    {t('profile_settings.notification_preferences')}
                  </Typography>
                  <Typography sx={{ color: '#6B7280', fontSize: '0.875rem', mb: 3 }}>
                    {t('profile_settings.notification_preferences_description')}
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem' }}>
                          {t('profile_settings.notify_bookings')}
                        </Typography>
                        <Typography sx={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                          {t('profile_settings.notify_bookings_hint')}
                        </Typography>
                      </Box>
                      <Switch
                        checked={notifyBookings}
                        onChange={(_, checked) => handleNotificationPreferenceChange('notify_bookings', checked)}
                        sx={switchSx}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem' }}>
                          {t('profile_settings.notify_properties')}
                        </Typography>
                        <Typography sx={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                          {t('profile_settings.notify_properties_hint')}
                        </Typography>
                      </Box>
                      <Switch
                        checked={notifyProperties}
                        onChange={(_, checked) => handleNotificationPreferenceChange('notify_properties', checked)}
                        sx={switchSx}
                      />
                    </Stack>
                  </Stack>
                </Paper>

                {/* Change Password */}
                <Paper elevation={0} sx={{ p: 4, border: '1px solid #E5E7EB', borderRadius: '16px' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
                    {t('profile_settings.change_password')}
                  </Typography>
                  
                  <form onSubmit={handlePasswordSubmit}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                          {t('profile_settings.current_password')}
                        </Typography>
                        <TextField
                          name="current_password"
                          type="password"
                          value={passwordData.current_password}
                          onChange={handlePasswordChange}
                          placeholder={t('profile_settings.current_password_placeholder')}
                          fullWidth
                          required
                          size="small"
                          error={!!passwordErrors.current_password}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: passwordErrors.current_password ? '#EF4444' : '#D0D5DD'
                              },
                              '&:hover fieldset': {
                                borderColor: passwordErrors.current_password ? '#EF4444' : '#D0D5DD'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: passwordErrors.current_password ? '#EF4444' : '#AD542D'
                              }
                            }
                          }}
                        />
                        <InputError message={Array.isArray(passwordErrors.current_password) ? passwordErrors.current_password[0] : passwordErrors.current_password} />
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                          {t('profile_settings.new_password')}
                        </Typography>
                        <TextField
                          name="new_password"
                          type="password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          placeholder={t('profile_settings.new_password_placeholder')}
                          fullWidth
                          required
                          size="small"
                          error={!!passwordErrors.new_password}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: passwordErrors.new_password ? '#EF4444' : '#D0D5DD'
                              },
                              '&:hover fieldset': {
                                borderColor: passwordErrors.new_password ? '#EF4444' : '#D0D5DD'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: passwordErrors.new_password ? '#EF4444' : '#AD542D'
                              }
                            }
                          }}
                        />
                        <InputError message={Array.isArray(passwordErrors.new_password) ? passwordErrors.new_password[0] : passwordErrors.new_password} />
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                          {t('profile_settings.confirm_password')}
                        </Typography>
                        <TextField
                          name="new_password_confirmation"
                          type="password"
                          value={passwordData.new_password_confirmation}
                          onChange={handlePasswordChange}
                          placeholder={t('profile_settings.confirm_password_placeholder')}
                          fullWidth
                          required
                          size="small"
                          error={!!passwordErrors.new_password_confirmation}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: passwordErrors.new_password_confirmation ? '#EF4444' : '#D0D5DD'
                              },
                              '&:hover fieldset': {
                                borderColor: passwordErrors.new_password_confirmation ? '#EF4444' : '#D0D5DD'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: passwordErrors.new_password_confirmation ? '#EF4444' : '#AD542D'
                              }
                            }
                          }}
                        />
                        <InputError message={Array.isArray(passwordErrors.new_password_confirmation) ? passwordErrors.new_password_confirmation[0] : passwordErrors.new_password_confirmation} />
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={passwordProcessing}
                        sx={{
                          bgcolor: '#AD542D',
                          borderRadius: '999px',
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          alignSelf: 'flex-start',
                          '&:hover': {
                            bgcolor: '#78381C'
                          },
                          '&:disabled': {
                            bgcolor: '#D1D5DB',
                            color: '#9CA3AF'
                          }
                        }}
                      >
                        {passwordProcessing ? t('profile_settings.updating') : t('profile_settings.update_password')}
                      </Button>
                    </Stack>
                  </form>
                </Paper>

                {/* Delete Account */}
                <Paper elevation={0} sx={{ p: 4, border: '1px solid #FECACA', borderRadius: '16px', mt: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
                    {t('profile_settings.delete_account')}
                  </Typography>
                  <Typography sx={{ color: '#6B7280', fontSize: '0.875rem', mb: 3 }}>
                    {t('profile_settings.delete_account_description')}
                  </Typography>

                  <form onSubmit={handleDeleteAccount}>
                    <Stack spacing={3}>
                      <Box>
                        <TextField
                          name="password"
                          type="password"
                          value={deleteData.password}
                          onChange={(e) => setDeleteData('password', e.target.value)}
                          placeholder={t('profile_settings.delete_account_password_placeholder')}
                          fullWidth
                          required
                          size="small"
                          error={!!deleteErrors.password}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: deleteErrors.password ? '#EF4444' : '#D0D5DD'
                              },
                              '&:hover fieldset': {
                                borderColor: deleteErrors.password ? '#EF4444' : '#D0D5DD'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: deleteErrors.password ? '#EF4444' : '#AD542D'
                              }
                            }
                          }}
                        />
                        <InputError message={Array.isArray(deleteErrors.password) ? deleteErrors.password[0] : deleteErrors.password} />
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={deleteProcessing}
                        sx={{
                          bgcolor: '#AD542D',
                          borderRadius: '999px',
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          alignSelf: 'flex-start',
                          '&:hover': {
                            bgcolor: '#78381C'
                          },
                          '&:disabled': {
                            bgcolor: '#D1D5DB',
                            color: '#9CA3AF'
                          }
                        }}
                      >
                        {deleteProcessing ? t('profile_settings.deleting') : t('profile_settings.delete_account_button')}
                      </Button>
                    </Stack>
                  </form>
                </Paper>
              </Col>
            </Row>
          </Container>
        </Box>
        <Footer />
        
        <Toast
          open={toast.open}
          onClose={() => setToast({ ...toast, open: false })}
          message={toast.message}
          severity={toast.severity}
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteAccountConfirm}
          title={t('profile_settings.delete_account')}
          message={t('profile_settings.delete_account_confirm')}
          confirmLabel={t('profile_settings.delete_account_button')}
          confirmColor="#AD542D"
          confirmHoverColor="#78381C"
        />
      </Box>
    </>
  )
}
