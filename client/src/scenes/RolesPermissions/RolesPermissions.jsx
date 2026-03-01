import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Switch,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Avatar,
  Fade,
  Tooltip,
  FormControlLabel,
  InputAdornment,
  alpha,
  useTheme,
} from "@mui/material";

import {
  AddOutlined,
  EditOutlined,
  VisibilityOutlined,
  SecurityOutlined,
  ShieldRounded,
  VpnKeyRounded,
  CloseRounded,
  CheckCircleOutlineRounded,
  LockRounded,
  GroupsRounded,
  BadgeRounded,
} from "@mui/icons-material";

import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useAssignPermissionsMutation,
  useGetPermissionsQuery,
} from "state/api";

/* =========================
   AUTH UTILS
========================= */
const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

/* =========================================
   INITIAL FORM STATE
========================================= */
const INITIAL_FORM = {
  key: "",
  name: "",
  isActive: true,
};

/* =========================
   COMPONENT
========================= */
const RolesPermissions = () => {
  const user = getLoggedInUser();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // ✅ Safe Role Check
  const isSuperAdmin =
    user?.role?.key?.toUpperCase() === "SUPER_ADMIN";

  /* =========================
     API CALLS
  ========================= */
  const { data: roles = [], isLoading: rolesLoading } =
    useGetRolesQuery();

  const { data: permissions = [], isLoading: permLoading } =
    useGetPermissionsQuery();

  const [createRole, { isLoading: isCreating }] =
    useCreateRoleMutation();
  const [assignPermissions] = useAssignPermissionsMutation();

  /* =========================
     STATE
  ========================= */
  const [selectedRole, setSelectedRole] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [newRole, setNewRole] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  /* =========================
     GROUP PERMISSIONS
  ========================= */
  const permissionGroups = useMemo(() => {
    const grouped = {};
    permissions.forEach((perm) => {
      const group = perm.group || perm.module || "General";
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(perm);
    });
    return grouped;
  }, [permissions]);

  /* =========================
     TOGGLE PERMISSION
  ========================= */
  const handleTogglePermission = async (permKey) => {
    if (!isSuperAdmin || !selectedRole) return;

    // selectedRole.permissions = populated Permission objects [{_id, key, name, …}, …]
    const currentPerms = selectedRole.permissions || [];
    const alreadyHas = currentPerms.some((p) => p.key === permKey);

    // Build the new permissions list (full objects for local UI state)
    let updatedPermsObjects;
    if (alreadyHas) {
      updatedPermsObjects = currentPerms.filter(
        (p) => p.key !== permKey
      );
    } else {
      // Find the full permission object from the global permissions list
      const fullPerm = permissions.find((p) => p.key === permKey);
      if (!fullPerm) return;
      updatedPermsObjects = [...currentPerms, fullPerm];
    }

    // Send only ObjectIds to the backend (what the model expects)
    const idsForBackend = updatedPermsObjects.map(
      (p) => p._id || p
    );

    try {
      await assignPermissions({
        roleId: selectedRole._id,
        permissions: idsForBackend,
      });

      // Update local state with full objects so UI toggles stay in sync
      setSelectedRole({
        ...selectedRole,
        permissions: updatedPermsObjects,
      });
    } catch (err) {
      console.error("Permission toggle error:", err);
      showSnackbar("Failed to update permission", "error");
    }
  };

  /* =========================
     VALIDATE FORM
  ========================= */
  const validateForm = () => {
    const errors = {};

    if (!newRole.key.trim()) {
      errors.key = "Role key is required";
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(newRole.key.trim().toUpperCase())) {
      errors.key =
        "Must start with a letter. Only letters, numbers & underscores.";
    }

    if (!newRole.name.trim()) {
      errors.name = "Role name is required";
    } else if (newRole.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* =========================
     CREATE ROLE
  ========================= */
  const handleCreateRole = async () => {
    if (!validateForm()) return;

    try {
      const result = await createRole({
        key: newRole.key.trim().toUpperCase(),
        name: newRole.name.trim(),
        isActive: newRole.isActive,
      }).unwrap();

      showSnackbar(
        result?.message || "Role created successfully!",
        "success"
      );
      setNewRole(INITIAL_FORM);
      setFormErrors({});
      setOpenCreate(false);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        "Failed to create role. Please try again.";
      showSnackbar(message, "error");
    }
  };

  /* =========================
     CLOSE MODAL
  ========================= */
  const handleCloseModal = () => {
    setOpenCreate(false);
    setNewRole(INITIAL_FORM);
    setFormErrors({});
  };

  /* =========================
     HANDLE KEY INPUT (auto-uppercase, strip spaces)
  ========================= */
  const handleKeyInput = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/[^A-Z0-9_]/g, "");
    setNewRole((prev) => ({ ...prev, key: value }));
    if (formErrors.key) setFormErrors((prev) => ({ ...prev, key: "" }));
  };

  const handleNameInput = (e) => {
    setNewRole((prev) => ({ ...prev, name: e.target.value }));
    if (formErrors.name)
      setFormErrors((prev) => ({ ...prev, name: "" }));
  };

  /* =========================
     LOADING
  ========================= */
  if (rolesLoading || permLoading) {
    return (
      <Box
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Loading roles & permissions…
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* ========================================= */
  /*              CARD STYLES                  */
  /* ========================================= */
  const cardBase = {
    borderRadius: 4,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9"}`,
    background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
    boxShadow: isDark
      ? "none"
      : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
    transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
  };

  return (
    <Box px={{ xs: 2, md: 4 }} py={4}>
      {/* ================= HEADER ================= */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={4}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              background:
                "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            <ShieldRounded fontSize="small" />
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                letterSpacing: "-0.02em",
                color: isDark ? "#e0e7ff" : "#1e293b",
              }}
            >
              Roles & Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage system roles and their access permissions
            </Typography>
          </Box>
        </Stack>

        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => setOpenCreate(true)}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.2,
              fontWeight: 700,
              fontSize: "0.85rem",
              textTransform: "none",
              background:
                "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                boxShadow: "0 6px 20px rgba(99,102,241,0.45)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Create Role
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        {/* ================= ROLES LIST ================= */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              ...cardBase,
              p: 0,
              overflow: "hidden",
            }}
          >
            {/* Panel Header */}
            <Box
              sx={{
                px: 3,
                py: 2.5,
                background: isDark
                  ? "rgba(99,102,241,0.08)"
                  : "linear-gradient(135deg, #eef2ff, #e0e7ff)",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                  }`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <GroupsRounded
                  sx={{ color: "#6366f1", fontSize: 20 }}
                />
                <Typography
                  fontWeight={700}
                  fontSize="0.95rem"
                  sx={{ color: isDark ? "#c7d2fe" : "#3730a3" }}
                >
                  System Roles
                </Typography>
                <Chip
                  label={roles.length}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 22,
                    background: isDark
                      ? "rgba(99,102,241,0.2)"
                      : "#c7d2fe",
                    color: "#4338ca",
                  }}
                />
              </Stack>
            </Box>

            {/* Role Cards */}
            <Box
              sx={{
                p: 2,
                maxHeight: "65vh",
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": {
                  borderRadius: 4,
                  background: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "#cbd5e1",
                },
              }}
            >
              {roles.map((role) => {
                const isSelected = selectedRole?._id === role._id;
                return (
                  <Fade in timeout={300} key={role._id}>
                    <Paper
                      elevation={0}
                      onClick={() => setSelectedRole(role)}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        cursor: "pointer",
                        borderRadius: 3,
                        position: "relative",
                        overflow: "hidden",
                        border: isSelected
                          ? `2px solid #6366f1`
                          : `1px solid ${isDark
                            ? "rgba(255,255,255,0.06)"
                            : "#f1f5f9"
                          }`,
                        background: isSelected
                          ? isDark
                            ? "rgba(99,102,241,0.1)"
                            : "#eef2ff"
                          : isDark
                            ? "rgba(255,255,255,0.02)"
                            : "#fafbfe",
                        transition:
                          "all 0.25s cubic-bezier(.4,0,.2,1)",
                        "&:hover": {
                          transform: "translateX(4px)",
                          borderColor: "#818cf8",
                          boxShadow: isSelected
                            ? "0 4px 16px rgba(99,102,241,0.2)"
                            : "0 2px 8px rgba(0,0,0,0.06)",
                        },
                        /* left accent */
                        "&::before": isSelected
                          ? {
                            content: '""',
                            position: "absolute",
                            top: 8,
                            left: 0,
                            width: 4,
                            height: "calc(100% - 16px)",
                            borderRadius: "0 4px 4px 0",
                            background:
                              "linear-gradient(180deg, #6366f1, #818cf8)",
                          }
                          : undefined,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            fontWeight={700}
                            fontSize="0.9rem"
                            noWrap
                            sx={{
                              color: isDark
                                ? "#e0e7ff"
                                : "#1e293b",
                            }}
                          >
                            {role.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                              color: isDark
                                ? "rgba(255,255,255,0.4)"
                                : "#94a3b8",
                              fontFamily: "monospace",
                            }}
                          >
                            {role.key}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={
                            role.isActive ? "Active" : "Inactive"
                          }
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            height: 22,
                            borderRadius: 2,
                            background: role.isActive
                              ? isDark
                                ? "rgba(16,185,129,0.15)"
                                : "#d1fae5"
                              : isDark
                                ? "rgba(239,68,68,0.15)"
                                : "#fee2e2",
                            color: role.isActive
                              ? "#059669"
                              : "#dc2626",
                          }}
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mt={1.5}
                      >
                        <Chip
                          icon={
                            <LockRounded
                              sx={{ fontSize: 12 }}
                            />
                          }
                          label={`${role.permissions?.length || 0} permissions`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            height: 24,
                            borderRadius: 2,
                            borderColor: isDark
                              ? "rgba(255,255,255,0.1)"
                              : "#e2e8f0",
                            color: isDark
                              ? "rgba(255,255,255,0.5)"
                              : "#64748b",
                          }}
                        />

                        <Stack direction="row" spacing={0}>
                          <Tooltip title="View details">
                            <IconButton size="small">
                              <VisibilityOutlined
                                sx={{ fontSize: 16 }}
                              />
                            </IconButton>
                          </Tooltip>
                          {isSuperAdmin && (
                            <Tooltip title="Edit role">
                              <IconButton size="small">
                                <EditOutlined
                                  sx={{ fontSize: 16 }}
                                />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  </Fade>
                );
              })}

              {roles.length === 0 && (
                <Box py={6} textAlign="center">
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    No roles created yet
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ================= PERMISSIONS PANEL ================= */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              ...cardBase,
              p: 0,
              minHeight: "65vh",
              overflow: "hidden",
            }}
          >
            {selectedRole ? (
              <>
                {/* Panel Header */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    background: isDark
                      ? "rgba(14,165,233,0.08)"
                      : "linear-gradient(135deg, #e0f2fe, #dbeafe)",
                    borderBottom: `1px solid ${isDark
                      ? "rgba(255,255,255,0.06)"
                      : "#e2e8f0"
                      }`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <SecurityOutlined
                      sx={{ color: "#0ea5e9", fontSize: 20 }}
                    />
                    <Typography
                      fontWeight={700}
                      fontSize="0.95rem"
                      sx={{
                        color: isDark ? "#bae6fd" : "#0c4a6e",
                      }}
                    >
                      Permissions
                    </Typography>
                    <Chip
                      label={selectedRole.name}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        height: 24,
                        borderRadius: 2,
                        background: isDark
                          ? "rgba(14,165,233,0.2)"
                          : "#bae6fd",
                        color: "#0369a1",
                      }}
                    />
                    {selectedRole.isSystemRole && (
                      <Chip
                        label="System"
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.6rem",
                          height: 20,
                          background: isDark
                            ? "rgba(245,158,11,0.15)"
                            : "#fef3c7",
                          color: "#d97706",
                        }}
                      />
                    )}
                  </Stack>
                </Box>

                {/* Permission Groups */}
                <Box
                  sx={{
                    p: 3,
                    maxHeight: "58vh",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: 4 },
                    "&::-webkit-scrollbar-thumb": {
                      borderRadius: 4,
                      background: isDark
                        ? "rgba(255,255,255,0.15)"
                        : "#cbd5e1",
                    },
                  }}
                >
                  {Object.entries(permissionGroups).map(
                    ([groupName, perms]) => (
                      <Box key={groupName} mb={3}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          mb={1.5}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: isDark
                                ? "rgba(255,255,255,0.5)"
                                : "#64748b",
                              fontSize: "0.7rem",
                            }}
                          >
                            {groupName}
                          </Typography>
                          <Box
                            sx={{
                              flex: 1,
                              height: 1,
                              background: isDark
                                ? "rgba(255,255,255,0.06)"
                                : "#f1f5f9",
                            }}
                          />
                          <Chip
                            label={perms.length}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.6rem",
                              height: 18,
                              width: 28,
                              p: 0,
                              background: isDark
                                ? "rgba(255,255,255,0.06)"
                                : "#f1f5f9",
                              color: isDark
                                ? "rgba(255,255,255,0.4)"
                                : "#94a3b8",
                            }}
                          />
                        </Stack>

                        {perms.map((perm) => {
                          const isOn =
                            selectedRole.permissions.some(
                              (p) => p.key === perm.key
                            );
                          return (
                            <Box
                              key={perm.key}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 1,
                                px: 2,
                                mb: 0.5,
                                borderRadius: 2.5,
                                transition: "all 0.2s ease",
                                background: isOn
                                  ? isDark
                                    ? "rgba(99,102,241,0.06)"
                                    : "#f8faff"
                                  : "transparent",
                                "&:hover": {
                                  background: isDark
                                    ? "rgba(255,255,255,0.03)"
                                    : "#fafbfe",
                                },
                              }}
                            >
                              <Box>
                                <Typography
                                  fontSize="0.85rem"
                                  fontWeight={isOn ? 600 : 400}
                                  sx={{
                                    color: isOn
                                      ? isDark
                                        ? "#c7d2fe"
                                        : "#1e293b"
                                      : isDark
                                        ? "rgba(255,255,255,0.5)"
                                        : "#64748b",
                                  }}
                                >
                                  {perm.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: "monospace",
                                    fontSize: "0.65rem",
                                    color: isDark
                                      ? "rgba(255,255,255,0.25)"
                                      : "#94a3b8",
                                  }}
                                >
                                  {perm.key}
                                </Typography>
                              </Box>

                              <Switch
                                size="small"
                                checked={isOn}
                                disabled={!isSuperAdmin}
                                onChange={() =>
                                  handleTogglePermission(
                                    perm.key
                                  )
                                }
                                sx={{
                                  "& .MuiSwitch-switchBase.Mui-checked":
                                  {
                                    color: "#6366f1",
                                  },
                                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                  {
                                    backgroundColor:
                                      "#818cf8",
                                  },
                                }}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    )
                  )}
                </Box>
              </>
            ) : (
              /* Empty State */
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="60vh"
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 2,
                    background: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#f1f5f9",
                  }}
                >
                  <SecurityOutlined
                    sx={{
                      fontSize: 28,
                      color: isDark
                        ? "rgba(255,255,255,0.2)"
                        : "#94a3b8",
                    }}
                  />
                </Avatar>
                <Typography
                  fontWeight={600}
                  fontSize="0.95rem"
                  sx={{
                    color: isDark
                      ? "rgba(255,255,255,0.4)"
                      : "#64748b",
                    mb: 0.5,
                  }}
                >
                  No role selected
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark
                      ? "rgba(255,255,255,0.25)"
                      : "#94a3b8",
                  }}
                >
                  Select a role from the left panel to manage
                  permissions
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ================= CREATE ROLE DIALOG ================= */}
      {isSuperAdmin && (
        <Dialog
          open={openCreate}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: "hidden",
              background: isDark ? "#1e1e2e" : "#ffffff",
            },
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              background: isDark
                ? "rgba(99,102,241,0.08)"
                : "linear-gradient(135deg, #eef2ff, #e0e7ff)",
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                }`,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background:
                      "linear-gradient(135deg, #6366f1, #818cf8)",
                  }}
                >
                  <BadgeRounded sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography
                    fontWeight={700}
                    fontSize="1rem"
                    sx={{
                      color: isDark ? "#e0e7ff" : "#1e293b",
                    }}
                  >
                    Create New Role
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Define a new system role with permissions
                  </Typography>
                </Box>
              </Stack>

              <IconButton
                onClick={handleCloseModal}
                size="small"
                sx={{
                  color: isDark
                    ? "rgba(255,255,255,0.4)"
                    : "#94a3b8",
                }}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Modal Body */}
          <DialogContent sx={{ px: 3, py: 3 }}>
            <Stack spacing={3}>
              {/* Role Key */}
              <TextField
                fullWidth
                label="Role Key"
                placeholder="e.g. HR_ADMIN"
                value={newRole.key}
                onChange={handleKeyInput}
                error={!!formErrors.key}
                helperText={
                  formErrors.key ||
                  "Unique identifier. Uppercase, no spaces."
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyRounded
                        sx={{
                          fontSize: 18,
                          color: formErrors.key
                            ? "error.main"
                            : "#6366f1",
                        }}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    fontFamily: "monospace",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  },
                }}
              />

              {/* Role Name */}
              <TextField
                fullWidth
                label="Role Name"
                placeholder="e.g. HR Admin"
                value={newRole.name}
                onChange={handleNameInput}
                error={!!formErrors.name}
                helperText={
                  formErrors.name ||
                  "Human-readable display name for this role"
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeRounded
                        sx={{
                          fontSize: 18,
                          color: formErrors.name
                            ? "error.main"
                            : "#0ea5e9",
                        }}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                  },
                }}
              />

              {/* isActive Toggle */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "#e2e8f0",
                }}
              >
                <Box>
                  <Typography
                    fontWeight={600}
                    fontSize="0.85rem"
                    sx={{
                      color: isDark ? "#e0e7ff" : "#1e293b",
                    }}
                  >
                    Active Status
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {newRole.isActive
                      ? "Role will be active immediately"
                      : "Role will be created as inactive"}
                  </Typography>
                </Box>
                <Switch
                  checked={newRole.isActive}
                  onChange={(e) =>
                    setNewRole((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#10b981",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                    {
                      backgroundColor: "#34d399",
                    },
                  }}
                />
              </Paper>
            </Stack>
          </DialogContent>

          {/* Modal Footer */}
          <DialogActions
            sx={{
              px: 3,
              py: 2.5,
              borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"
                }`,
              gap: 1.5,
            }}
          >
            <Button
              onClick={handleCloseModal}
              disabled={isCreating}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "none",
                color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
                "&:hover": {
                  background: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "#f8fafc",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateRole}
              disabled={isCreating}
              startIcon={
                isCreating ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckCircleOutlineRounded
                    sx={{ fontSize: 18 }}
                  />
                )
              }
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 700,
                fontSize: "0.85rem",
                textTransform: "none",
                background:
                  "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  boxShadow:
                    "0 6px 20px rgba(99,102,241,0.45)",
                },
                "&.Mui-disabled": {
                  background: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "#e2e8f0",
                },
              }}
            >
              {isCreating ? "Creating…" : "Create Role"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ================= SNACKBAR ================= */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RolesPermissions;