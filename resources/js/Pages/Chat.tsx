import { useState, useRef, useEffect, useMemo } from 'react'
import { usePage, router, Head } from '@inertiajs/react'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Avatar, Paper, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Container, Row, Col } from 'react-bootstrap'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'

interface MessageFile {
  id: string
  type: 'image' | 'video'
  url: string
  name: string
  size: number
}

interface Message {
  id: number
  text?: string
  sender: 'customer' | 'host'
  timestamp: Date
  read: boolean
  files?: MessageFile[]
}

interface Conversation {
  id: number
  hostName: string
  hostAvatar: string
  property: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages: Message[]
}

interface User {
  id: number
  name: string
  email: string
  avatar: string
}

export default function Chat() {
  const { url } = usePage()
  const searchParams = useMemo(() => {
    const q = url.includes('?') ? url.split('?')[1] : ''
    return new URLSearchParams(q)
  }, [url])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [messageText, setMessageText] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({})
  const [openModal, setOpenModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)

  // Mock users data
  const [users] = useState<User[]>([
    { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', avatar: '' },
    { id: 2, name: 'Michael Chen', email: 'michael.chen@example.com', avatar: '' },
    { id: 3, name: 'Emma Williams', email: 'emma.williams@example.com', avatar: '' },
    { id: 4, name: 'David Brown', email: 'david.brown@example.com', avatar: '' },
    { id: 5, name: 'Lisa Anderson', email: 'lisa.anderson@example.com', avatar: '' },
  ])

  // Mock conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      hostName: 'Sarah Johnson',
      hostAvatar: '',
      property: 'Luxury Beachfront Villa',
      lastMessage: 'hey 👋 hey...',
      lastMessageTime: new Date('2025-01-20T10:30:00'),
      unreadCount: 2,
      messages: [
        { id: 1, text: 'Hello! I have a question about the property.', sender: 'customer', timestamp: new Date('2025-01-20T09:00:00'), read: true },
        { id: 2, text: 'Hi! I\'d be happy to help. What would you like to know?', sender: 'host', timestamp: new Date('2025-01-20T09:05:00'), read: true },
        { id: 3, text: 'Is the property pet-friendly?', sender: 'customer', timestamp: new Date('2025-01-20T09:10:00'), read: true },
        { id: 4, text: 'Yes, pets are allowed with prior notification.', sender: 'host', timestamp: new Date('2025-01-20T09:15:00'), read: true },
        { id: 5, text: 'hey 👋 hey', sender: 'customer', timestamp: new Date('2025-01-20T10:30:00'), read: false },
      ]
    },
    {
      id: 2,
      hostName: 'Michael Chen',
      hostAvatar: '',
      property: 'Modern Downtown Apartment',
      lastMessage: 'hey',
      lastMessageTime: new Date('2025-01-19T14:20:00'),
      unreadCount: 0,
      messages: [
        { id: 1, text: 'What time is check-in?', sender: 'customer', timestamp: new Date('2025-01-19T14:00:00'), read: true },
        { id: 2, text: 'The check-in time is flexible.', sender: 'host', timestamp: new Date('2025-01-19T14:20:00'), read: true },
        { id: 3, text: 'hey', sender: 'customer', timestamp: new Date('2025-01-19T14:25:00'), read: true },
      ]
    },
    {
      id: 3,
      hostName: 'Emma Williams',
      hostAvatar: '',
      property: 'Cozy Mountain Cabin',
      lastMessage: '📎 image',
      lastMessageTime: new Date('2025-01-18T16:45:00'),
      unreadCount: 0,
      messages: [
        { 
          id: 1, 
          sender: 'host', 
          timestamp: new Date('2025-01-18T16:45:00'), 
          read: true,
          files: [
            { id: '1', type: 'image', url: '/images/popular-stay-1.svg', name: 'property-image.jpg', size: 245000 }
          ]
        },
      ]
    },
  ])

  const currentConversation = conversations.find(c => c.id === selectedConversation)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle URL parameters to auto-select conversation with host
  useEffect(() => {
    const hostName = searchParams.get('host')
    const propertyName = searchParams.get('property')
    
    if (hostName && propertyName) {
      // Find existing conversation with this host and property
      const existingConv = conversations.find(
        c => c.hostName === hostName && c.property === propertyName
      )
      
      if (existingConv) {
        setSelectedConversation(existingConv.id)
      } else {
        // Create new conversation
        const newConversation: Conversation = {
          id: Date.now(),
          hostName: hostName,
          hostAvatar: '',
          property: propertyName,
          lastMessage: '',
          lastMessageTime: new Date(),
          unreadCount: 0,
          messages: []
        }
        setConversations(prev => [newConversation, ...prev])
        setSelectedConversation(newConversation.id)
      }
      
      // Clean up URL params
      router.visit('/chat')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (currentConversation) {
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversation?.messages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = () => {
    if ((!messageText.trim() && selectedFiles.length === 0) || !selectedConversation) return

    const fileMessages: MessageFile[] = selectedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }))

    const newMessage: Message = {
      id: Date.now(),
      text: messageText.trim() || undefined,
      sender: 'customer',
      timestamp: new Date(),
      read: false,
      files: fileMessages.length > 0 ? fileMessages : undefined
    }

    let lastMessageText = messageText.trim() || ''
    // Don't show "image" or "video" in last message preview
    if (selectedFiles.length > 0 && !messageText.trim()) {
      lastMessageText = ''
    }

    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: lastMessageText,
          lastMessageTime: new Date()
        }
      }
      return conv
    }))

    setMessageText('')
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const handleMenuOpen = (conversationId: number, event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(prev => ({ ...prev, [conversationId]: event.currentTarget }))
  }

  const handleMenuClose = (conversationId: number) => {
    setMenuAnchor(prev => ({ ...prev, [conversationId]: null }))
  }

  const handleStartConversation = (userId: number) => {
    // Find or create conversation with selected user
    const user = users.find(u => u.id === userId)
    if (user) {
      const existingConv = conversations.find(c => c.hostName === user.name)
      if (existingConv) {
        setSelectedConversation(existingConv.id)
      } else {
        // Create new conversation
        const newConversation: Conversation = {
          id: Date.now(),
          hostName: user.name,
          hostAvatar: user.avatar,
          property: 'New Property',
          lastMessage: '',
          lastMessageTime: new Date(),
          unreadCount: 0,
          messages: []
        }
        setConversations(prev => [newConversation, ...prev])
        setSelectedConversation(newConversation.id)
      }
    }
    setOpenModal(false)
    setSelectedUser(null)
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
      <Head title="Messages" />
      <Navbar />
      <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF', py: 4 }}>
        <Container>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#222222', mb: 1 }}>
              Messages
            </Typography>
            <Typography variant="body1" sx={{ color: '#717171', fontSize: '1rem' }}>
              Chat with your hosts
            </Typography>
          </Box>

          <Row>
            {/* Conversations List */}
            <Col xs={12} md={4} lg={3}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, height: 'calc(100vh - 250px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2 }}>
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
                    Start Conversation
                  </Button>
                </CardContent>
                <CardContent sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
                  {conversations.map((conversation) => (
                    <Box
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversation(conversation.id)
                        setConversations(prev => prev.map(conv => {
                          if (conv.id === conversation.id) {
                            return {
                              ...conv,
                              unreadCount: 0,
                              messages: conv.messages.map(msg => ({ ...msg, read: true }))
                            }
                          }
                          return conv
                        }))
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
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar sx={{ bgcolor: '#AD542D', width: 48, height: 48 }}>
                          {conversation.hostName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222222' }}>
                              {conversation.hostName}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
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
                                  mr: 1
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
                </CardContent>
              </Card>
            </Col>

            {/* Chat Window */}
            <Col xs={12} md={8} lg={9}>
              {currentConversation ? (
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
                  {/* Chat Header */}
                  <Box sx={{ p: 2, borderBottom: '1px solid #E5E7EB' }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: '#AD542D', width: 40, height: 40 }}>
                          {currentConversation.hostName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222222' }}>
                            {currentConversation.hostName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#717171' }}>
                            {currentConversation.property}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Messages */}
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#F9FAFB' }}>
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
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
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
                    <Stack direction="row" spacing={1} alignItems="flex-end">
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
                        placeholder="Type a message..."
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
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() && selectedFiles.length === 0}
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
                      Select a conversation
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Choose a conversation from the list to start messaging, or create a new one.
                    </Typography>
                  </Box>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </Box>
      <Footer />

      {/* Start Conversation Modal */}
      <Dialog
        open={openModal}
        onClose={() => {
          setOpenModal(false)
          setSelectedUser(null)
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
            Start Conversation
          </Typography>
          <IconButton
            onClick={() => {
              setOpenModal(false)
              setSelectedUser(null)
            }}
            sx={{ color: '#717171' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Typography variant="body2" sx={{ px: 3, pb: 2, color: '#717171' }}>
            Select Participants
          </Typography>
          <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {users.map((user) => (
              <Box
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                sx={{
                  px: 3,
                  py: 2,
                  cursor: 'pointer',
                  bgcolor: selectedUser === user.id ? '#FFF5F7' : 'transparent',
                  borderBottom: '1px solid #E5E7EB',
                  '&:hover': {
                    bgcolor: selectedUser === user.id ? '#FFF5F7' : '#F9FAFB'
                  }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#AD542D', width: 40, height: 40 }}>
                    {user.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222222', mb: 0.5 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#717171', fontSize: '0.875rem' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button
            onClick={() => {
              setOpenModal(false)
              setSelectedUser(null)
            }}
            sx={{
              color: '#717171',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => selectedUser && handleStartConversation(selectedUser)}
            disabled={!selectedUser}
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
            Start
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
