import {
  Dashboard,
  People,
  AdminPanelSettings,
  Business,
  Work,
  Verified,
  Assignment,
  Assessment,
  Settings,
} from "@mui/icons-material";

import { ROLES } from "constants/roles";

const menuConfig = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <Dashboard />,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MODERATOR],
  },

  {
    label: "Admins",
    path: "/admins",
    icon: <AdminPanelSettings />,
    roles: [ROLES.SUPER_ADMIN],
  },

  {
    label: "Roles & Permissions",
    path: "/roles",
    icon: <Assignment />,
    roles: [ROLES.SUPER_ADMIN],
  },

  {
    label: "Companies",
    path: "/companies",
    icon: <Business />,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },

  {
    label: "Company Verification",
    path: "/companies/verification",
    icon: <Verified />,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },

  {
    label: "Users",
    path: "/users",
    icon: <People />,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },

  {
    label: "Jobs",
    path: "/jobs",
    icon: <Work />,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MODERATOR],
  },

  {
    label: "ATS Pipeline",
    path: "/applications/pipeline",
    icon: <Assessment />,
    roles: [ROLES.ADMIN, ROLES.MODERATOR],
  },

  {
    label: "System Settings",
    path: "/settings",
    icon: <Settings />,
    roles: [ROLES.SUPER_ADMIN],
  },
];

export default menuConfig;
