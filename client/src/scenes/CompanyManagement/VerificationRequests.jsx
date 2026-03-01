import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Drawer,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Divider,
  Tooltip,
  TextField,
  MenuItem,
} from "@mui/material";

import {
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";

import axiosInstance from "state/instant";

/* ================= STATUS CHIP ================= */

const StatusChip = ({ status }) => {
  const colorMap = {
    DRAFT: "warning",
    PUBLISHED: "success",
    CANCELLED: "error",
  };
  return (
    <Chip
      size="small"
      label={status}
      color={colorMap[status] || "default"}
      variant="outlined"
    />
  );
};

const statusOptions = ["DRAFT", "PUBLISHED", "CANCELLED"];

const AdminSkillTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedTraining, setSelectedTraining] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [editForm, setEditForm] = useState({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* ================= FETCH ================= */

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/skill-trainings");
      if (res?.data?.success) {
        setTrainings(res.data.data || []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch trainings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  /* ================= STATS ================= */

  const stats = useMemo(() => ({
    total: trainings.length,
    published: trainings.filter(t => t.status === "PUBLISHED").length,
    draft: trainings.filter(t => t.status === "DRAFT").length,
    cancelled: trainings.filter(t => t.status === "CANCELLED").length,
  }), [trainings]);

  /* ================= ACTIONS ================= */

  const handleView = (row) => {
    setSelectedTraining(row);
    setViewOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedTraining(row);
    setEditForm({
      title: row.title,
      category: row.category,
      price: row.price || 0,
      maxSeats: row.maxSeats || 0,
      durationMinutes: row.durationMinutes || 0,
      status: row.status,
    });
    setEditOpen(true);
  };

  const handleDelete = (row) => {
    setSelectedTraining(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/admin/skill-trainings/${selectedTraining._id}`);
      setSnackbar({ open: true, message: "Deleted successfully", severity: "success" });
      fetchTrainings();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Delete failed",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setActionLoading(true);

      await axiosInstance.patch(
        `/admin/skill-trainings/${selectedTraining._id}`,
        editForm
      );

      setSnackbar({
        open: true,
        message: "Training updated successfully",
        severity: "success",
      });

      setEditOpen(false);
      fetchTrainings();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Update failed",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ================= UI ================= */

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Skill Training Management
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {/* ================= SUMMARY CARDS ================= */}
      <Grid container spacing={3} mb={4}>
        {Object.entries(stats).map(([key, value]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Card elevation={2}>
              <CardContent>
                <Typography fontSize={14} color="text.secondary">
                  {key.toUpperCase()}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ================= TABLE ================= */}

      <Paper elevation={2}>
        {loading ? (
          <Box textAlign="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><b>Title</b></TableCell>
                  <TableCell><b>Category</b></TableCell>
                  <TableCell><b>Date</b></TableCell>
                  <TableCell><b>Price</b></TableCell>
                  <TableCell><b>Seats</b></TableCell>
                  <TableCell><b>Enrolled</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell align="right"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {trainings.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      {row.date ? new Date(row.date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      {row.isFree ? "Free" : `₹${row.price}`}
                    </TableCell>
                    <TableCell>{row.maxSeats}</TableCell>
                    <TableCell>{row.enrolledCount || 0}</TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="View">
                          <IconButton onClick={() => handleView(row)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(row)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDelete(row)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {!trainings.length && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No Skill Trainings Available
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ================= EDIT DRAWER ================= */}

      <Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)}>
        <Box width={450} p={4}>
          <Typography variant="h6" mb={2}>Edit Training</Typography>

          <Stack spacing={2}>
            <TextField
              label="Title"
              value={editForm.title || ""}
              onChange={(e) => handleEditChange("title", e.target.value)}
              fullWidth
            />

            <TextField
              label="Category"
              value={editForm.category || ""}
              onChange={(e) => handleEditChange("category", e.target.value)}
              fullWidth
            />

            <TextField
              label="Price"
              type="number"
              value={editForm.price || 0}
              onChange={(e) => handleEditChange("price", e.target.value)}
              fullWidth
            />

            <TextField
              label="Max Seats"
              type="number"
              value={editForm.maxSeats || 0}
              onChange={(e) => handleEditChange("maxSeats", e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Status"
              value={editForm.status || ""}
              onChange={(e) => handleEditChange("status", e.target.value)}
              fullWidth
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              onClick={handleSaveEdit}
              disabled={actionLoading}
            >
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* DELETE DIALOG */}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSkillTraining;