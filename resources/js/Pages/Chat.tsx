import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { usePage, router, Head } from '@inertiajs/react'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Avatar, Paper, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLanguage } from '../hooks/use-language'
import { Container, Row, Col } from 'react-bootstrap'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { apiGet, apiPostForm, apiPostJson } from '../chatApi'

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

interface PropertyToMessage {
  propertyId: number
  property: string
  hostName: string
  hostAvatar: string | null
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
  const [openModal, setOpenModal] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const initialPropertiesToMessage = useMemo(() => Array.isArray(props.propertiesToMessage) ? props.propertiesToMessage : [], [props.propertiesToMessage])
  const [startableProperties, setStartableProperties] = useState<PropertyToMessage[]>(initialPropertiesToMessage)
  const [loadingStartable, setLoadingStartable] = useState(false)
  const [startingConversation, setStartingConversation] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const conversationsRef = useRef<Conversation[]>([])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const conversationsList = useMemo(() => {
    const arr = Array.isArray(props.conversations) ? props.conversations : []
    return arr.map((c) => ({ ...c, messages: [] as Message[] }))
  }, [props.conversations])
  const [conversations, setConversations] = useState<Conversation[]>(conversationsList)
  conversationsRef.current = conversations

  useEffect(() => {
    setConversations((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]))
      for (const c of conversationsList) {
        if (!byId.has(c.id)) byId.set(c.id, { ...c, messages: [] })
        else {
          const existing = byId.get(c.id)!
          byId.set(c.id, { ...c, messages: existing.messages })
        }
      }
      return Array.from(byId.values()).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
    })
  }, [conversationsList])

  useEffect(() => {
    if (!openModal) return
    if (initialPropertiesToMessage.length > 0) {
      setStartableProperties(initialPropertiesToMessage)
      setLoadingStartable(false)
      return
    }
    setLoadingStartable(true)
    apiGet<{ data: { properties: PropertyToMessage[] } }>('/api/messages/properties-to-message')
      .then((res) => setStartableProperties(res.data?.properties ?? []))
      .catch(() => setStartableProperties([]))
      .finally(() => setLoadingStartable(false))
  }, [openModal, initialPropertiesToMessage])

  const currentConversation = conversations.find(c => c.id === selectedConversation)

  const hostsToMessage = useMemo(
    () => initialPropertiesToMessage.filter((p) => !conversations.some((c) => c.propertyId === p.propertyId)),
    [initialPropertiesToMessage, conversations]
  )

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

  const handleStartFromHost = useCallback(
    async (propertyId: number) => {
      setStartingConversation(true)
      try {
        await startConversationWithProperty(propertyId)
      } catch {
        setSelectedConversation(null)
      } finally {
        setStartingConversation(false)
      }
    },
    [startConversationWithProperty]
  )

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
    setLoadingMessages(true)
    apiGet(`/api/messages/conversations/${selectedConversation}`)
      .then((res) => {
        const messages = parseMessagesFromApi(res as Parameters<typeof parseMessagesFromApi>[0])
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConversation ? { ...c, messages } : c))
        )
      })
      .catch(() => {})
      .finally(() => setLoadingMessages(false))
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
    if (currentConversation) scrollToBottom()
  }, [currentConversation?.messages, scrollToBottom, currentConversation])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = async () => {
    if ((!messageText.trim() && selectedFiles.length === 0) || !selectedConversation) return
    setSending(true)
    const form = new FormData()
    form.append('message', messageText.trim())
    selectedFiles.forEach((f) => form.append('files[]', f))
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

  const handleStartConversation = async () => {
    if (!selectedPropertyId) return
    setStartingConversation(true)
    try {
      await startConversationWithProperty(selectedPropertyId)
      setOpenModal(false)
      setSelectedPropertyId(null)
    } finally {
      setStartingConversation(false)
    }
  }

  const getLastMessagePreview = (conversation: Conversation) => {
    // Filter out "image" or "video" text from last message
    if (conversation.lastMessage.includes('image') || conversation.lastMessage.includes('video')) {
      return ''
    }
    return conversation.lastMessage
  }

  return (
    <Box>
      <Head title={t('chat.messages')} />
      <Navbar />
      <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF', py: 4 }}>
        <Container>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#222222', mb: 1 }}>
              {t('chat.messages')}
            </Typography>
            <Typography variant="body1" sx={{ color: '#717171', fontSize: '1rem' }}>
              {t('chat.chat_with_hosts')}
            </Typography>
          </Box>

          <Row>
            {/* Conversations List - on mobile hide when a chat is open */}
            {(!isMobile || !selectedConversation) && (
            <Col xs={12} md={4} lg={3}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, height: 'calc(100vh - 250px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 0, flex: 1, minHeight: 0, overflowY: 'scroll', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 2, flex: '0 0 auto' }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      fullWidth
                      onClick={() => setOpenModal(true)}
                      sx={{
                        bgcolor: '#AD542D',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2,
                        mb: 2,
                        py: 1.5,
                        '&:hover': { bgcolor: '#78381C' }
                      }}
                    >
                      {t('chat.start_conversation')}
                    </Button>
                    {hostsToMessage.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#717171', mb: 1, px: 0.5 }}>
                          {t('chat.select_property')}
                        </Typography>
                        <Box sx={{ overflowX: 'hidden', pr: 0.5 }}>
                          {hostsToMessage.map((item) => (
                            <Box
                              key={item.propertyId}
                              onClick={() => handleStartFromHost(item.propertyId)}
                              sx={{
                                p: 1.5,
                                mb: 0.5,
                                borderRadius: 1.5,
                                cursor: 'pointer',
                                border: '1px solid #E5E7EB',
                                '&:hover': { bgcolor: '#F9FAFB', borderColor: '#AD542D' },
                                opacity: startingConversation ? 0.7 : 1,
                                pointerEvents: startingConversation ? 'none' : 'auto',
                              }}
                            >
                              <Stack direction="row" spacing={1.5} useFlexGap alignItems="center">
                                <Avatar src={item.hostAvatar ?? undefined} sx={{ bgcolor: '#AD542D', width: 40, height: 40 }}>
                                  {item.hostName.charAt(0)}
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#222222' }}>
                                    {item.hostName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#717171', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.property}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>
                  <Box sx={{ flex: '0 0 auto' }}>
                  {conversations.map((conversation) => (
                    <Box
                      key={conversation.id}
                      onClick={() => {
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
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222222' }}>
                              {conversation.hostName}
                            </Typography>
                            <Stack direction="row" spacing={1} useFlexGap alignItems="center">
                              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
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
                                <MenuItem onClick={() => handleMenuClose(conversation.id)}>Archive</MenuItem>
                                <MenuItem onClick={() => handleMenuClose(conversation.id)}>Delete</MenuItem>
                                <MenuItem onClick={() => handleMenuClose(conversation.id)}>Mute</MenuItem>
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
                  ))}
                  </Box>
                </CardContent>
              </Card>
            </Col>
            )}

            {/* Chat Window - on mobile only show when a conversation is selected */}
            {(!isMobile || selectedConversation) && (
            <Col xs={12} md={8} lg={9}>
              {currentConversation ? (
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
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

                  {/* Messages */}
                  <Box ref={messageContainerRef} sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#F9FAFB', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {loadingMessages ? (
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                        <Typography variant="body2" sx={{ color: '#717171' }}>{t('chat.loading')}</Typography>
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
                          <Stack
                            direction="row"
                            justifyContent={message.sender === 'customer' ? 'flex-end' : 'flex-start'}
                            sx={{ mb: 1.5 }}
                          >
                            {message.files && message.files.length > 0 && !message.text ? (
                              // Image/Video only - no red background
                              <Box sx={{ maxWidth: '70%', position: 'relative' }}>
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
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: '#9CA3AF', 
                                    fontSize: '0.7rem',
                                    display: 'block',
                                    mt: 0.5,
                                    textAlign: message.sender === 'customer' ? 'right' : 'left'
                                  }}
                                >
                                  {formatTime(message.timestamp)}
                                </Typography>
                              </Box>
                            ) : (
                              // Text message or text with files - with background
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  maxWidth: '70%',
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

                                {/* Timestamp */}
                                <Typography variant="caption" sx={{ color: message.sender === 'customer' ? 'rgba(255,255,255,0.7)' : '#9CA3AF', fontSize: '0.7rem' }}>
                                  {formatTime(message.timestamp)}
                                </Typography>
                              </Paper>
                            )}
                          </Stack>
                        </Box>
                      )
                    })}
                    </>
                    )}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
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
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, height: 'calc(100vh - 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* Start Conversation Modal */}
      <Dialog
        open={openModal}
        onClose={() => {
          setOpenModal(false)
          setSelectedPropertyId(null)
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
            {t('chat.start_conversation')}
          </Typography>
          <IconButton
            onClick={() => {
              setOpenModal(false)
              setSelectedPropertyId(null)
            }}
            sx={{ color: '#717171' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Typography variant="body2" sx={{ px: 3, pb: 2, color: '#717171' }}>
            {t('chat.select_property')}
          </Typography>
          <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {loadingStartable ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#717171' }}>{t('chat.loading')}</Typography>
              </Box>
            ) : startableProperties.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#717171' }}>{t('chat.no_properties')}</Typography>
              </Box>
            ) : (
              startableProperties.map((item) => (
                <Box
                  key={item.propertyId}
                  onClick={() => setSelectedPropertyId(item.propertyId)}
                  sx={{
                    px: 3,
                    py: 2,
                    cursor: 'pointer',
                    bgcolor: selectedPropertyId === item.propertyId ? '#FFF5F7' : 'transparent',
                    borderBottom: '1px solid #E5E7EB',
                    '&:hover': {
                      bgcolor: selectedPropertyId === item.propertyId ? '#FFF5F7' : '#F9FAFB'
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                    <Avatar
                      src={item.hostAvatar ?? undefined}
                      sx={{ bgcolor: '#AD542D', width: 40, height: 40 }}
                    >
                      {item.hostName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222222', mb: 0.5 }}>
                        {item.hostName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#717171', fontSize: '0.875rem' }} noWrap>
                        {item.property}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button
            onClick={() => {
              setOpenModal(false)
              setSelectedPropertyId(null)
            }}
            sx={{
              color: '#717171',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {t('chat.cancel')}
          </Button>
          <Button
            onClick={() => void handleStartConversation()}
            disabled={!selectedPropertyId || startingConversation}
            variant="contained"
            sx={{
              bgcolor: '#AD542D',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#78381C' },
              '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' }
            }}
          >
            {startingConversation ? t('chat.loading') : t('chat.start')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
