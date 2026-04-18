import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { usePage, router, Head } from '@inertiajs/react'
import { Box, Button, Card, CardContent, Checkbox, Dialog, FormControlLabel, Stack, TextField, Typography, Avatar, Paper, IconButton, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLanguage } from '../hooks/use-language'
import { Container, Row, Col } from 'react-bootstrap'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import { apiDelete, apiGet, apiPostForm, apiPostJson } from '../chatApi'
import Toast from '../components/Admin/Toast'
import { MessageStatusTicks } from '../components/MessageStatusTicks'

interface MessageFile {
  id: number | string
  type: 'image' | 'video'
  url: string
  name: string
  size: number
}

interface Message {
  id: number
  text?: string
  sender: 'customer' | 'host'
  timestamp: Date | string
  read: boolean
  files?: MessageFile[] | null
}

interface ConversationListItem {
  id: number
  hostName: string
  hostAvatar: string | null
  property: string
  propertyId?: number
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface Conversation extends ConversationListItem {
  messages: Message[]
}

// Backend returns messages as plain array with sender 'customer'|'host'
function apiMessageToMessage(m: Record<string, unknown>): Message {
  return {
    id: Number(m.id),
    text: m.text as string | undefined,
    sender: ((m.sender as string) === 'user' || (m.sender as string) === 'customer' ? 'customer' : 'host') as 'customer' | 'host',
    timestamp: (m.timestamp as string) ?? new Date().toISOString(),
    read: (m.read as boolean) ?? false,
    files: (m.files as MessageFile[] | null) ?? null,
  }
}

// Backend (createOrGet) returns conversation with id, propertyId, messages: []
function normalizeConversationFromApi(conv: ConversationListItem | undefined, propertyId: number): Conversation | null {
  return conv ? { ...conv, id: Number(conv.id), propertyId: conv.propertyId ?? propertyId, messages: (conv as { messages?: Message[] }).messages ?? [] } : null
}

// Backend returns data.messages as plain array (no .data wrapper)
function parseMessagesFromApi(res: { data?: { messages?: unknown[] } }): Message[] {
  return (res.data?.messages ?? []).map(apiMessageToMessage)
}

function addConversationAndSort(prev: Conversation[], newConv: Conversation): Conversation[] {
  return prev.some((c) => c.id === newConv.id) ? prev : [newConv, ...prev].sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
}

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export default function Chat() {
  const { t } = useLanguage()
  const { url, props } = usePage<{
    conversations: ConversationListItem[]
    propertiesToMessage?: PropertyToMessage[]
    auth: { user: { id: number; name: string; email: string } | null }
  }>()
  const searchParams = useMemo(() => {
    const q = url.includes('?') ? url.split('?')[1] : ''
    return new URLSearchParams(q)
  }, [url])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [messageText, setMessageText] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({})
  const [deleteChatDialogOpen, setDeleteChatDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null)
  const [deleteFileFromDevice, setDeleteFileFromDevice] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showLoadingDelayed, setShowLoadingDelayed] = useState(false)
  const [sending, setSending] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [fileError, setFileError] = useState('')
  const conversationsRef = useRef<Conversation[]>([])
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showLoadingDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const conversationsList = useMemo(() => {
    const arr = Array.isArray(props.conversations) ? props.conversations : []
    return arr.map((c) => ({ ...c, messages: [] as Message[] }))
  }, [props.conversations])
  const [conversations, setConversations] = useState<Conversation[]>(conversationsList)
  conversationsRef.current = conversations

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        router.get('/chat', { search: searchQuery }, { preserveState: true, preserveScroll: true, only: ['conversations'] })
      } else {
        router.get('/chat', {}, { preserveState: true, preserveScroll: true, only: ['conversations'] })
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setConversations(conversationsList)
  }, [conversationsList])

  const currentConversation = conversations.find(c => c.id === selectedConversation)

  const startConversationWithProperty = useCallback(async (propertyId: number) => {
    const res = await apiPostJson<{ data?: { conversation?: ConversationListItem } }>('/api/messages/conversations', {
      property_id: propertyId,
    })
    const conv = (res as { data?: { conversation?: ConversationListItem } }).data?.conversation
    const newConv = normalizeConversationFromApi(conv, propertyId)
    if (!newConv) return null
    setConversations((prev) => addConversationAndSort(prev, newConv))
    setTimeout(() => setSelectedConversation(newConv.id), 0)
    return newConv.id
  }, [])

  const scrollToBottom = useCallback(() => {
    const el = messageContainerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [])

  const addMessageToConversation = useCallback((conversationId: number, message: Message) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) return conv
        if (conv.messages.some((m) => m.id === message.id)) return conv
        return { ...conv, messages: [...conv.messages, message] }
      })
    )
  }, [])

  useEffect(() => {
    const propertyIdParam = searchParams.get('property_id')
    const propertyId = propertyIdParam ? parseInt(propertyIdParam, 10) : null
    if (!propertyId) return
    const existingConv = conversations.find((c) => c.propertyId === propertyId)
    if (existingConv) {
      setSelectedConversation(existingConv.id)
      router.visit('/chat')
      return
    }
    startConversationWithProperty(propertyId).catch(() => {}).finally(() => router.visit('/chat'))
  }, [searchParams, conversations, startConversationWithProperty])

  useEffect(() => {
    if (!selectedConversation) return
    const conv = conversationsRef.current.find((c) => c.id === selectedConversation)
    if (conv?.messages.length) return
    const ac = new AbortController()
    const minLoadingStartedAt = Date.now()
    const MIN_LOADING_MS = 400
    const SHOW_LOADING_AFTER_MS = 800
    setLoadingMessages(true)
    setShowLoadingDelayed(false)
    if (showLoadingDelayRef.current) {
      clearTimeout(showLoadingDelayRef.current)
      showLoadingDelayRef.current = null
    }
    showLoadingDelayRef.current = setTimeout(() => {
      showLoadingDelayRef.current = null
      setShowLoadingDelayed(true)
    }, SHOW_LOADING_AFTER_MS)
    const startFetch = () => {
      apiGet(`/api/messages/conversations/${selectedConversation}`, { signal: ac.signal })
      .then((res) => {
        if (ac.signal.aborted) return
        const messages = parseMessagesFromApi(res as Parameters<typeof parseMessagesFromApi>[0])
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConversation ? { ...c, messages } : c))
        )
      })
      .catch(() => {})
      .finally(() => {
        if (ac.signal.aborted) return
        setShowLoadingDelayed(false)
        const elapsed = Date.now() - minLoadingStartedAt
        const delay = Math.max(0, MIN_LOADING_MS - elapsed)
        if (delay > 0) {
          loadingTimeoutRef.current = setTimeout(() => {
            loadingTimeoutRef.current = null
            setLoadingMessages(false)
          }, delay)
        } else {
          setLoadingMessages(false)
        }
      })
    }
    const t = setTimeout(startFetch, 0)
    return () => {
      clearTimeout(t)
      ac.abort()
      if (showLoadingDelayRef.current) {
        clearTimeout(showLoadingDelayRef.current)
        showLoadingDelayRef.current = null
      }
      if (loadingTimeoutRef.current != null) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    if (!selectedConversation) return
    const refresh = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      void apiGet(`/api/messages/conversations/${selectedConversation}`)
        .then((res) => {
          const messages = parseMessagesFromApi(res as Parameters<typeof parseMessagesFromApi>[0])
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedConversation ? { ...c, messages } : c))
          )
        })
        .catch(() => {})
    }
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [selectedConversation])

  useEffect(() => {
    if (!selectedConversation || typeof window === 'undefined' || !(window as unknown as { Echo?: { private: (ch: string) => { listen: (e: string, cb: (payload: unknown) => void) => void } } }).Echo) return
    const ch = `conversation.${selectedConversation}`
    const echo = (window as unknown as { Echo: { private: (ch: string) => { listen: (e: string, cb: (payload: unknown) => void) => void } } }).Echo
    const handler = (payload: unknown) => {
      const p = payload as { id?: number; text?: string; sender?: string; timestamp?: string; read?: boolean; files?: MessageFile[] | null }
      if (!p || p.id == null) return
      addMessageToConversation(selectedConversation, apiMessageToMessage({
        id: p.id,
        text: p.text,
        sender: p.sender ?? 'host',
        timestamp: p.timestamp ?? new Date().toISOString(),
        read: p.read ?? false,
        files: p.files ?? null,
      }))
    }
    const channel = echo.private(ch)
    channel.listen('.message.sent', handler)
    return () => {
      try { (channel as { leave?: () => void }).leave?.() } catch { /* noop */ }
    }
  }, [selectedConversation, addMessageToConversation])

  useEffect(() => {
    // Scroll removed - newest messages are at top
  }, [currentConversation?.messages, currentConversation])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE_BYTES)
    if (valid.length < files.length) setFileError(`Max ${MAX_FILE_SIZE_MB} MB per file.`)
    if (valid.length) setSelectedFiles((prev) => [...prev, ...valid])
    e.target.value = ''
  }

  const handleRemoveFile = (index: number) => {
    setFileError('')
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = async () => {
    if ((!messageText.trim() && selectedFiles.length === 0) || !selectedConversation) return
    setSending(true)
    const form = new FormData()
    if (messageText.trim()) form.append('message', messageText.trim())
    selectedFiles.forEach((f) => form.append('files[]', f))
    setFileError('')
    try {
      const res = await apiPostForm<{ data: { message: Record<string, unknown> } }>(
        `/api/messages/conversations/${selectedConversation}/messages`,
        form
      )
      const m = res.data?.message
      if (m) {
        const newMessage = apiMessageToMessage(m as Record<string, unknown>)
        addMessageToConversation(selectedConversation, newMessage)
        const lastMessageText = messageText.trim() || ''
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? { ...conv, lastMessage: lastMessageText, lastMessageTime: new Date().toISOString() }
              : conv
          )
        )
      }
      setMessageText('')
      setSelectedFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      try {
        const parsed = JSON.parse(msg) as { errors?: Record<string, string[]>; message?: string }
        const firstError = parsed.errors && Object.values(parsed.errors).flat()[0]
        setFileError(firstError || parsed.message || msg)
      } catch {
        setFileError(msg)
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleMenuOpen = (conversationId: number, event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(prev => ({ ...prev, [conversationId]: event.currentTarget }))
  }

  const handleMenuClose = (conversationId: number) => {
    setMenuAnchor(prev => ({ ...prev, [conversationId]: null }))
  }

  const handleDeleteConversation = async (conversationId: number) => {
    handleMenuClose(conversationId)
    try {
      await apiDelete(`/chat/conversations/${conversationId}`)
      setConversations((prev) => prev.filter((c) => c.id !== conversationId))
      if (selectedConversation === conversationId) {
        setSelectedConversation(null)
      }
    } catch {
      // Optionally show error toast
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (!selectedConversation) return
    try {
      await apiDelete(`/api/messages/conversations/${selectedConversation}/messages/${messageId}`)
      setConversations((prev) =>
        prev.map((c) => c.id === selectedConversation 
          ? { ...c, messages: c.messages.filter((m) => m.id !== messageId), lastMessage: c.messages.filter((m) => m.id !== messageId).slice(-1)[0]?.text || '' }
          : c
        )
      )
      setMessageToDelete(null)
      setDeleteChatDialogOpen(false)
      setToastMessage(t('chat.message_deleted') || 'Message deleted successfully')
      setToastOpen(true)
    } catch {
      setToastMessage('Failed to delete message')
      setToastOpen(true)
    }
  }

  const openDeleteMessageDialog = (messageId: number) => {
    setMessageToDelete(messageId)
    setDeleteChatDialogOpen(true)
  }

  const closeDeleteMessageDialog = () => {
    setMessageToDelete(null)
    setDeleteChatDialogOpen(false)
    setDeleteFileFromDevice(true)
  }

  const getLastMessagePreview = (conversation: Conversation) => {
    // Filter out "image" or "video" text from last message
    if (conversation.lastMessage.includes('image') || conversation.lastMessage.includes('video')) {
      return ''
    }
    return conversation.lastMessage
  }

  return (
    <Box className="chat-page-layout">
      <Head title={t('chat.messages')} />
      <Navbar />
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          py: { xs: 2, md: 4 },
        }}
      >
        <Container fluid className="chat-page-container">
          <Box sx={{ mb: { xs: 2, md: 4 } }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 800, color: '#222222', mb: 1 }}>
              {t('chat.messages')}
            </Typography>
            <Typography variant="body1" sx={{ color: '#717171', fontSize: '1rem' }}>
              {t('chat.chat_with_hosts')}
            </Typography>
          </Box>

          <Row>
            {/* Conversations List - on mobile hide when a chat is open */}
            {(!isMobile || !selectedConversation) && (
            <Col
              xs={12}
              md={isMobile && !selectedConversation ? 12 : 4}
              lg={isMobile && !selectedConversation ? 12 : 3}
            >
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, height: { xs: 'calc(100dvh - 200px)', md: 'calc(100vh - 250px)' }, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 0, flex: 1, minHeight: 0, overflowY: 'scroll', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 2, flex: '0 0 auto' }}>
                    {/* Search Conversations */}
                    <TextField
                      fullWidth
                      placeholder={t('chat.search_conversations')}
                      variant="outlined"
                      size="small"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#F9FAFB',
                          '& fieldset': { borderColor: '#E5E7EB' },
                          '&:hover fieldset': { borderColor: '#AD542D' },
                          '&.Mui-focused fieldset': { borderColor: '#AD542D' }
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '0 0 auto' }}>
                  {conversations.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#717171' }}>
                        {searchQuery ? t('chat.no_results') : t('chat.no_conversations')}
                      </Typography>
                    </Box>
                  ) : (
                    conversations.map((conversation) => (
                    <Box
                      key={conversation.id}
                      onClick={() => {
                        setShowLoadingDelayed(false)
                        setSelectedConversation(conversation.id)
                        setConversations((prev) =>
                          prev.map((conv) =>
                            conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
                          )
                        )
                      }}
                      sx={{
                        p: 2,
                        borderBottom: '1px solid #E5E7EB',
                        cursor: 'pointer',
                        bgcolor: selectedConversation === conversation.id ? '#FFF5F7' : 'transparent',
                        position: 'relative',
                        '&:hover': {
                          bgcolor: selectedConversation === conversation.id ? '#FFF5F7' : '#F9FAFB'
                        }
                      }}
                    >
                      <Stack direction="row" spacing={2} useFlexGap alignItems="flex-start">
                        <Avatar src={conversation.hostAvatar ?? undefined} sx={{ bgcolor: '#AD542D', width: 48, height: 48 }}>
                          {conversation.hostName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              title={conversation.hostName}
                              sx={{
                                fontWeight: 700,
                                color: '#222222',
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {conversation.hostName}
                            </Typography>
                            <Stack direction="row" spacing={1} useFlexGap alignItems="center" sx={{ flexShrink: 0 }}>
                              <Typography variant="caption" sx={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                                {formatDate(conversation.lastMessageTime)}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMenuOpen(conversation.id, e)
                                }}
                                sx={{ p: 0.5 }}
                              >
                                <MoreVertIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                              </IconButton>
                              <Menu
                                anchorEl={menuAnchor[conversation.id]}
                                open={Boolean(menuAnchor[conversation.id])}
                                onClose={() => handleMenuClose(conversation.id)}
                              >
                                <MenuItem onClick={() => handleDeleteConversation(conversation.id)}>Delete</MenuItem>
                              </Menu>
                            </Stack>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            {getLastMessagePreview(conversation) && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: conversation.unreadCount > 0 ? '#222222' : '#717171',
                                  fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1,
                                  marginInlineEnd: 1
                                }}
                              >
                                {getLastMessagePreview(conversation)}
                              </Typography>
                            )}
                            {conversation.unreadCount > 0 && (
                              <Box
                                sx={{
                                  bgcolor: '#AD542D',
                                  color: '#FFFFFF',
                                  borderRadius: '50%',
                                  width: 20,
                                  height: 20,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                              >
                                {conversation.unreadCount}
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  )))}
                  </Box>
                </CardContent>
              </Card>
            </Col>
            )}

            {/* Chat Window - on mobile only show when a conversation is selected */}
            {(!isMobile || selectedConversation) && (
            <Col
              xs={12}
              md={isMobile && selectedConversation ? 12 : 8}
              lg={isMobile && selectedConversation ? 12 : 9}
            >
              {currentConversation ? (
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, height: { xs: 'calc(100dvh - 200px)', md: 'calc(100vh - 250px)' }, display: 'flex', flexDirection: 'column' }}>
                  {/* Chat Header */}
                  <Box sx={{ p: 2, borderBottom: '1px solid #E5E7EB' }}>
                    <Stack direction="row" spacing={2} useFlexGap alignItems="center" justifyContent="space-between">
                      {isMobile && (
                        <IconButton onClick={() => setSelectedConversation(null)} sx={{ mr: -1 }} aria-label={t('chat.back')}>
                          <ArrowBackIcon sx={{ fontSize: 24, color: '#222222' }} />
                        </IconButton>
                      )}
                      <Stack direction="row" spacing={2} useFlexGap alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                        <Avatar src={currentConversation.hostAvatar ?? undefined} sx={{ bgcolor: '#AD542D', width: 40, height: 40, flexShrink: 0 }}>
                          {currentConversation.hostName.charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222222' }} noWrap>
                            {currentConversation.hostName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#717171' }} noWrap display="block">
                            {currentConversation.property}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Messages - show loading only when we're loading AND have no messages; if messages exist, never show loading */}
                  <Box ref={messageContainerRef} sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#F9FAFB', display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
                    {currentConversation && currentConversation.messages.length === 0 && showLoadingDelayed ? (
                      <Box sx={{ flex: 1, minHeight: 200, position: 'relative' }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#F9FAFB',
                          }}
                        >
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{ color: '#717171', opacity: 1 }}
                          >
                            {t('chat.loading') || 'Loading messages…'}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                    <>
                    {currentConversation.messages.map((message, index) => {
                      const showDate = index === 0 || 
                        new Date(message.timestamp).toDateString() !== 
                        new Date(currentConversation.messages[index - 1].timestamp).toDateString()

                      return (
                        <Box key={message.id}>
                          {showDate && (
                            <Box sx={{ textAlign: 'center', my: 2 }}>
                              <Typography variant="caption" sx={{ color: '#9CA3AF', bgcolor: '#F9FAFB', px: 2, py: 0.5, borderRadius: 1 }}>
                                {formatDate(message.timestamp)}
                              </Typography>
                            </Box>
                          )}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: message.sender === 'customer' ? 'flex-end' : 'flex-start',
                              width: '100%',
                              mb: 1.5,
                            }}
                          >
                            {message.files && message.files.length > 0 && !message.text ? (
                              // Image/Video only - no red background
                              <Box sx={{ maxWidth: { xs: '85%', sm: '78%' }, position: 'relative', pr: 3.5 }}>
                                <Stack spacing={1}>
                                  {message.files.map((file) => (
                                    <Box key={file.id} sx={{ position: 'relative' }}>
                                      {file.type === 'image' ? (
                                        <Box
                                          component="img"
                                          src={file.url}
                                          alt={file.name}
                                          sx={{
                                            maxWidth: '100%',
                                            maxHeight: 300,
                                            borderRadius: 2,
                                            objectFit: 'cover',
                                            cursor: 'pointer',
                                            display: 'block'
                                          }}
                                          onClick={() => window.open(file.url, '_blank')}
                                        />
                                      ) : (
                                        <Box
                                          sx={{
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            maxHeight: 300
                                          }}
                                        >
                                          <video
                                            src={file.url}
                                            style={{
                                              maxWidth: '100%',
                                              maxHeight: 300,
                                              display: 'block'
                                            }}
                                            controls
                                          />
                                        </Box>
                                      )}
                                    </Box>
                                  ))}
                                </Stack>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: message.sender === 'customer' ? 'flex-end' : 'flex-start',
                                    gap: 0.5,
                                    mt: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#9CA3AF',
                                      fontSize: '0.7rem',
                                    }}
                                  >
                                    {formatTime(message.timestamp)}
                                  </Typography>
                                  {message.sender === 'customer' && (
                                    <MessageStatusTicks read={message.read} variant="onSurface" />
                                  )}
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) => { e.stopPropagation(); openDeleteMessageDialog(message.id) }}
                                  aria-label="Options"
                                  sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    right: 0,
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF',
                                    '&:hover': { color: '#AD542D', bgcolor: 'rgba(173,84,45,0.08)' },
                                  }}
                                >
                                  <MoreVertIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Box>
                            ) : (
                              // Text message or text with files - with background
                              <Box
                                sx={{
                                  position: 'relative',
                                  maxWidth: { xs: '85%', sm: '78%' },
                                  pr: 3.5,
                                }}
                              >
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  maxWidth: '100%',
                                  bgcolor: message.sender === 'customer' ? '#AD542D' : '#FFFFFF',
                                  color: message.sender === 'customer' ? '#FFFFFF' : '#222222',
                                  borderRadius: 2,
                                  border: message.sender === 'host' ? '1px solid #E5E7EB' : 'none'
                                }}
                              >
                                {/* Files */}
                                {message.files && message.files.length > 0 && (
                                  <Stack spacing={1} sx={{ mb: message.text ? 1 : 0 }}>
                                    {message.files.map((file) => (
                                      <Box key={file.id}>
                                        {file.type === 'image' ? (
                                          <Box
                                            component="img"
                                            src={file.url}
                                            alt={file.name}
                                            sx={{
                                              maxWidth: '100%',
                                              maxHeight: 300,
                                              borderRadius: 1,
                                              objectFit: 'cover',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(file.url, '_blank')}
                                          />
                                        ) : (
                                          <Box
                                            sx={{
                                              position: 'relative',
                                              bgcolor: 'rgba(0,0,0,0.5)',
                                              borderRadius: 1,
                                              overflow: 'hidden',
                                              minHeight: 200,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}
                                          >
                                            <video
                                              src={file.url}
                                              style={{
                                                maxWidth: '100%',
                                                maxHeight: 300,
                                                borderRadius: 4
                                              }}
                                              controls
                                            />
                                          </Box>
                                        )}
                                      </Box>
                                    ))}
                                  </Stack>
                                )}

                                {/* Text */}
                                {message.text && (
                                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    {message.text}
                                  </Typography>
                                )}

                                {/* Timestamp + delivery ticks (outgoing only) */}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: 0.5,
                                    mt: 0.25,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: message.sender === 'customer' ? 'rgba(255,255,255,0.75)' : '#9CA3AF',
                                      fontSize: '0.7rem',
                                    }}
                                  >
                                    {formatTime(message.timestamp)}
                                  </Typography>
                                  {message.sender === 'customer' && (
                                    <MessageStatusTicks read={message.read} variant="onPrimary" />
                                  )}
                                </Box>
                              </Paper>
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); openDeleteMessageDialog(message.id) }}
                                aria-label="Options"
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  right: 0,
                                  transform: 'translateY(-50%)',
                                  color: '#9CA3AF',
                                  '&:hover': { color: '#AD542D', bgcolor: 'rgba(173,84,45,0.08)' },
                                }}
                              >
                                <MoreVertIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      )
                    })}
                    </>
                    )}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Delete message dialog: own message = 3 options; other user's message = dark modal with "Delete file from device" + Delete for me / Cancel */}
                  {(() => {
                    const messageBeingDeleted = currentConversation?.messages.find((m) => m.id === messageToDelete)
                    const isOwnMessage = messageBeingDeleted?.sender === 'customer'
                    const isOtherUserMessage = messageToDelete != null && messageBeingDeleted && !isOwnMessage
                    return (
                  <Dialog
                    open={deleteChatDialogOpen}
                    onClose={closeDeleteMessageDialog}
                    PaperProps={{
                      sx: {
                        borderRadius: '16px',
                        bgcolor: '#FFFFFF',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                        width: 520,
                        minWidth: 320,
                        maxWidth: '92vw',
                        overflow: 'hidden',
                      },
                    }}
                  >
                    <Box sx={{ p: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 3 }}>
                      <Typography sx={{ fontWeight: 700, color: '#AD542D', fontSize: '1.25rem', textAlign: 'left' }}>
                        Delete message?
                      </Typography>
                      {isOtherUserMessage && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={deleteFileFromDevice}
                              onChange={(_, checked) => setDeleteFileFromDevice(checked)}
                              sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#AD542D' } }}
                            />
                          }
                          label="Delete file from your phone"
                          sx={{ color: '#AD542D', '& .MuiFormControlLabel-label': { color: '#AD542D' } }}
                        />
                      )}
                      <Stack
                        direction="column"
                        spacing={1.5}
                        sx={{ alignSelf: 'flex-end', alignItems: 'flex-end' }}
                      >
                        {!isOtherUserMessage && (
                          <>
                            <Button
                              onClick={() => {
                                if (messageToDelete != null) {
                                  handleDeleteMessage(messageToDelete)
                                }
                              }}
                              disabled={messageToDelete == null}
                              sx={{
                                borderRadius: 999,
                                py: 0.75,
                                px: 2,
                                width: 'auto',
                                minWidth: 0,
                                bgcolor: '#FFFFFF',
                                border: '1px solid #AD542D',
                                color: '#AD542D',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                '&:hover': {
                                  bgcolor: 'rgba(173,84,45,0.08)',
                                  borderColor: '#AD542D',
                                  color: '#78381C',
                                },
                              }}
                            >
                              Delete for everyone
                            </Button>
                            <Button
                              onClick={() => {
                                if (messageToDelete != null) {
                                  handleDeleteMessage(messageToDelete)
                                }
                              }}
                              disabled={messageToDelete == null}
                              sx={{
                                borderRadius: 999,
                                py: 0.75,
                                px: 2,
                                width: 'auto',
                                minWidth: 0,
                                bgcolor: '#FFFFFF',
                                border: '1px solid #AD542D',
                                color: '#AD542D',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                '&:hover': {
                                  bgcolor: 'rgba(173,84,45,0.08)',
                                  borderColor: '#AD542D',
                                  color: '#78381C',
                                },
                              }}
                            >
                              Delete for me
                            </Button>
                          </>
                        )}
                        {isOtherUserMessage && (
                          <Button
                            onClick={() => {
                              if (messageToDelete != null) {
                                handleDeleteMessage(messageToDelete)
                              }
                            }}
                            disabled={messageToDelete == null}
                            sx={{
                              borderRadius: 999,
                              py: 0.75,
                              px: 2,
                              width: 'auto',
                              minWidth: 0,
                              bgcolor: '#AD542D',
                              color: '#FFFFFF',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.9375rem',
                              '&:hover': { bgcolor: '#78381C' },
                            }}
                          >
                            Delete for me
                          </Button>
                        )}
                        <Button
                          onClick={closeDeleteMessageDialog}
                          sx={{
                            borderRadius: 999,
                            py: 0.75,
                            px: 2,
                            width: 'auto',
                            minWidth: 0,
                            bgcolor: isOtherUserMessage ? 'transparent' : '#FFFFFF',
                            border: isOtherUserMessage ? 'none' : '1px solid #AD542D',
                            color: isOtherUserMessage ? '#AD542D' : '#AD542D',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            '&:hover': {
                              bgcolor: isOtherUserMessage ? 'rgba(173,84,45,0.12)' : 'rgba(173,84,45,0.08)',
                              borderColor: '#AD542D',
                              color: isOtherUserMessage ? '#D4A574' : '#78381C',
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Box>
                  </Dialog>
                    )
                  })()}

                  {/* File size error */}
                  {fileError && (
                    <Box sx={{ px: 2, py: 1, bgcolor: '#FEF2F2', borderTop: '1px solid #FECACA' }}>
                      <Typography variant="body2" sx={{ color: '#B91C1C' }}>{fileError}</Typography>
                    </Box>
                  )}
                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
                        Max {MAX_FILE_SIZE_MB} MB per file (image or video)
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {selectedFiles.map((file, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: 'relative',
                              border: '1px solid #E5E7EB',
                              borderRadius: 1,
                              overflow: 'hidden',
                              width: 80,
                              height: 80
                            }}
                          >
                            {file.type.startsWith('image/') ? (
                              <Box
                                component="img"
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: '#F9FAFB'
                                }}
                              >
                                <VideoFileIcon sx={{ fontSize: 32, color: '#717171' }} />
                              </Box>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFile(index)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: '#FFFFFF',
                                width: 20,
                                height: 20,
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                              }}
                            >
                              ×
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Message Input */}
                  <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
                    <Stack direction="row" spacing={1} useFlexGap alignItems="flex-end">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,video/*"
                        multiple
                        style={{ display: 'none' }}
                      />
                      <IconButton
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          border: '1px solid #E5E7EB',
                          borderRadius: 2,
                          width: 40,
                          height: 40,
                          color: '#717171',
                          '&:hover': {
                            bgcolor: '#F9FAFB',
                            borderColor: '#AD542D'
                          }
                        }}
                      >
                        <AttachFileIcon />
                      </IconButton>
                      <TextField
                        fullWidth
                        placeholder={t('chat.type_placeholder')}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        multiline
                        maxRows={4}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: '#FFFFFF',
                            '& fieldset': {
                              borderColor: '#E5E7EB'
                            }
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => void handleSendMessage()}
                        disabled={sending || (!messageText.trim() && selectedFiles.length === 0)}
                        sx={{
                          bgcolor: '#AD542D',
                          borderRadius: 2,
                          minWidth: 48,
                          height: 40,
                          '&:hover': { bgcolor: '#78381C' },
                          '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' }
                        }}
                      >
                        <SendIcon />
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              ) : (
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, height: { xs: 'calc(100dvh - 200px)', md: 'calc(100vh - 250px)' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        border: '2px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <SendIcon sx={{ fontSize: 40, color: '#9CA3AF' }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                      {t('chat.select_conversation')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      {t('chat.select_conversation_sub')}
                    </Typography>
                  </Box>
                </Card>
              )}
            </Col>
            )}
          </Row>
        </Container>
      </Box>
      <Footer />
      <Toast 
        open={toastOpen} 
        message={toastMessage} 
        onClose={() => setToastOpen(false)} 
      />
    </Box>
  )
}
