import { Paper, Typography, Divider, Stack, Chip } from "@mui/material";

const ActivitySection = ({ logs }) => (
  <Paper sx={{ p:3, borderRadius:4 }}>
    <Typography fontWeight={600}>Recent Activity</Typography>
    <Divider sx={{ my:2 }} />

    {logs.map(log => (
      <Stack
        key={log._id}
        direction="row"
        justifyContent="space-between"
        mb={1}
      >
        <Typography fontSize="0.9rem">
          {log.userEmail} – {log.action}
        </Typography>

        <Chip
          label={log.status}
          color={log.status === "SUCCESS" ? "success" : "error"}
          size="small"
        />
      </Stack>
    ))}
  </Paper>
);

export default ActivitySection;
