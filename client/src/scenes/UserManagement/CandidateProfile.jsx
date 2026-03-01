import React, { useEffect, useState, useMemo } from "react";
import axios from "state/instant";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

/* ===============================
   STATUS CHIP
================================ */
const JobStatusChip = ({ status }) => {
  const map = {
    "Actively Looking": "success",
    "Open to Offers": "info",
    "Not Looking": "default",
  };
  return (
    <Chip size="small" label={status || "N/A"} color={map[status] || "default"} />
  );
};

/* ===============================
   MAIN COMPONENT
================================ */
const AdminCandidateProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewProfile, setViewProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  /* ===============================
     FETCH PROFILES
  =================================*/
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/candidate-profiles", {
        params: {
          search,
          jobSearchStatus: statusFilter || undefined,
        },
      });

      setProfiles(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load candidate profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [statusFilter]);

  /* ===============================
     PROCESS DATA
  =================================*/
  const processedProfiles = profiles.map((p) => {
  const latestEdu =
    p.education?.length > 0
      ? p.education[p.education.length - 1]
      : null;

  return {
    ...p,
    mobile: p.personal?.canphone || "N/A",
    college: latestEdu?.caneduIns || "N/A",

    // ✅ FIXED COURSE FIELD
    course: latestEdu?.caneduCrs || "N/A",

    qualification: latestEdu?.caneduQual || "N/A",

    skillsList:
      p.skills?.map((s) => s.canskicou).join(", ") || "N/A",
  };
});


  /* ===============================
     SAVE EDIT
  =================================*/
  const handleSave = async () => {
    try {
      await axios.put(
        `/admin/candidate-profiles/${viewProfile._id}`,
        formData
      );

      setEditMode(false);
      setViewProfile(null);
      fetchProfiles();
    } catch {
      alert("Update failed");
    }
  };

  /* ===============================
     TABLE COLUMNS
  =================================*/
  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Candidate",
        flex: 1.5,
        renderCell: ({ row }) => (
          <Stack spacing={0.3}>
            <Typography fontWeight={600}>
              {row.personal?.canname || "N/A"}
            </Typography>
            <Typography fontSize="0.75rem" color="text.secondary">
              {row.personal?.canemail}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "mobile",
        headerName: "Mobile Number",
        flex: 1.2,
      },
      {
        field: "college",
        headerName: "College",
        flex: 1.5,
      },
      {
        field: "course",
        headerName: "Course",
        flex: 1.2,
      },
      {
        field: "skillsList",
        headerName: "Skills",
        flex: 2,
      },
      {
        field: "jobStatus",
        headerName: "Job Status",
        flex: 1,
        renderCell: ({ row }) => (
          <JobStatusChip status={row.personal?.jobSearchStatus} />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.8,
        sortable: false,
        renderCell: ({ row }) => (
          <IconButton
            size="small"
            onClick={() => {
              setViewProfile(row);
              setFormData(row);
              setEditMode(false);
            }}
          >
            <VisibilityOutlined />
          </IconButton>
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
      <Typography variant="h4" fontWeight={600}>
        Candidate Profiles Admin
      </Typography>

      {/* FILTERS */}
      <Stack direction="row" spacing={2} my={2}>
        <TextField
          size="small"
          label="Search name/email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={fetchProfiles}>
          Search
        </Button>

        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="Actively Looking">Actively Looking</MenuItem>
          <MenuItem value="Open to Offers">Open to Offers</MenuItem>
          <MenuItem value="Not Looking">Not Looking</MenuItem>
        </Select>
      </Stack>

      {/* GRID */}
      <Box height="65vh">
        <DataGrid
          rows={processedProfiles}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* VIEW + EDIT DIALOG */}
      {viewProfile && (
        <Dialog
          open
          onClose={() => setViewProfile(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Candidate Profile
            {!editMode && (
              <IconButton
                sx={{ float: "right" }}
                onClick={() => setEditMode(true)}
              >
                <EditOutlined />
              </IconButton>
            )}
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              {[
                { label: "Name", path: "personal.canname" },
                { label: "Email", path: "personal.canemail" },
                { label: "Mobile", path: "personal.canphone" },
                { label: "College", path: "college" },
                { label: "Course", path: "course" },
                { label: "About", path: "personal.canabout" },
              ].map(({ label, path }) => {
                const value =
                  path.split(".").reduce((o, i) => o?.[i], formData) || "";

                return (
                  <TextField
                    key={label}
                    label={label}
                    fullWidth
                    multiline={label === "About"}
                    rows={label === "About" ? 3 : 1}
                    value={value}
                    disabled={!editMode}
                    onChange={(e) => {
                      const keys = path.split(".");
                      const updated = { ...formData };
                      let temp = updated;

                      keys.slice(0, -1).forEach((k) => {
                        temp[k] = { ...temp[k] };
                        temp = temp[k];
                      });

                      temp[keys[keys.length - 1]] = e.target.value;
                      setFormData(updated);
                    }}
                  />
                );
              })}
            </Stack>
          </DialogContent>

          <DialogActions>
            {editMode ? (
              <>
                <Button onClick={() => setEditMode(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setViewProfile(null)}>Close</Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminCandidateProfiles;
