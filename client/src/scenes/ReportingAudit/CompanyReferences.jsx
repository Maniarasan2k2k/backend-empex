import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import apiClient from "../../api/apiClient";

/* =========================
   PAGE ANIMATION
========================= */
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const Reports = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openView, setOpenView] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiClient.get("/admin/jobs");

      const jobs = res.data || (Array.isArray(res) ? res : []);

      const formatted = jobs.map((job, index) => ({
        id: job._id || index,
        empname: job.postedBy?.empname || "-",
        empemail: job.postedBy?.empemail || "-",
        cmpName: job.cmpName || "-",
        jobTit: job.jobTit || "-",
        jobTyp: job.jobTyp || "-",
        jobMod: job.jobMod || "-",
        jobCity: job.jobCity || "-",
        salary:
          job.salTyp === "Unpaid"
            ? "Unpaid"
            : `₹${job.salMin || 0} - ₹${job.salMax || 0}`,
        openings: job.openings || 0,
        contactName: job.contactName || "-",
        contactPhone: job.contactPhone || "-",
        createdAt: job.createdAt
          ? new Date(job.createdAt).toISOString().split("T")[0]
          : "-",
        deadline: job.deadline
          ? new Date(job.deadline).toISOString().split("T")[0]
          : "-",
      }));

      setRows(formatted);
      setFilteredRows(formatted);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "API Fetch Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DATE FILTER
  ========================= */
  const handleFilter = () => {
    if (!startDate || !endDate) return;

    const filtered = rows.filter((row) => {
      if (row.createdAt === "-") return false;
      return row.createdAt >= startDate && row.createdAt <= endDate;
    });

    setFilteredRows(filtered);
  };

  const resetFilter = () => {
    setFilteredRows(rows);
    setStartDate("");
    setEndDate("");
  };

  /* =========================
     SUMMARY TOTALS
  ========================= */
  const totalJobs = filteredRows.length;

  const totalCompanies = [
    ...new Set(filteredRows.map((row) => row.cmpName)),
  ].length;

  const totalOpenings = filteredRows.reduce(
    (sum, row) => sum + (row.openings || 0),
    0
  );

  const totalEmployees = [
    ...new Set(filteredRows.map((row) => row.empemail)),
  ].length;

  /* =========================
     TABLE COLUMNS
  ========================= */
  const columns = useMemo(
    () => [
      { field: "empname", headerName: "Employee Name", flex: 1 },
      { field: "empemail", headerName: "Employee Email", flex: 1 },
      { field: "cmpName", headerName: "Company Name", flex: 1 },
      { field: "jobTit", headerName: "Job Title", flex: 1 },
      { field: "jobTyp", headerName: "Job Type", flex: 1 },
      { field: "jobMod", headerName: "Job Mode", flex: 1 },
      { field: "jobCity", headerName: "City", flex: 1 },
      { field: "salary", headerName: "Salary", flex: 1 },
      { field: "openings", headerName: "Openings", flex: 0.7 },
      { field: "contactName", headerName: "Contact Person", flex: 1 },
      { field: "contactPhone", headerName: "Contact Phone", flex: 1 },
      { field: "createdAt", headerName: "Posted Date", flex: 1 },
      { field: "deadline", headerName: "Deadline", flex: 1 },
    ],
    []
  );

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.4 }}
      >
        <Box p={4}>
          <Typography variant="h4" fontWeight={700} mb={3}>
            Company Reference Report
          </Typography>

          {/* ================= SUMMARY CARDS ================= */}
          <Grid container spacing={3} mb={4}>
            {[
              { label: "Total Jobs", value: totalJobs },
              { label: "Total Companies", value: totalCompanies },
              { label: "Total Openings", value: totalOpenings },
              { label: "Total Employees Posted", value: totalEmployees },
            ].map((item, index) => (
              <Grid item xs={12} md={3} key={index}>
                <Card elevation={4} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6">
                      {item.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* ================= FILTER ================= */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Button variant="contained" onClick={handleFilter}>
                Apply Filter
              </Button>
              <Button variant="outlined" onClick={resetFilter}>
                Reset
              </Button>
            </Box>
          </Paper>

          {error && <Alert severity="error">{error}</Alert>}

          {/* ================= TABLE ================= */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            {loading ? (
              <Box textAlign="center" py={5}>
                <CircularProgress />
              </Box>
            ) : (
              <Box height={520}>
                <DataGrid
                  rows={filteredRows}
                  columns={columns}
                  pageSizeOptions={[5, 10, 20]}
                  disableRowSelectionOnClick
                />
              </Box>
            )}
          </Paper>
        </Box>
      </motion.div>

      {/* ================= VIEW DIALOG ================= */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Details</DialogTitle>
        <DialogContent dividers>
          {selectedRow &&
            Object.entries(selectedRow).map(([key, value]) => (
              <Typography key={key} mb={1}>
                <strong>{key}:</strong> {String(value)}
              </Typography>
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Reports;
