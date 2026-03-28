import { Box, Paper, Typography, Stack, Chip } from '@mui/material';
import HostLayout from '../../../Components/Host/HostLayout';
import { router } from '@inertiajs/react';
import { useLanguage } from '../../../hooks/use-language';

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
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
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
                                    {!notification.read_at && (
                                        <Chip
                                            label="New"
                                            size="small"
                                            sx={{
                                                bgcolor: '#3B82F6',
                                                color: '#FFFFFF',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Paper>
                        ))
                    )}
                </Stack>
            </Box>
        </HostLayout>
    );
}
