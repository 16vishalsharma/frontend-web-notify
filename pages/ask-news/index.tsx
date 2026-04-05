import React, { useState, useRef, useEffect } from 'react';
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

const ASK_API_URL = process.env.NEXT_PUBLIC_ASK_API_URL || 'http://localhost:8000';

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
  const [isStreaming, setIsStreaming] = useState(false);
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
    if (!query || isStreaming) return;

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
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    fetch(`${ASK_API_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: abortControllerRef.current.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        return reader.read().then(function process({ done, value }): Promise<void> | void {
          if (done) return;

          const chunk = decoder.decode(value, { stream: true });

          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'assistant') {
              last.content += chunk;
            }
            return updated;
          });

          return reader.read().then(process);
        });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;

        // Server may not terminate chunked encoding properly — if content already received, ignore
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
        setIsStreaming(false);
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
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setIsStreaming(false);
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
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.content || (
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
                disabled={isStreaming}
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
                disabled={!input.trim() || isStreaming}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&.Mui-disabled': { bgcolor: 'grey.200', color: 'grey.400' },
                  width: 40,
                  height: 40,
                }}
              >
                {isStreaming ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default AskNewsPage;
