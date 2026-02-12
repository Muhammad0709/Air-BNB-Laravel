import React, { useState } from 'react'
import { Avatar, Box, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../Components/Admin/AdminLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import { router, usePage } from '@inertiajs/react'
import SearchIcon from '@mui/icons-material/Search'

export default function AdminUsers() {
  const { users, filters } = usePage().props as any
  const [search, setSearch] = useState(filters?.search || '')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    router.get('/admin/users', { search: value }, { 
      preserveState: true,
      replace: true
    })
  }

  const handleDeleteClick = (user: { id: number; name: string }) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      router.delete(`/admin/users/${userToDelete.id}`, {
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

  const usersList = users?.data || []

  return (
    <AdminLayout title="Users">
      {/* Users Table */}
      <Row>
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  All Users
                </Typography>
                <TextField
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search users..."
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

              <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table sx={{ minWidth: 800, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usersList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{ color: '#6B7280' }}>No users found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersList.map((user: any) => (
                        <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                          <TableCell>
                            <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: '#AD542D',
                                  fontSize: '1rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                                onClick={() => router.visit(`/admin/users/${user.id}`)}
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
                                onClick={() => router.visit(`/admin/users/${user.id}`)}
                              >
                                {user.name}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ color: '#6B7280' }}>{user.email}</TableCell>
                          <TableCell sx={{ color: '#6B7280' }}>
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <ActionsMenu
                              onView={() => router.visit(`/admin/users/${user.id}`)}
                              onEdit={() => router.visit(`/admin/users/${user.id}/edit`)}
                              onDelete={() => handleDeleteClick({ id: user.id, name: user.name })}
                              viewLabel="View"
                              editLabel="Edit"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Are you sure you want to delete this user?"
        itemName="the user"
      />
    </AdminLayout>
  )
}

