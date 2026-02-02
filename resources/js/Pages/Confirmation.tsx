import { Box, Breadcrumbs, Button, Typography } from '@mui/material'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { Container, Row, Col } from 'react-bootstrap'
import ListingPreviewCard from '../Components/ListingPreviewCard'
import BookingSummaryCard from '../Components/BookingSummaryCard'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { router, Head } from '@inertiajs/react'

// Images served from public directory
const img1 = '/images/popular-stay-1.svg'

export default function Confirmation() {
  return (
    <>
      <Head title="Booking Confirmation" />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box className="confirmation-page" sx={{ flex: 1 }}>
          <Container>
            <Box className="confirmation-content">
              <Box className="success-icon-wrapper">
                <CheckCircleIcon className="success-icon" />
              </Box>
              <Typography className="confirmation-title">Request Submitted</Typography>
              <Typography className="confirmation-subtitle">Your Request has been Successfully Submitted</Typography>
            </Box>

            <Row className="justify-content-center">
              <Col xs={12} md={10} lg={8}>
                <ListingPreviewCard
                  image={img1}
                  title="Luxury Beachfront Villa Luxury Beachfront Vi"
                  location="Malibu, California"
                  reviews={123}
                  rating={4}
                />
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col xs={12} md={10} lg={8}>
                <BookingSummaryCard
                  rules={[
                    'Check-in: 3:00 PM - 10:00 PM',
                    'Check-out: 11:00 AM',
                    'No parties or events allowed',
                    'Pets allowed (with prior notification)',
                    'No smoking indoors',
                  ]}
                  costs={[
                    { label: '$87 × 7 nights', amount: '$585' },
                    { label: 'Cleaning fee', amount: '$25' },
                    { label: 'Service fee', amount: '$71' },
                  ]}
                  totalLabel="Totaal"
                  totalAmount="$631"
                />
              </Col>
            </Row>

            <Box className="return-btn-wrapper">
              <Button
                variant="contained"
                className="return-home-btn"
                onClick={() => router.visit('/')}
              >
                Return to Home
              </Button>
            </Box>
          </Container>
        </Box>
        <Footer />
      </Box>
    </>
  )
}
