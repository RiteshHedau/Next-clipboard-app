"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Fade,
    IconButton,
    Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ModalProps {
    onClose: () => void;
    onSubmit: (content: string) => void;
    initialContent?: string;  // Make initialContent optional
}

export default function Modal({ onClose, onSubmit, initialContent = '' }: ModalProps) {
    const [content, setContent] = useState<string>(initialContent);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content);
            setContent('');
        }
    };

    return (
        <Dialog
            open={true}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 500 }}
        >
            <DialogTitle sx={{
                m: 0,
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6" component="div">
                    Add New Paste
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                        '&:hover': {
                            color: (theme) => theme.palette.grey[700],
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        multiline
                        rows={8}
                        value={content}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                        placeholder="Paste your content here..."
                        variant="outlined"
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontFamily: 'monospace',
                                fontSize: '0.875rem'
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!content.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
