import { Box, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import AdminLayout from '../../../components/admin/AdminLayout'
import Pagination from '../../../components/Pagination'
import { Head, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'

type AuditLogRow = {
  id: number
  actor_name: string
  action: string
  subject_label: string
  description: string | null
  created_at: string
}

type LogsProp = { data: AuditLogRow[]; current_page: number; last_page: number }

export default function AdminAuditLogs() {
  const { t } = useLanguage()
  const props = usePage().props as { logs?: LogsProp }
  const logsProp = props.logs
  const list = logsProp?.data ?? []
  const currentPage = logsProp?.current_page ?? 1
  const lastPage = logsProp?.last_page ?? 1

  const handlePageChange = (page: number) => {
    router.get('/admin/audit-logs', { page }, { preserveState: true })
  }

  const getActionColor = (action: string) => {
    if (action.includes('deleted') || action.includes('rejected')) return '#EF4444'
    if (action.includes('approved')) return '#10B981'
    return '#717171'
  }

  const getActionLabel = (action: string) => {
    return t(`admin.audit_logs.action_${action}`) || action
  }

  return (
    <>
      <Head title={t('admin.audit_logs.title')} />
      <AdminLayout title={t('admin.audit_logs.title')}>
        <Row>
          <Col xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>
                  {t('admin.audit_logs.all_logs')}
                </Typography>
                <Typography sx={{ color: '#717171', fontSize: 14, mb: 3 }}>
                  {t('admin.audit_logs.subtitle')}
                </Typography>

                <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <Table sx={{ minWidth: 800, width: '100%' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.audit_logs.date')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.audit_logs.admin')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.audit_logs.action')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.audit_logs.subject')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('admin.audit_logs.details')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {list.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                            <Typography sx={{ color: '#6B7280' }}>{t('admin.audit_logs.no_logs_found')}</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        list.map((log) => (
                          <TableRow key={log.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                            <TableCell sx={{ color: '#717171', whiteSpace: 'nowrap' }}>{log.created_at}</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#222222' }}>{log.actor_name}</TableCell>
                            <TableCell>
                              <Chip
                                label={getActionLabel(log.action)}
                                size="small"
                                sx={{ bgcolor: `${getActionColor(log.action)}15`, color: getActionColor(log.action), fontWeight: 600, fontSize: 12 }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#222222' }}>{log.subject_label}</TableCell>
                            <TableCell sx={{ color: '#717171', maxWidth: 280 }}>
                              <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {log.description ?? '—'}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {lastPage > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </CardContent>
            </Card>
          </Col>
        </Row>
      </AdminLayout>
    </>
  )
}
