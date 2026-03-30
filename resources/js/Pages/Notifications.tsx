import { Box, Container, Paper, Typography, Stack, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../Components/Admin/Toast';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Notification {
    id: number;
    title: string;
    description: string;
    image?: string | null;
    status: string;
    read_at: string | null;
    created_at: string;
    notifiable_type: string;
    notifiable_id: number;
}

interface NotificationsPageProps {
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function Notifications({ notifications }: NotificationsPageProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const markAsRead = (notificationId: number) => {
        router.patch(`/notifications/${notificationId}/mark-as-read`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notificationId: number) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedNotificationId(notificationId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedNotificationId) {
            router.delete(`/notifications/${selectedNotificationId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setToastMessage('Notification deleted successfully');
                    setShowToast(true);
                    setDeleteDialogOpen(false);
                    setSelectedNotificationId(null);
                },
                onError: () => {
                    setToastMessage('Failed to delete notification');
                    setShowToast(true);
                }
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setSelectedNotificationId(null);
    };

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: '80vh', py: 6, bgcolor: '#F9FAFB' }}>
                <Container maxWidth="md">
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: '#111827' }}>
                        Notifications
                    </Typography>

                    <Stack spacing={2}>
                        {notifications.data.length === 0 ? (
                            <Paper sx={{ p: 6, textAlign: 'center' }}>
                                <Typography sx={{ color: '#6B7280', fontSize: '1rem' }}>
                                    No notifications yet
                                </Typography>
                            </Paper>
                        ) : (
                            notifications.data.map((notification) => (
                                <Paper
                                    key={notification.id}
                                    sx={{
                                        p: 3,
                                        cursor: 'pointer',
                                        bgcolor: notification.read_at ? '#FFFFFF' : '#F3F4F6',
                                        '&:hover': { bgcolor: '#F9FAFB', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                                        transition: 'all 0.2s',
                                    }}
                                    onClick={() => !notification.read_at && markAsRead(notification.id)}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#111827', mb: 0.5 }}>
                                                {notification.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.875rem', color: '#6B7280', mb: 1 }}>
                                                {notification.description}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                                {formatTimeAgo(notification.created_at)}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, notification.id)}
                                            sx={{ color: '#6B7280' }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Stack>
                                </Paper>
                            ))
                        )}
                    </Stack>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                        }}
                    >
                        <MenuItem onClick={handleDeleteClick} sx={{ color: '#DC2626', gap: 1 }}>
                            <DeleteIcon fontSize="small" />
                            Delete
                        </MenuItem>
                    </Menu>

                    <Dialog
                        open={deleteDialogOpen}
                        onClose={handleDeleteCancel}
                        maxWidth="xs"
                        fullWidth
                    >
                        <DialogTitle>Delete Notification</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to delete this notification? This action cannot be undone.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, gap: 1 }}>
                            <Button onClick={handleDeleteCancel} variant="outlined" color="inherit">
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </Box>
            <Footer />
            
            <Toast
                open={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
                severity="success"
            />
        </>
    );
}
