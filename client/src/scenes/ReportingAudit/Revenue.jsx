import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

/* =========================
   MOCK REVENUE DATA (API READY)
========================= */
const revenueData = [
  { month: "Jan", revenue: 50000 },
  { month: "Feb", revenue: 75000 },
  { month: "Mar", revenue: 60000 },
  { month: "Apr", revenue: 90000 },
  { month: "May", revenue: 120000 },
  { month: "Jun", revenue: 80000 },
  { month: "Jul", revenue: 95000 },
  { month: "Aug", revenue: 110000 },
];

/* =========================
   MOCK TRANSACTION TABLE
========================= */
const transactionsData = [
  {
    id: 1,
    customer: "Ramesh Kumar",
    amount: 5000,
    method: "Credit Card",
    status: "Completed",
    date: "2025-12-01",
  },
  {
    id: 2,
    customer: "Divya HR",
    amount: 12000,
    method: "Net Banking",
    status: "Pending",
    date: "2025-12-03",
  },
  {
    id: 3,
    customer: "Arun Dev",
    amount: 8000,
    method: "UPI",
    status: "Completed",
    date: "2025-12-05",
  },
];

/* =========================
   STATUS ENUM
========================= */
export const TRANSACTION_STATUS = Object.freeze({
  COMPLETED: "Completed",
  PENDING: "Pending",
  FAILED: "Failed",
});

/* =========================
   REVENUE PAGE
========================= */
const Revenue = () => {
  const [statusFilter, setStatusFilter] = useState("");

  /* =========================
     TABLE COLUMNS
  ========================== */
  const columns = useMemo(
    () => [
      {
        field: "customer",
        headerName: "Customer",
        flex: 1,
      },
      {
        field: "amount",
        headerName: "Amount ($)",
        flex: 0.8,
      },
      {
        field: "method",
        headerName: "Payment Method",
        flex: 1,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.7,
        renderCell: ({ value }) => {
          let bgcolor;
          switch (value) {
            case TRANSACTION_STATUS.COMPLETED:
              bgcolor = "#4caf50";
              break;
            case TRANSACTION_STATUS.PENDING:
              bgcolor = "#ff9800";
              break;
            case TRANSACTION_STATUS.FAILED:
              bgcolor = "#f44336";
              break;
            default:
              bgcolor = "#e0e0e0";
          }
          return (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: "6px",
                bgcolor,
                color: "#fff",
                fontSize: "0.75rem",
                textAlign: "center",
              }}
            >
              {value}
            </Box>
          );
        },
      },
      {
        field: "date",
        headerName: "Date",
        flex: 0.8,
      },
    ],
    []
  );

  /* =========================
     FILTERED TRANSACTIONS
  ========================== */
  const filteredTransactions = useMemo(
    () =>
      transactionsData.filter(
        (t) => (statusFilter ? t.status === statusFilter : true)
      ),
    [statusFilter]
  );

  return (
    <Box p="1.5rem">
      {/* ===== HEADER ===== */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="1.5rem">
        <Typography variant="h4" fontWeight={600}>
          Revenue
        </Typography>
        <Button variant="outlined" sx={{ borderRadius: "8px" }}>
          Export Revenue
        </Button>
      </Box>

      {/* ===== LINE CHART ===== */}
      <Paper sx={{ p: "1rem", mb: "2rem" }}>
        <Typography fontWeight={600} mb={2}>
          Monthly Revenue Overview
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* ===== FILTER BAR ===== */}
      <Paper sx={{ p: "1rem", mb: "1rem" }}>
        <Stack direction="row" gap="1rem" flexWrap="wrap">
          <TextField
            size="small"
            select
            label="Transaction Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.values(TRANSACTION_STATUS).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* ===== TRANSACTIONS TABLE ===== */}
      <Box height="50vh">
        <DataGrid
          rows={filteredTransactions}
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
    </Box>
  );
};

export default Revenue;
