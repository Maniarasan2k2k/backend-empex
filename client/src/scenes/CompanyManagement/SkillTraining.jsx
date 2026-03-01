import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Switch,
  Chip,
  Divider,
} from "@mui/material";
import axios from "state/instant";

/* =========================
   CONSTANTS (BACKEND MATCH)
========================= */
const LANGUAGES = ["English", "Tamil", "Hindi"];
const STATUS = ["DRAFT", "PUBLISHED", "COMPLETED"];
const CATEGORY = ["IT", "SOFT SKILLS", "NON-IT"];

const CreateSkillTraining = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    shortTag: "",
    description: "",
    category: "",
    date: "",
    time: "",
    durationMinutes: "",
    language: [],
    price: "",
    isFree: true,
    benefits: [],
    curriculum: [],
    instructor: {
      name: "",
      photo: "",
      designation: "",
    },
    maxSeats: "",
    status: "DRAFT",
    isActive: true,
  });

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleInstructorChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      instructor: { ...form.instructor, [name]: value },
    });
  };

  const handleArrayInput = (key, value) => {
    setForm({ ...form, [key]: value.split("\n").filter(Boolean) });
  };

  const toggleLanguage = (lang) => {
    setForm({
      ...form,
      language: form.language.includes(lang)
        ? form.language.filter((l) => l !== lang)
        : [...form.language, lang],
    });
  };

  /* =========================
     SUBMIT (FINAL FIX)
  ========================= */
  const handleSubmit = async () => {
    // 🔒 FRONTEND VALIDATION
    if (!form.title || !form.category || !form.date || !form.time) {
      alert("Required fields missing ❌");
      return;
    }

    if (form.language.length === 0) {
      alert("Select at least one language ❌");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title,
        shortTag: form.shortTag,
        description: form.description,
        category: form.category,
        date: new Date(form.date), // ✅ FIX
        time: form.time,
        durationMinutes: Number(form.durationMinutes),
        language: form.language,
        price: form.isFree ? 0 : Number(form.price),
        isFree: form.isFree,
        benefits: form.benefits,
        curriculum: form.curriculum,
        instructor: form.instructor,
        maxSeats: Number(form.maxSeats),
        status: form.status,
        isActive: form.isActive,
      };

      await axios.post("/admin/skill-trainings", payload);

      alert("Skill Training Created Successfully ✅");

      // RESET
      setForm({
        title: "",
        shortTag: "",
        description: "",
        category: "",
        date: "",
        time: "",
        durationMinutes: "",
        language: [],
        price: "",
        isFree: true,
        benefits: [],
        curriculum: [],
        instructor: { name: "", photo: "", designation: "" },
        maxSeats: "",
        status: "DRAFT",
        isActive: true,
      });
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Create failed ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <Box p={3} maxWidth={900}>
      <Typography variant="h4" fontWeight={600}>
        Create Skill Training
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Admin – Skill Training Management
      </Typography>

      <Stack spacing={2}>
        <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth />
        <TextField label="Short Tag" name="shortTag" value={form.shortTag} onChange={handleChange} />

        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          rows={3}
        />

        <Stack direction="row" spacing={2}>
          <TextField select label="Category" name="category" value={form.category} onChange={handleChange} fullWidth>
            {CATEGORY.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>

          <TextField select label="Status" name="status" value={form.status} onChange={handleChange} fullWidth>
            {STATUS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField type="date" name="date" value={form.date} onChange={handleChange} fullWidth />
          <TextField label="Time" name="time" value={form.time} onChange={handleChange} fullWidth />
          <TextField label="Duration (minutes)" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} fullWidth />
        </Stack>

        {/* LANGUAGE */}
        <Box>
          <Typography fontWeight={600}>Languages</Typography>
          <Stack direction="row" spacing={1} mt={1}>
            {LANGUAGES.map((l) => (
              <Chip
                key={l}
                label={l}
                clickable
                color={form.language.includes(l) ? "primary" : "default"}
                onClick={() => toggleLanguage(l)}
              />
            ))}
          </Stack>
        </Box>

        {/* PRICE */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography>Free Session</Typography>
          <Switch checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
          {!form.isFree && (
            <TextField label="Price" name="price" value={form.price} onChange={handleChange} />
          )}
        </Stack>

        <Divider />

        <TextField label="Benefits (one per line)" multiline rows={3} onChange={(e) => handleArrayInput("benefits", e.target.value)} />
        <TextField label="Curriculum (one per line)" multiline rows={4} onChange={(e) => handleArrayInput("curriculum", e.target.value)} />

        <Divider />

        <Typography fontWeight={600}>Instructor</Typography>
        <Stack direction="row" spacing={2}>
          <TextField label="Name" name="name" value={form.instructor.name} onChange={handleInstructorChange} fullWidth />
          <TextField label="Designation" name="designation" value={form.instructor.designation} onChange={handleInstructorChange} fullWidth />
        </Stack>
        <TextField label="Photo URL" name="photo" value={form.instructor.photo} onChange={handleInstructorChange} fullWidth />

        <TextField label="Max Seats" name="maxSeats" value={form.maxSeats} onChange={handleChange} />

        <Button variant="contained" size="large" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create Skill Training"}
        </Button>
      </Stack>
    </Box>
  );
};

export default CreateSkillTraining;

