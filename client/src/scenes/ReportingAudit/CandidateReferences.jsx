import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../api/apiClient";

/* =========================
   PAGE ANIMATION
========================= */
const pageVariants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

const Reports = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openView, setOpenView] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

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

      const [applicationsRes, profilesRes] = await Promise.all([
        apiClient.get("/admin/applications"),
        apiClient.get("/admin/candidate-profiles"),
      ]);

      const applications = Array.isArray(applicationsRes.data)
        ? applicationsRes.data
        : (Array.isArray(applicationsRes) ? applicationsRes : []);

      const profiles = Array.isArray(profilesRes.data)
        ? profilesRes.data
        : (Array.isArray(profilesRes) ? profilesRes : []);

      const mergedData = profiles.map((profile) => {
        const candidateApplications = applications.filter(
          (app) => app?.candidateId?._id === profile._id
        );

        const latestEducation = profile.education?.[0] || {};

        return {
          id: profile._id,
          collegeName: latestEducation.caneduIns || "-",
          candidateName: profile.personal?.canname || "-",
          mobile: profile.personal?.canphone || "-",
          degree: latestEducation.caneduCrs || "-",
          passedOutYear: latestEducation.caneduYr || "-",
          appliedJobs: candidateApplications.length > 0 ? "Yes" : "No",
          shortlisted: candidateApplications.some(
            (app) => app.status === "Shortlisted"
          ),
          hired: candidateApplications.some(
            (app) => app.status === "Hired"
          ),
          interviewScheduled: candidateApplications.some(
            (app) => app.status === "Interview Scheduled"
          ),
          createdAt:
            candidateApplications[0]?.createdAt || profile.createdAt,
        };
      });

      setCandidates(mergedData);
      setFilteredCandidates(mergedData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch candidate data"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DATE FILTER FUNCTION
  ========================= */
  const handleFilter = () => {
    if (!startDate || !endDate) return;

    const filtered = candidates.filter((candidate) => {
      const created = new Date(candidate.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      return created >= start && created <= end;
    });

    setFilteredCandidates(filtered);
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setFilteredCandidates(candidates);
  };

  /* =========================
     SUMMARY COUNTS
  ========================= */
  const totalCandidates = filteredCandidates.length;
  const shortlistedCount = filteredCandidates.filter(
    (c) => c.shortlisted
  ).length;
  const hiredCount = filteredCandidates.filter((c) => c.hired).length;
  const interviewCount = filteredCandidates.filter(
    (c) => c.interviewScheduled
  ).length;

  /* =========================
     TABLE COLUMNS
  ========================= */
  const columns = useMemo(
    () => [
      { field: "collegeName", headerName: "College", flex: 1.2 },
      { field: "candidateName", headerName: "Candidate Name", flex: 1 },
      { field: "mobile", headerName: "Mobile", flex: 1 },
      { field: "degree", headerName: "Course", flex: 1 },
      { field: "passedOutYear", headerName: "Year", flex: 0.8 },
      {
        field: "shortlisted",
        headerName: "Shortlisted",
        flex: 1,
        renderCell: (params) =>
          params.value ? (
            <Chip label="Yes" color="warning" size="small" />
          ) : (
            <Chip label="No" size="small" />
          ),
      },
      {
        field: "hired",
        headerName: "Hired",
        flex: 1,
        renderCell: (params) =>
          params.value ? (
            <Chip label="Yes" color="success" size="small" />
          ) : (
            <Chip label="No" size="small" />
          ),
      },
      {
        field: "interviewScheduled",
        headerName: "Interview",
        flex: 1,
        renderCell: (params) =>
          params.value ? (
            <Chip label="Scheduled" color="info" size="small" />
          ) : (
            <Chip label="No" size="small" />
          ),
      },
      {
        field: "actions",
        headerName: "View",
        flex: 0.8,
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => {
              setSelectedCandidate(params.row);
              setOpenView(true);
            }}
          >
            View
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Box p={4}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Candidate Wise Reference Report
        </Typography>

        {/* ================= SUMMARY CARDS ================= */}
        <Grid container spacing={3} mb={4}>
          {[
            { label: "Total", value: totalCandidates },
            { label: "Shortlisted", value: shortlistedCount },
            { label: "Hired", value: hiredCount },
            { label: "Interview Scheduled", value: interviewCount },
          ].map((item, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6">{item.label}</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ================= DATE FILTER ================= */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                label="Start Date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                label="End Date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                sx={{ mr: 2 }}
                onClick={handleFilter}
              >
                Apply Filter
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={handleClearFilter}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= TABLE ================= */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {loading ? (
            <Box textAlign="center" py={5}>
              <CircularProgress />
            </Box>
          ) : (
            <Box height={520}>
              <DataGrid
                rows={filteredCandidates}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                sx={{ border: "none" }}
              />
            </Box>
          )}
        </Paper>
      </Box>

      {/* ================= VIEW DIALOG ================= */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Candidate Details</DialogTitle>
        <DialogContent dividers>
          {selectedCandidate &&
            Object.entries(selectedCandidate).map(([key, value]) => (
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
