import React from 'react'
import { Head } from '@inertiajs/react';
import { Box, Typography } from '@mui/material';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                    Welcome to LipaBnb
                </Typography>
                <Typography variant="body1">
                    Laravel 12 + Inertia.js + React is working!
                </Typography>
            </Box>
        </>
    );
}

