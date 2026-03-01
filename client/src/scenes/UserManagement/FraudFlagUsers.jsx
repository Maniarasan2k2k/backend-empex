import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  VisibilityOutlined,
  BlockOutlined,
  CheckCircleOutline,
  FlagOutlined,
} from "@mui/icons-material";
import apiClient from "../../api/apiClient";

const FraudFlags = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  /* ===============================
     FETCH FRAUD FLAGGED USERS
  =============================== */
  const fetchFraudUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/candidates/fraud-flagged");

      const list = res.data || [];

      const mapped = list.map((u) => ({
        id: u._id,
        name: u.canname,
        email: u.canemail,
        role: "candidate",
        isFlagged: Boolean(u.isFlagged),
        isBlocked: Boolean(u.isBlocked),
        createdAt: u.createdAt,
        raw: u, // full object for modal
      }));

      setUsers(mapped);
    } catch (err) {
      console.error("Fetch fraud users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudUsers();
  }, []);

  /* ===============================
     BLOCK USER
  =============================== */
  const handleBlock = async (id) => {
    if (!window.confirm("Block this user?")) return;

    try {
      await apiClient.patch(`/admin/candidates/${id}/block`);
      fetchFraudUsers();
    } catch (err) {
      alert(err || "Block failed");
    }
  };

  /* ===============================
     UNFLAG USER
  =============================== */
  const handleUnflag = async (id) => {
    if (!window.confirm("Unflag this user?")) return;

    try {
      await apiClient.patch(`/admin/candidates/${id}/unflag`);
      fetchFraudUsers();
    } catch (err) {
      alert(err || "Unflag failed");
    }
  };

  /* ===============================
     VIEW USER
  =============================== */
  const handleView = (row) => {
    setSelectedUser(row.raw);
    setViewOpen(true);
  };

  /* ===============================
     TABLE COLUMNS
  =============================== */
  const columns = useMemo(() => [
    {
      field: "name",
      headerName: "User",
      flex: 1.5,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar>{row.name?.charAt(0)}</Avatar>
          <Box>
            <Typography fontWeight={600}>{row.name}</Typography>
            <Typography fontSize="0.75rem" color="text.secondary">{row.email}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 0.9,
      renderCell: ({ value }) => <Chip size="small" label={value} color="info" />,
    },
    {
      field: "fraud",
      headerName: "Fraud",
      flex: 0.8,
      renderCell: ({ row }) =>
        row.isFlagged ? (
          <Chip size="small" label="Flagged" color="warning" icon={<FlagOutlined />} />
        ) : (
          <Chip size="small" label="Clean" variant="outlined" />
        ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: ({ row }) => (
        <Chip size="small" label={row.isBlocked ? "Blocked" : "Active"} color={row.isBlocked ? "error" : "success"} />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.3,
      sortable: false,
      renderCell: ({ row }) => (
        <Box>
          <IconButton color="primary" onClick={() => handleView(row)}><VisibilityOutlined /></IconButton>
          {!row.isBlocked && <IconButton color="warning" onClick={() => handleBlock(row.id)}><BlockOutlined /></IconButton>}
          {row.isFlagged && <IconButton color="success" onClick={() => handleUnflag(row.id)}><CheckCircleOutline /></IconButton>}
        </Box>
      ),
    },
  ], []);

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>Fraud Flagged Users</Typography>
        <Button variant="outlined">Export Users</Button>
      </Box>

      <Box height="65vh">
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* VIEW USER */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>User Details</DialogTitle>
        <Divider />
        {selectedUser && (
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56 }}>{selectedUser.name?.charAt(0)}</Avatar>
                <Box>
                  <Typography fontWeight={600}>{selectedUser.name}</Typography>
                  <Typography color="text.secondary">{selectedUser.email}</Typography>
                </Box>
              </Stack>
              <Divider />
              <Typography><strong>Role:</strong> {selectedUser.role?.name || selectedUser.role?.key}</Typography>
              <Typography><strong>Status:</strong> {!selectedUser.isBlocked ? "Active" : "Blocked"}</Typography>
              <Typography><strong>Fraud Flagged:</strong> {selectedUser.isFlagged ? "Yes" : "No"}</Typography>
              <Typography><strong>Joined On:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</Typography>
            </Stack>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FraudFlags;
