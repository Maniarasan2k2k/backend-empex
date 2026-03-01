import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Stack,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DownloadOutlined, Refresh } from "@mui/icons-material";
import apiClient from "../../api/apiClient";

/* =========================
   STATUS MAP (Backend Based)
========================= */
const STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

/* =========================
   SECURITY LOG PAGE
========================= */
const SecurityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  /* =========================
     FETCH SECURITY LOGS
  ========================== */
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/admin/audit-logs/security", {
        params: {
          page: page + 1,
          limit: pageSize,
          status: statusFilter || undefined,
        },
      });

      const { data, total } = response;
      const logsArray = Array.isArray(data) ? data : (response.logs || []);

      const formattedLogs = logsArray.map((log) => ({
        id: log._id,
        user: log.userId?.name || log.email || "Unknown",
        action: log.action,
        ip: log.ipAddress,
        status: log.status,
        timestamp: new Date(log.createdAt).toLocaleString(),
      }));

      setLogs(formattedLogs);
      setRowCount(total);
    } catch (err) {
      setError("Failed to load security logs");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /* =========================
     EXPORT HANDLER
  ========================== */
  const handleExport = () => {
    const exportData = logs.map((row) => ({
      User: row.user,
      Action: row.action,
      IP: row.ip,
      Status: row.status,
      Timestamp: row.timestamp,
    }));

    console.table(exportData);
    alert("Security logs exported (check console)");
  };

  /* =========================
     TABLE COLUMNS
  ========================== */
  const columns = useMemo(
    () => [
      { field: "user", headerName: "User", flex: 1 },
      { field: "action", headerName: "Action", flex: 1.5 },
      { field: "ip", headerName: "IP Address", flex: 1 },
      {
        field: "status",
        headerName: "Status",
        flex: 0.8,
        renderCell: ({ value }) => (
          <Chip
            label={value}
            size="small"
            sx={{
              fontWeight: 600,
              color: "#fff",
              backgroundColor:
                value === STATUS.SUCCESS ? "#4caf50" : "#f44336",
            }}
          />
        ),
      },
      { field: "timestamp", headerName: "Timestamp", flex: 1.2 },
    ],
    []
  );

  /* =========================
     SEARCH FILTER (Client Side)
  ========================== */
  const filteredRows = useMemo(() => {
    return logs.filter((row) =>
      row.user.toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);

  return (
    <Box p="1.5rem">
      {/* ===== HEADER ===== */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="1.5rem"
        flexWrap="wrap"
      >
        <Typography variant="h4" fontWeight={600}>
          Security Logs
        </Typography>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchLogs}
            >
              Refresh
            </Button>
          </Tooltip>

          <Tooltip title="Export logs">
            <Button
              variant="contained"
              startIcon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Tooltip>
        </Stack>
      </Box>

      {/* ===== FILTER BAR ===== */}
      <Paper sx={{ p: "1rem", mb: "1rem" }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            size="small"
            label="Search User"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
          />

          <TextField
            size="small"
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            sx={{ width: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="SUCCESS">Success</MenuItem>
            <MenuItem value="FAILED">Failed</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* ===== ERROR STATE ===== */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* ===== TABLE ===== */}
      <Box height="65vh">
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pagination
          paginationMode="server"
          rowCount={rowCount}
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            borderRadius: "12px",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#1f2a40",
              color: "#fff",
              fontWeight: 600,
            },
          }}
          components={{
            LoadingOverlay: () => (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress />
              </Box>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default SecurityLog;