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
      console.error("API ERROR:", err);
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
     SUMMARY
  ========================= */
  const totalCandidates = filteredCandidates.length;
  const shortlistedCount = filteredCandidates.filter(
    (c) => c.shortlisted
  ).length;
  const hiredCount = filteredCandidates.filter((c) => c.hired).length;

  /* =========================
     VIEW
  ========================= */
  const handleView = (row) => {
    setSelectedCandidate(row);
    setOpenView(true);
  };

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
      { field: "appliedJobs", headerName: "Applied", flex: 0.7 },
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
        flex: 0.7,
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => handleView(params.row)}
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
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            College Wise Candidate Report
          </Typography>

          <Box>
            <Button
              variant="outlined"
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((prev) => prev - 1)}
              sx={{ mr: 1 }}
            >
              ⬅ Previous
            </Button>

            <Button
              variant="contained"
              disabled={pageIndex === 1}
              onClick={() => setPageIndex((prev) => prev + 1)}
            >
              Next ➡
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <AnimatePresence mode="wait">
          <motion.div
            key={pageIndex}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
          >
            {pageIndex === 0 ? (
              <>
                {/* SUMMARY */}
                <Grid container spacing={3} mb={4}>
                  {[
                    { label: "Total Candidates", value: totalCandidates },
                    { label: "Shortlisted", value: shortlistedCount },
                    { label: "Hired", value: hiredCount },
                  ].map((item, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {item.value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* TABLE */}
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
              </>
            ) : (
              <Paper sx={{ p: 5, borderRadius: 3, textAlign: "center" }}>
                <Typography variant="h4" fontWeight={700} mb={3}>
                  Analytics Overview
                </Typography>

                <Typography variant="h6" mb={2}>
                  Total Candidates: {totalCandidates}
                </Typography>

                <Typography variant="h6" mb={2}>
                  Shortlisted: {shortlistedCount}
                </Typography>

                <Typography variant="h6">
                  Hired: {hiredCount}
                </Typography>
              </Paper>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* VIEW DIALOG */}
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
