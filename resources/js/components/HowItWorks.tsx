import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Box, Typography } from '@mui/material'
// Images served from public directory
const howWorkIcon = '/images/how-work.svg'

type Step = {
  title: string
  description: string
}

const steps: Step[] = [
  {
    title: 'Browse Listings',
    description:
      'Explore our curated collection of rentals, each with detailed descriptions.',
  },
  {
    title: 'Book & Pay Securely',
    description:
      'Securely book your stay using our trusted payment gateways.',
  },
  {
    title: 'Wait for Confirmation',
    description:
      'Receive confirmation of your booking and prepare for your trip.',
  },
]

export default function HowItWorks() {
  return (
    <section className="how-works">
      <Container>
        <Typography component="h2" className="how-title">
          How It Works
        </Typography>
        <Typography className="how-sub">
          Book your perfect stay in just three simple steps
        </Typography>

        <Row className="g-4 how-grid">
          {steps.map((s, i) => (
            <Col key={i} xs={12} md={4}>
              <Box className="how-card">
                <Box className="how-icon">
                  <img src={howWorkIcon} alt="step" />
                </Box>
                <Typography component="h3" className="how-card-title">
                  {s.title}
                </Typography>
                <Typography className="how-card-desc">{s.description}</Typography>
              </Box>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

