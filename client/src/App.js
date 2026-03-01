import React, { useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "scenes/auth/Login";
import Register from "scenes/auth/Register";



// Theme
import { themeSettings } from "theme";

// Layout + Pages (UNCHANGED)
import {
  Layout,
  Dashboard,
  Products,
  Customers,
  Transactions,
  Geography,
  Overview,
  Daily,
  Monthly,
  Breakdown,
  Admin,
  Performance,
} from "scenes";

import AdminPage from "scenes/admin/Admins.jsx";
import Roles from "scenes/RolesPermissions/RolesPermissions.jsx";
import Companies from "scenes/CompanyManagement/Companies";
import Verification from "scenes/CompanyManagement/VerificationRequests";
import AllUser from "scenes/UserManagement/AllUsers";
import BlockedUsers from "scenes/UserManagement/BlockedUsers";
import FlagUsers from "scenes/UserManagement/FraudFlagUsers";
import Jobs from "scenes/JobsAts/Jobs";
import Pending from "scenes/JobsAts/PendingApprovals";
import Applicant from "scenes/JobsAts/Applications";
import ATS from "scenes/JobsAts/ATS";
import Reporting from "scenes/ReportingAudit/Reports";
import Revenue from "scenes/ReportingAudit/Revenue";
import Auditlog from "scenes/ReportingAudit/AuditLog";
import SecurityLog from "scenes/ReportingAudit/SecurityLog";
import Notification from "scenes/system/Notifications";
import System from "scenes/system/SystemSettings";
import ProtectedRoute from "routes/ProtectedRoute";
import Tutorial from "scenes/CompanyManagement/Tutorial";
import SkillTraining from "scenes/CompanyManagement/SkillTraining";
import CreateTutorial from "scenes/CompanyManagement/CreateTutorial";
import CandidateProfile from "scenes/UserManagement/CandidateProfile";
import CompanyProfiles from "scenes/CompanyManagement/CompanyProfiles";
import CompanyUsers from "scenes/CompanyManagement/CompanyUsers";
import CandidateReferences from "scenes/ReportingAudit/CandidateReferences";
import CollegeCandidates from "scenes/ReportingAudit/CollegeCandidates";
import CompanyReferences from "scenes/ReportingAudit/CompanyReferences";

const App = () => {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Routes>
          {/* ---------------- AUTH ONLY ---------------- */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />




          {/* ---------------- AFTER LOGIN ---------------- */}
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/geography" element={<Geography />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/daily" element={<Daily />} />
            <Route path="/monthly" element={<Monthly />} />
            <Route path="/breakdown" element={<Breakdown />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/performance" element={<Performance />} />

            <Route path="/admins" element={<AdminPage />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/verification" element={<Verification />} />

            <Route path="/users" element={<AllUser />} />
            <Route path="/users/blocked" element={<CompanyUsers />} />
            <Route path="/users/fraud" element={<FlagUsers />} />

            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/pending" element={<Pending />} />
            <Route path="/applications" element={<Applicant />} />
            <Route path="/applications/pipeline" element={<ATS />} />

            <Route path="/reports" element={<Reporting />} />
            <Route path="/reports/revenue" element={<Revenue />} />

            <Route path="/audit/logs" element={<Auditlog />} />
            <Route path="/audit/security" element={<SecurityLog />} />

            <Route path="/notifications" element={<Notification />} />
            <Route path="/settings" element={<System />} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/skilltrain" element={<SkillTraining />} />
            <Route path="/createtutorial" element={<CreateTutorial />} />
            <Route path="/profile" element={<CandidateProfile />} />
            <Route path="/company-profile" element={<CompanyProfiles />} />
            <Route path="/candidate-references" element={<CandidateReferences />} />
            <Route path="/college-candidates" element={<CollegeCandidates />} />
            <Route path="/company-references" element={<CompanyReferences />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

