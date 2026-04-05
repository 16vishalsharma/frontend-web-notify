import React, { useState, useRef, useEffect, useCallback } from 'react';
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

// Parse SSE response text into plain text
function parseSSE(raw: string): string {
  let text = '';
  const lines = raw.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('data:')) continue;
    const data = trimmed.slice(5).trim();
    if (data === '[DONE]') break;
    try {
      const parsed = JSON.parse(data);
      if (parsed.chunk != null) text += parsed.chunk;
    } catch {
      // skip
    }
  }
  return text;
}

const AskNewsPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typingRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, []);

  const typeOutResponse = useCallback((fullText: string, msgId: string) => {
    const words = fullText.split(/(\s+)/); // split but keep whitespace
    let index = 0;
    setIsTyping(true);

    typingRef.current = window.setInterval(() => {
      // Add a few words per tick for natural speed
      index += 3;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, content: words.slice(0, index).join('') }
            : m
        )
      );

      if (index >= words.length) {
        if (typingRef.current) clearInterval(typingRef.current);
        typingRef.current = null;
        setIsTyping(false);
        setIsLoading(false);
      }
    }, 30);
  }, []);

  const handleSend = async (text?: string) => {
    const query = (text || input).trim();
    if (!query || isLoading) return;

    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(ASK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let raw = '';

      // Read the entire stream
      let done = false;
      while (!done) {
        try {
          const result = await reader.read();
          done = result.done;
          if (!done) {
            raw += decoder.decode(result.value, { stream: true });
          }
        } catch {
          // ERR_INCOMPLETE_CHUNKED_ENCODING — stream content already captured
          break;
        }
      }

      // Parse the SSE data
      const fullText = parseSSE(raw);

      if (fullText) {
        // Type it out word by word
        typeOutResponse(fullText, assistantId);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'No results found. Try a different question.' }
              : m
          )
        );
        setIsLoading(false);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setIsLoading(false);
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
            : m
        )
      );
      setIsLoading(false);
    } finally {
      abortControllerRef.current = null;
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setIsLoading(false);
    setIsTyping(false);
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
