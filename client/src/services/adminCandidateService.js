import apiClient from "../api/apiClient";

/**
 * 👑 Admin Candidate Service
 */
const adminCandidateService = {
    /**
     * Fetch all candidates with query params
     */
    getAll: async (params = {}) => {
        return await apiClient.get("/admin/candidates", { params });
    },

    /**
     * Create candidate record (if needed by admin)
     */
    create: async (payload) => {
        return await apiClient.post("/admin/candidates", payload);
    },

    /**
     * Update existing candidate record
     */
    update: async (id, payload) => {
        return await apiClient.put(`/admin/candidates/${id}`, payload);
    },

    /**
     * Toggle identity verification status
     */
    toggleVerification: async (id) => {
        return await apiClient.put(`/admin/candidates/${id}/verify`);
    },

    /**
     * Toggle account block status
     */
    toggleBlock: async (id) => {
        // Check backend toggle methodology - most use /block/unblock or same endpoint
        return await apiClient.patch(`/admin/candidates/${id}/block`);
    },

    /**
     * Delete single candidate profile
     */
    delete: async (id) => {
        return await apiClient.delete(`/admin/candidates/${id}`);
    },

    /**
     * Bulk deletion (Caution!)
     */
    deleteAll: async () => {
        return await apiClient.delete("/admin/candidates");
    },
};

export default adminCandidateService;
