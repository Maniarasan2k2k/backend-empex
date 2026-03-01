// src/state/api.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

console.log("✅ API BASE URL:", BASE_URL);

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Auth", "Admins", "Users", "Roles", "Permissions", "Notifications"],

  endpoints: (builder) => ({
    /* ================= AUTH ================= */
    login: builder.mutation({
      query: (body) => ({
        url: "/admin/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/admin/auth/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    register: builder.mutation({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    /* ================= ADMINS ================= */
    getAdmins: builder.query({
      query: () => "/admin/users",
      providesTags: ["Admins"],
    }),

    createAdmin: builder.mutation({
      query: (body) => ({
        url: "/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admins"],
    }),

    updateAdmin: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Admins"],
    }),

    toggleAdminStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Admins"],
    }),

    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admins"],
    }),

    /* ================= USERS (Candidates) ================= */
    getUsers: builder.query({
      query: () => "/admin/candidates",
      providesTags: ["Users"],
    }),

    /* ================= ROLES ================= */
    getRoles: builder.query({
      query: () => "/admin/roles",
      transformResponse: (response) => response || [], // Roles return array directly often
      providesTags: ["Roles"],
    }),

    createRole: builder.mutation({
      query: (body) => ({
        url: "/admin/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Roles"],
    }),

    updateRole: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/roles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Roles"],
    }),

    assignPermissions: builder.mutation({
      query: ({ roleId, permissions }) => ({
        url: `/admin/roles/${roleId}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
      invalidatesTags: ["Roles"],
    }),

    /* ================= PERMISSIONS ================= */
    getPermissions: builder.query({
      query: () => "/admin/permissions",
      providesTags: ["Permissions"],
    }),

    createPermission: builder.mutation({
      query: (body) => ({
        url: "/admin/permissions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Permissions"],
    }),

    /* ================= NOTIFICATIONS ================= */
    getNotifications: builder.query({
      query: ({ page }) => ({
        url: `/admin/notifications?page=${page}`,
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),

    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/admin/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    markAllRead: builder.mutation({
      query: () => ({
        url: `/admin/notifications/mark-all-read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

/* ===== Hooks Export ===== */
export const {
  useLoginMutation,
  useRegisterMutation,

  /* ADMINS */
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useToggleAdminStatusMutation,
  useDeleteAdminMutation,

  /* USERS */
  useGetUsersQuery,

  /* ROLES */
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useAssignPermissionsMutation,

  /* PERMISSIONS */
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useVerifyOtpMutation,
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllReadMutation,
} = api;
