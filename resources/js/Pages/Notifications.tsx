import { Box, Container, Paper, Typography, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Card, CardContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import Toast from '../components/Admin/Toast';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useLanguage } from '../hooks/use-language';

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
    const { t } = useLanguage();
    const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const currentPage = notifications.current_page;
    const lastPage = notifications.last_page;

    const handlePageChange = (page: number) => {
        router.get('/notifications', { page }, { preserveState: true });
    };

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return t('common.just_now') as string;
        if (diffInMinutes < 60) return (t('common.minutes_ago') as string).replace(':count', String(diffInMinutes));
        if (diffInMinutes < 1440) return (t('common.hours_ago') as string).replace(':count', String(Math.floor(diffInMinutes / 60)));
        return (t('common.days_ago') as string).replace(':count', String(Math.floor(diffInMinutes / 1440)));
    };

    const markAsRead = (notificationId: number) => {
        router.patch(`/notifications/${notificationId}/mark-as-read`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notificationId: number) => {
        event.stopPropagation();
        setSelectedNotificationId(notificationId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedNotificationId) {
            router.delete(`/notifications/${selectedNotificationId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setToastMessage(t('notifications.delete_success'));
                    setShowToast(true);
                    setDeleteDialogOpen(false);
                    setSelectedNotificationId(null);
                },
                onError: () => {
                    setToastMessage(t('notifications.delete_failed'));
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
            <Box className="notifications-page" sx={{ minHeight: '80vh', py: 4, bgcolor: '#FFFFFF' }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' }, fontWeight: 800, color: '#111827', mb: 1.5, letterSpacing: '-0.01em' }}>
                            {t('notifications.title')}
                        </Typography>
                        <Typography sx={{ color: '#6B7280', fontSize: { xs: '0.9375rem', md: '1rem' } }}>
                            {t('notifications.subtitle')}
                        </Typography>
                    </Box>

                    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                        <CardContent sx={{ p: notifications.data.length === 0 ? 0 : { xs: 1.5, sm: 2 } }}>
                            {notifications.data.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
                                    <NotificationsNoneIcon sx={{ fontSize: 64, color: '#D0D5DD', mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: '#374151', fontWeight: 700, mb: 1 }}>
                                        {t('notifications.empty_title')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                                        {t('notifications.empty_sub')}
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={1.5}>
                                    {notifications.data.map((notification) => (
                                        <Paper
                                            key={notification.id}
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                cursor: 'pointer',
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: notification.read_at ? '#E5E7EB' : '#F3D9CC',
                                                bgcolor: notification.read_at ? '#FFFFFF' : '#FFF8F4',
                                                transition: 'all 0.2s',
                                                '&:hover': { borderColor: '#AD542D', boxShadow: '0 2px 8px rgba(173, 84, 45, 0.1)' },
                                            }}
                                            onClick={() => !notification.read_at && markAsRead(notification.id)}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        flexShrink: 0,
                                                        display: 'grid',
                                                        placeItems: 'center',
                                                        background: notification.read_at
                                                            ? '#F3F4F6'
                                                            : 'linear-gradient(160deg, #C46A42 0%, #AD542D 60%, #8F4322 100%)',
                                                    }}
                                                >
                                                    <NotificationsNoneIcon sx={{ fontSize: 20, color: notification.read_at ? '#9CA3AF' : '#fff' }} />
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111827' }}>
                                                            {notification.title}
                                                        </Typography>
                                                        {!notification.read_at && (
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#AD542D', flexShrink: 0 }} aria-label={t('notifications.unread')} />
                                                        )}
                                                    </Stack>
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
                                                    sx={{ color: '#9CA3AF', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>

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
                        <DialogTitle>{t('notifications.delete_dialog_title')}</DialogTitle>
                        <DialogContent>
                            <Typography>
                                {t('notifications.delete_dialog_message')}
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, gap: 1 }}>
                            <Button onClick={handleDeleteCancel} variant="outlined" color="inherit">
                                {t('common.cancel')}
                            </Button>
                            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                                {t('common.delete')}
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
