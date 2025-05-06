"use client";
import { useState, useEffect, KeyboardEvent } from 'react';
import Modal from './components/Modal';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Grid,
  Fade,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Stack,
  AlertColor
} from '@mui/material';
import { Add as AddIcon, Logout as LogoutIcon, Delete as DeleteIcon, Mic as MicIcon, Edit as EditIcon } from '@mui/icons-material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

interface Paste {
  pasteId: string;
  content: string;
  createdAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export default function Home() {
  const router = useRouter();
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newPaste, setNewPaste] = useState<string>('');
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filterText, setFilterText] = useState<string>('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [editingPaste, setEditingPaste] = useState<Paste | null>(null);

  useEffect(() => {
    // Load saved pastes when component mounts
    fetchPastes();
  }, []);

  useEffect(() => {
    // Add global paste listener
    const handlePaste = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'v') {
        setShowModal(true);
      }
    };

    document.addEventListener('keydown', handlePaste);
    return () => document.removeEventListener('keydown', handlePaste);
  }, []);

  const fetchPastes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/pastes');
      // Ensure we're setting an array, even if empty
      setPastes(response.data.data?.pastes || []);
    } catch (error) {
      console.error('Error fetching pastes:', error);
      setPastes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaste = async (content: string) => {
    try {
      const response = await axios.post('/api/users/pastes', {
        content: content
      });

      if (response.data.success) {
        await fetchPastes();
        setShowModal(false);
        setSnackbar({
          open: true,
          message: 'Paste added successfully!',
          severity: 'success'
        });
      } else {
        console.error('Error:', response.data.error);
        setSnackbar({
          open: true,
          message: response.data.error || 'Failed to add paste',
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Error adding paste:', error.response?.data?.error || error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to add paste',
        severity: 'error'
      });
    }
  };

  const handleUpdatePaste = async (id: string, content: string) => {
    try {
      const response = await axios.put(`/api/users/pastes?pasteId=${id}`, {
        content: content
      });

      if (response.data.success) {
        await fetchPastes();
        setSnackbar({
          open: true,
          message: 'Paste updated successfully!',
          severity: 'success'
        });
      } else {
        console.error('Update failed:', response.data.error);
        setSnackbar({
          open: true,
          message: response.data.error || 'Failed to update paste',
          severity: 'error'
        });
      }
    }catch (error: any) {
      console.error('Error updating paste:', error.response?.data?.error || error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update paste',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`/api/users/pastes?pasteId=${id}`);

      if (response.data.success) {
        await fetchPastes();
        setSnackbar({
          open: true,
          message: 'Paste deleted successfully!',
          severity: 'success'
        });
      } else {
        console.error('Delete failed:', response.data.error);
        setSnackbar({
          open: true,
          message: response.data.error || 'Failed to delete paste',
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Error deleting paste:', error.response?.data?.error || error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete paste',
        severity: 'error'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('/api/users/logout');
      router.push('/login');
    } catch (error: any) {
      console.error('Error logging out:', error);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setSnackbar({
      open: true,
      message: 'Content copied to clipboard!',
      severity: 'success'
    });
  };

  const scrollToPaste = (pasteId: string) => {
    setTimeout(() => {
      const element = document.getElementById(`paste-${pasteId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the paste card
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.01)';
        setTimeout(() => {
          element.style.transform = 'scale(1)';
        }, 500);
      }
    }, 100);
  };

  const handleSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setFilterText('');
        setSnackbar({
          open: true,
          message: 'Listening... Please speak',
          severity: 'info'
        });
      };

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        // Remove punctuation and clean up transcript
        const transcript = event.results[last][0].transcript
          .toLowerCase()
          .trim()
          .replace(/[.?!,]/g, ''); // Remove common punctuation marks

        console.log('Searching for:', transcript);

        const matchingPastes = pastes.filter(paste => {
          // Remove punctuation from paste content for comparison
          const content = paste.content.toLowerCase().replace(/[.?!,]/g, '');
          return content.includes(transcript);
        });

        if (matchingPastes.length > 0) {
          setFilterText(transcript);
          setCurrentMatchIndex(0);
          const firstMatch = matchingPastes[0];

          // First scroll to the matching paste
          scrollToPaste(firstMatch.pasteId);

          // Then highlight the specific text after a delay
          setTimeout(() => {
            const marks = document.querySelectorAll('mark');
            setTotalMatches(marks.length);
            if (marks[0]) {
              marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
              marks.forEach((mark, i) => {
                (mark as HTMLElement).style.backgroundColor = i === 0 ? '#ffd54f' : '#bbdefb';
              });
            }
          }, 300);

          setSnackbar({
            open: true,
            message: `Found "${transcript}" in ${matchingPastes.length} ${matchingPastes.length === 1 ? 'paste' : 'pastes'}`,
            severity: 'success'
          });
        } else {
          setFilterText('');
          setSnackbar({
            open: true,
            message: `No content found containing "${transcript}"`,
            severity: 'info'
          });
        }

        recognition.stop();
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
      };

      recognition.onerror = (event: any) => {
        let errorMessage = '';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech was detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not found or not working.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
          default:
            errorMessage = `Error occurred: ${event.error}`;
        }
        console.error('Speech recognition error:', errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
        recognition.stop();
      };

      try {
        recognition.start();
        console.log('Recognition started');
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const navigateMatches = (direction: 'next' | 'prev') => {
    const marks = document.querySelectorAll('mark');
    if (marks.length === 0) return;

    let newIndex: any;
    if (direction === 'next') {
      newIndex = (currentMatchIndex + 1) % marks.length;
    } else {
      newIndex = (currentMatchIndex - 1 + marks.length) % marks.length;
    }

    setCurrentMatchIndex(newIndex);
    marks[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Update the highlight style
    marks.forEach((mark, i) => {
      (mark as HTMLElement).style.backgroundColor = i === newIndex ? '#ffd54f' : '#bbdefb';
    });
  };

  const handleEdit = (paste: Paste) => {
    setEditingPaste(paste);
    setShowModal(true);
  };

  const handleModalSubmit = async (content: string) => {
    if (editingPaste) {
      await handleUpdatePaste(editingPaste.pasteId, content);
    } else {
      await handleAddPaste(content);
    }
    setEditingPaste(null);
    setShowModal(false);
  };

  const formatCodeContent = (content: string) => {
    return content
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n');
  };

  // Add helper function to format code blocks
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map(line => {
        // Preserve input field syntax
        const inputRegex = /<(input|textarea|select)([^>]*)>/g;
        line = line.replace(inputRegex, (match) => `\`${match}\``);
        
        // Preserve code formatting
        if (line.trim().startsWith('```') || line.trim().startsWith('// ')) {
          return line;
        }
        return line;
      })
      .join('\n');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main'
        }}
      >
        <Toolbar sx={{ flexDirection: { xs: 'column', sm: 'row' }, py: { xs: 2, sm: 0 }, gap: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Your Pastes
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 2 },
            width: '100%',
            justifyContent: { xs: 'space-between', sm: 'flex-end' }
          }}>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setShowModal(true)}
              sx={{
                minWidth: { xs: '40px', sm: 'auto' },
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              New Paste
            </Button>
            <Tooltip title="Voice Search">
              <IconButton
                onClick={handleSpeechRecognition}
                sx={{
                  bgcolor: 'white',
                  '&:hover': { bgcolor: 'grey.100' },
                  width: { xs: '40px', sm: '40px' },
                  height: { xs: '40px', sm: '40px' }
                }}
              >
                <MicIcon color="primary" />
              </IconButton>
            </Tooltip>

            {totalMatches > 0 && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <IconButton
                  onClick={() => navigateMatches('prev')}
                  sx={{
                    bgcolor: 'white',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  ←
                </IconButton>
                <Typography
                  sx={{
                    color: 'white',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}
                >
                  {currentMatchIndex + 1}/{totalMatches}
                </Typography>
                <IconButton
                  onClick={() => navigateMatches('next')}
                  sx={{
                    bgcolor: 'white',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  →
                </IconButton>
              </Box>
            )}

            <Button
              color="error"
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                minWidth: { xs: '40px', sm: 'auto' },
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Add a toolbar component to prevent content from going under AppBar */}
      <Toolbar />

      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          mt: { xs: 1, sm: 2, md: 3 },
          mb: { xs: 2, sm: 3, md: 4 }
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : pastes.length === 0 ? (
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            No pastes found. Create your first paste!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
            {[...pastes].reverse().map((paste, index) => (
              <Fade in timeout={300 + index * 100} key={paste.pasteId}>
                <Box id={`paste-${paste.pasteId}`}> {/* Use Box instead of div for better MUI integration */}
                  <Card
                    variant="outlined"
                    sx={{
                      background: filterText && paste.content.toLowerCase().includes(filterText.toLowerCase())
                        ? 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%)'
                        : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      boxShadow: filterText && paste.content.toLowerCase().includes(filterText.toLowerCase())
                        ? '0 0 8px rgba(33,150,243,0.3)'
                        : '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: { xs: 'none', sm: 'translateY(-2px)' },
                        boxShadow: { xs: '0 2px 4px rgba(0,0,0,0.1)', sm: '0 4px 8px rgba(0,0,0,0.12)' }
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        gap={{ xs: 1, sm: 0 }}
                        mb={1}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {new Date(paste.createdAt).toLocaleString()}
                        </Typography>
                        <Tooltip title="Copy to clipboard">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(paste.content)}
                            sx={{
                              opacity: 0.7,
                              '&:hover': { opacity: 1 },
                              padding: { xs: 0.5, sm: 1 }
                            }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Divider sx={{ my: { xs: 1, sm: 2 } }} />
                      <Typography
                        component="pre"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: 'Consolas, Monaco, monospace',
                          bgcolor: '#f8f9fa',
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: 1,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          lineHeight: 1.6,
                          position: 'relative',
                          '& mark': {
                            backgroundColor: '#fff59d',
                            color: 'inherit',
                            padding: '2px 0',
                            borderRadius: '2px',
                            textDecoration: 'none'
                          },
                          '& code': {
                            display: 'block',
                            padding: '8px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            marginBottom: '8px'
                          },
                          '& pre': {
                            margin: '8px 0',
                            padding: '12px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            overflow: 'auto'
                          }
                        }}
                      >
                        {filterText ? (
                          <div 
                            dangerouslySetInnerHTML={{
                              __html: formatContent(paste.content).replace(
                                new RegExp(filterText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
                                match => `<mark>${match}</mark>`
                              )
                            }}
                          />
                        ) : (
                          formatContent(paste.content)
                        )}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{
                      justifyContent: 'flex-end',
                      p: { xs: 1.5, sm: 2 },
                      gap: 1
                    }}>
                      <Button
                        startIcon={<EditIcon />}
                        color="primary"
                        variant="outlined"
                        size="small"
                        onClick={() => handleEdit(paste)}
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white'
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={() => handleDelete(paste.pasteId)}
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          '&:hover': {
                            bgcolor: 'error.main',
                            color: 'white'
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              </Fade>
            ))}
          </Box>
        )}

        {showModal && (
          <Modal
            onClose={() => {
              setShowModal(false);
              setEditingPaste(null);
            }}
            onSubmit={handleModalSubmit}
            initialContent={editingPaste?.content || newPaste}
            title={editingPaste ? 'Edit Paste' : 'New Paste'}
          />
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
