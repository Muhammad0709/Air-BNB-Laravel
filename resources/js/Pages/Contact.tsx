import React, { useState, useEffect } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography, Chip } from '@mui/material'
import { Container, Row, Col } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/shared/Toast'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import { Head, useForm, usePage } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

export default function Contact() {
  const { t } = useLanguage()
  const { props } = usePage()
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    subject: '',
    message: '',
    files: [] as File[]
  })

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Show success message from backend redirect
  useEffect(() => {
    if ((props as any)?.flash?.success) {
      setToast({
        open: true,
        message: (props as any).flash.success,
        severity: 'success'
      })
      reset()
    }
  }, [(props as any)?.flash?.success])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData(name as any, value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      setData('files', fileArray)
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...data.files]
    newFiles.splice(index, 1)
    setData('files', newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/contact', {
      forceFormData: true,
      onSuccess: () => {
        // Show success toast immediately
        setToast({
          open: true,
          message: t('contact.success_message'),
          severity: 'success'
        })
        reset()
      },
      onError: (errors) => {
        // Show error toast if there are validation errors
        const errorMessage = Object.keys(errors).length > 0 
          ? t('contact.error_fix') 
          : t('contact.error_generic')
        setToast({ 
          open: true, 
          message: errorMessage, 
          severity: 'error' 
        })
      }
    })
  }

  return (
    <>
      <Head title={t('contact.title')} />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box className="contact-page" sx={{ flex: 1 }}>
          <Container>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 6, mt: 4 }}>
              <Typography variant="h2" sx={{ fontSize: '2rem', fontWeight: 800, color: '#111827', mb: 2 }}>
                {t('contact.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280', fontSize: '1rem',  mx: 'auto' }}>
                {t('contact.subtitle')}
              </Typography>
            </Box>

            <Row className="g-4 justify-content-center">
              {/* Contact Form */}
              <Col xs={12} md={10} lg={8} xl={6}>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid #E5E7EB', borderRadius: '16px' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3, fontSize: '1.25rem' }}>
                    {t('contact.send_message')}
                  </Typography>
                  
                  <form onSubmit={handleSubmit}>
                    <Stack spacing={3} useFlexGap>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: '0.875rem' }}>
                          {t('contact.name')}
                        </Typography>
                        <TextField
                          name="name"
                          value={data.name}
                          onChange={handleChange}
                          placeholder={t('contact.name_placeholder')}
                          fullWidth
                          required
                          size="small"
                          error={!!errors.name}
                          helperText={errors.name}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: errors.name ? '#EF4444' : '#D0D5DD'
                              }
                            }
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: '0.875rem' }}>
                          {t('contact.email')}
                        </Typography>
                        <TextField
                          name="email"
                          type="email"
                          value={data.email}
                          onChange={handleChange}
                          placeholder={t('contact.email_placeholder')}
                          fullWidth
                          required
                          size="small"
                          error={!!errors.email}
                          helperText={errors.email}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: errors.email ? '#EF4444' : '#D0D5DD'
                              }
                            }
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: '0.875rem' }}>
                          {t('contact.subject')}
                        </Typography>
                        <TextField
                          name="subject"
                          value={data.subject}
                          onChange={handleChange}
                          placeholder={t('contact.subject_placeholder')}
                          fullWidth
                          required
                          size="small"
                          error={!!errors.subject}
                          helperText={errors.subject}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: errors.subject ? '#EF4444' : '#D0D5DD'
                              }
                            }
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: '0.875rem' }}>
                          {t('contact.attach_files')}
                        </Typography>
                        <Box
                          sx={{
                            border: '2px dashed #D0D5DD',
                            borderRadius: '12px',
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: '#AD542D',
                              bgcolor: '#FFF5F7'
                            }
                          }}
                        >
                          <input
                            type="file"
                            id="file-upload"
                            name="files[]"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="file-upload">
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                              <AttachFileIcon sx={{ fontSize: 32, color: '#6B7280', mb: 1 }} />
                              <Typography sx={{ color: '#6B7280', fontSize: '0.875rem', mb: 0.5 }}>
                                {t('contact.click_to_upload')}
                              </Typography>
                              <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                                {t('contact.file_types')}
                              </Typography>
                            </Box>
                          </label>
                        </Box>
                        
                        {data.files && data.files.length > 0 && (
                          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {data.files.map((file: File, index: number) => (
                              <Chip
                                key={index}
                                label={`${file.name} (${formatFileSize(file.size)})`}
                                onDelete={() => handleRemoveFile(index)}
                                deleteIcon={<CloseIcon />}
                                sx={{
                                  bgcolor: '#F3F4F6',
                                  color: '#374151',
                                  '& .MuiChip-deleteIcon': {
                                    color: '#6B7280',
                                    '&:hover': {
                                      color: '#EF4444'
                                    }
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1, fontSize: '0.875rem' }}>
                          {t('contact.message')}
                        </Typography>
                        <TextField
                          name="message"
                          value={data.message}
                          onChange={handleChange}
                          placeholder={t('contact.message_placeholder')}
                          fullWidth
                          required
                          multiline
                          rows={6}
                          error={!!errors.message}
                          helperText={errors.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: errors.message ? '#EF4444' : '#D0D5DD'
                              }
                            }
                          }}
                        />
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SendIcon />}
                        disabled={processing}
                        sx={{
                          bgcolor: '#AD542D',
                          borderRadius: '999px',
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          '&:hover': {
                            bgcolor: '#78381C'
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#D1D5DB',
                            color: '#9CA3AF'
                          }
                        }}
                      >
                        {processing ? t('contact.sending') : t('contact.send_message_btn')}
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
      </Box>
    </>
  )
}
