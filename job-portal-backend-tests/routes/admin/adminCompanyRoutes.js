const express = require("express");
const {
    getCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    updateCompanyStatus,
    deleteCompany,
} = require("../../controllers/admin/adminCompanyController");
const { adminAuthMiddleware } = require("../../utils/adminAuthMiddleware");
const { allowPermissions } = require("../../utils/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const router = express.Router();

router.get("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_COMPANIES), getCompanies);
router.get("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.VIEW_COMPANIES), getCompanyById);
router.post("/", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_COMPANIES), createCompany);
router.put("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_COMPANIES), updateCompany);
router.delete("/:id", adminAuthMiddleware, allowPermissions(PERMISSIONS.MANAGE_COMPANIES), deleteCompany);
router.patch("/:id/status", adminAuthMiddleware, allowPermissions(PERMISSIONS.VERIFY_COMPANIES), updateCompanyStatus);

module.exports = router;
