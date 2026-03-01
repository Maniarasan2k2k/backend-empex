import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import { VisibilityOutlined, EditOutlined, DeleteOutlined } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

// =========================
// ATS STAGES ENUM
// =========================
export const ATS_STAGES = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

// =========================
// MOCK ATS PIPELINE DATA (API READY)
// =========================
const atsData = [
  {
    id: 1,
    candidate: "Ramesh Kumar",
    email: "ramesh@gmail.com",
    jobTitle: "Frontend Developer",
    company: "Zoho Corporation",
    stage: ATS_STAGES.APPLIED,
    updatedAt: "2025-11-01",
  },
  {
    id: 2,
    candidate: "Divya HR",
    email: "divya@company.com",
    jobTitle: "Backend Engineer",
    company: "Freshworks",
    stage: ATS_STAGES.INTERVIEW,
    updatedAt: "2025-11-05",
  },
  {
    id: 3,
    candidate: "Arun Dev",
    email: "arun@gmail.com",
    jobTitle: "UI/UX Designer",
    company: "Infosys",
    stage: ATS_STAGES.SCREENING,
    updatedAt: "2025-10-20",
  },
];

// =========================
// ATS PIPELINE PAGE
// =========================
const ATS = () => {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  /* =========================
     HANDLERS
  ========================= */
  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setViewOpen(true);
  };
  const handleMoveStage = (candidate) => console.log("Move Stage:", candidate);
  const handleRejectCandidate = (candidate) => console.log("Reject Candidate:", candidate);
  const handleCloseDialog = () => {
    setSelectedCandidate(null);
    setViewOpen(false);
  };

  /* =========================
     TABLE COLUMNS
  ========================= */
  const columns = useMemo(
    () => [
      {
        field: "candidate",
        headerName: "Candidate",
        flex: 1.2,
        renderCell: ({ row }) => (
          <Stack>
            <Typography fontWeight={600}>{row.candidate}</Typography>
            <Typography fontSize="0.75rem" color="text.secondary">
              {row.email}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "jobTitle",
        headerName: "Job Applied",
        flex: 1,
        renderCell: ({ row }) => (
          <Stack>
            <Typography fontWeight={600}>{row.jobTitle}</Typography>
            <Typography fontSize="0.75rem" color="text.secondary">
              {row.company}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "stage",
        headerName: "Current Stage",
        flex: 0.8,
        renderCell: ({ value }) => {
          let color;
          switch (value) {
            case ATS_STAGES.APPLIED:
              color = "warning";
              break;
            case ATS_STAGES.SCREENING:
              color = "info";
              break;
            case ATS_STAGES.INTERVIEW:
              color = "primary";
              break;
            case ATS_STAGES.OFFER:
              color = "success";
              break;
            case ATS_STAGES.HIRED:
              color = "success";
              break;
            case ATS_STAGES.REJECTED:
              color = "error";
              break;
            default:
              color = "default";
          }
          return <Chip label={value} size="small" color={color} />;
        },
      },
      { field: "updatedAt", headerName: "Last Updated", flex: 0.8 },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        sortable: false,
        renderCell: ({ row }) => (
          <Box>
            <IconButton size="small" color="primary" onClick={() => handleViewCandidate(row)}>
              <VisibilityOutlined />
            </IconButton>
            <IconButton size="small" color="info" onClick={() => handleMoveStage(row)}>
              <EditOutlined />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleRejectCandidate(row)}>
              <DeleteOutlined />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  /* =========================
     FILTERED ATS PIPELINE
  ========================= */
  const filteredRows = useMemo(() => {
    return atsData.filter(
      (c) =>
        c.candidate.toLowerCase().includes(search.toLowerCase()) &&
        (stageFilter ? c.stage === stageFilter : true)
    );
  }, [search, stageFilter]);

  return (
    <Box p="1.5rem">
      {/* ===== HEADER ===== */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="1.5rem">
        <Typography variant="h4" fontWeight={600}>
          ATS Pipeline
        </Typography>
        <Button variant="outlined" sx={{ borderRadius: "8px" }}>
          Export Pipeline
        </Button>
      </Box>

      {/* ===== FILTER BAR ===== */}
      <Paper sx={{ p: "1rem", mb: "1rem" }}>
        <Box display="flex" gap="1rem" flexWrap="wrap">
          <TextField
            size="small"
            label="Search Candidate"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            size="small"
            select
            label="Stage"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            sx={{ width: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.values(ATS_STAGES).map((stage) => (
              <MenuItem key={stage} value={stage}>
                {stage}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* ===== TABLE ===== */}
      <Box height="65vh">
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20]}
          disableRowSelectionOnClick
          sx={{
            borderRadius: "10px",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#1f2a40",
              color: "#fff",
            },
          }}
        />
      </Box>

      {/* ===== VIEW CANDIDATE DIALOG ===== */}
      <Dialog open={viewOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Candidate Details</DialogTitle>
        <Divider />
        {selectedCandidate && (
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <Typography fontWeight={600} fontSize="1rem">
                {selectedCandidate.candidate}
              </Typography>
              <Typography color="text.secondary">{selectedCandidate.email}</Typography>
              <Divider />
              <Typography>
                <strong>Job Applied:</strong> {selectedCandidate.jobTitle}
              </Typography>
              <Typography>
                <strong>Company:</strong> {selectedCandidate.company}
              </Typography>
              <Typography>
                <strong>Current Stage:</strong> {selectedCandidate.stage}
              </Typography>
              <Typography>
                <strong>Last Updated:</strong> {selectedCandidate.updatedAt}
              </Typography>
            </Stack>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ATS;
