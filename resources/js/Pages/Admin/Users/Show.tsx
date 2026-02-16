import React, { useState } from 'react'
import { Avatar, Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import { router, usePage } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import EmailIcon from '@mui/icons-material/Email'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DeleteIcon from '@mui/icons-material/Delete'
import { useLanguage } from '../../../hooks/use-language'

export default function ViewUser() {
  const { t } = useLanguage()
  const { user } = usePage().props as any
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    router.delete(`/admin/users/${user.id}`, {
      onSuccess: () => {
        router.visit('/admin/users')
      }
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (!user) {
    return (
      <AdminLayout title={t('admin.users.view_user')}>
        <Typography>{t('admin.users.user_not_found')}</Typography>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={t('admin.users.view_user')}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.visit('/admin/users')}
          sx={{
            color: '#6B7280',
            textTransform: 'none',
            '&:hover': { bgcolor: '#F9FAFB', color: '#111827' }
          }}
        >
          {t('admin.users.back_to_users')}
        </Button>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            sx={{
              borderColor: '#EF4444',
              color: '#EF4444',
              textTransform: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#DC2626',
                bgcolor: '#FEF2F2'
              }
            }}
          >
            {t('admin.common.delete')}
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => router.visit(`/admin/users/${user.id}/edit`)}
            sx={{
              bgcolor: '#AD542D',
              textTransform: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              '&:hover': { bgcolor: '#78381C' }
            }}
          >
            {t('admin.users.edit_user')}
          </Button>
        </Stack>
      </Stack>

      {/* User Header */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={3} useFlexGap>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: '#AD542D',
                fontSize: '2rem',
                fontWeight: 700
              }}
            >
              {getInitials(user.name)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
                {user.name}
              </Typography>
              <Stack direction="row" spacing={2} useFlexGap alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} useFlexGap alignItems="center">
                  <EmailIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                  <Typography sx={{ color: '#6B7280' }}>{user.email}</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={3} useFlexGap>
                <Stack direction="row" spacing={1} useFlexGap alignItems="center">
                  <CalendarTodayIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                  <Typography sx={{ color: '#6B7280' }}>
                    Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* User Details */}
      <Row>
        <Col xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
                {t('admin.users.user_information')}
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#6B7280', mb: 0.5 }}>{t('admin.users.full_name')}</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#111827' }}>{user.name}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#6B7280', mb: 0.5 }}>{t('admin.users.email_address')}</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#111827' }}>{user.email}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
                {t('admin.users.account_information')}
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#6B7280', mb: 1 }}>{t('admin.users.member_since')}</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t('admin.users.delete_confirm')}
        itemName={t('admin.users.item_name')}
      />
    </AdminLayout>
  )
}

