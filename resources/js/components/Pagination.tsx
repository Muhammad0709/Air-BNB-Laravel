import React from 'react'
import { Button, Stack, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

export type PaginationProps = {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
  /** Optional spacing/sx for the root Stack */
  sx?: object
}

function getPageNumbers(current: number, last: number): (number | 'ellipsis')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', last]
  if (current >= last - 3) return [1, 'ellipsis', last - 4, last - 3, last - 2, last - 1, last]
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', last]
}

export default function Pagination({ currentPage, lastPage, onPageChange, sx }: PaginationProps) {
  if (lastPage <= 1) return null

  const current = currentPage
  const last = lastPage
  const pages = getPageNumbers(current, last)

  return (
    <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 4, mb: 2, ...sx }}>
      <Button
        size="small"
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
        startIcon={<ChevronLeftIcon fontSize="small" />}
        sx={{
          color: current <= 1 ? '#9CA3AF' : '#6B7280',
          textTransform: 'none',
          minWidth: 'auto',
          px: 1.5,
          '&.Mui-disabled': { color: '#9CA3AF' },
        }}
      >
        Previous
      </Button>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <Typography key={`e-${idx}`} sx={{ px: 0.75, color: '#6B7280', fontSize: 14 }}>
              …
            </Typography>
          ) : (
            <Button
              key={p}
              size="small"
              onClick={() => onPageChange(p)}
              sx={{
                minWidth: 36,
                height: 36,
                borderRadius: 1,
                fontWeight: p === current ? 600 : 400,
                color: p === current ? '#FFFFFF' : '#222222',
                bgcolor: p === current ? '#AD542D' : 'transparent',
                border: p === current ? '1px solid #AD542D' : '1px solid transparent',
                '&:hover': {
                  bgcolor: p === current ? '#78381C' : '#F7F7F7',
                  borderColor: p === current ? '#78381C' : '#AD542D',
                },
              }}
            >
              {p}
            </Button>
          )
        )}
      </Stack>
      <Button
        size="small"
        disabled={current >= last}
        onClick={() => onPageChange(current + 1)}
        endIcon={<ChevronRightIcon fontSize="small" />}
        sx={{
          color: current >= last ? '#9CA3AF' : '#222222',
          fontWeight: 600,
          textTransform: 'none',
          minWidth: 'auto',
          px: 1.5,
          '&.Mui-disabled': { color: '#9CA3AF' },
        }}
      >
        Next
      </Button>
    </Stack>
  )
}
