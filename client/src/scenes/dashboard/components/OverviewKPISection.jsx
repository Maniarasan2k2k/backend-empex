import { Grid, Box, Typography } from "@mui/material";
import DashboardCard from "./DashboardCard";

const OverviewKPISection = ({ data }) => {
  // 🔥 Safety Guard
  if (!data || typeof data !== "object") {
    return (
      <Box mb={4}>
        <Typography color="text.secondary">
          Overview data not available
        </Typography>
      </Box>
    );
  }

  // 🔥 Flexible mapping (handles different backend shapes)
  const {
    totalUsers = 0,
    totalCandidates = data.totalEmployees ?? 0,
    totalEmployers = data.totalCompanies ?? 0,
    totalJobs = data.totalJobs ?? data.activeJobs ?? 0,
    totalApplications = data.totalApplications ?? 0,
  } = data;

  const cards = [
    { title: "Total Users", value: totalUsers, color: "#6366f1" },
    { title: "Total Candidates", value: totalCandidates, color: "#0ea5e9" },
    { title: "Total Employers", value: totalEmployers, color: "#10b981" },
    { title: "Total Jobs", value: totalJobs, color: "#f59e0b" },
    { title: "Total Applications", value: totalApplications, color: "#ef4444" },
  ];

  return (
    <Box mb={5}>
      <Typography
        variant="h6"
        fontWeight={700}
        mb={3}
        sx={{ opacity: 0.8 }}
      >
        Platform Overview
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
            <DashboardCard
              title={card.title}
              value={card.value}
              color={card.color}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OverviewKPISection;
