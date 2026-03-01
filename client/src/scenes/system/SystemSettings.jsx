import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Switch,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import { SettingsOutlined } from "@mui/icons-material";

/* =========================
   SYSTEM SETTINGS PAGE
========================= */
const SystemSettings = () => {
  /* =========================
     STATE (API READY)
  ========================== */
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maxLoginAttempts: 5,
    passwordExpiryDays: 90,
    jobAutoApproval: false,
    maxApplicationsPerUser: 10,
    emailNotifications: true,
    systemNotifications: true,
    auditLogsEnabled: true,
  });

  /* =========================
     HANDLERS
  ========================== */
  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    console.log("Saving Settings:", settings);
    alert("System settings saved successfully (API call here)");
  };

  return (
    <Box p="1.5rem">
      {/* ===== HEADER ===== */}
      <Box display="flex" alignItems="center" gap={1} mb="1.5rem">
        <SettingsOutlined />
        <Typography variant="h4" fontWeight={600}>
          System Settings
        </Typography>
      </Box>

      {/* ===== PLATFORM SETTINGS ===== */}
      <Paper sx={{ p: "1.5rem", mb: "1.5rem" }}>
        <Typography variant="h6" fontWeight={600} mb={1}>
          Platform Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>Maintenance Mode</Typography>
          <Switch
            checked={settings.maintenanceMode}
            onChange={() => handleToggle("maintenanceMode")}
          />
        </Stack>
      </Paper>

      {/* ===== USER & SECURITY SETTINGS ===== */}
      <Paper sx={{ p: "1.5rem", mb: "1.5rem" }}>
        <Typography variant="h6" fontWeight={600} mb={1}>
          User & Security Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <TextField
            label="Max Login Attempts"
            type="number"
            size="small"
            value={settings.maxLoginAttempts}
            onChange={(e) =>
              handleChange("maxLoginAttempts", e.target.value)
            }
            sx={{ maxWidth: 260 }}
          />

          <TextField
            label="Password Expiry (Days)"
            type="number"
            size="small"
            value={settings.passwordExpiryDays}
            onChange={(e) =>
              handleChange("passwordExpiryDays", e.target.value)
            }
            sx={{ maxWidth: 260 }}
          />
        </Stack>
      </Paper>

      {/* ===== JOB & APPLICATION SETTINGS ===== */}
      <Paper sx={{ p: "1.5rem", mb: "1.5rem" }}>
        <Typography variant="h6" fontWeight={600} mb={1}>
          Job & Application Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>Job Auto Approval</Typography>
            <Switch
              checked={settings.jobAutoApproval}
              onChange={() => handleToggle("jobAutoApproval")}
            />
          </Stack>

          <TextField
            label="Max Applications Per User"
            type="number"
            size="small"
            value={settings.maxApplicationsPerUser}
            onChange={(e) =>
              handleChange("maxApplicationsPerUser", e.target.value)
            }
            sx={{ maxWidth: 260 }}
          />
        </Stack>
      </Paper>

      {/* ===== NOTIFICATION SETTINGS ===== */}
      <Paper sx={{ p: "1.5rem", mb: "1.5rem" }}>
        <Typography variant="h6" fontWeight={600} mb={1}>
          Notification Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>Email Notifications</Typography>
            <Switch
              checked={settings.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>System Notifications</Typography>
            <Switch
              checked={settings.systemNotifications}
              onChange={() => handleToggle("systemNotifications")}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* ===== AUDIT SETTINGS ===== */}
      <Paper sx={{ p: "1.5rem", mb: "1.5rem" }}>
        <Typography variant="h6" fontWeight={600} mb={1}>
          Audit & Logs
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>Enable Audit Logs</Typography>
          <Switch
            checked={settings.auditLogsEnabled}
            onChange={() => handleToggle("auditLogsEnabled")}
          />
        </Stack>
      </Paper>

      {/* ===== SAVE BUTTON ===== */}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          sx={{ borderRadius: "8px", px: 4 }}
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default SystemSettings;
