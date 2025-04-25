"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Container,
    Avatar,
    Paper,
    Link as MuiLink
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

export default function LoginPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",

    })
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);


    const onLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", user);
            console.log("Login success", response.data);
            toast.success("Login success");
            router.push("/");
        } catch (error: any) {
            console.log("Login failed", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                backgroundColor: '#f5f5f5',
                py: { xs: 2, sm: 4, md: 6 }
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, sm: 3, md: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: 'white',
                        borderRadius: 2
                    }}
                >
                    <Avatar sx={{
                        m: 1,
                        bgcolor: 'primary.main',
                        width: 56,
                        height: 56
                    }}>
                        <LockIcon fontSize="large" />
                    </Avatar>

                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{ mb: 3 }}
                    >
                        Login
                    </Typography>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        variant="outlined"
                        type="email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={onLogin}
                        disabled={buttonDisabled || loading}
                        sx={{
                            mb: 2,
                            height: 48 // Fixed height to prevent jumping
                        }}
                    >
                        {loading ? (
                            <CircularProgress
                                size={24}
                                sx={{ color: 'white' }}
                            />
                        ) : "Login"}
                    </Button>

                    <MuiLink
                        component={Link}
                        href="/signup"
                        sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        Don't have an account? Sign Up
                    </MuiLink>
                </Paper>
            </Container>
        </Box>
    );
}