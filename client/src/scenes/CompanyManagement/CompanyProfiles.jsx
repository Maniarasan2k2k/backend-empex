import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
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
  Alert,
  TextField,
  Grid,
  Paper,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  VisibilityOutlined,
  RefreshOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

import apiClient from "../../api/apiClient";

/* ===============================
   STATUS CHIP
================================ */
const StatusChip = ({ verified }) => (
  <Chip
    size="small"
    label={verified ? "Verified" : "Pending"}
    color={verified ? "success" : "warning"}
  />
);

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewCompany, setViewCompany] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  /* ===============================
     FETCH
  ================================= */
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiClient.get("/admin/companies");

      if (!res.success) throw new Error("Invalid response");

      setCompanies(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load companies"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  /* ===============================
     FILTER
  ================================= */
  const filteredCompanies = useMemo(() => {
    if (!statusFilter) return companies;
    if (statusFilter === "Verified")
      return companies.filter((c) => c.empisVer === true);
    if (statusFilter === "Pending")
      return companies.filter((c) => !c.empisVer);
    return companies;
  }, [companies, statusFilter]);

  /* ===============================
     OPEN VIEW
  ================================= */
  const openView = (company) => {
    setViewCompany(company);
    setFormData(company);
    setEditMode(false);
  };

  /* ===============================
     SAVE UPDATE
  ================================= */
  const handleSave = async () => {
    try {
      setSaving(true);

      await apiClient.put(`/admin/companies/${viewCompany._id}`, formData);

      setEditMode(false);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
     TABLE COLUMNS
  ================================= */
  const columns = [
    { field: "empcomNam", headerName: "Company Name", flex: 2 },
    { field: "empindTyp", headerName: "Industry", flex: 1.2 },
    { field: "empstate", headerName: "State", flex: 1 },
    { field: "empdist", headerName: "District", flex: 1 },
    { field: "empstf", headerName: "Employees", flex: 1 },
    {
      field: "empisVer",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row }) => (
        <StatusChip verified={row.empisVer} />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Tooltip title="View Details">
          <IconButton
            color="primary"
            onClick={() => openView(row)}
          >
            <VisibilityOutlined />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        Company Management
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {/* FILTER BAR */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Verified">Verified</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>

          <Tooltip title="Refresh">
            <IconButton onClick={fetchCompanies}>
              <RefreshOutlined />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* TABLE */}
      <Box height="70vh">
        <DataGrid
          rows={filteredCompanies}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* VIEW / EDIT DIALOG */}
      {viewCompany && (
        <Dialog
          open
          onClose={() => setViewCompany(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Company Details
            {!editMode && (
              <IconButton
                sx={{ float: "right" }}
                onClick={() => setEditMode(true)}
              >
                <EditOutlined />
              </IconButton>
            )}
          </DialogTitle>

          <Divider />

          <DialogContent>
            <Grid container spacing={2} mt={1}>
              {[
                { label: "Company Name", field: "empcomNam" },
                { label: "Industry", field: "empindTyp" },
                { label: "Phone", field: "empphone" },
                { label: "Conduct Number", field: "empconductNo" }, // 🔥 NEW FIELD
                { label: "Website", field: "empweb" },
                { label: "State", field: "empstate" },
                { label: "District", field: "empdist" },
                { label: "Address", field: "empaddr" },
                { label: "About", field: "empabout" },
              ].map((item) => (
                <Grid item xs={12} sm={6} key={item.field}>
                  <TextField
                    fullWidth
                    label={item.label}
                    value={formData[item.field] || ""}
                    disabled={!editMode}
                    multiline={item.field === "empabout"}
                    minRows={item.field === "empabout" ? 3 : 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [item.field]: e.target.value,
                      })
                    }
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
              <Button onClick={() => setViewCompany(null)}>
                Close
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminCompanies;
