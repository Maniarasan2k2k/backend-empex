/**
 * ==================================================
 * AUDIT LOG VIEWER COMPONENT
 * ==================================================
 * 
 * Enterprise-level audit logging dashboard with:
 * - Advanced filtering and search
 * - Pagination
 * - Date range filtering
 * - Detail view modal
 * - Export capability
 * - Real-time refresh
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Visibility,
  Download,
  Refresh,
  Close,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import {
  useGetAuditLogsQuery,
  useGetAuditLogDetailQuery,
  useGetAuditStatsQuery,
} from "state/auditLogsAPI";

// Constants
const AUDIT_MODULES = [
  "USERS",
  "ROLES",
  "PERMISSIONS",
  "JOBS",
  "APPLICATIONS",
  "MEETINGS",
  "SKILL_TRAINING",
  "COMPANIES",
  "ADMINS",
  "CANDIDATES",
  "EMPLOYEES",
  "SETTINGS",
  "REPORTS",
  "TUTORIALS",
  "WEBINARS",
  "AUTHENTICATION",
];

const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "TOGGLE",
  "LOGIN",
  "LOGOUT",
  "EXPORT",
  "IMPORT",
  "VIEW",
];

const ACTION_COLORS = {
  CREATE: "#4caf50",
  UPDATE: "#2196f3",
  DELETE: "#f44336",
  TOGGLE: "#ff9800",
  LOGIN: "#9c27b0",
  LOGOUT: "#795548",
  EXPORT: "#00bcd4",
  IMPORT: "#673ab7",
  VIEW: "#607d8b",
};

const AuditLog = () => {
  // ========== STATE ==========
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({
    module: "",
    action: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // ========== QUERIES ==========
  const { data: auditData, isLoading, refetch } = useGetAuditLogsQuery({
    page,
    limit,
    ...filters,
  });

  const { data: statsData } = useGetAuditStatsQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const { data: detailData } = useGetAuditLogDetailQuery(selectedLogId, {
    skip: !selectedLogId,
  });

  // ========== HANDLERS ==========
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page when filtering
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleViewDetail = useCallback((logId) => {
    setSelectedLogId(logId);
    setDetailDialogOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailDialogOpen(false);
    setSelectedLogId(null);
  }, []);

  const handleExport = useCallback(() => {
    // Create CSV download link
    const queryParams = new URLSearchParams();
    if (filters.module) queryParams.append("module", filters.module);
    if (filters.action) queryParams.append("action", filters.action);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const exportUrl = `${API_URL}/admin/audit-logs/export/csv?${queryParams.toString()}`;
    window.location.href = exportUrl;
  }, [filters]);

  // ========== STATS SECTION ==========
  const StatsPanel = () => {
    if (!statsData?.data) return null;

    const {
      actionCounts = [],
      topUsers = [],
      totalLogs = [],
      successRate = [],
    } = statsData.data;

    const totalCount = totalLogs[0]?.count || 0;
    const successCount = successRate.find((s) => s._id === "SUCCESS")?.count || 0;
    const successPercentage =
      totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : 0;

    return (
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: "center", bgcolor: "#e8f5e9" }}>
            <Typography color="textSecondary" variant="body2">
              Total Logs
            </Typography>
            <Typography variant="h5">{totalCount}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: "center", bgcolor: "#e3f2fd" }}>
            <Typography color="textSecondary" variant="body2">
              Success Rate
            </Typography>
            <Typography variant="h5">{successPercentage}%</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: "center", bgcolor: "#fce4ec" }}>
            <Typography color="textSecondary" variant="body2">
              Top Action
            </Typography>
            <Typography variant="h6">
              {actionCounts[0]?._id || "N/A"} ({actionCounts[0]?.count || 0})
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: "center", bgcolor: "#fff3e0" }}>
            <Typography color="textSecondary" variant="body2">
              Active Users
            </Typography>
            <Typography variant="h5">{topUsers.length}</Typography>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // ========== FILTER SECTION ==========
  const FiltersSection = () => (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600}>
          Filters & Search
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search (email, name, description)"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                handleFilterChange("search", e.target.value)
              }
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Module</InputLabel>
              <Select
                label="Module"
                value={filters.module}
                onChange={(e) =>
                  handleFilterChange("module", e.target.value)
                }
              >
                <MenuItem value="">All</MenuItem>
                {AUDIT_MODULES.map((mod) => (
                  <MenuItem key={mod} value={mod}>
                    {mod}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Action</InputLabel>
              <Select
                label="Action"
                value={filters.action}
                onChange={(e) =>
                  handleFilterChange("action", e.target.value)
                }
              >
                <MenuItem value="">All</MenuItem>
                {AUDIT_ACTIONS.map((act) => (
                  <MenuItem key={act} value={act}>
                    {act}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={filters.startDate}
              onChange={(e) =>
                handleFilterChange("startDate", e.target.value)
              }
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) =>
                handleFilterChange("endDate", e.target.value)
              }
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <Tooltip title="Refresh data">
              <span>
                <IconButton
                  onClick={handleRefresh}
                  disabled={isLoading}
                  sx={{
                    width: "100%",
                    height: "40px",
                  }}
                >
                  <Refresh />
                </IconButton>
              </span>
            </Tooltip>
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <Tooltip title="Export as CSV">
              <IconButton
                onClick={handleExport}
                sx={{
                  width: "100%",
                  height: "40px",
                  color: "primary.main",
                }}
              >
                <Download />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );

  // ========== TABLE COLUMNS ==========
  const columns = useMemo(
    () => [
      {
        field: "createdAt",
        headerName: "Date & Time",
        flex: 1.2,
        renderCell: ({ row }) => (
          <Box>
            <Typography variant="body2">
              {new Date(row.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {new Date(row.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
        ),
      },
      {
        field: "userEmail",
        headerName: "User",
        flex: 1.2,
      },
      {
        field: "module",
        headerName: "Module",
        flex: 0.9,
        renderCell: ({ row }) => (
          <Chip label={row.module} size="small" variant="outlined" />
        ),
      },
      {
        field: "action",
        headerName: "Action",
        flex: 0.9,
        renderCell: ({ row }) => (
          <Chip
            label={row.action}
            size="small"
            sx={{
              backgroundColor: ACTION_COLORS[row.action] || "#9e9e9e",
              color: "#fff",
            }}
          />
        ),
      },
      {
        field: "description",
        headerName: "Description",
        flex: 1.8,
        renderCell: ({ row }) => (
          <Tooltip title={row.description}>
            <Typography variant="body2" noWrap>
              {row.description}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "targetType",
        headerName: "Target",
        flex: 0.8,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.7,
        renderCell: ({ row }) => (
          <Chip
            label={row.status}
            size="small"
            color={row.status === "SUCCESS" ? "success" : "error"}
            variant="outlined"
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.6,
        sortable: false,
        renderCell: ({ row }) => (
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleViewDetail(row._id)}
              color="primary"
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [handleViewDetail]
  );

  // ========== DETAIL MODAL ==========
  const DetailModal = () => {
    if (!detailData?.data) return null;

    const log = detailData.data;

    return (
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Audit Log Details</Typography>
            <IconButton onClick={handleCloseDetail} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date & Time"
                    value={new Date(log.createdAt).toLocaleString()}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="User Email"
                    value={log.userEmail}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Module"
                    value={log.module}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Action"
                    value={log.action}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={log.description}
                    disabled
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Target Info */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Target Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Target Type"
                    value={log.targetType || "N/A"}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Target ID"
                    value={log.targetId || "N/A"}
                    disabled
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Old vs New Data */}
            {(log.oldData || log.newData) && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Data Changes
                  </Typography>
                  <Grid container spacing={2}>
                    {log.oldData && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Old Data"
                          value={JSON.stringify(log.oldData, null, 2)}
                          disabled
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                    )}
                    {log.newData && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="New Data"
                          value={JSON.stringify(log.newData, null, 2)}
                          disabled
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>
              </>
            )}

            {/* Meta Info */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Technical Metadata
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IP Address"
                    value={log.ipAddress || "N/A"}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Status"
                    value={log.status}
                    disabled
                    size="small"
                  />
                </Grid>
                {log.error && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Error Message"
                      value={log.error}
                      disabled
                      size="small"
                      error
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  };

  // ========== RENDER ==========
  return (
    <Box p="1.5rem">
      <Stack spacing={3}>
        {/* HEADER */}
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Audit Logs
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={0.5}>
            Track all system actions, user activities, and data changes
          </Typography>
        </Box>

        {/* TABS */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Audit Logs" />
          <Tab label="Statistics" />
        </Tabs>

        {/* TAB CONTENT */}
        {tabValue === 0 ? (
          // LOGS TAB
          <>
            <FiltersSection />

            {isLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : auditData?.data && auditData.data.length > 0 ? (
              <Paper elevation={3}>
                <Box sx={{ height: "70vh", width: "100%" }}>
                  <DataGrid
                    rows={auditData.data}
                    columns={columns}
                    getRowId={(row) => row._id}
                    paginationModel={{
                      pageSize: limit,
                      page: page - 1,
                    }}
                    onPaginationModelChange={(model) => {
                      setPage(model.page + 1);
                      setLimit(model.pageSize);
                    }}
                    rowCount={auditData.total}
                    paginationMode="server"
                    pageSizeOptions={[10, 20, 50, 100]}
                  />
                </Box>
              </Paper>
            ) : (
              <Alert severity="info">
                No audit logs found. Try adjusting your filters.
              </Alert>
            )}
          </>
        ) : (
          // STATS TAB
          <>
            <StatsPanel />

            {statsData?.data && (
              <>
                {/* Top Actions */}
                {statsData.data.actionCounts?.length > 0 && (
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Top Actions
                    </Typography>
                    <Stack spacing={1}>
                      {statsData.data.actionCounts.map((item, idx) => (
                        <Box
                          key={idx}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Chip
                            label={item._id}
                            sx={{
                              backgroundColor: ACTION_COLORS[item._id],
                              color: "#fff",
                            }}
                          />
                          <Typography variant="body2">
                            {item.count} times
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Card>
                )}

                {/* Top Users */}
                {statsData.data.topUsers?.length > 0 && (
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Top Active Users
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                            <TableCell>User Email</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statsData.data.topUsers.map((user, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{user._id}</TableCell>
                              <TableCell align="right">{user.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </Stack>

      {/* DETAIL MODAL */}
      <DetailModal />
    </Box>
  );
};

export default AuditLog;
