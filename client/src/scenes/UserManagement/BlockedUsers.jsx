import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
  BlockOutlined,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import apiClient from "../../api/apiClient";

const EmployeeAdminPanel = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editData, setEditData] = useState({ empname: "", empemail: "", empphone: "", role: "" });
  const token = localStorage.getItem("token");

  // ========================= FETCH EMPLOYEES =========================
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/employees");
      const mapped = (res.data || (Array.isArray(res) ? res : [])).map(emp => ({
        id: emp._id,
        name: emp.empname,
        email: emp.empemail,
        phone: emp.empphone,
        role: emp.role,
        isVerified: emp.isVerified,
        profilePicture: emp.profilePicture,
        joinedAt: new Date(emp.createdAt).toLocaleDateString(),
        raw: emp,
      }));
      setEmployees(mapped);
    } catch (err) {
      console.error("FETCH EMPLOYEES ERROR:", err);
      alert(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  // ========================= ACTION HANDLERS =========================
  const handleView = (row) => {
    setSelectedEmployee(row.raw);
    setViewOpen(true);
  };

  const handleEditOpen = (row) => {
    setSelectedEmployee(row.raw);
    setEditData({
      empname: row.raw.empname,
      empemail: row.raw.empemail,
      empphone: row.raw.empphone,
      role: row.raw.role,
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await apiClient.put(`/admin/employees/${selectedEmployee._id}`, editData);
      setEditOpen(false);
      fetchEmployees();
      alert("Employee updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleBlockUnblock = async (id, block) => {
    const confirmMsg = block ? "Block this employee?" : "Unblock this employee?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await apiClient.patch(`/admin/employees/${id}/status`, { isVerified: !block });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee permanently?")) return;
    try {
      await apiClient.delete(`/admin/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // ========================= COLUMNS =========================
  const columns = useMemo(() => [
    {
      field: "name",
      headerName: "Employee",
      flex: 1.3,
      renderCell: ({ row }) => (
        <Paper
          elevation={2}
          sx={{ p: 1, width: "100%", display: "flex", alignItems: "center", gap: 1, borderRadius: 2, "&:hover": { transform: "scale(1.02)", boxShadow: 6 } }}
        >
          <Avatar src={row.profilePicture} sx={{ width: 48, height: 48 }}>
            {!row.profilePicture && row.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography fontWeight={600}>{row.name}</Typography>
            <Typography fontSize="0.75rem" color="text.secondary">{row.email}</Typography>
            <Typography fontSize="0.75rem" color="text.secondary">{row.phone}</Typography>
          </Box>
        </Paper>
      ),
    },
    { field: "role", headerName: "Role", flex: 0.8, renderCell: ({ value }) => <Chip label={value} size="small" color={value === "admin" ? "error" : "info"} /> },
    { field: "verified", headerName: "Verified", flex: 0.6, renderCell: ({ row }) => row.isVerified ? <Chip label="Yes" size="small" color="success" /> : <Chip label="No" size="small" color="warning" /> },
    { field: "joinedAt", headerName: "Joined On", flex: 0.9 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.4,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" color="primary" startIcon={<VisibilityOutlined />} onClick={() => handleView(row)}>View</Button>
          <Button variant="outlined" size="small" color="secondary" startIcon={<EditOutlined />} onClick={() => handleEditOpen(row)}>Edit</Button>
          <Button variant="outlined" size="small" color={row.raw.isVerified ? "error" : "warning"} onClick={() => handleBlockUnblock(row.id, row.raw.isVerified)}>
            {row.raw.isVerified ? "Block" : "Unblock"}
          </Button>
          <Button variant="contained" color="error" size="small" startIcon={<DeleteOutlined />} onClick={() => handleDelete(row.id)}>Delete</Button>
        </Stack>
      ),
    },
  ], []);

  // ========================= RENDER =========================
  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Company Users</Typography>
        <Button variant="contained" color="primary" onClick={() => alert("Export to CSV / Excel logic")}>Export Employees</Button>
      </Stack>

      <Box height="70vh">
        <DataGrid rows={employees} columns={columns} loading={loading} pageSize={10} disableRowSelectionOnClick sx={{ "& .MuiDataGrid-cell": { outline: "none" }, "& .MuiDataGrid-columnHeaders": { fontWeight: 600 } }} />
      </Box>

      {/* VIEW DIALOG */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Employee Details</DialogTitle>
        <Divider />
        {selectedEmployee && (
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={selectedEmployee.profilePicture} sx={{ width: 64, height: 64 }}>{!selectedEmployee.profilePicture && selectedEmployee.empname?.charAt(0)}</Avatar>
                <Box>
                  <Typography fontWeight={700}>{selectedEmployee.empname}</Typography>
                  <Typography color="text.secondary">{selectedEmployee.empemail}</Typography>
                  <Typography color="text.secondary">{selectedEmployee.empphone}</Typography>
                </Box>
              </Stack>
              <Divider />
              <Stack direction="row" spacing={2}>
                <Chip label={`Role: ${selectedEmployee.role}`} color={selectedEmployee.role === "admin" ? "error" : "info"} size="medium" />
                <Chip label={`Verified: ${selectedEmployee.isVerified ? "Yes" : "No"}`} color={selectedEmployee.isVerified ? "success" : "warning"} size="medium" />
                <Chip label={`Joined: ${new Date(selectedEmployee.createdAt).toLocaleDateString()}`} color="secondary" size="medium" />
              </Stack>
            </Stack>
          </DialogContent>
        )}
        <DialogActions>
          <Button variant="outlined" onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Employee</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" fullWidth value={editData.empname} onChange={e => setEditData(prev => ({ ...prev, empname: e.target.value }))} />
            <TextField label="Email" fullWidth value={editData.empemail} onChange={e => setEditData(prev => ({ ...prev, empemail: e.target.value }))} />
            <TextField label="Phone" fullWidth value={editData.empphone} onChange={e => setEditData(prev => ({ ...prev, empphone: e.target.value }))} />
            <TextField label="Role" fullWidth value={editData.role} onChange={e => setEditData(prev => ({ ...prev, role: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeAdminPanel;
