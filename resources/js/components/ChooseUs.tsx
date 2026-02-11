import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Box, Typography } from '@mui/material'
import { useLanguage } from '../hooks/use-language'
// Images served from public directory
const icon1 = '/images/choose-img1.svg'
const icon2 = '/images/choose-img2.svg'
const icon3 = '/images/choose-img3.svg'
const icon4 = '/images/choose-img4.svg'

const featureKeys = [
  { icon: icon1, title: 'about.choose1_title', desc: 'about.choose1_desc' },
  { icon: icon2, title: 'about.choose2_title', desc: 'about.choose2_desc' },
  { icon: icon3, title: 'about.choose3_title', desc: 'about.choose3_desc' },
  { icon: icon4, title: 'about.choose4_title', desc: 'about.choose4_desc' },
] as const

export default function ChooseUs() {
  const { t } = useLanguage()
  return (
    <section className="choose-section">
      <Container>
        <Typography component="h2" className="choose-title">{t('about.choose_title')}</Typography>
        <Typography className="choose-sub">{t('about.choose_sub')}</Typography>

        <Row className="g-4 mt-2">
          {featureKeys.map((f, i) => (
            <Col key={i} xs={12} md={6} lg={3}>
              <Box className="choose-card">
                <Box className="choose-icon"><img src={f.icon} alt="" /></Box>
                <Typography component="h3" className="choose-card-title">{t(f.title)}</Typography>
                <Typography className="choose-card-desc">{t(f.desc)}</Typography>
              </Box>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

