const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
    userName: { type: String },
    userEmail: { type: String, required: true },
    userRole: { type: String, required: true },
    module: { type: String, required: true },
    action: { type: String, required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED"], default: "SUCCESS" },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    details: { type: String },
    oldData: { type: mongoose.Schema.Types.Mixed },
    newData: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    error: { type: String },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminUser",
    },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model("AuditLog", AuditLogSchema);
