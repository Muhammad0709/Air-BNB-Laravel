import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

type DeleteConfirmationDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message?: string
  itemName?: string
}

export default function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName = 'this item'
}: DeleteConfirmationDialogProps) {
  const defaultMessage = `This action cannot be undone. This will permanently delete ${itemName} and all their data.`

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          minWidth: 400
        }
      }}
      BackdropProps={{
        sx: {
          bgcolor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <DialogTitle
        sx={{
          color: '#111827',
          fontWeight: 700,
          fontSize: 20,
          pb: 1,
          px: 3,
          pt: 3
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 0 }}>
        <Typography
          sx={{
            color: '#6B7280',
            fontSize: 14,
            lineHeight: 1.6
          }}
        >
          {message || defaultMessage}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#344054',
            borderColor: '#D0D5DD',
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            '&:hover': {
              borderColor: '#D0D5DD',
              bgcolor: '#F9FAFB'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            bgcolor: '#EF4444',
            color: '#FFFFFF',
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#DC2626'
            }
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}



