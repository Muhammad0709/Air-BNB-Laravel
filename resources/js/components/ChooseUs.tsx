import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Box, Typography } from '@mui/material'
// Images served from public directory
const icon1 = '/images/choose-img1.svg'
const icon2 = '/images/choose-img2.svg'
const icon3 = '/images/choose-img3.svg'
const icon4 = '/images/choose-img4.svg'

type Feature = { icon: string; title: string; desc: string }

const features: Feature[] = [
  { icon: icon1, title: 'Handpicked Listings', desc: 'We carefully select each listing and verify hosts to ensure quality and reliability.' },
  { icon: icon2, title: 'Secure Payments', desc: 'Your payments are processed securely through Stripe & GCash.' },
  { icon: icon3, title: 'Flexible Booking', desc: 'Enjoy flexible booking options and discounts for longer stays.' },
  { icon: icon4, title: 'Reliable Support', desc: 'Our customer support team is available to assist you with any questions or concerns.' },
]

export default function ChooseUs() {
  return (
    <section className="choose-section">
      <Container>
        <Typography component="h2" className="choose-title">Why Choose Us</Typography>
        <Typography className="choose-sub">Experience the difference with our premium booking platform</Typography>

        <Row className="g-4 mt-2">
          {features.map((f, i) => (
            <Col key={i} xs={12} md={6} lg={3}>
              <Box className="choose-card">
                <Box className="choose-icon"><img src={f.icon} alt="" /></Box>
                <Typography component="h3" className="choose-card-title">{f.title}</Typography>
                <Typography className="choose-card-desc">{f.desc}</Typography>
              </Box>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

