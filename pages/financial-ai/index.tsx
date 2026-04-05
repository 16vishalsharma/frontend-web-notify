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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  'Analyse TCS for 5 years',
  'How is Nifty performing this week?',
  'Best SIP strategies for beginners',
  'Analyse RELIANCE for 10 years',
  'Gold vs equity — which is better now?',
  'Fundamental analysis of HDFCBANK',
];

// Detect if response is HTML (stock analysis widget) vs markdown
function isHTMLResponse(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith('<style>') || trimmed.startsWith('<div class="wrap');
}

// Renders HTML widget in an iframe so <script> tags work (for tab switching)
const HTMLWidget: React.FC<{ html: string }> = ({ html }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const resizeObserver = new ResizeObserver(() => {
      const body = iframe.contentDocument?.body;
      if (body) {
        setHeight(body.scrollHeight + 20);
      }
    });

    const handleLoad = () => {
      const body = iframe.contentDocument?.body;
      if (body) {
        setHeight(body.scrollHeight + 20);
        resizeObserver.observe(body);
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => {
      iframe.removeEventListener('load', handleLoad);
      resizeObserver.disconnect();
    };
  }, [html]);

  const srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:8px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.6;background:transparent;--color-text-primary:#1a1a1a;--color-text-secondary:#6b7280;--color-background-primary:#fff;--color-background-secondary:#f9fafb;--color-border-secondary:rgba(0,0,0,0.15);--color-border-tertiary:rgba(0,0,0,0.08);--color-border-primary:rgba(0,0,0,0.3)}@media(prefers-color-scheme:dark){body{--color-text-primary:#e5e7eb;--color-text-secondary:#9ca3af;--color-background-primary:#1f2937;--color-background-secondary:#111827;--color-border-secondary:rgba(255,255,255,0.15);--color-border-tertiary:rgba(255,255,255,0.08);--color-border-primary:rgba(255,255,255,0.3);color:#e5e7eb;background:#1f2937}}</style></head><body>${html}</body></html>`;

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcdoc}
      style={{
        width: '100%',
        height,
        border: 'none',
        borderRadius: 8,
        overflow: 'hidden',
      }}
      sandbox="allow-scripts"
      title="Stock Analysis"
    />
  );
};

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
                  {msg.role === 'assistant' && msg.content && isHTMLResponse(msg.content) ? (
                    // Full-width HTML widget for stock analysis
                    <Box sx={{ maxWidth: '95%', width: '100%' }}>
                      <HTMLWidget html={msg.content} />
                    </Box>
                  ) : (
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
                          <Typography variant="body2" color="inherit">Analyzing...</Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
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
