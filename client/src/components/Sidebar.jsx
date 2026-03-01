import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";

import {
  DashboardOutlined,
  AdminPanelSettingsOutlined,
  GroupsOutlined,
  BusinessOutlined,
  WorkOutlineOutlined,
  AssignmentOutlined,
  SmartToyOutlined,
  PaymentsOutlined,
  BarChartOutlined,
  ReceiptLongOutlined,
  SecurityOutlined,
  NotificationsOutlined,
  SettingsOutlined,
  ChevronLeft,
  ChevronRightOutlined,
  CircleOutlined,
  ExpandMore,
   ExpandLess,
} from "@mui/icons-material";

import { FlexBetween } from ".";
import profileImage from "assets/profile.jpeg";



const SidebarItem = ({ item, active, navigate, theme }) => {
  const [open, setOpen] = useState(false);

  const isParentActive =
    item.children &&
    item.children.some((child) => active === child.path);

  const isActive = active === item.path || isParentActive;

  const handleClick = () => {
    if (item.children) {
      setOpen((prev) => !prev);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* ===== MAIN ITEM ===== */}
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleClick}
          sx={{
            mx: "1rem",
            mb: "0.3rem",
            borderRadius: "10px",
            transition: "all 0.2s ease",
            backgroundColor: isActive
              ? theme.palette.secondary[300]
              : "transparent",
            "&:hover": {
              backgroundColor: theme.palette.secondary[200],
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: isActive
                ? theme.palette.primary.main
                : theme.palette.secondary[300],
            }}
          >
            {item.icon}
          </ListItemIcon>

          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: "0.9rem",
              fontWeight: isActive ? 600 : 400,
            }}
          />

          {item.children &&
            (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {/* ===== SUB MENU ===== */}
      {item.children && open && (
        <List component="div" disablePadding>
          {item.children.map((child) => {
            const isChildActive = active === child.path;

            return (
              <ListItemButton
                key={child.path}
                sx={{
                  pl: 6,
                  mx: "1rem",
                  mb: "0.2rem",
                  borderRadius: "8px",
                  backgroundColor: isChildActive
                    ? theme.palette.secondary[200]
                    : "transparent",
                  "&:hover": {
                    backgroundColor: theme.palette.secondary[100],
                  },
                }}
                onClick={() => navigate(child.path)}
              >
                <ListItemText
                  primary={child.label}
                  primaryTypographyProps={{
                    fontSize: "0.85rem",
                    fontWeight: isChildActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      )}
    </>
  );
};








/* =========================
   SIDEBAR DATA (ENTERPRISE)
========================= */





const sidebarData = [
  {
    section: "GENERAL",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlined /> },
    ],
  },

  {
    section: "ADMIN CONTROL",
    items: [
      { label: "Admins", path: "/admins", icon: <AdminPanelSettingsOutlined /> },
      { label: "Roles & Permissions", path: "/roles", icon: <SecurityOutlined /> },
    ],
  },

  {
    section: "USER MANAGEMENT",
    items: [
      { label: "Candidate User", path: "/users", icon: <GroupsOutlined /> },
      { label: "Candidate Profile", path: "/profile", icon: <GroupsOutlined /> },
      { label: "Fraud Flags", path: "/users/fraud", icon: <SecurityOutlined /> },
    ],
  },

  {
    section: "Company MANAGEMENT",
    items: [
      { label: "Company Profiles", path: "/company-profile", icon: <GroupsOutlined /> },
      { label: "Company Users", path: "/users/blocked", icon: <CircleOutlined /> },
    ],
  },

  {
    section: "Meeting & Webinar",
    items: [
      { label: "Virtual Meet", path: "/companies", icon: <BusinessOutlined /> },
      {
        label: "Skill",
        path: "/companies/verification",
        icon: <AssignmentOutlined />,
      },
      {
        label: "Tutorial",
        path: "/tutorial",
        icon: <AssignmentOutlined />,
      },
      {
        label: "Create Skill Training",
        path: "/skilltrain",
        icon: <AssignmentOutlined />,
      },
      {
        label: "Create Tutorial",
        path: "/createtutorial",
        icon: <AssignmentOutlined />,
      },
    ],
  },


  {
    section: "JOB & ATS",
    items: [
      { label: "Govt Jobs", path: "/jobs", icon: <WorkOutlineOutlined /> },
      {
        label: "Jobs Posted",
        path: "/jobs/pending",
        icon: <AssignmentOutlined />,
      },
      {
        label: "Applied Jobs",
        path: "/applications",
        icon: <AssignmentOutlined />,
      },
      {
        label: "ATS Pipelines",
        path: "/applications/pipeline",
        icon: <BarChartOutlined />,
      },
    ],
  },

  {
    section: "AI & BILLING",
    items: [
      { label: "AI Usage", path: "/ai/usage", icon: <SmartToyOutlined /> },
      { label: "AI Limits", path: "/ai/limits", icon: <SecurityOutlined /> },
      {
        label: "Subscriptions",
        path: "/subscriptions",
        icon: <PaymentsOutlined />,
      },
      { label: "Payments", path: "/payments", icon: <PaymentsOutlined /> },
      { label: "Refunds", path: "/refunds", icon: <ReceiptLongOutlined /> },
    ],
  },

  {
  section: "REPORTING & AUDIT",
  items: [
    {
      label: "Reports",
      path: "/reports",
      icon: <BarChartOutlined />,
      children: [
        {
          label: "College Candidates Report",
          path: "/college-candidates",
        },
        {
          label: "Candidate Reference Report",
          path: "/candidate-references",
        },
        {
          label: "Company Reference Report",
          path: "/company-references",
        },
      ],
    },
    {
      label: "Revenue Report",
      path: "/reports/revenue",
      icon: <BarChartOutlined />,
    },
    {
      label: "Audit Logs",
      path: "/audit/logs",
      icon: <ReceiptLongOutlined />,
    },
    {
      label: "Security Logs",
      path: "/audit/security",
      icon: <SecurityOutlined />,
    },
  ],
},


  {
    section: "SYSTEM",
    items: [
      {
        label: "Notifications",
        path: "/notifications",
        icon: <NotificationsOutlined />,
      },
      { label: "Settings", path: "/settings", icon: <SettingsOutlined /> },
    ],
  },
];

/* =========================
   SIDEBAR COMPONENT
========================= */
const Sidebar = ({
  user,
  isNonMobile,
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [active, setActive] = useState("");
  

  useEffect(() => {
    setActive(pathname);
  }, [pathname]);

  // <Route path="*" element={<Navigate to="/login" replace />} />

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          variant="persistent"
          anchor="left"
          open={isSidebarOpen}
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              backgroundColor: theme.palette.background.alt,
              borderRight: isNonMobile ? "none" : "1px solid #333",
            },
          }}
        >
          {/* ===== BRAND ===== */}
          <Box px="2rem" py="1.5rem">
            <FlexBetween>
              <Typography
                variant="h4"
                fontWeight="700"
                sx={{ cursor: "pointer" }}
                onClick={() => navigate("/dashboard")}
              >
                EMPEX HITECH
              </Typography>
              {!isNonMobile && (
                <IconButton onClick={() => setIsSidebarOpen(false)}>
                  <ChevronLeft />
                </IconButton>
              )}
            </FlexBetween>
          </Box>

          {/* ===== MENU ===== */}
          <List>
            {sidebarData.map((group) => (
              <Box key={group.section}>
                <Typography
                  sx={{
                    mt: "1.8rem",
                    mb: "0.6rem",
                    ml: "2rem",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    color: theme.palette.secondary[400],
                  }}
                >
                  {group.section}
                </Typography>

                {group.items.map((item) => (
  <SidebarItem
    key={item.path}
    item={item}
    active={active}
    navigate={navigate}
    theme={theme}
  />
))}

              </Box>
            ))}
          </List>

          {/* ===== FOOTER ===== */}
          <Box mt="auto" px="2rem" py="1.2rem">
            <Divider />
            <FlexBetween mt="1rem">
              <Box
                component="img"
                src={profileImage}
                height="42px"
                width="42px"
                borderRadius="50%"
              />
              <Box>
                <Typography fontWeight="600" fontSize="0.85rem">
                  {user?.role?.key}
                </Typography>
                <Typography fontSize="0.7rem" color="secondary">
                  {user?.role?.key}
                </Typography>
              </Box>
              <SettingsOutlined fontSize="small" />
            </FlexBetween>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;