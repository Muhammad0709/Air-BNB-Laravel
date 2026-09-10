import React, { useState } from 'react'
import { Button, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Box, Card, CardContent, Chip, Divider, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import Pagination from '../../../components/Pagination'
import { router, usePage, useForm } from '@inertiajs/react'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useLanguage } from '../../../hooks/use-language'

export default function AdminUsers() {
  const { t } = useLanguage()
  const page = usePage().props as any
  const { users, filters } = page
  const resourcePath = page.resourcePath || '/admin/users'
  const pageTitle = page.pageTitle || t('admin.users.title')
  const listTitle = page.listTitle || t('admin.users.all_users')
  const searchPlaceholder = page.searchPlaceholder || t('admin.users.search_placeholder')
  const noItemsLabel = page.noItemsLabel || t('admin.users.no_users_found')
  const deleteConfirm = page.deleteConfirm || t('admin.users.delete_confirm')
  const deleteItemName = page.deleteItemName || t('admin.users.item_name')
  const [search, setSearch] = useState(filters?.search || '')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    router.get(resourcePath, { ...filters, search: value, page: 1 }, {
      preserveState: true,
      replace: true
    })
  }

  const handlePageChange = (page: number) => {
    router.get(resourcePath, { ...filters, search, page }, { preserveState: true })
  }

  const handleDeleteClick = (user: { id: number; name: string }) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      router.delete(`${resourcePath}/${userToDelete.id}`, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setUserToDelete(null)
        }
      })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const [statusUser, setStatusUser] = useState<any>(null)
  const statusForm = useForm({ account_status: 'suspended', reason: '' })
  const usersList = users?.data || []
  const currentPage = users?.current_page ?? 1
  const lastPage = users?.last_page ?? 1

  const getStatus = (user: any) => (user.account_status || 'active').toLowerCase()
  const getStatusStyles = (status: string) => {
    if (status === 'suspended') return { color: '#B45309', bgcolor: '#FFF7ED', borderColor: '#FED7AA' }
    if (status === 'disabled') return { color: '#B91C1C', bgcolor: '#FEF2F2', borderColor: '#FECACA' }
    return { color: '#047857', bgcolor: '#ECFDF5', borderColor: '#A7F3D0' }
  }
  const formatStatus = (status: string) => t(`admin.users.status_${status}`)
  const verificationStatuses = ['pending', 'verified', 'rejected', 'suspended']
  const getVerificationStatus = (user: any) => String(user.provider_verification_status || 'verified').toLowerCase()

  return (
    <AdminLayout title={pageTitle}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
        <TextField select label={t('admin.users.account_status')} size="small" sx={{ width: { xs: '100%', sm: 190 } }} value={filters?.account_status || ''} onChange={e => router.get(resourcePath, { ...filters, account_status: e.target.value })}>
          <MenuItem value="">{t('admin.users.all_statuses')}</MenuItem>
          {['active', 'suspended', 'disabled'].map(s => <MenuItem key={s} value={s}>{formatStatus(s)}</MenuItem>)}
        </TextField>
      </Stack>
      <Dialog
        open={!!statusUser}
        onClose={() => setStatusUser(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', boxShadow: '0 24px 70px rgba(17, 24, 39, 0.22)' } }}
      >
        <DialogTitle sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: '#FFFAF7' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: '#FBE9DF', color: '#AD542D', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <LockOutlinedIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: { xs: '1.15rem', sm: '1.3rem' } }}>{t('admin.users.manage_access')}</Typography>
              <Typography noWrap sx={{ color: '#6B7280', fontSize: 14, mt: 0.25 }}>{statusUser?.name}</Typography>
            </Box>
            <IconButton onClick={() => setStatusUser(null)} aria-label={t('admin.common.close')} sx={{ color: '#6B7280', '&:hover': { bgcolor: '#FBE9DF', color: '#AD542D' } }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: 14 }}>{t('admin.users.account_status')}</Typography>
              </Stack>
              <TextField select value={statusForm.data.account_status} onChange={e => statusForm.setData('account_status', e.target.value)} fullWidth>
              {['active', 'suspended', 'disabled'].map(s => <MenuItem key={s} value={s}>{s === 'disabled' ? t('admin.users.status_permanently_disabled') : formatStatus(s)}</MenuItem>)}
              </TextField>
            </Box>
            <TextField
              label={t('admin.users.reason')}
              placeholder={t('admin.users.reason_placeholder')}
              multiline
              minRows={3}
              value={statusForm.data.reason}
              onChange={e => statusForm.setData('reason', e.target.value)}
              error={!!statusForm.errors.reason}
              helperText={statusForm.errors.reason || t('admin.users.reason_required')}
              fullWidth
            />
            <Box sx={{ px: 1.5, py: 1.25, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
              <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.5 }}>{t('admin.users.permanently_disabled_note')}</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: { xs: 2.5, sm: 3 }, py: 2 }}>
          <Button onClick={() => setStatusUser(null)} sx={{ textTransform: 'none', color: '#6B7280' }}>{t('admin.common.cancel')}</Button>
          <Button variant="contained" disabled={statusForm.processing} onClick={() => statusForm.patch(`${resourcePath}/${statusUser.id}/status`, { onSuccess: () => setStatusUser(null) })} sx={{ textTransform: 'none', borderRadius: 1.5, px: 2.5, bgcolor: '#AD542D', '&:hover': { bgcolor: '#8F4324' } }}>{statusForm.processing ? t('admin.users.saving') : t('admin.users.save_changes')}</Button>
        </DialogActions>
      </Dialog>
      {/* Users Table */}
      <Row>
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {listTitle}
                </Typography>
                <TextField
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  size="small"
                  variant="outlined"
                  sx={{
                    width: { xs: '100%', sm: 250 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px !important',
                      '& fieldset': {
                        borderColor: '#E5E7EB',
                        borderRadius: '10px !important',
                      },
                      '&:hover fieldset': {
                        borderColor: '#D1D5DD',
                        borderRadius: '10px !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#AD542D',
                        borderRadius: '10px !important',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>

              <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch', border: '1px solid #EEF0F2', borderRadius: 2 }}>
                <Table sx={{ minWidth: { xs: 760, md: 900 }, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#374151', whiteSpace: 'nowrap', py: 1.75 }}>{t('admin.users.name')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#374151', whiteSpace: 'nowrap', py: 1.75 }}>{t('admin.users.email')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#374151', whiteSpace: 'nowrap', py: 1.75 }}>{t('admin.users.joined')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#374151', whiteSpace: 'nowrap', py: 1.75 }}>{t('admin.users.status')}</TableCell>
                      {page.managementType === 'hosts' && <TableCell sx={{ fontWeight: 700, color: '#374151', whiteSpace: 'nowrap', py: 1.75 }}>{t('admin.users.verification')}</TableCell>}
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#374151', whiteSpace: 'nowrap', py: 1.75 }}>{t('admin.common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usersList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={page.managementType === 'hosts' ? 6 : 5} sx={{ textAlign: 'center', py: 6 }}>
                          <Typography sx={{ color: '#6B7280' }}>{noItemsLabel}</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersList.map((user: any) => (
                        <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#FCFCFD' }, '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ py: 1.75 }}>
                            <Stack direction="row" spacing={1.5} useFlexGap alignItems="center" sx={{ minWidth: 190 }}>
                              <Avatar
                                sx={{
                                  width: 44,
                                  height: 44,
                                  bgcolor: '#AD542D',
                                  fontSize: '1rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                                onClick={() => router.visit(`${resourcePath}/${user.id}`)}
                              >
                                {getInitials(user.name)}
                              </Avatar>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: '#111827',
                                  cursor: 'pointer',
                                  '&:hover': { color: '#AD542D' }
                                }}
                                onClick={() => router.visit(`${resourcePath}/${user.id}`)}
                              >
                                {user.name}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ color: '#6B7280', py: 1.75, whiteSpace: 'nowrap' }}>{user.email}</TableCell>
                          <TableCell sx={{ color: '#6B7280', py: 1.75, whiteSpace: 'nowrap' }}>
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip label={formatStatus(getStatus(user))} size="small" sx={{ ...getStatusStyles(getStatus(user)), border: '1px solid', fontWeight: 700, fontSize: 12, height: 30, borderRadius: 1.5 }} />
                          </TableCell>
                          {page.managementType === 'hosts' && (
                            <TableCell sx={{ py: 1.75 }}>
                              <TextField
                                select
                                size="small"
                                value={getVerificationStatus(user)}
                                onChange={(e) => router.patch(`${resourcePath}/${user.id}/verification`, { provider_verification_status: e.target.value }, { preserveScroll: true })}
                                sx={{ minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                              >
                                {verificationStatuses.map((status) => (
                                  <MenuItem key={status} value={status}>{formatStatus(status)}</MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                          )}
                          <TableCell align="right" sx={{ py: 1.75 }}>
                            <Stack direction="row" spacing={1} useFlexGap justifyContent="flex-end" alignItems="center">
                            <ActionsMenu
                              onView={() => router.visit(`${resourcePath}/${user.id}`)}
                              onEdit={() => router.visit(`${resourcePath}/${user.id}/edit`)}
                              onManageAccess={getStatus(user) === 'disabled' ? undefined : () => { statusForm.reset(); statusForm.clearErrors(); statusForm.setData('account_status', getStatus(user)); setStatusUser(user) }}
                              onDelete={() => handleDeleteClick({ id: user.id, name: user.name })}
                              viewLabel={t('admin.common.view')}
                              editLabel={t('admin.common.edit')}
                              manageAccessLabel={t('admin.users.manage_access')}
                            />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {lastPage > 1 && (
                <Pagination
                  currentPage={currentPage}
                  lastPage={lastPage}
                  onPageChange={handlePageChange}
                />
              )}
            </CardContent>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={deleteConfirm}
        itemName={deleteItemName}
      />
    </AdminLayout>
  )
}
