import { Box, Typography } from "@mui/material";

const DashboardCard = ({ title, value, color }) => (
  <Box
    sx={{
      p: 3,
      borderRadius: 4,
      background: "linear-gradient(145deg, , )",
      border: `1px solid ${color}20`,
      boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: `0 12px 24px ${color}30`,
      },
    }}
  >
    <Typography fontSize="0.85rem" color="text.secondary">
      {title}
    </Typography>

    <Typography
      variant="h4"
      fontWeight={700}
      sx={{
        mt: 1,
        color: color,
      }}
    >
      {value ?? 0}
    </Typography>
  </Box>
);

export default DashboardCard;
