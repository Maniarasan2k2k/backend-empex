import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { setMode } from "state";
import { useNavigate } from "react-router-dom";

import {
  AppBar,
  useTheme,
  Toolbar,
  Menu,
  MenuItem,
  Button,
  Box,
  Typography,
  IconButton,
  InputBase,
  Avatar,
} from "@mui/material";

import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
  LogoutOutlined,
} from "@mui/icons-material";

import { FlexBetween } from ".";
import profileImage from "assets/profile.jpeg";

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  const isOpen = Boolean(anchorEl);

  /* =============================
     Load Logged-In User (SAFE)
  ============================== */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) return;

      const parsedUser = JSON.parse(storedUser);

      // Support multiple possible login response structures
      const finalUser =
        parsedUser?.user ||
        parsedUser?.data ||
        parsedUser;

      setUser(finalUser);
    } catch (error) {
      console.error("Invalid user in localStorage");
      setUser(null);
    }
  }, []);

  /* =============================
     Dynamic Name Resolver
  ============================== */
  const displayName = useMemo(() => {
    if (!user) return "";

    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.email?.split("@")[0] ||
      "User"
    );
  }, [user]);

  const displayRole = useMemo(() => {
  if (!user) return "";

  return user.role.name || user.userRole || "Admin";
}, [user]);

  const userInitial = useMemo(() => {
    return displayName ? displayName.charAt(0).toUpperCase() : "";
  }, [displayName]);

  /* =============================
     Handlers
  ============================== */
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    handleMenuClose();
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: "transparent",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* ================= LEFT ================= */}
        <FlexBetween>
          <IconButton
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Toggle Sidebar"
          >
            <MenuIcon />
          </IconButton>

          <FlexBetween
            backgroundColor={theme.palette.background.alt}
            borderRadius="8px"
            px={2}
            py={0.5}
            ml={2}
            width="250px"
          >
            <InputBase
              placeholder="Search..."
              sx={{ fontSize: "0.9rem", flex: 1 }}
            />
            <IconButton size="small">
              <Search fontSize="small" />
            </IconButton>
          </FlexBetween>
        </FlexBetween>

        {/* ================= RIGHT ================= */}
        <FlexBetween gap="1.5rem">
          {/* Theme Toggle */}
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlined />
            ) : (
              <LightModeOutlined />
            )}
          </IconButton>

          {/* Settings */}
          <IconButton>
            <SettingsOutlined />
          </IconButton>

          {/* USER INFO */}
          {user && (
            <>
              <Button
                onClick={handleMenuOpen}
                sx={{
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Avatar
                  src={profileImage}
                  alt={displayName}
                  sx={{ width: 32, height: 32 }}
                >
                  {userInitial}
                </Avatar>

                <Box textAlign="left">
                  <Typography fontSize="0.85rem" fontWeight={600}>
                    {displayName}
                  </Typography>
                  <Typography fontSize="0.7rem" color="text.secondary">
                    {displayRole}
                  </Typography>
                </Box>

                <ArrowDropDownOutlined />
              </Button>

              {/* DROPDOWN */}
              <Menu
                anchorEl={anchorEl}
                open={isOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutOutlined fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
