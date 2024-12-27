import React from 'react';
import { Box, Grid, Paper, Typography, Container } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data - will be replaced with real API data
const sectorAllocation = [
  { name: 'Technology', value: 35 },
  { name: 'Healthcare', value: 20 },
  { name: 'Finance', value: 15 },
  { name: 'Consumer', value: 12 },
  { name: 'Energy', value: 8 },
  { name: 'Others', value: 10 },
];

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" color="primary" gutterBottom>
              Hedge Fund Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome to your hedge fund analytics platform. Monitor fund performance, analyze holdings, and track investment strategies.
            </Typography>
          </Paper>
        </Grid>

        {/* Portfolio Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Sector Allocation
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectorAllocation}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Allocation %" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Key Metrics
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Total Assets: $10.5B
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Number of Holdings: 245
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Top Holdings: 25
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Latest Filing Date: 2024-01-15
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                • New 13F filing detected for Renaissance Technologies
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Significant position increase in NVIDIA Corporation
              </Typography>
              <Typography variant="body2" gutterBottom>
                • New position initiated in Tesla, Inc.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
