import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Divider
} from "@mui/material";
import axios from "state/instant";

const LEVELS = ["Basic", "Intermediate", "Advanced"];
const LANGUAGES = ["English", "Tamil", "Hindi"];

const CreateTutorial = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    foss: "",
    language: "English",
    level: "Basic",
    videoUrl: "",
    outline: "",
    transcript: "",
    instructionSheet: "",
    codeFiles: "",
    assignment: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:youtu\.be\/|v=)([^&]+)/);
    return match ? match[1] : "";
  };

  const handleSubmit = async () => {
    if (!form.title || !form.foss || !form.videoUrl) {
      alert("Required fields missing ❌");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title,
        foss: form.foss,
        language: form.language,
        level: form.level,
        videoUrl: form.videoUrl,
        videoId: extractVideoId(form.videoUrl),
        outline: form.outline,
        transcript: form.transcript,
        resources: {
          instructionSheet: form.instructionSheet,
          codeFiles: form.codeFiles,
          assignment: form.assignment
        }
      };

      await axios.post("/admin/tutorials", payload);

      alert("Tutorial Created Successfully ✅");

      setForm({
        title: "",
        foss: "",
        language: "English",
        level: "Basic",
        videoUrl: "",
        outline: "",
        transcript: "",
        instructionSheet: "",
        codeFiles: "",
        assignment: ""
      });
    } catch (err) {
      console.error(err);
      alert("Create failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3} maxWidth={900}>
      <Typography variant="h4" fontWeight={600}>
        Create Tutorial
      </Typography>

      <Stack spacing={2} mt={3}>
        <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth />
        <TextField label="FOSS / Course Name" name="foss" value={form.foss} onChange={handleChange} fullWidth />

        <Stack direction="row" spacing={2}>
          <TextField select label="Language" name="language" value={form.language} onChange={handleChange} fullWidth>
            {LANGUAGES.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </TextField>

          <TextField select label="Level" name="level" value={form.level} onChange={handleChange} fullWidth>
            {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </TextField>
        </Stack>

        <TextField label="YouTube Video URL" name="videoUrl" value={form.videoUrl} onChange={handleChange} fullWidth />

        <Divider />

        <TextField label="Outline" multiline rows={3} name="outline" value={form.outline} onChange={handleChange} />
        <TextField label="Transcript" multiline rows={6} name="transcript" value={form.transcript} onChange={handleChange} />

        <Divider />

        <Typography fontWeight={600}>Resources</Typography>
        <TextField label="Instruction Sheet URL" name="instructionSheet" value={form.instructionSheet} onChange={handleChange} />
        <TextField label="Code Files URL" name="codeFiles" value={form.codeFiles} onChange={handleChange} />
        <TextField label="Assignment URL" name="assignment" value={form.assignment} onChange={handleChange} />

        <Button variant="contained" size="large" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Create Tutorial"}
        </Button>
      </Stack>
    </Box>
  );
};

export default CreateTutorial;
