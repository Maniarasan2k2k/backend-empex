import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Alert,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

const roles = [
  { key: "SUPER_ADMIN", label: "Super Admin" },
  { key: "ADMIN", label: "Admin" },
  { key: "MODERATOR", label: "Moderator" },
  { key: "HR_ADMIN", label: "HR Admin" },
  { key: "RECRUITER", label: "Recruiter" },
  { key: "USER", label: "User" },
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", roleKey: "USER" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.email || !form.password || !form.roleKey) {
      setError("All fields are required");
      return;
    }

    try {
      await apiClient.post("/auth/register", form);
      setSuccess("User registered successfully!");
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundColor: "#f4f6f8" }}
    >
      <Paper elevation={6} sx={{ width: 420, p: "2.5rem", borderRadius: "16px" }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.2}>
            <Typography variant="h4" fontWeight={700} textAlign="center">
              EMPEX HITECH
            </Typography>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              Register New User
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField
              label="Full Name"
              name="name"
              fullWidth
              required
              value={form.name}
              onChange={handleChange}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              required
              value={form.password}
              onChange={handleChange}
            />

            <TextField
              select
              label="Role"
              name="roleKey"
              value={form.roleKey}
              onChange={handleChange}
              fullWidth
            >
              {roles.map((r) => (
                <MenuItem key={r.key} value={r.key}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ borderRadius: "10px", mt: 1 }}
            >
              Register
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;
