const mongoose = require("mongoose");

const TutorialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  foss: { type: String, required: true },        // e.g., "Advanced Cpp"
  language: { type: String, default: "English" },
  level: { type: String, default: "Basic" },
  
  videoUrl: { type: String, required: true },
  videoId: { type: String },                     // We will extract this from the URL
  
  outline: { type: String },                     // Short text for the list page
  transcript: { type: String },                  // Long text for the detail page
  
  resources: {
    instructionSheet: { type: String },
    codeFiles: { type: String },
    assignment: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model("Tutorial", TutorialSchema);