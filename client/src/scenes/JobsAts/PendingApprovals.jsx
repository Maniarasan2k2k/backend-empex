import React, { useEffect, useMemo, useState } from "react";
import axios from "state/instant";
import {
  Box,
  Button,
  IconButton,
  Typography,
  TextField,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Tooltip,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutline,
  VisibilityOffOutlined,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* =========================
     FETCH JOBS
  ========================= */
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/jobs");
      setJobs(res.data?.data || []);
    } catch {
      setSnack({
        open: true,
        message: "Failed to load jobs",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  /* =========================
     OPEN VIEW
  ========================= */
  const openView = (job) => {
    setSelectedJob(job);
    setFormData(job);
    setEditMode(false);
    setViewOpen(true);
  };

  /* =========================
     SAVE UPDATE
  ========================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`/admin/jobs/${selectedJob._id}`, formData);
      fetchJobs();
      setEditMode(false);
      setSnack({
        open: true,
        message: "Job updated successfully",
        severity: "success",
      });
    } catch {
      setSnack({
        open: true,
        message: "Update failed",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     DELETE JOB (Permanent)
  ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?"))
      return;

    try {
      await axios.delete(`/admin/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      setSnack({
        open: true,
        message: "Job deleted permanently",
        severity: "success",
      });
    } catch {
      setSnack({
        open: true,
        message: "Delete failed",
        severity: "error",
      });
    }
  };

  /* =========================
     HIDE/UNHIDE JOB
  ========================= */
  const handleToggleVisibility = async (id, isCurrentlyHidden) => {
    const action = isCurrentlyHidden ? "unhide" : "hide";
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this job?`))
      return;

    try {
      const res = await axios.patch(`/admin/jobs/${id}/hide`);
      
      // Update the job in state with the new isHidden value
      setJobs((prev) =>
        prev.map((j) =>
          j._id === id ? { ...j, isHidden: res.data?.data?.isHidden } : j
        )
      );

      setSnack({
        open: true,
        message: `Job ${action}d successfully`,
        severity: "success",
      });
    } catch (error) {
      setSnack({
        open: true,
        message: error?.response?.data?.message || `${action} failed`,
        severity: "error",
      });
    }
  };

  /* =========================
     TABLE COLUMNS
  ========================= */
  const columns = useMemo(
    () => [
      { field: "jobTit", headerName: "Job Name", flex: 1.5 },
      { field: "cmpName", headerName: "Company", flex: 1.5 },
      { field: "jobTyp", headerName: "Type", flex: 1 },
      { field: "jobMod", headerName: "Work Mode", flex: 1 },
      { field: "jobDist", headerName: "District", flex: 1 },
      { field: "contactName", headerName: "Contact", flex: 1.2 },
      { field: "contactPhone", headerName: "Mobile", flex: 1 },
      {
        field: "createdAt",
        headerName: "Created",
        flex: 1.2,
        renderCell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "-",
      },
      {
        field: "deadline",
        headerName: "Closing",
        flex: 1.2,
        renderCell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "-",
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1.3,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <IconButton size="small" onClick={() => openView(row)}>
                <VisibilityOutlined />
              </IconButton>
            </Tooltip>

            <Tooltip title={row.isHidden ? "Unhide Job" : "Hide Job"}>
              <IconButton
                size="small"
                color={row.isHidden ? "success" : "warning"}
                onClick={() => handleToggleVisibility(row._id, row.isHidden)}
              >
                {row.isHidden ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Permanently">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(row._id)}
              >
                <DeleteOutline />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    []
  );

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Job Management
      </Typography>

      <Paper elevation={3}>
        <Box height="70vh">
          <DataGrid
            rows={jobs}
            columns={columns}
            getRowId={(row) => row._id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            getRowClassName={(params) =>
              params.row.isHidden ? "hidden-row" : ""
            }
            sx={{
              "& .hidden-row": {
                opacity: 0.5,
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              },
            }}
          />
        </Box>
      </Paper>

      {/* VIEW / EDIT DIALOG */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={600}>Job Details</Typography>
            {!editMode && (
              <IconButton onClick={() => setEditMode(true)}>
                <EditOutlined />
              </IconButton>
            )}
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Grid container spacing={2} mt={1}>
            {[
              ["Job Name", "jobTit"],
              ["Company Name", "cmpName"],
              ["Job Type", "jobTyp"],
              ["Work Mode", "jobMod"],
              ["District", "jobDist"],
              ["Contact Person", "contactName"],
              ["Mobile Number", "contactPhone"],
            ].map(([label, field]) => (
              <Grid item xs={12} sm={6} key={field}>
                <TextField
                  label={label}
                  fullWidth
                  value={formData[field] || ""}
                  disabled={!editMode}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions>
          {editMode ? (
            <>
              <Button startIcon={<CloseOutlined />} onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveOutlined />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setViewOpen(false)}>Close</Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminJobs;
