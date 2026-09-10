import { useState } from 'react'
import { IconButton, Menu, MenuItem, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useLanguage } from '../../hooks/use-language'

type ActionsMenuProps = {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  onManageAccess?: () => void
  onApprove?: () => void
  onReject?: () => void
  editLabel?: string
  deleteLabel?: string
  viewLabel?: string
  manageAccessLabel?: string
  approveLabel?: string
  rejectLabel?: string
}

export default function ActionsMenu({
  onEdit,
  onDelete,
  onView,
  onManageAccess,
  onApprove,
  onReject,
  editLabel,
  deleteLabel,
  viewLabel,
  manageAccessLabel,
  approveLabel,
  rejectLabel
}: ActionsMenuProps) {
  const { t } = useLanguage()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const resolvedEditLabel = editLabel ?? t('admin.common.edit')
  const resolvedDeleteLabel = deleteLabel ?? t('admin.common.delete')
  const resolvedViewLabel = viewLabel ?? t('admin.common.view')
  const resolvedManageAccessLabel = manageAccessLabel ?? t('admin.users.manage_access')
  const resolvedApproveLabel = approveLabel ?? t('admin.properties.approve')
  const resolvedRejectLabel = rejectLabel ?? t('admin.properties.reject')

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    }
    handleClose()
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    }
    handleClose()
  }

  const handleView = () => {
    if (onView) {
      onView()
    }
    handleClose()
  }

  const handleManageAccess = () => {
    if (onManageAccess) {
      onManageAccess()
    }
    handleClose()
  }

  const handleApprove = () => {
    if (onApprove) {
      onApprove()
    }
    handleClose()
  }

  const handleReject = () => {
    if (onReject) {
      onReject()
    }
    handleClose()
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          color: '#6B7280',
          '&:hover': { bgcolor: '#F9FAFB', color: '#111827' }
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB',
            minWidth: 140
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {onView && (
          <MenuItem
            onClick={handleView}
            sx={{
              py: 1,
              px: 1.5,
              '&:hover': { bgcolor: '#F9FAFB' }
            }}
          >
            <VisibilityIcon sx={{ fontSize: 16, color: '#6B7280', marginInlineEnd: 1 }} />
            <Typography sx={{ color: '#111827', fontSize: 14 }}>{resolvedViewLabel}</Typography>
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem
            onClick={handleEdit}
            sx={{
              py: 1,
              px: 1.5,
              '&:hover': { bgcolor: '#F9FAFB' }
            }}
          >
            <EditIcon sx={{ fontSize: 16, color: '#6B7280', marginInlineEnd: 1 }} />
            <Typography sx={{ color: '#111827', fontSize: 14 }}>{resolvedEditLabel}</Typography>
          </MenuItem>
        )}
        {onManageAccess && (
          <MenuItem
            onClick={handleManageAccess}
            sx={{
              py: 1,
              px: 1.5,
              '&:hover': { bgcolor: '#FFF7F3' }
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 16, color: '#AD542D', marginInlineEnd: 1 }} />
            <Typography sx={{ color: '#AD542D', fontSize: 14 }}>{resolvedManageAccessLabel}</Typography>
          </MenuItem>
        )}
        {onApprove && (
          <MenuItem
            onClick={handleApprove}
            sx={{
              py: 1,
              px: 1.5,
              '&:hover': { bgcolor: '#ECFDF5' }
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981', marginInlineEnd: 1 }} />
            <Typography sx={{ color: '#10B981', fontSize: 14 }}>{resolvedApproveLabel}</Typography>
          </MenuItem>
        )}
        {onReject && (
          <MenuItem
            onClick={handleReject}
            sx={{
              py: 1,
              px: 1.5,
              '&:hover': { bgcolor: '#FEF2F2' }
            }}
          >
            <CancelIcon sx={{ fontSize: 16, color: '#EF4444', marginInlineEnd: 1 }} />
            <Typography sx={{ color: '#EF4444', fontSize: 14 }}>{resolvedRejectLabel}</Typography>
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={handleDelete}
            sx={{
              py: 1,
              px: 1.5,
              '&:hover': { bgcolor: '#FEF2F2' }
            }}
          >
            <DeleteIcon sx={{ fontSize: 16, color: '#EF4444', marginInlineEnd: 1 }} />
            <Typography sx={{ color: '#EF4444', fontSize: 14 }}>{resolvedDeleteLabel}</Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

