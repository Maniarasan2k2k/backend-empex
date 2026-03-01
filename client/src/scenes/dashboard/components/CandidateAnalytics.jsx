import { useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Skeleton,
  Divider,
  Alert,
  Fade,
  Stack,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

/* ========================================= */
/*  KPI CONFIG — icon + accent per metric    */
/* ========================================= */
const KPI_CONFIG = {
  totalCandiProfiles: {
    icon: <PersonOutlineRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    light: "#eef2ff",
    accent: "#6366f1",
  },
  totalCandiUsers: {
    icon: <PeopleAltRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
    light: "#e0f2fe",
    accent: "#0ea5e9",
  },
  totalAppliedJobs: {
    icon: <WorkOutlineRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    light: "#d1fae5",
    accent: "#10b981",
  },
  bookmarkJobs: {
    icon: <BookmarkBorderRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    light: "#fef3c7",
    accent: "#f59e0b",
  },
  blockedCandidates: {
    icon: <BlockRoundedIcon fontSize="small" />,
    gradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
    light: "#fee2e2",
    accent: "#ef4444",
  },
};

const REQUIRED_KPI_KEYS = [
  "totalCandiProfiles",
  "totalCandiUsers",
  "totalAppliedJobs",
  "bookmarkJobs",
  "blockedCandidates",
];

/**
 * CandidateAnalytics
 * ------------------
 * Receives **already date-filtered** data from the parent Dashboard.
 *
 * Props:
 *   kpis          – KPI object returned by the backend (filtered by date range)
 *   atsPipeline   – ATS pipeline array (filtered by date range)
 *   loading       – whether the parent is still fetching
 *   error         – error string from the parent fetch
 */
const CandidateAnalytics = ({ kpis, atsPipeline = [], loading, error }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // =====================================
  // Format key → readable title
  // =====================================
  const formatTitle = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

  // =====================================
  // Derive KPI cards from filtered data
  // =====================================
  const kpiCards = useMemo(() => {
    if (!kpis) return [];

    return REQUIRED_KPI_KEYS.map((key) => ({
      title: formatTitle(key),
      value: kpis[key] ?? 0,
      key,
      ...KPI_CONFIG[key],
    }));
  }, [kpis]);

  /* ======= ATS Pipeline colour palette ======= */
  const ATS_COLORS = [
    "#6366f1",
    "#0ea5e9",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  // =====================================
  // Loading UI
  // =====================================
  if (loading) {
    return (
      <Box px={{ xs: 2, md: 4 }} py={4}>
        <Skeleton
          variant="rounded"
          width={280}
          height={32}
          sx={{ borderRadius: 2, mb: 1 }}
        />
        <Skeleton
          variant="text"
          width={360}
          height={20}
          sx={{ mb: 4 }}
        />
        <Grid container spacing={3}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
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

  // =====================================
  // Error UI
  // =====================================
  if (error) {
    return (
      <Box px={{ xs: 2, md: 4 }} py={4}>
        <Alert
          severity="error"
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // =====================================
  // MAIN UI
  // =====================================
  return (
    <Fade in timeout={600}>
      <Box px={{ xs: 2, md: 4 }} py={4}>
        {/* ================= HEADER ================= */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          mb={0.5}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            <PeopleAltRoundedIcon fontSize="small" />
          </Avatar>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              letterSpacing: "-0.02em",
              color: isDark ? "#e0e7ff" : "#1e293b",
            }}
          >
            Candidate Analytics
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 4, pl: 7 }}
        >
          Overview of candidate-related metrics and ATS pipeline status
        </Typography>

        {/* ================= KPI CARDS ================= */}
        <Grid container spacing={3} mb={5}>
          {kpiCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Fade in timeout={400 + index * 120}>
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
                  {/* icon chip */}
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

        {/* ================= DIVIDER ================= */}
        <Divider
          sx={{
            mb: 4,
            borderColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "#f1f5f9",
          }}
        />

        {/* ================= ATS PIPELINE ================= */}
        {atsPipeline.length > 0 && (
          <>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              mb={3}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background:
                    "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                  boxShadow: "0 4px 14px rgba(14,165,233,0.3)",
                }}
              >
                <TrendingUpRoundedIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  letterSpacing: "-0.01em",
                  color: isDark ? "#e0e7ff" : "#1e293b",
                }}
              >
                ATS Pipeline Status
              </Typography>
              <Chip
                label={`${atsPipeline.length} stages`}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  background: isDark
                    ? "rgba(14,165,233,0.15)"
                    : "#e0f2fe",
                  color: "#0ea5e9",
                  height: 24,
                }}
              />
            </Stack>

            <Grid container spacing={3}>
              {atsPipeline.map((stage, index) => {
                const color =
                  ATS_COLORS[index % ATS_COLORS.length];
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={index}
                  >
                    <Fade in timeout={400 + index * 100}>
                      <Box
                        sx={{
                          borderRadius: 4,
                          p: 3,
                          position: "relative",
                          overflow: "hidden",
                          background: isDark
                            ? "rgba(255,255,255,0.04)"
                            : "#ffffff",
                          border: `1px solid ${isDark
                              ? "rgba(255,255,255,0.08)"
                              : "#f1f5f9"
                            }`,
                          boxShadow: isDark
                            ? "none"
                            : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                          transition:
                            "all 0.3s cubic-bezier(.4,0,.2,1)",
                          cursor: "default",

                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 30px ${color}18`,
                            borderColor: `${color}40`,
                          },

                          /* top accent bar */
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: 3,
                            background: color,
                            opacity: 0.85,
                          },
                        }}
                      >
                        {/* status badge */}
                        <Chip
                          label={stage._id}
                          size="small"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            background: isDark
                              ? `${color}20`
                              : `${color}12`,
                            color: color,
                            height: 26,
                            borderRadius: 2,
                          }}
                        />

                        {/* count */}
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: isDark ? "#f1f5f9" : "#0f172a",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {(stage.count ?? 0).toLocaleString()}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 500,
                          }}
                        >
                          candidates
                        </Typography>
                      </Box>
                    </Fade>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Box>
    </Fade>
  );
};

export default CandidateAnalytics;
