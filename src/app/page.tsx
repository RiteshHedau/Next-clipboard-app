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
import { Add as AddIcon, Logout as LogoutIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
    } catch (error:any) {
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      <AppBar position="static" sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
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
          <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Button
              fullWidth={false}
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setShowModal(true)}
              sx={{
                flex: { xs: 1, sm: 'none' },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              New Paste
            </Button>
            <Button
              fullWidth={false}
              color="error"
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                flex: { xs: 1, sm: 'none' },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
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
                <Box> {/* Use Box instead of div for better MUI integration */}
                  <Card
                    variant="outlined"
                    sx={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
                          fontFamily: 'monospace',
                          bgcolor: '#f8f9fa',
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: 1,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          lineHeight: { xs: 1.4, sm: 1.5 }
                        }}
                      >
                        {paste.content}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{
                      justifyContent: 'flex-end',
                      p: { xs: 1.5, sm: 2 },
                      gap: 1
                    }}>
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
            onClose={() => setShowModal(false)}
            onSubmit={handleAddPaste}
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
