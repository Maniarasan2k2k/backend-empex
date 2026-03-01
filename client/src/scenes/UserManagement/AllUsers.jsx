import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Avatar,
  Chip,
  IconButton,
  Typography,
  TextField,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  VisibilityOutlined,
  DeleteOutlined,
  BlockOutlined,
  CheckCircleOutline,
  DeleteSweepOutlined,
  RefreshOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

// 🚀 CENTRALIZED SERVICE INJECTED
import adminCandidateService from "../../services/adminCandidateService";

const AdminCandidates = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [totalRows, setTotalRows] = useState(0);

  const [selected, setSelected] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  /* ================= FETCH DATA (ALIGNED WITH BACKEND) ================= */

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);

      const response = await adminCandidateService.getAll({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: search || undefined,
      });

      // BACKEND FORMAT: { success: true, total: 100, page: 1, data: [...] }
      if (response.success) {
        setTotalRows(response.total || 0);
        setRows(
          (response.data || []).map((c) => ({
            id: c._id,
            name: c.canname,
            email: c.canemail,
            mobile: c.canphone,
            referrerName: c.referrerName || "N/A",
            referrerPhone: c.referrerPhone || "N/A",
            referredBy: c.referredBy || "N/A",
            verification: c.isVerified,
            createdAt: c.createdAt,
            status: c.isBlocked,
            avatar: c.profilePicture,
            raw: c,
          }))
        );
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      // alert(err); // Consider using a Snackbar instead
    } finally {
      setLoading(false);
    }
  }, [paginationModel, search]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  /* ================= CRUD ACTIONS (USING API SERVICE) ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Irreversible: Delete candidate permanently?")) return;
    try {
      await adminCandidateService.delete(id);
      fetchCandidates();
    } catch (err) {
      alert(err);
    }
  };

  const handleBlockToggle = async (id) => {
    try {
      setActionLoading(id);
      await adminCandidateService.toggleBlock(id);
      fetchCandidates();
    } catch (err) {
      alert(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("🔥 CRITICAL: Delete ALL candidates in DB?")) return;
    try {
      await adminCandidateService.deleteAll();
      fetchCandidates();
    } catch (err) {
      alert(err);
    }
  };

  const openViewModal = (candidate) => {
    setSelected(candidate);
    setFormData({ ...candidate });
    setEditMode(false);
    setOpenView(true);
  };

  const handleSaveEdit = async () => {
    try {
      await adminCandidateService.update(selected._id, formData);
      setEditMode(false);
      setOpenView(false);
      fetchCandidates();
    } catch (err) {
      alert(err);
    }
  };

  /* ================= DATAGRID COLUMNS ================= */

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Candidate Name",
        flex: 1.2,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={row.avatar} sx={{ width: 32, height: 32 }}>{row.name?.charAt(0)}</Avatar>
            <Typography fontSize="0.9rem" fontWeight={500}>{row.name}</Typography>
          </Stack>
        ),
      },
      { field: "email", headerName: "Email Address", flex: 1 },
      { field: "mobile", headerName: "Mobile", flex: 0.8 },
      {
        field: "verification",
        headerName: "Verified",
        flex: 0.8,
        renderCell: ({ value }) => (
          <Chip
            variant="outlined"
            label={value ? "Verified" : "Pending"}
            color={value ? "success" : "warning"}
            size="small"
          />
        ),
      },
      {
        field: "status",
        headerName: "Account Status",
        flex: 0.8,
        renderCell: ({ value }) => (
          <Chip
            label={value ? "Blocked" : "Active"}
            color={value ? "error" : "primary"}
            size="small"
          />
        ),
      },
      {
        field: "actions",
        headerName: "Control Panel",
        flex: 1.2,
        sortable: false,
        renderCell: ({ row }) => {
          const isBlocked = row.status;
          const isLoading = actionLoading === row.id;

          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="View Profile">
                <IconButton color="info" size="small" onClick={() => openViewModal(row.raw)}>
                  <VisibilityOutlined fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={isBlocked ? "Re-activate Account" : "Suspend Account"}>
                <IconButton
                  color={isBlocked ? "success" : "warning"}
                  size="small"
                  onClick={() => handleBlockToggle(row.id)}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={16} /> : <BlockOutlined fontSize="small" />}
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem />

              <Tooltip title="Permanent Wipe">
                <IconButton color="error" size="small" onClick={() => handleDelete(row.id)}>
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [actionLoading]
  );

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="900" mb={4} color="primary.main">
        👥 CANDIDATE MANAGEMENT
      </Typography>

      {/* 🚀 TOOLBAR */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Name, Email, or Mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ bgcolor: "" }}
            />
          </Grid>
          <Grid item xs={12} md={6} display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={fetchCandidates}
              size="small"
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              disableElevation
              color="error"
              startIcon={<DeleteSweepOutlined />}
              onClick={handleDeleteAll}
              size="small"
            >
              Bulk Wipe
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 📊 DATA TABLE */}
      <Box height="65vh">
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={totalRows}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{
            "& .MuiDataGrid-columnHeaders": { bgcolor: "", borderRadius: 0 },
            "& .MuiDataGrid-footerContainer": { borderTop: "1px solid" }
          }}
        />
      </Box>

      {/* 🖊️ MODAL DIALOG */}
      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editMode ? "✍️ EDIT PROFILE" : "👤 CANDIDATE PROFILE"}
          {!editMode && (
            <IconButton sx={{ float: "right" }} onClick={() => setEditMode(true)}>
              <EditOutlined color="primary" />
            </IconButton>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 1 }}>
          <Stack spacing={2.5}>
            <TextField fullWidth label="Full Name" value={formData.canname || ""} disabled={!editMode} onChange={(e) => setFormData({ ...formData, canname: e.target.value })} />
            <TextField fullWidth label="Email ID" value={formData.canemail || ""} disabled={!editMode} onChange={(e) => setFormData({ ...formData, canemail: e.target.value })} />
            <TextField fullWidth label="Phone Number" value={formData.canphone || ""} disabled={!editMode} onChange={(e) => setFormData({ ...formData, canphone: e.target.value })} />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isVerified || false}
                  disabled={!editMode}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                />
              }
              label={<Typography fontWeight={600}>Verified Profile</Typography>}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {editMode ? (
            <>
              <Button onClick={() => setEditMode(false)}>Discard</Button>
              <Button variant="contained" disableElevation onClick={handleSaveEdit}>Save Updates</Button>
            </>
          ) : (
            <Button variant="outlined" onClick={() => setOpenView(false)}>Dismiss</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCandidates;