import { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { router, usePage } from '@inertiajs/react';
import Toast from '../Components/Admin/Toast';

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

export default function UserNotificationDropdown() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { auth } = usePage().props as any;

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications/latest', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.data.notifications || []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/api/notifications/unread-count', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.data.unread_count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            router.patch(`/notifications/${notificationId}/mark-as-read`, {}, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setNotifications(prev =>
                        prev.map(notif =>
                            notif.id === notificationId
                                ? { ...notif, read_at: new Date().toISOString() }
                                : notif
                        )
                    );
                    setUnreadCount(prev => Math.max(0, prev - 1));
                    setToastMessage('Notification marked as read');
                    setShowToast(true);
                },
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            router.patch('/notifications/mark-all-as-read', {}, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setNotifications(prev =>
                        prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
                    );
                    setUnreadCount(0);
                    setToastMessage('All notifications marked as read');
                    setShowToast(true);
                },
            });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            setToastMessage('Failed to mark notifications as read');
            setShowToast(true);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        setAnchorEl(null);
        // Navigate based on notification type
        if (notification.notifiable_type === 'App\\Models\\Property') {
            router.visit('/listing');
        } else if (notification.notifiable_type === 'App\\Models\\Booking') {
            router.visit('/booking-history');
        }
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

    useEffect(() => {
        if (auth?.user) {
            fetchNotifications();
            fetchUnreadCount();

            // Subscribe to user's private notification channel
            const channel = (window as any).Echo?.private(`user.${auth.user.id}`);
            if (channel) {
                channel.listen('.notification.created', (data: any) => {
                    const newNotification: Notification = {
                        id: data.id || Date.now(),
                        title: data.title || 'New Notification',
                        description: data.description || '',
                        image: data.image || null,
                        status: 'unread',
                        read_at: null,
                        created_at: new Date().toISOString(),
                        notifiable_type: data.notifiable_type || '',
                        notifiable_id: data.notifiable_id || 0,
                    };

                    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
                    setUnreadCount(prev => prev + 1);

                    // Play notification sound
                    const audio = new Audio('/sounds/notification.mp3');
                    audio.play().catch(() => {});
                });
            }

            return () => {
                if (channel) {
                    channel.stopListening('.notification.created');
                }
            };
        }
    }, [auth]);

    if (!auth?.user) {
        return null;
    }

    return (
        <>
            <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ 
                    color: '#AD542D',
                    p: 1,
                    transition: 'all 0.2s',
                    '&:hover': { color: '#8a4224', bgcolor: 'rgba(173, 84, 45, 0.08)' }
                }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon sx={{ fontSize: 24 }} />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        width: 380,
                        maxHeight: 500,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Typography
                            onClick={markAllAsRead}
                            sx={{
                                fontSize: '0.875rem',
                                color: '#AD542D',
                                cursor: 'pointer',
                                fontWeight: 600,
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Mark all as read
                        </Typography>
                    )}
                </Box>
                <Divider />
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                No notifications yet
                            </Typography>
                        </Box>
                    ) : (
                        notifications.map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    py: 2,
                                    px: 2,
                                    bgcolor: notification.read_at ? 'transparent' : '#FFF5F7',
                                    borderBottom: '1px solid #E5E7EB',
                                    display: 'block',
                                    whiteSpace: 'normal',
                                    '&:hover': { bgcolor: '#F9FAFB' }
                                }}
                            >
                                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827', mb: 0.5 }}>
                                    {notification.title}
                                </Typography>
                                <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280', mb: 0.5 }}>
                                    {notification.description}
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                    {formatTimeAgo(notification.created_at)}
                                </Typography>
                            </MenuItem>
                        ))
                    )}
                </Box>
                <Divider />
                <Box sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography
                        onClick={() => {
                            router.visit('/notifications');
                            setAnchorEl(null);
                        }}
                        sx={{
                            fontSize: '0.875rem',
                            color: '#AD542D',
                            cursor: 'pointer',
                            fontWeight: 600,
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        See all notifications
                    </Typography>
                </Box>
            </Menu>
            
            <Toast
                open={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
                severity="success"
            />
        </>
    );
}
