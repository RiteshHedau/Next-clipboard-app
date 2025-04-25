"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Container,
    Avatar
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

export default function SignupPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
        username: "",
    })
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const onSignup = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            console.log("Signup success", response.data);
            router.push("/login");

        } catch (error: any) {
            console.log("Signup failed", error.message);

            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
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
                        bgcolor: 'secondary.main',
                        width: 56,
                        height: 56
                    }}>
                        <PersonAddIcon fontSize="large" />
                    </Avatar>

                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{ mb: 3 }}
                    >
                        Sign Up
                    </Typography>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Username"
                        variant="outlined"
                        value={user.username}
                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                        sx={{ mb: 2 }}
                    />

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
                        onClick={onSignup}
                        disabled={buttonDisabled || loading}
                        sx={{
                            mb: 2,
                            height: 48
                        }}
                    >
                        {loading ? (
                            <CircularProgress
                                size={24}
                                sx={{ color: 'white' }}
                            />
                        ) : "Sign Up"}
                    </Button>

                    <Link
                        href="/login"
                        style={{
                            color: '#1976d2',
                            textDecoration: 'none'
                        }}
                    >
                        Already have an account? Login
                    </Link>
                </Paper>
            </Container>
        </Box>
    );
}