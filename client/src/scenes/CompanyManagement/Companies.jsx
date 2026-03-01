import React, { useEffect, useMemo, useState } from "react";
import axios from "state/instant";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  VisibilityOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined as UnhideIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

/* =========================
   STATUS CHIP
========================= */
const StatusChip = ({ status }) => {
  const map = {
    UPCOMING: "info",
    COMPLETED: "success",
    CANCELLED: "warning",
    BLOCKED: "error",
  };

  return (
    <Chip
      size="small"
      label={status || "UNKNOWN"}
      color={map[status] || "default"}
    />
  );
};

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMeeting, setViewMeeting] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/meetings");
      // Normalize backend `isHidden` to frontend `hidden` field for UI compatibility
      const meetings = (res.data?.data || []).map(m => ({ ...m, hidden: !!m.isHidden }));
      setMeetings(meetings);
    } catch (err) {
      alert("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  /* ================= VIEW ================= */
  const openView = (row) => {
    setViewMeeting(row);
    setFormData(row);
    setEditMode(false);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`/admin/meetings/${viewMeeting._id}`, formData);
      fetchMeetings();
      setEditMode(false);
    } catch {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= HIDE / UNHIDE ================= */
  const toggleVisibility = async (id) => {
    try {
      await axios.patch(`/admin/meetings/${id}/toggle-visibility`);
      fetchMeetings();
    } catch {
      alert("Toggle failed");
    }
  };

  /* ================= DELETE ================= */
  const deleteMeeting = async (id) => {
    if (!window.confirm("Delete this meeting permanently?")) return;
    try {
      await axios.delete(`/admin/meetings/${id}`);
      fetchMeetings();
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = useMemo(
    () => [
      {
        field: "title",
        headerName: "Title",
        flex: 1.5,
      },
      {
        field: "companyName",
        headerName: "Company Name",
        flex: 1.5,
      },
      {
        field: "employerName",
        headerName: "Employer Name",
        flex: 1.3,
        valueGetter: (params) =>
          params.row.employer?.empname || "-",
      },
      {
        field: "employerEmail",
        headerName: "Employer Email",
        flex: 1.5,
        valueGetter: (params) =>
          params.row.employer?.empemail || "-",
      },
      {
        field: "date",
        headerName: "Date",
        flex: 1,
      },
      {
        field: "time",
        headerName: "Time",
        flex: 1,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: ({ value }) => <StatusChip status={value} />,
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1.5,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <IconButton
                size="small"
                color="primary"
                onClick={() => openView(row)}
              >
                <VisibilityOutlined />
              </IconButton>
            </Tooltip>

            <Tooltip title={row.hidden ? "Unhide" : "Hide"}>
              <IconButton
                size="small"
                color={row.hidden ? "success" : "warning"}
                onClick={() => toggleVisibility(row._id)}
              >
                {row.hidden ? (
                  <UnhideIcon />
                ) : (
                  <VisibilityOffOutlined />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => deleteMeeting(row._id)}
              >
                <DeleteOutlined />
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
      <Typography variant="h4" fontWeight={700} mb={2}>
        Meetings Management
      </Typography>

      <Paper elevation={3}>
        <Box height="75vh">
          <DataGrid
            rows={meetings}
            columns={columns}
            getRowId={(row) => row._id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      {/* ================= VIEW / EDIT DIALOG ================= */}
      {viewMeeting && (
        <Dialog open fullWidth maxWidth="md">
          <DialogTitle>
            {editMode ? "Edit Meeting" : "Meeting Details"}
          </DialogTitle>
          <Divider />

          <DialogContent>
            <Grid container spacing={2} mt={1}>
              {[
                { label: "Title", field: "title" },
                { label: "Company Name", field: "companyName" },
                { label: "Employer Name", field: "employer.empname" },
                { label: "Employer Email", field: "employer.empemail" },
                { label: "Date", field: "date" },
                { label: "Time", field: "time" },
                { label: "Meeting Link", field: "link" },
              ].map((item) => (
                <Grid item xs={12} sm={6} key={item.label}>
                  <TextField
                    fullWidth
                    label={item.label}
                    value={
                      item.field.includes(".")
                        ? formData.employer?.[
                            item.field.split(".")[1]
                          ] || ""
                        : formData[item.field] || ""
                    }
                    disabled={!editMode}
                    onChange={(e) => {
                      if (item.field.includes(".")) {
                        setFormData({
                          ...formData,
                          employer: {
                            ...formData.employer,
                            [item.field.split(".")[1]]:
                              e.target.value,
                          },
                        });
                      } else {
                        setFormData({
                          ...formData,
                          [item.field]: e.target.value,
                        });
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>

          <DialogActions>
            {editMode ? (
              <>
                <Button
                  startIcon={<CloseOutlined />}
                  onClick={() => setEditMode(false)}
                >
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
              <>
                <Button onClick={() => setEditMode(true)}>
                  Edit
                </Button>
                <Button onClick={() => setViewMeeting(null)}>
                  Close
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminMeetings;
