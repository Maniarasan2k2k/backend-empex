import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Avatar,
  Chip,
  IconButton,
  Typography,
  TextField,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  VisibilityOutlined,
  DeleteOutlined,
  BlockOutlined,
  CheckCircleOutline,
  DeleteSweepOutlined,
  RefreshOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import apiClient from "../../api/apiClient";

const EmployeeAdminPanel = () => {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [totalRows, setTotalRows] = useState(0);

  const [selected, setSelected] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  /* ================= FETCH ================= */

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);

      const res = await apiClient.get("/admin/employees", {
        params: {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          search: search || undefined,
        },
      });

      const data = res.data || (Array.isArray(res) ? res : []);
      setTotalRows(res.total || 0);

      setRows(
        data.map((emp) => ({
          id: emp._id,
          name: emp.empname,
          email: emp.empemail,
          mobile: emp.empphone,
          role: emp.role,
          referrerName: emp.referrerName || "N/A",
          referrerPhone: emp.referrerPhone || "N/A",
          referredBy: emp.referredBy || "N/A",
          verification: emp.isVerified,
          status: emp.isBlocked,
          createdAt: emp.createdAt,
          avatar: emp.profilePicture,
          raw: emp,
        }))
      );
    } catch {
      alert("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /* ================= ACTIONS ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee permanently?")) return;

    await apiClient.delete(`/admin/employees/${id}`);

    fetchEmployees();
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete ALL employees?")) return;

    await apiClient.delete("/admin/employees");

    fetchEmployees();
  };

  const handleBlockToggle = async (id, isBlocked) => {
    try {
      setActionLoading(id);

      const action = isBlocked ? "unblock" : "block";
      await apiClient.patch(`/admin/employees/${id}/${action}`);

      await fetchEmployees();
    } catch {
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= VIEW ================= */

  const openViewModal = (employee) => {
    setSelected(employee);
    setFormData(employee);
    setEditMode(false);
    setOpenView(true);
  };

  const handleSave = async () => {
    try {
      await apiClient.put(`/admin/employees/${selected._id}`, formData);

      setEditMode(false);
      setOpenView(false);
      fetchEmployees();
    } catch {
      alert("Update failed");
    }
  };

  /* ================= COLUMNS ================= */

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1.2,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={row.avatar}>
              {row.name?.charAt(0)}
            </Avatar>
            <Typography fontWeight={600}>{row.name}</Typography>
          </Stack>
        ),
      },
      { field: "email", headerName: "Email", flex: 1 },
      { field: "mobile", headerName: "Mobile", flex: 1 },
      { field: "role", headerName: "Role", flex: 1 },
      { field: "referrerName", headerName: "Reference Name", flex: 1 },
      { field: "referrerPhone", headerName: "Reference Mobile", flex: 1 },
      { field: "referredBy", headerName: "Reference By", flex: 1 },
      {
        field: "verification",
        headerName: "Verification",
        flex: 1,
        renderCell: ({ value }) => (
          <Chip
            label={value ? "Verified" : "Not Verified"}
            color={value ? "success" : "default"}
            size="small"
          />
        ),
      },
      {
        field: "createdAt",
        headerName: "Created Date",
        flex: 1.2,
        renderCell: ({ value }) =>
          value ? new Date(value).toLocaleString() : "N/A",
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1.6,
        sortable: false,
        renderCell: ({ row }) => {
          const isBlocked = row.status;
          const isLoading = actionLoading === row.id;

          return (
            <Stack direction="row" spacing={1}>
              <Tooltip title="View">
                <IconButton
                  color="primary"
                  onClick={() => openViewModal(row.raw)}
                >
                  <VisibilityOutlined />
                </IconButton>
              </Tooltip>

              <Tooltip title={isBlocked ? "Unblock" : "Block"}>
                <IconButton
                  color={isBlocked ? "success" : "warning"}
                  onClick={() =>
                    handleBlockToggle(row.id, isBlocked)
                  }
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={18} />
                  ) : isBlocked ? (
                    <CheckCircleOutline />
                  ) : (
                    <BlockOutlined />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={() => handleDelete(row.id)}
                >
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [actionLoading]
  );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Employee Management
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              startIcon={<RefreshOutlined />}
              onClick={fetchEmployees}
            >
              Refresh
            </Button>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteSweepOutlined />}
              onClick={handleDeleteAll}
            >
              Delete All
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box height="70vh">
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={totalRows}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Box>

      {/* VIEW + EDIT MODAL */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Employee Details
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
          {selected && (
            <Grid container spacing={2}>
              {[
                { label: "Name", field: "empname" },
                { label: "Email", field: "empemail" },
                { label: "Mobile", field: "empphone" },
                { label: "Role", field: "role" },
                { label: "Reference Name", field: "referrerName" },
                { label: "Reference Mobile", field: "referrerPhone" },
                { label: "Reference By", field: "referredBy" },
              ].map((item) => (
                <Grid item xs={6} key={item.field}>
                  <TextField
                    fullWidth
                    label={item.label}
                    value={formData[item.field] || ""}
                    disabled={!editMode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [item.field]: e.target.value,
                      })
                    }
                  />
                </Grid>
              ))}

              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isVerified || false}
                      disabled={!editMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isVerified: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Verified"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          {editMode ? (
            <>
              <Button onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpenView(false)}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeAdminPanel;
