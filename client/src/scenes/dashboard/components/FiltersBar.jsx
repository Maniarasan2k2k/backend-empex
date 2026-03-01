import { Stack, TextField, Button } from "@mui/material";
import { useState } from "react";

const FiltersBar = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const applyFilter = () => {
    // Validation
    if (startDate && endDate && startDate > endDate) {
      alert("Start date cannot be after End date");
      return;
    }

    onFilterChange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    onFilterChange({});
  };

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems="center"
      sx={{ background: "", p: 2, borderRadius: 2 }}
    >
      <TextField
        type="date"
        size="small"
        label="Start Date"
        value={startDate}
        InputLabelProps={{ shrink: true }}
        onChange={(e) => setStartDate(e.target.value)}
        fullWidth
      />

      <TextField
        type="date"
        size="small"
        label="End Date"
        value={endDate}
        InputLabelProps={{ shrink: true }}
        onChange={(e) => setEndDate(e.target.value)}
        fullWidth
      />

      <Button
        variant="contained"
        color="primary"
        onClick={applyFilter}
        sx={{ minWidth: 100 }}
      >
        Apply
      </Button>

      <Button
        variant="outlined"
        color="secondary"
        onClick={clearFilter}
        sx={{ minWidth: 100 }}
      >
        Clear
      </Button>
    </Stack>
  );
};

export default FiltersBar;
