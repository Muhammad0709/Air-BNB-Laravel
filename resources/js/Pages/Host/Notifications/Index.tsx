import { Box, Paper, Typography, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HostLayout from '../../../Components/Host/HostLayout';
import Pagination from '../../../components/Pagination';
import Toast from '../../../Components/Admin/Toast';
import { router } from '@inertiajs/react';
import { useLanguage } from '../../../hooks/use-language';
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

export default function Index({ notifications }: NotificationsPageProps) {
    const { t } = useLanguage();
    const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const currentPage = notifications.current_page;
    const lastPage = notifications.last_page;

    const handlePageChange = (page: number) => {
        router.get('/host/notifications', { page }, { preserveState: true });
    };

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
        router.patch(`/host/notifications/${notificationId}/mark-as-read`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeleteClick = (event: React.MouseEvent<HTMLElement>, notificationId: number) => {
        event.stopPropagation();
        setSelectedNotificationId(notificationId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedNotificationId) {
            router.delete(`/host/notifications/${selectedNotificationId}`, {
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
        <HostLayout title={t('host.notifications.title') || 'Notifications'}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
                    {t('host.notifications.all_notifications') || 'All Notifications'}
                </Typography>

                <Stack spacing={2}>
                    {notifications.data.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography sx={{ color: '#6B7280' }}>
                                {t('host.notifications.no_notifications') || 'No notifications yet'}
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
                                    '&:hover': { bgcolor: '#F9FAFB' },
                                    transition: 'background-color 0.2s',
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
                                        onClick={(e) => handleDeleteClick(e, notification.id)}
                                        sx={{ color: '#DC2626' }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Stack>
                            </Paper>
                        ))
                    )}
                </Stack>

                {lastPage > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        lastPage={lastPage}
                        onPageChange={handlePageChange}
                    />
                )}

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
            </Box>
            
            <Toast
                open={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
                severity="success"
            />
        </HostLayout>
    );
}
