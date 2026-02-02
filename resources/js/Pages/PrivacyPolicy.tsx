import { Box, Container, Paper, Stack, Typography } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Head } from '@inertiajs/react'

export default function PrivacyPolicy() {
  return (
    <Box>
      <Head title="Privacy Policy" />
      <Navbar />
      <Box sx={{ minHeight: '80vh', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, md: 3 } }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#FFFFFF' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: '#222222' }}>Privacy Policy</Typography>
            <Typography variant="body2" sx={{ color: '#717171', mb: 4 }}>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>1. Introduction</Typography>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>
                  Welcome to LipaBnb. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>2. Information We Collect</Typography>
                <Typography variant="body1" sx={{ color: '#222222', mb: 1.5, lineHeight: 1.8 }}>We collect information that you provide directly to us, including:</Typography>
                <Box component="ul" sx={{ pl: 3, mb: 1.5 }}>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Name, email address, phone number, and other contact information</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Payment information and billing details</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Profile information and preferences</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Property listings and booking information</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Communications and messages sent through our platform</Typography></li>
                </Box>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>
                  We also automatically collect certain information when you visit our website, such as your IP address, browser type, device information, and usage patterns.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>3. How We Use Your Information</Typography>
                <Typography variant="body1" sx={{ color: '#222222', mb: 1.5, lineHeight: 1.8 }}>We use the information we collect to:</Typography>
                <Box component="ul" sx={{ pl: 3, mb: 1.5 }}>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Provide, maintain, and improve our services</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Process bookings and transactions</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Send you updates, newsletters, and promotional materials</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Respond to your inquiries and provide customer support</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Detect, prevent, and address technical issues and fraud</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>Comply with legal obligations</Typography></li>
                </Box>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>4. Information Sharing and Disclosure</Typography>
                <Typography variant="body1" sx={{ color: '#222222', mb: 1.5, lineHeight: 1.8 }}>We may share your information in the following circumstances:</Typography>
                <Box component="ul" sx={{ pl: 3, mb: 1.5 }}>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>With hosts and guests to facilitate bookings and communications</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>With service providers who assist us in operating our platform</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>When required by law or to protect our rights and safety</Typography></li>
                  <li><Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>In connection with a business transfer or merger</Typography></li>
                </Box>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>We do not sell your personal information to third parties.</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>5. Data Security</Typography>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>6. Your Rights and Choices</Typography>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>
                  You have the right to access, update, and request deletion of your personal information. To exercise these rights, please contact us at privacy@lipabnb.com.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#222222' }}>7. Contact Us</Typography>
                <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8 }}>
                  If you have any questions about this Privacy Policy, please contact us at privacy@lipabnb.com.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}
