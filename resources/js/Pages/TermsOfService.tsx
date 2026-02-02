import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Container } from 'react-bootstrap'
import { Box, Typography } from '@mui/material'
import { Head } from '@inertiajs/react'

export default function TermsOfService() {
  return (
    <div>
      <Head title="Terms of Service" />
      <Navbar />
      <Box sx={{ py: 8, minHeight: '60vh' }}>
        <Container>
          <Typography component="h1" sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#222222', mb: 4 }}>Terms of Service</Typography>
          <Box sx={{ color: '#222222', fontSize: '1rem', lineHeight: 1.8 }}>
            <Typography sx={{ mb: 3 }}>Welcome to LipaBnb. By accessing or using our platform, you agree to be bound by these Terms of Service.</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>1. Acceptance of Terms</Typography>
            <Typography sx={{ mb: 3 }}>By using LipaBnb, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>2. Use of Service</Typography>
            <Typography sx={{ mb: 3 }}>You may use our platform to browse and book accommodations. You agree to use the service only for lawful purposes and in accordance with these Terms.</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>3. User Accounts</Typography>
            <Typography sx={{ mb: 3 }}>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>4. Booking and Payments</Typography>
            <Typography sx={{ mb: 3 }}>All bookings are subject to availability and confirmation. Payment terms and cancellation policies are outlined in our booking process.</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>5. Limitation of Liability</Typography>
            <Typography sx={{ mb: 3 }}>LipaBnb acts as a platform connecting hosts and guests. We are not responsible for the condition of properties or the conduct of hosts or guests.</Typography>
            <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, mt: 4 }}>6. Contact Information</Typography>
            <Typography sx={{ mb: 3 }}>If you have any questions about these Terms of Service, please contact us through our Contact page.</Typography>
          </Box>
        </Container>
      </Box>
      <Footer />
    </div>
  )
}
