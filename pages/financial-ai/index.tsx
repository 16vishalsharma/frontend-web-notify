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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  'How is Nifty performing this week?',
  'Best SIP strategies for beginners',
  'Upcoming IPOs to watch in 2026',
  'Gold vs equity — which is better now?',
  'How will RBI rate cut affect markets?',
  'Top mutual funds for long term',
];

const ChatPage: React.FC = () => {
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

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, assistantMessage]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    // Send full conversation history (without IDs) so Claude has context
    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages }),
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

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant' && !last.content) {
            last.content = 'Sorry, something went wrong. Please try again.';
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
            <TrendingUpIcon color="primary" />
            <Typography variant="h1">Financial Adviser</Typography>
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
          Your AI-powered share market &amp; finance adviser — ask follow-up questions for deeper insights
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
                <AutoAwesomeIcon sx={{ fontSize: 56, color: 'primary.light', opacity: 0.6 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={500}>
                  Ask me anything about finance &amp; markets
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
                  I can help with stocks, IPOs, mutual funds, crypto, gold prices, tax planning, and more. Ask follow-up questions to dive deeper.
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
                        <Typography variant="body2" color="inherit">Analyzing...</Typography>
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
                placeholder="Ask about stocks, mutual funds, IPOs, crypto..."
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              For educational purposes only. Not financial advice. Consult a SEBI-registered advisor before investing.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default ChatPage;
