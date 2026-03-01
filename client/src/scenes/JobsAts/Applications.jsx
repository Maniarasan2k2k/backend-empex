import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "state/instant";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
    interviewMode: "",
    interviewTime: "",
  });

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* =========================
     FETCH APPLICATIONS
  ========================= */
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/admin/applications");
      if (data.success) setApplications(data.data);
    } catch (err) {
      setSnack({
        open: true,
        message: "Failed to fetch applications",
        severity: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  /* =========================
     VIEW - Fetch single application
  ========================= */
  const handleView = async (app) => {
    setLoadingView(true);
    try {
      const { data } = await axiosInstance.get(
        `/admin/applications/${app._id}`
      );
      if (data.success) {
        setSelectedApp(data.data);
        // Initialize form with fetched data
        setFormData({
          status: data.data.status || "",
          interviewMode: data.data.interviewMode || "",
          interviewTime: data.data.interviewTime || "",
        });
        setEditMode(false);
        setViewOpen(true);
      } else {
        setSnack({
          open: true,
          message: "Failed to load application",
          severity: "error",
        });
      }
    } catch (err) {
      setSnack({
        open: true,
        message: "Error loading application details",
        severity: "error",
      });
    }
    setLoadingView(false);
  };

  /* =========================
     EDIT MODE TOGGLE
  ========================= */
  const handleEditToggle = () => {
    if (!editMode) {
      // Entering edit mode - ensure formData is fresh
      setFormData({
        status: selectedApp?.status || "",
        interviewMode: selectedApp?.interviewMode || "",
        interviewTime: selectedApp?.interviewTime || "",
      });
    }
    setEditMode(!editMode);
  };

  const handleCancelEdit = () => {
    // Reset formData to selectedApp values when canceling
    setFormData({
      status: selectedApp?.status || "",
      interviewMode: selectedApp?.interviewMode || "",
      interviewTime: selectedApp?.interviewTime || "",
    });
    setEditMode(false);
  };

  /* =========================
     SAVE UPDATE
  ========================= */
  const handleSave = async () => {
    if (!selectedApp) return;

    try {
      const { data } = await axiosInstance.put(
        `/admin/applications/${selectedApp._id}`,
        {
          status: formData.status,
          interviewMode: formData.interviewMode,
          interviewTime: formData.interviewTime,
        }
      );

      if (data.success) {
        setSnack({
          open: true,
          message: "Application updated successfully",
          severity: "success",
        });

        // Update local state with returned data
        setSelectedApp(data.data);
        setFormData({
          status: data.data.status || "",
          interviewMode: data.data.interviewMode || "",
          interviewTime: data.data.interviewTime || "",
        });

        // Refresh list
        fetchApplications();
        setEditMode(false);
      } else {
        setSnack({
          open: true,
          message: data.message || "Update failed",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      setSnack({
        open: true,
        message: err.response?.data?.message || "Update failed",
        severity: "error",
      });
    }
  };

  /* =========================
     CLOSE DIALOG
  ========================= */
  const handleCloseDialog = () => {
    if (editMode) {
      handleCancelEdit();
    }
    setViewOpen(false);
  };

  /* =========================
     TABLE COLUMNS
  ========================= */
  const columns = useMemo(
    () => [
      {
        field: "candidateName",
        headerName: "Candidate Name",
        flex: 1.2,
        renderCell: ({ row }) =>
          row.candidateId?.canname || "—",
      },
      {
        field: "candidateEmail",
        headerName: "Email",
        flex: 1.4,
        renderCell: ({ row }) =>
          row.candidateId?.canemail || "—",
      },
      {
        field: "jobId",
        headerName: "Job ID",
        flex: 1.2,
        renderCell: ({ row }) =>
          row.jobId?._id || row.jobId || "—",
      },
      {
        field: "interviewMode",
        headerName: "Interview Mode",
        flex: 1,
      },
      {
        field: "interviewTime",
        headerName: "Interview Time",
        flex: 1,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.status}
            color="primary"
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.8,
        sortable: false,
        renderCell: ({ row }) => (
          <Tooltip title="View">
            <IconButton
              onClick={() => handleView(row)}
              disabled={loadingView}
            >
              <VisibilityOutlined />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [loadingView]
  );

  return (
    <Box p="1.5rem">
      <Typography
        variant="h4"
        fontWeight={600}
        mb={2}
      >
        Job Applications
      </Typography>

      <Paper elevation={3}>
        <Box height="65vh">
          <DataGrid
            rows={applications}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
          />
        </Box>
      </Paper>

      {/* VIEW / EDIT DIALOG */}
      <Dialog
        open={viewOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontWeight={600}>
              Application Details
            </Typography>
            {!editMode && (
              <IconButton
                onClick={handleEditToggle}
                disabled={loadingView}
              >
                <EditOutlined />
              </IconButton>
            )}
          </Stack>
        </DialogTitle>

        <Divider />

        {loadingView ? (
          <DialogContent sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </DialogContent>
        ) : selectedApp ? (
          <DialogContent>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Candidate Name"
                  fullWidth
                  value={
                    selectedApp.candidateId
                      ?.canname || ""
                  }
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  fullWidth
                  value={
                    selectedApp.candidateId
                      ?.canemail || ""
                  }
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Job ID"
                  fullWidth
                  value={
                    selectedApp.jobId?._id ||
                    selectedApp.jobId || ""
                  }
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Interview Mode"
                  fullWidth
                  select
                  disabled={!editMode}
                  value={formData.interviewMode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interviewMode: e.target.value,
                    })
                  }
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Virtual">
                    Virtual
                  </MenuItem>
                  <MenuItem value="Offline">
                    Offline
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Interview Time"
                  type="time"
                  fullWidth
                  disabled={!editMode}
                  value={formData.interviewTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interviewTime: e.target.value,
                    })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Status"
                  fullWidth
                  select
                  disabled={!editMode}
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                >
                  {[
                    "Applied",
                    "Viewed",
                    "Shortlisted",
                    "Interview Scheduled",
                    "Selected",
                    "Rejected",
                    "Hired",
                  ].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
        ) : null}

        <DialogActions>
          {editMode ? (
            <>
              <Button
                startIcon={<CloseOutlined />}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveOutlined />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleCloseDialog}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnack({
            ...snack,
            open: false,
          })
        }
      >
        <Alert
          severity={snack.severity}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Applications;
