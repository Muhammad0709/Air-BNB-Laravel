import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HowItWorks from '../components/HowItWorks'
import ChooseUs from '../components/ChooseUs'
import CtaReady from '../components/CtaReady'
import { Container, Row, Col } from 'react-bootstrap'
import { Box, Typography } from '@mui/material'
import { Head } from '@inertiajs/react'

export default function About() {
  return (
    <div className="about-page">
      <Head title="About Us" />
      <Navbar />
      <section className="hero-section">
        <Container>
          <Box className="hero-content">
            <Row className="justify-content-center">
              <Col lg={8} className="text-center">
                <Typography component="h1" className="hero-title">About us</Typography>
                <Typography className="hero-subtitle">
                  We offer a diverse selection of rentals, from cozy apartments to luxurious villas and hotels, tailored to your preferences.
                </Typography>
              </Col>
            </Row>
          </Box>
        </Container>
      </section>
      <HowItWorks />
      <ChooseUs />
      <CtaReady />
      <Footer />
    </div>
  )
}
