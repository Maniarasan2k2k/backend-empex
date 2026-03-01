import { Grid, Paper, Typography } from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell
} from "recharts";

const ChartsSection = ({ data }) => {
  const trend = data.applicationTrend.map(i => ({
    month: `${i._id.month}/${i._id.year}`,
    total: i.total
  }));

  const ats = data.atsPipeline.map(i => ({
    stage: i._id,
    count: i.count
  }));

  const company = data.companyBreakdown.map(i => ({
    name: i._id || "Unknown",
    value: i.count
  }));

  return (
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p:3, borderRadius:4 }}>
          <Typography fontWeight={600} mb={2}>Application Growth</Typography>
          <ResponsiveContainer height={300}>
            <LineChart data={trend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="total" stroke="#0a66c2" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p:3, borderRadius:4 }}>
          <Typography fontWeight={600} mb={2}>ATS Pipeline</Typography>
          <ResponsiveContainer height={300}>
            <BarChart data={ats}>
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#057642" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p:3, borderRadius:4 }}>
          <Typography fontWeight={600} mb={2}>Company Breakdown</Typography>
          <ResponsiveContainer height={300}>
            <PieChart>
              <Pie data={company} dataKey="value" label>
                {company.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "#0a66c2" : "#057642"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ChartsSection;
