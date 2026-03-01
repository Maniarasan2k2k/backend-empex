// import { Grid, Box, Typography } from "@mui/material";
// import {
//   PeopleOutlined,
//   BusinessOutlined,
//   WorkOutline,
//   SecurityOutlined,
//   AssignmentTurnedInOutlined,
//   AdminPanelSettingsOutlined,
// } from "@mui/icons-material";

// const KPISection = ({ kpis }) => {
//   const cards = [
//     {
//       title: "Admins",
//       value: kpis?.totalAdmins,
//       icon: <AdminPanelSettingsOutlined />,
//       color: "#6366f1",
//     },
//     {
//       title: "Employees",
//       value: kpis?.totalEmployees,
//       icon: <PeopleOutlined />,
//       color: "#0ea5e9",
//     },
//     {
//       title: "Companies",
//       value: kpis?.totalCompanies,
//       icon: <BusinessOutlined />,
//       color: "#10b981",
//     },
//     {
//       title: "Applications",
//       value: kpis?.totalApplications,
//       icon: <AssignmentTurnedInOutlined />,
//       color: "#f59e0b",
//     },
//     {
//       title: "Active Jobs",
//       value: kpis?.activeJobs,
//       icon: <WorkOutline />,
//       color: "#ef4444",
//     },
//     {
//       title: "Flagged Users",
//       value: kpis?.flaggedUsers,
//       icon: <SecurityOutlined />,
//       color: "#ec4899",
//     },
//   ];

//   return (
//     <Box
//       sx={{
//         p: 3,
//         borderRadius: 5,
//         background:
//           "linear-gradient(135deg,  0%, #f9fa 100%)",
//       }}
//     >
//       <Grid container spacing={3}>
//         {cards.map((card, index) => (
//           <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
//             <Box
//               sx={{
//                 p: 3,
//                 borderRadius: 4,
//                 backdropFilter: "blur(12px)",
//                 background: "rgba(255,255,255,0.6)",
//                 border: `1px solid ${card.color}20`,
//                 boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
//                 transition: "all 0.3s ease",
//                 "&:hover": {
//                   transform: "translateY(-6px)",
//                   boxShadow: `0 12px 30px ${card.color}40`,
//                 },
//               }}
//             >
//               {/* Icon */}
//               <Box
//                 sx={{
//                   width: 45,
//                   height: 45,
//                   borderRadius: "12px",
//                   background: `${card.color}15`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   color: card.color,
//                   mb: 2,
//                 }}
//               >
//                 {card.icon}
//               </Box>

//               {/* Title */}
//               <Typography
//                 fontSize="0.85rem"
//                 color="text.secondary"
//                 mb={0.5}
//               >
//                 {card.title}
//               </Typography>

//               {/* Value */}
//               <Typography
//                 variant="h4"
//                 fontWeight={700}
//                 sx={{
//                   background: `linear-gradient(90deg, ${card.color}, #000)`,
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                 }}
//               >
//                 {card.value ?? 0}
//               </Typography>
//             </Box>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// };

// export default KPISection;
