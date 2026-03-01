/**
 * ==================================================
 * AUDIT LOGS RTK QUERY SLICE
 * ==================================================
 * 
 * Purpose: Fetch and manage audit logs from backend
 * Usage:
 * import { useGetAuditLogsQuery, useGetAuditStatsQuery } from "state/auditLogsAPI";
 * 
 * const { data, isLoading, error } = useGetAuditLogsQuery({
 *   page: 1,
 *   limit: 20,
 *   module: "JOBS",
 *   action: "CREATE"
 * });
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token") || null;
};

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  prepareHeaders: (headers) => {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const auditLogsAPI = createApi({
  reducerPath: "auditLogsAPI",
  baseQuery,
  tagTypes: ["AuditLogs"],

  endpoints: (builder) => ({
    /**
     * GET ALL AUDIT LOGS (with filtering and pagination)
     */
    getAuditLogs: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          limit = 20,
          module,
          action,
          userId,
          targetType,
          search,
          startDate,
          endDate,
        } = params;

        const queryParams = new URLSearchParams();
        queryParams.append("page", page);
        queryParams.append("limit", limit);

        if (module) queryParams.append("module", module);
        if (action) queryParams.append("action", action);
        if (userId) queryParams.append("userId", userId);
        if (targetType) queryParams.append("targetType", targetType);
        if (search) queryParams.append("search", search);
        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);

        return `/admin/audit-logs?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ _id }) => ({
              type: "AuditLogs",
              id: _id,
            })),
            "AuditLogs",
          ]
          : ["AuditLogs"],
    }),

    /**
     * GET SINGLE AUDIT LOG DETAIL
     */
    getAuditLogDetail: builder.query({
      query: (auditLogId) => `/admin/audit-logs/${auditLogId}`,
      providesTags: (result, error, id) => [{ type: "AuditLogs", id }],
    }),

    /**
     * GET AUDIT LOG STATISTICS
     */
    getAuditStats: builder.query({
      query: (params = {}) => {
        const { startDate, endDate } = params;
        const queryParams = new URLSearchParams();

        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);

        return `/admin/audit-logs/stats?${queryParams.toString()}`;
      },
      providesTags: ["AuditLogs"],
    }),

    /**
     * GET AUDIT LOGS BY USER
     */
    getAuditByUser: builder.query({
      query: (params) => {
        const { userId, page = 1, limit = 20 } = params;
        return `/admin/audit-logs/user/${userId}?page=${page}&limit=${limit}`;
      },
      providesTags: (result, error, { userId }) => [
        { type: "AuditLogs", id: `user-${userId}` },
      ],
    }),

    /**
     * GET AUDIT LOGS BY MODULE
     */
    getAuditByModule: builder.query({
      query: (params) => {
        const { module, page = 1, limit = 20 } = params;
        return `/admin/audit-logs/module/${module}?page=${page}&limit=${limit}`;
      },
      providesTags: (result, error, { module }) => [
        { type: "AuditLogs", id: `module-${module}` },
      ],
    }),

    /**
     * EXPORT AUDIT LOGS (CSV)
     * Note: This returns a blob/file, not JSON
     */
    exportAuditLogs: builder.query({
      query: (params = {}) => {
        const { module, action, startDate, endDate } = params;
        const queryParams = new URLSearchParams();

        if (module) queryParams.append("module", module);
        if (action) queryParams.append("action", action);
        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);

        return `/admin/audit-logs/export/csv?${queryParams.toString()}`;
      },
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetAuditLogDetailQuery,
  useGetAuditStatsQuery,
  useGetAuditByUserQuery,
  useGetAuditByModuleQuery,
  useExportAuditLogsQuery,
} = auditLogsAPI;
