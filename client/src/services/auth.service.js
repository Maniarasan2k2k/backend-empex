import api from "../api/api";

/**
 * 👑 ADMIN AUTH SERVICE
 */
const authService = {
  /**
   * Request Access (Phase 1)
   */
  loginAdmin: async (credentials) => {
    // credentials: { email, password }
    const response = await api.post("/admin/auth/login", credentials);
    return response; // { success, otp, email, userId }
  },

  /**
   * Verify OTP & Finalize Login (Phase 2)
   */
  verifyAdminOTP: async (payload) => {
    // payload: { email, otp }
    const response = await api.post("/admin/auth/verify-otp", payload);
    if (response.success && response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response; // { success, token, user }
  },

  /**
   * Logout (Clear sessions)
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  /**
   * Get Current Session User
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  /**
   * Is User Authenticated?
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * Role check helper
   */
  hasRole: (roleKey) => {
    const user = authService.getCurrentUser();
    return user?.role?.key === roleKey;
  }
};

export default authService;
