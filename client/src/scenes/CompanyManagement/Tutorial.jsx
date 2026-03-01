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
  Divider,
  TextField,
  Paper,
  Grid,
} from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ToggleOn,
  ToggleOff,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

/* =========================
   MAIN COMPONENT
========================= */
const AdminTutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTutorial, setViewTutorial] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  /* =========================
     FETCH
  ========================== */
  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/tutorials");
      setTutorials(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load tutorials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  /* =========================
     LEVEL DETECTION
  ========================== */
  const processedTutorials = useMemo(() => {
    return tutorials.map((tut) => ({
      ...tut,
      level: (() => {
        const t = tut.title?.toLowerCase() || "";
        if (t.includes("advanced") || t.includes("pro"))
          return "Advanced";
        if (t.includes("basic") || t.includes("beginner"))
          return "Beginner";
        return "Intermediate";
      })(),
    }));
  }, [tutorials]);

  /* =========================
     SUMMARY COUNTS
  ========================== */
  const totalCount = tutorials.length;
  const activeCount = tutorials.filter((t) => t.isActive).length;
  const inactiveCount = tutorials.filter((t) => !t.isActive).length;

  /* =========================
     VIEW
  ========================== */
  const openView = (tutorial) => {
    setViewTutorial(tutorial);
    setFormData(tutorial);
    setEditMode(false);
  };

  /* =========================
     SAVE
  ========================== */
  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `/admin/tutorials/${viewTutorial._id}`,
        formData
      );
      fetchTutorials();
      setViewTutorial(formData);
      setEditMode(false);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     TOGGLE ACTIVE
  ========================== */
  const toggleActive = async (id) => {
    try {
      await axios.patch(`/admin/tutorials/${id}/toggle`);
      setTutorials((prev) =>
        prev.map((t) =>
          t._id === id
            ? { ...t, isActive: !t.isActive }
            : t
        )
      );
    } catch {
      alert("Toggle failed");
    }
  };

  /* =========================
     TABLE COLUMNS
  ========================== */
  const columns = useMemo(
    () => [
      {
        field: "title",
        headerName: "Title",
        flex: 2,
        renderCell: ({ row }) => (
          <Stack spacing={0.3}>
            <Typography fontWeight={600}>
              {row.title}
            </Typography>
            <Typography
              fontSize="0.75rem"
              color="text.secondary"
            >
              {row.outline || "No description"}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "foss",
        headerName: "FOSS",
        flex: 1.2,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            label={value || "—"}
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              fontWeight: 500,
            }}
          />
        ),
      },
      {
        field: "level",
        headerName: "Level",
        flex: 1,
        renderCell: ({ value }) => (
          <Typography fontWeight={500}>
            {value}
          </Typography>
        ),
      },
      {
        field: "active",
        headerName: "Active",
        flex: 0.7,
        renderCell: ({ row }) => (
          <IconButton
            size="small"
            color={row.isActive ? "success" : "default"}
            onClick={() =>
              toggleActive(row._id)
            }
          >
            {row.isActive ? (
              <ToggleOn />
            ) : (
              <ToggleOff />
            )}
          </IconButton>
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
            onClick={() => openView(row)}
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
      <Box
        display="flex"
        justifyContent="center"
        mt={5}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3}>
      <Typography
        variant="h4"
        fontWeight={600}
        mb={3}
      >
        Tutorials Management
      </Typography>

      {/* =========================
           SUMMARY CARDS
      ========================== */}
      <Grid container spacing={2} mb={3}>
        {[
          ["Total Tutorials", totalCount],
          ["Active Tutorials", activeCount],
          ["Inactive Tutorials", inactiveCount],
        ].map(([label, value]) => (
          <Grid item xs={12} md={4} key={label}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                {label}
              </Typography>
              <Typography
                variant="h5"
                fontWeight={600}
              >
                {value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* =========================
           DATA GRID
      ========================== */}
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Box height="65vh">
          <DataGrid
            rows={processedTutorials}
            columns={columns}
            getRowId={(row) => row._id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      {/* =========================
           VIEW / EDIT DIALOG
      ========================== */}
      {viewTutorial && (
        <Dialog
          open
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography fontWeight={600}>
                Tutorial Details
              </Typography>

              {!editMode && (
                <IconButton
                  onClick={() =>
                    setEditMode(true)
                  }
                >
                  <EditOutlined />
                </IconButton>
              )}
            </Stack>
          </DialogTitle>

          <Divider />

          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Title"
                fullWidth
                value={formData.title || ""}
                disabled={!editMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
              />

              <TextField
                label="Outline"
                fullWidth
                multiline
                rows={3}
                value={
                  formData.outline || ""
                }
                disabled={!editMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    outline: e.target.value,
                  })
                }
              />

              <TextField
                label="FOSS"
                fullWidth
                value={formData.foss || ""}
                disabled={!editMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    foss: e.target.value,
                  })
                }
              />

              <TextField
                label="Video URL"
                fullWidth
                value={
                  formData.videoUrl || ""
                }
                disabled={!editMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    videoUrl:
                      e.target.value,
                  })
                }
              />

              <Typography>
                <b>Level:</b>{" "}
                {
                  processedTutorials.find(
                    (t) =>
                      t._id ===
                      viewTutorial._id
                  )?.level
                }
              </Typography>
            </Stack>
          </DialogContent>

          <DialogActions>
            {editMode ? (
              <>
                <Button
                  startIcon={
                    <CloseOutlined />
                  }
                  onClick={() =>
                    setEditMode(false)
                  }
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    <SaveOutlined />
                  }
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() =>
                  setViewTutorial(null)
                }
              >
                Close
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminTutorials;
