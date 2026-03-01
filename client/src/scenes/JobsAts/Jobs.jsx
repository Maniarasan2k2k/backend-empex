import React, { useEffect, useMemo, useState } from "react";
import axios from "state/instant";
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Link
} from "@mui/material";
import {
  VisibilityOutlined,
  DeleteOutlined,
  CheckCircleOutline,
  CancelOutlined,
  LockOutlined,
  OpenInNew
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

/* =========================
   STATUS CONFIG (backend values only)
========================= */
const STATUS_COLORS = {
  ACTIVE: "success",
  PENDING: "warning",
  CLOSED: "default",
  REJECTED: "error",
};

const GovJobsAdmin = () => {
  /* =========================
     STATES
  ========================= */
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const [viewJob, setViewJob] = useState(null);

  /* =========================
     FETCH JOBS (backend-driven)
  ========================= */
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/gov-jobs", {
        params: {
          search,
          status,
          category,
        },
      });
      setJobs(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, status, category]);

  /* =========================
     ACTIONS
  ========================= */
  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/admin/gov-jobs/${id}/status`, { status });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Govt Job?")) return;
    try {
      await axios.delete(`/admin/gov-jobs/${id}`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  /* =========================
     TABLE COLUMNS
  ========================= */
  const columns = useMemo(() => [
    {
      field: "jobTit",
      headerName: "Job",
      flex: 1.6,
      renderCell: ({ row }) => (
        <Stack>
          <Typography fontWeight={600}>{row.jobTit}</Typography>
          <Typography fontSize="0.75rem" color="text.secondary">
            {row.jobCity}, {row.jobState}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "jobCat",
      headerName: "Category",
      flex: 0.8,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      renderCell: ({ value }) => (
        <Chip size="small" label={value} color={STATUS_COLORS[value]} />
      ),
    },
    {
      field: "deadline",
      headerName: "Deadline",
      flex: 0.8,
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleDateString() : "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.2,
      sortable: false,
      renderCell: ({ row }) => (
        <>
          <IconButton onClick={() => setViewJob(row)}>
            <VisibilityOutlined />
          </IconButton>

          {row.status === "PENDING" && (
            <>
              <IconButton
                color="success"
                onClick={() => updateStatus(row._id, "ACTIVE")}
              >
                <CheckCircleOutline />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => updateStatus(row._id, "REJECTED")}
              >
                <CancelOutlined />
              </IconButton>
            </>
          )}

          {row.status === "ACTIVE" && (
            <IconButton
              onClick={() => updateStatus(row._id, "CLOSED")}
            >
              <LockOutlined />
            </IconButton>
          )}

          <IconButton
            color="error"
            onClick={() => deleteJob(row._id)}
          >
            <DeleteOutlined />
          </IconButton>
        </>
      ),
    },
  ], []);

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt="4rem">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      {/* ===== HEADER ===== */}
      <Typography variant="h4" fontWeight={600} mb={2}>
        Govt Jobs Admin Panel
      </Typography>

      {/* ===== FILTERS ===== */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" gap={2}>
          <TextField
            size="small"
            label="Search Job"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <TextField
            size="small"
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ width: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.keys(STATUS_COLORS).map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ width: 220 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Central Government">Central Government</MenuItem>
            <MenuItem value="State Government">State Government</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* ===== TABLE ===== */}
      <Box height="65vh">
        <DataGrid
          rows={jobs}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={10}
          rowsPerPageOptions={[10, 20]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* =========================
          VIEW DIALOG
      ========================= */}
      <Dialog
        open={Boolean(viewJob)}
        onClose={() => setViewJob(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Govt Job Details</DialogTitle>
        <Divider />

        {viewJob && (
          <DialogContent>
            <Stack spacing={1.5}>
              <Typography variant="h6">{viewJob.jobTit}</Typography>
              <Typography color="text.secondary">
                {viewJob.jobCity}, {viewJob.jobDist}, {viewJob.jobState}
              </Typography>

              <Divider />

              <Typography><b>Category:</b> {viewJob.jobCat}</Typography>
              <Typography><b>Status:</b> {viewJob.status}</Typography>
              <Typography>
                <b>Deadline:</b>{" "}
                {new Date(viewJob.deadline).toLocaleDateString()}
              </Typography>
              <Typography><b>Views:</b> {viewJob.views}</Typography>

              <Divider />

              <Typography><b>Description:</b></Typography>
              <Typography fontSize="0.9rem">
                {viewJob.jobDesc || "No description provided"}
              </Typography>

              <Typography>
                <b>Required Degrees:</b>{" "}
                {viewJob.reqDegrees?.length
                  ? viewJob.reqDegrees.join(", ")
                  : "Not specified"}
              </Typography>

              <Divider />

              {viewJob.officialLink && (
                <Link href={viewJob.officialLink} target="_blank">
                  Official Website <OpenInNew fontSize="small" />
                </Link>
              )}

              {viewJob.notificationLink && (
                <Link href={viewJob.notificationLink} target="_blank">
                  Notification PDF <OpenInNew fontSize="small" />
                </Link>
              )}

              <Divider />

              <Typography>
                <b>Posted By:</b> {viewJob.postedBy?.name || "Admin"}
              </Typography>
              <Typography>
                <b>Posted On:</b>{" "}
                {new Date(viewJob.createdAt).toLocaleDateString()}
              </Typography>
            </Stack>
          </DialogContent>
        )}

        <DialogActions>
          <Button onClick={() => setViewJob(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GovJobsAdmin;
