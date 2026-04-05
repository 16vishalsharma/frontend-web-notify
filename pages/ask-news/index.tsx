import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Layout } from '@components/common';
import {
  Typography,
  Box,
  TextField,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const ASK_API_URL = process.env.NEXT_PUBLIC_ASK_API_URL || 'http://localhost:8001/ask';

const suggestedQuestions = [
  'What is the latest news on stock market?',
  'Tell me about recent IPO listings',
  'What are the top crypto trends today?',
  'Any updates on RBI monetary policy?',
  'Latest startup funding news in India',
  'What happened in tech news this week?',
];

const AskNewsPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const query = (text || input).trim();
    if (!query || isLoading) return;

    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    fetch(ASK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: abortControllerRef.current.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let isDone = false;

        while (!isDone) {
          let result;
          try {
            result = await reader.read();
          } catch {
            // Stream error (e.g. ERR_INCOMPLETE_CHUNKED_ENCODING) — stop reading
            break;
          }

          if (result.done) break;

          buffer += decoder.decode(result.value, { stream: true });

          // Process all complete lines in the buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let newText = '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('data:')) {
              const data = trimmed.slice(5).trim();

              if (data === '[DONE]') {
                isDone = true;
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk != null) {
                  newText += parsed.chunk;
                }
              } catch {
                // skip invalid JSON
              }
            }
          }

          if (newText) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === 'assistant') {
                last.content += newText;
              }
              return updated;
            });
          }
        }

        // Process any remaining data in buffer
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim();
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk != null) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last.role === 'assistant') {
                      last.content += parsed.chunk;
                    }
                    return updated;
                  });
                }
              } catch {
                // skip
              }
            }
          }
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;

        // If content already received, ignore stream errors
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.content) return prev;

          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg?.role === 'assistant' && !lastMsg.content) {
            lastMsg.content = 'Sorry, something went wrong. Please try again.';
          }
          return updated;
        });
      })
      .finally(() => {
        setIsLoading(false);
        abortControllerRef.current = null;
        inputRef.current?.focus();
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setIsLoading(false);
  };
  return (
    <Layout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', maxHeight: '800px' }}>
        {/* Header */}
        <Box className="flex items-center justify-between mb-2">
          <Box className="flex items-center gap-2">
            <NewspaperIcon color="primary" />
            <Typography variant="h1">Ask News AI</Typography>
          </Box>
          {messages.length > 0 && (
            <Tooltip title="Clear chat">
              <IconButton onClick={handleClearChat} size="small" color="default">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" className="mb-4">
          Ask any news-related question and get instant AI-powered answers from our news database
        </Typography>

        {/* Chat area */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 3,
          }}
        >
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 3 }}>
                <NewspaperIcon sx={{ fontSize: 56, color: 'primary.light', opacity: 0.6 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={500}>
                  What news are you looking for?
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: 550 }}>
                  {suggestedQuestions.map((q) => (
                    <Chip
                      key={q}
                      label={q}
                      variant="outlined"
                      onClick={() => handleSend(q)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    mb: 2.5,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.200',
                      color: msg.role === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                  </Avatar>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      px: 2,
                      maxWidth: '75%',
                      borderRadius: 2.5,
                      bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                      color: msg.role === 'user' ? 'white' : 'text.primary',
                      wordBreak: 'break-word',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      '& .markdown-body': {
                        '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
                        '& ul, & ol': { m: 0, mb: 1, pl: 2.5 },
                        '& li': { mb: 0.5 },
                        '& h1, & h2, & h3': { mt: 1.5, mb: 0.5, fontSize: '1.1rem', fontWeight: 600 },
                        '& code': {
                          bgcolor: 'rgba(0,0,0,0.06)',
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          fontSize: '0.85rem',
                        },
                        '& pre': {
                          bgcolor: 'rgba(0,0,0,0.06)',
                          p: 1.5,
                          borderRadius: 1,
                          overflow: 'auto',
                          '& code': { bgcolor: 'transparent', p: 0 },
                        },
                        '& strong': { fontWeight: 600 },
                        '& a': { color: 'primary.main', textDecoration: 'underline' },
                        '& blockquote': {
                          borderLeft: '3px solid',
                          borderColor: 'primary.light',
                          pl: 1.5,
                          ml: 0,
                          opacity: 0.85,
                        },
                      },
                    }}
                  >
                    {msg.content ? (
                      msg.role === 'assistant' ? (
                        <Box className="markdown-body">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </Box>
                      ) : (
                        msg.content
                      )
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} color="inherit" />
                        <Typography variant="body2" color="inherit">Searching news...</Typography>
                      </Box>
                    )}
                  </Paper>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input area */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                inputRef={inputRef}
                fullWidth
                multiline
                maxRows={4}
                placeholder="Ask about any news topic..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'grey.50',
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&.Mui-disabled': { bgcolor: 'grey.200', color: 'grey.400' },
                  width: 40,
                  height: 40,
                }}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default AskNewsPage;
