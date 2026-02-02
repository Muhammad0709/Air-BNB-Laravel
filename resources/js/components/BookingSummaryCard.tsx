import React from 'react'
import { Box, Paper, Typography, Divider } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface BookingSummaryCardProps {
  rules: string[]
  costs: Array<{ label: string; amount: string }>
  totalLabel?: string
  totalAmount: string
}

export default function BookingSummaryCard({ rules, costs, totalLabel = "Total", totalAmount }: BookingSummaryCardProps) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 2 }}>
      {/* Rules Section */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
        House Rules
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        {rules.map((rule, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981', mt: 0.25, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.5 }}>
              {rule}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Cost Breakdown */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
        Price Details
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        {costs.map((cost, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {cost.label}
            </Typography>
            <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>
              {cost.amount}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Total */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
          {totalLabel}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
          {totalAmount}
        </Typography>
      </Box>
    </Paper>
  )
}
