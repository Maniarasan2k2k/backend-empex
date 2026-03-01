import { Paper, Typography, Stack, Box } from "@mui/material";

const StatCard = ({ title, value, icon }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      background: "white",
      border: "1px solid #e0e0e0",
      transition: "0.3s",
      "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.08)" },
    }}
  >
    <Stack direction="row" justifyContent="space-between">
      <Box>
        <Typography fontSize="0.9rem" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
      </Box>
      {icon}
    </Stack>
  </Paper>
);

export default StatCard;
