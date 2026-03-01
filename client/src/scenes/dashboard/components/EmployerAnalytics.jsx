import { useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Skeleton,
  Alert,
  Fade,
  Stack,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

/* ========================================= */
/*  KPI CONFIG — icon + accent per metric    */
/* ========================================= */
const KPI_CONFIG = {
  totalAdmins: {
    icon: <AdminPanelSettingsRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    light: "#eef2ff",
    accent: "#6366f1",
  },
  totalCompanies: {
    icon: <BusinessRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
    light: "#e0f2fe",
    accent: "#0ea5e9",
  },
  totalApplications: {
    icon: <DescriptionRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    light: "#d1fae5",
    accent: "#10b981",
  },
  totalAppliedJobs: {
    icon: <WorkOutlineRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    light: "#fef3c7",
    accent: "#f59e0b",
  },
  TotalUsers: {
    icon: <GroupsRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
    light: "#ede9fe",
    accent: "#8b5cf6",
  },
  totalJobpost: {
    icon: <PostAddRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
    light: "#fce7f3",
    accent: "#ec4899",
  },
  AppliedCandidates: {
    icon: <HowToRegRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)",
    light: "#ccfbf1",
    accent: "#14b8a6",
  },
  shotlistedCandidates: {
    icon: <StarBorderRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
    light: "#ffedd5",
    accent: "#f97316",
  },
  interviewShedules: {
    icon: <EventAvailableRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    light: "#dbeafe",
    accent: "#3b82f6",
  },
  hiredCandidates: {
    icon: <EmojiEventsRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)",
    light: "#dcfce7",
    accent: "#22c55e",
  },
  noOfVerification: {
    icon: <VerifiedRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
    light: "#cffafe",
    accent: "#06b6d4",
  },
  totalEmployeeUsers: {
    icon: <BadgeRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
    light: "#f3e8ff",
    accent: "#a855f7",
  },
};

const EMPLOYER_KPI_KEYS = [
  "totalAdmins",
  "totalCompanies",
  "totalApplications",
  "totalAppliedJobs",
  "TotalUsers",
  "totalJobpost",
  "AppliedCandidates",
  "shotlistedCandidates",
  "interviewShedules",
  "hiredCandidates",
  "noOfVerification",
  "totalEmployeeUsers",
];

/**
 * EmployerAnalytics
 * -----------------
 * Receives **already date-filtered** data from the parent Dashboard.
 *
 * Props:
 *   kpis    – KPI object returned by the backend (filtered by date range)
 *   loading – whether the parent is still fetching
 *   error   – error string from the parent fetch
 */
const EmployerAnalytics = ({ kpis, loading, error }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // =========================================
  // Format key → readable title
  // =========================================
  const formatTitle = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

  // =========================================
  // Derive employer cards from filtered data
  // =========================================
  const employerCards = useMemo(() => {
    if (!kpis) return [];

    return EMPLOYER_KPI_KEYS.map((key) => ({
      title: formatTitle(key),
      value: kpis[key] ?? 0,
      key,
      ...KPI_CONFIG[key],
    }));
  }, [kpis]);

  // =========================================
  // Loading UI
  // =========================================
  if (loading) {
    return (
      <Box px={{ xs: 2, md: 4 }} py={4}>
        <Skeleton
          variant="rounded"
          width={300}
          height={32}
          sx={{ borderRadius: 2, mb: 1 }}
        />
        <Skeleton variant="text" width={380} height={20} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton
                variant="rounded"
                height={150}
                sx={{ borderRadius: 4 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // =========================================
  // Error UI
  // =========================================
  if (error) {
    return (
      <Box px={{ xs: 2, md: 4 }} py={4}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // =========================================
  // Main UI
  // =========================================
  return (
    <Fade in timeout={600}>
      <Box px={{ xs: 2, md: 4 }} py={4}>
        {/* ================= HEADER ================= */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
              boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
            }}
          >
            <StorefrontRoundedIcon fontSize="small" />
          </Avatar>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              letterSpacing: "-0.02em",
              color: isDark ? "#e0e7ff" : "#1e293b",
            }}
          >
            Employer Analytics
          </Typography>
          <Chip
            label={`${employerCards.length} metrics`}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: "0.7rem",
              background: isDark ? "rgba(14,165,233,0.15)" : "#e0f2fe",
              color: "#0ea5e9",
              height: 24,
            }}
          />
        </Stack>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 4, pl: 7 }}
        >
          Real-time overview of employer & system performance metrics
        </Typography>

        {/* ================= KPI GRID ================= */}
        <Grid container spacing={3}>
          {employerCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Fade in timeout={350 + index * 80}>
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 4,
                    p: 3,
                    background: isDark
                      ? "rgba(255,255,255,0.04)"
                      : "#ffffff",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9"
                      }`,
                    boxShadow: isDark
                      ? "none"
                      : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                    transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
                    cursor: "default",
                    overflow: "hidden",

                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: isDark
                        ? `0 8px 30px ${card.accent}30`
                        : `0 8px 30px ${card.accent}18`,
                      borderColor: `${card.accent}40`,
                    },

                    /* left accent bar */
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 12,
                      left: 0,
                      width: 4,
                      height: "calc(100% - 24px)",
                      borderRadius: "0 4px 4px 0",
                      background: card.gradient,
                    },
                  }}
                >
                  {/* icon avatar */}
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      mb: 2,
                      background: isDark
                        ? `${card.accent}25`
                        : card.light,
                      color: card.accent,
                    }}
                  >
                    {card.icon}
                  </Avatar>

                  {/* label */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "text.secondary",
                      lineHeight: 1.2,
                      display: "block",
                      mb: 0.75,
                    }}
                  >
                    {card.title}
                  </Typography>

                  {/* value */}
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: isDark ? "#f1f5f9" : "#0f172a",
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {(card.value ?? 0).toLocaleString()}
                  </Typography>
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Fade>
  );
};

export default EmployerAnalytics;
