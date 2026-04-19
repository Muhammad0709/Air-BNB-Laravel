import React from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import { Head, router, usePage } from '@inertiajs/react'
import RtlBackArrowIcon from '../../../components/RtlBackArrowIcon'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import SubjectIcon from '@mui/icons-material/Subject'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import DownloadIcon from '@mui/icons-material/Download'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import { useLanguage } from '../../../hooks/use-language'
import { adminButtonStartIconSx } from '../../../utils/adminButtonStartIconSx'

type ContactFile = {
  file_name: string
  url: string | null
  mime_type?: string | null
  file_size?: number | null
}

type ContactShow = {
  id: number
  name: string
  email: string
  subject: string
  message: string | null
  files: ContactFile[]
  user: { id: number; name: string; email: string } | null
  created_at: string | null
}

function formatBytes(n: number | null | undefined): string {
  if (n == null || n <= 0) return ''
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${Math.round((n / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

function FileRow({ file, openLabel }: { file: ContactFile; openLabel: string }) {
  const mime = (file.mime_type || '').toLowerCase()
  const isPdf = mime.includes('pdf')
  const isImage = mime.startsWith('image/')

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: '#E5E7EB',
        bgcolor: '#FAFAFA',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: isPdf ? '#FEE2E2' : isImage ? '#DCFCE7' : '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <InsertDriveFileOutlinedIcon
          sx={{ fontSize: 24, color: isPdf ? '#DC2626' : isImage ? '#16A34A' : '#6B7280' }}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem', wordBreak: 'break-word' }}>
          {file.file_name || '—'}
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 0.5, flexWrap: 'wrap' }}>
          {file.file_size != null && file.file_size > 0 && (
            <Typography component="span" sx={{ color: '#6B7280', fontSize: 12 }}>
              {formatBytes(file.file_size)}
            </Typography>
          )}
          {file.mime_type && (
            <Typography component="span" sx={{ color: '#9CA3AF', fontSize: 11 }}>
              {file.mime_type}
            </Typography>
          )}
        </Stack>
      </Box>
      {file.url ? (
        <Button
          component={Link}
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          variant="contained"
          startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: '#AD542D',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            flexShrink: 0,
            '&:hover': { bgcolor: '#78381C' },
            ...adminButtonStartIconSx,
          }}
        >
          {openLabel}
        </Button>
      ) : (
        <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>—</Typography>
      )}
    </Paper>
  )
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <Stack direction="row" spacing={2} useFlexGap alignItems="flex-start">
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#717171', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
          {label}
        </Typography>
        <Box sx={{ fontWeight: 600, color: '#222222', fontSize: '0.9375rem', wordBreak: 'break-word' }}>{children}</Box>
      </Box>
    </Stack>
  )
}

export default function AdminContactsShow() {
  const { t } = useLanguage()
  const { contact } = usePage().props as { contact: ContactShow }

  const hasFiles = Boolean(contact.files?.length)
  const receivedLabel = contact.created_at
    ? new Date(contact.created_at).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <>
      <Head title={t('admin.contacts.view_message')} />
      <AdminLayout title={t('admin.contacts.view_message')}>
        <Button
          startIcon={<RtlBackArrowIcon />}
          onClick={() => router.visit('/admin/contacts')}
          sx={{
            mb: 3,
            color: '#717171',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#F9FAFB', color: '#222222' },
            ...adminButtonStartIconSx,
          }}
        >
          {t('admin.contacts.back_to_list')}
        </Button>

        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {contact.subject}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
              <Chip label={`#${contact.id}`} size="small" sx={{ fontWeight: 600, bgcolor: '#F3F4F6', color: '#374151' }} />
              {receivedLabel && (
                <Chip
                  icon={<AccessTimeIcon sx={{ fontSize: '16px !important' }} />}
                  label={receivedLabel}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#E5E7EB', color: '#717171', fontWeight: 500 }}
                />
              )}
              {!contact.user && (
                <Chip label={t('admin.contacts.guest_submitter')} size="small" sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 600 }} />
              )}
            </Stack>
          </CardContent>
        </Card>

        <Row className="g-3">
          <Col xs={12} lg={8}>
            <Stack spacing={2}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ px: { xs: 2, md: 3 }, py: 1.75, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <Typography sx={{ fontWeight: 700, color: '#222222', fontSize: '1rem' }}>{t('admin.contacts.message')}</Typography>
                  </Box>
                  <Box sx={{ p: { xs: 2, md: 4 } }}>
                    <Typography
                      sx={{
                        color: '#374151',
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {contact.message?.trim() ? contact.message : '—'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {hasFiles && (
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ px: { xs: 2, md: 3 }, py: 1.75, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <AttachFileIcon sx={{ color: '#AD542D', fontSize: 22, mt: 0.25 }} />
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: '#222222', fontSize: '1rem' }}>{t('admin.contacts.attachments')}</Typography>
                          <Typography sx={{ color: '#6B7280', mt: 0.25, fontSize: '0.8125rem', lineHeight: 1.45 }}>
                            {t('admin.contacts.attachments_hint')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <Box sx={{ p: { xs: 2, md: 3 } }}>
                      <Stack spacing={2}>
                        {contact.files.map((f, i) => (
                          <FileRow key={`${f.file_name}-${i}`} file={f} openLabel={t('admin.contacts.open_file')} />
                        ))}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Col>

          <Col xs={12} lg={4}>
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 16 }, alignSelf: 'flex-start' }}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ px: { xs: 2, md: 3 }, py: 1.75, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <Typography sx={{ fontWeight: 700, color: '#222222', fontSize: '1rem' }}>{t('admin.contacts.sender_details')}</Typography>
                  </Box>
                  <Box sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack spacing={0}>
                      <DetailRow label={t('admin.contacts.name')} icon={<PersonIcon sx={{ fontSize: 22, color: '#6B7280' }} />}>
                        {contact.name}
                      </DetailRow>
                      <Divider sx={{ my: 2 }} />
                      <DetailRow label={t('admin.contacts.email')} icon={<EmailIcon sx={{ fontSize: 22, color: '#6B7280' }} />}>
                        {contact.email}
                      </DetailRow>
                      <Divider sx={{ my: 2 }} />
                      <DetailRow label={t('admin.contacts.subject')} icon={<SubjectIcon sx={{ fontSize: 22, color: '#6B7280' }} />}>
                        {contact.subject}
                      </DetailRow>
                      <Divider sx={{ my: 2 }} />
                      <DetailRow label={t('admin.contacts.received_at')} icon={<AccessTimeIcon sx={{ fontSize: 22, color: '#6B7280' }} />}>
                        {receivedLabel ?? '—'}
                      </DetailRow>
                      <Divider sx={{ my: 2 }} />
                      <DetailRow
                        label={t('admin.contacts.account_user')}
                        icon={<AccountCircleIcon sx={{ fontSize: 22, color: '#6B7280' }} />}
                      >
                        {contact.user ? (
                          <Stack spacing={0.25}>
                            <Typography component="span" sx={{ fontWeight: 700, color: '#111827' }}>
                              {contact.user.name}
                            </Typography>
                            <Typography sx={{ fontWeight: 500, color: '#6B7280', fontSize: '0.875rem' }}>
                              {contact.user.email}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography component="span" sx={{ fontWeight: 500, color: '#6B7280' }}>
                            {t('admin.contacts.guest_submitter')}
                          </Typography>
                        )}
                      </DetailRow>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Col>
        </Row>
      </AdminLayout>
    </>
  )
}
