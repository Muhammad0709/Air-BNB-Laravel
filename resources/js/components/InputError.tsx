import React from 'react'
import { Typography } from '@mui/material'

type Props = { message?: string | null }

export default function InputError({ message }: Props) {
  if (!message) return null
  return (
    <Typography component="p" sx={{ marginTop: '10px !important', fontSize: '0.9rem', color: '#d32f2f' }}>
      {message}
    </Typography>
  )
}
