const Role = require("../../models/Role");
const Permission = require("../../models/Permission");

const auditService = require("../../services/auditService");
const { sendNotification } = require("../../services/notificationService");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// CREATE ROLE
const createRole = async (req, res) => {
    try {
        const { name, key, permissions, isActive, description } = req.body;

        if (!name || !key) {
            return res.status(400).json({ message: "Name and Key are required" });
        }

        const role = await Role.create({
            name,
            key: key.toUpperCase(),
            permissions: permissions || [],
            isActive: isActive !== undefined ? isActive : true,
            description: description || "",
        });

        await auditService.auditCreate(req, "ROLES", role._id, "Role", `Created role: ${role.name}`, role);

        res.status(201).json(role);
    } catch (error) {
        auditService.auditError(req, "ROLES", "CREATE", "Role", "Failed to create role", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// GET ALL ROLES
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate("permissions");
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// GET SINGLE ROLE
const getRoleById = async (req, res) => {
    try {
        const { roleId } = req.params;
        if (!isValidObjectId(roleId)) return res.status(400).json({ message: "Invalid ID" });

        const role = await Role.findById(roleId).populate("permissions");
        if (!role) return res.status(404).json({ message: "Role not found" });

        res.json(role);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// UPDATE ROLE
const updateRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        if (!isValidObjectId(roleId)) return res.status(400).json({ message: "Invalid ID" });

        const role = await Role.findById(roleId);
        if (!role) return res.status(404).json({ message: "Role not found" });

        const oldData = JSON.parse(JSON.stringify(role));
        Object.assign(role, req.body);
        const updated = await role.save();

        await auditService.auditUpdate(req, "ROLES", roleId, "Role", `Updated role: ${role.name}`, oldData, updated);

        res.json(updated);
    } catch (error) {
        auditService.auditError(req, "ROLES", "UPDATE", "Role", "Failed to update role", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ASSIGN PERMISSIONS TO ROLE
const assignPermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissions } = req.body; // array of permission IDs

        const role = await Role.findById(roleId);
        if (!role) return res.status(404).json({ message: "Role not found" });

        const oldData = { permissions: role.permissions };
        role.permissions = permissions;
        await role.save();

        await auditService.auditUpdate(req, "ROLES", roleId, "Role", `Assigned permissions to: ${role.name}`, oldData, { permissions });

        res.json(role);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// DELETE ROLE
const deleteRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        if (!isValidObjectId(roleId)) return res.status(400).json({ message: "Invalid ID" });

        const role = await Role.findById(roleId);
        if (!role) return res.status(404).json({ message: "Role not found" });

        // Prevent deletion of system roles
        if (["SUPER_ADMIN", "ADMIN"].includes(role.key)) {
            return res.status(403).json({ message: "Cannot delete system roles" });
        }

        await auditService.auditDelete(req, "ROLES", roleId, "Role", `Deleted role: ${role.name}`, role);
        await Role.findByIdAndDelete(roleId);

        res.json({ message: "Role deleted successfully" });
    } catch (error) {
        auditService.auditError(req, "ROLES", "DELETE", "Role", "Failed to delete role", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    assignPermissions,
    deleteRole,
};
