import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Grid,
  Divider,
} from "@mui/material";
import {
  PeopleOutlined,
  WorkOutline,
  AssignmentTurnedInOutlined,
  MonetizationOnOutlined,
  SecurityOutlined,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

/* =========================
   MOCK DASHBOARD DATA (API READY)
========================= */
const stats = {
  users: 12450,
  activeJobs: 320,
  applications: 8450,
  revenue: 1850000,
  securityAlerts: 12,
};

const applicationTrend = [
  { month: "Aug", count: 900 },
  { month: "Sep", count: 1200 },
  { month: "Oct", count: 1600 },
  { month: "Nov", count: 2100 },
  { month: "Dec", count: 2650 },
];

const revenueData = [
  { name: "Jobs", value: 950000 },
  { name: "Subscriptions", value: 650000 },
  { name: "Ads", value: 250000 },
];

const atsPipeline = [
  { stage: "Applied", count: 3200 },
  { stage: "Screening", count: 2100 },
  { stage: "Interview", count: 1800 },
  { stage: "Offer", count: 900 },
  { stage: "Hired", count: 450 },
];

/* =========================
   KPI CARD
========================= */
const StatCard = ({ title, value, icon }) => (
  <Paper sx={{ p: "1.25rem", borderRadius: "12px" }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          {value}
        </Typography>
      </Box>
      {icon}
    </Stack>
  </Paper>
);

/* =========================
   DASHBOARD PAGE
========================= */
const Dashboard = () => {
  return (
    <Box p="1.5rem">
      {/* ===== HEADER ===== */}
      <Typography variant="h4" fontWeight={600} mb="1.5rem">
        Admin Dashboard
      </Typography>

      {/* ===== KPI CARDS ===== */}
      <Grid container spacing={2} mb="1.5rem">
        <Grid item xs={12} md={2.4}>
          <StatCard
            title="Total Users"
            value={stats.users}
            icon={<PeopleOutlined color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={<WorkOutline color="success" />}
          />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <StatCard
            title="Applications"
            value={stats.applications}
            icon={<AssignmentTurnedInOutlined color="info" />}
          />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <StatCard
            title="Revenue (₹)"
            value={stats.revenue.toLocaleString()}
            icon={<MonetizationOnOutlined color="warning" />}
          />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <StatCard
            title="Security Alerts"
            value={stats.securityAlerts}
            icon={<SecurityOutlined color="error" />}
          />
        </Grid>
      </Grid>

      {/* ===== CHARTS ===== */}
      <Grid container spacing={2} mb="1.5rem">
        {/* Applications Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: "1.5rem", borderRadius: "12px" }}>
            <Typography fontWeight={600} mb={2}>
              Applications Trend
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={applicationTrend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#1976d2"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: "1.5rem", borderRadius: "12px" }}>
            <Typography fontWeight={600} mb={2}>
              Revenue Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* ===== ATS PIPELINE ===== */}
      <Paper sx={{ p: "1.5rem", borderRadius: "12px" }}>
        <Typography fontWeight={600} mb={2}>
          ATS Pipeline Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={atsPipeline}>
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#0288d1" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;
