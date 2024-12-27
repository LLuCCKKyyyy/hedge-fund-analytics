import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data - will be replaced with real API data
const performanceData = [
  { date: '2023-Q1', value: 100 },
  { date: '2023-Q2', value: 115 },
  { date: '2023-Q3', value: 108 },
  { date: '2023-Q4', value: 125 },
  { date: '2024-Q1', value: 135 },
];

const topHoldings = [
  { symbol: 'AAPL', name: 'Apple Inc.', value: '$1.5B', weight: '15%', change: '+2.3%' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', value: '$1.2B', weight: '12%', change: '+1.8%' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', value: '$900M', weight: '9%', change: '-0.5%' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', value: '$800M', weight: '8%', change: '+3.2%' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', value: '$600M', weight: '6%', change: '+5.1%' },
];

const fundOptions = [
  { label: 'Renaissance Technologies', value: 'RenTech' },
  { label: 'Bridgewater Associates', value: 'Bridgewater' },
  { label: 'BlackRock', value: 'BlackRock' },
  { label: 'Citadel', value: 'Citadel' },
];

const FundAnalysis: React.FC = () => {
  const [selectedFund, setSelectedFund] = useState<string | null>(null);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Fund Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Autocomplete
                options={fundOptions}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Select Fund" />}
                onChange={(event, newValue) => setSelectedFund(newValue?.value || null)}
              />
              <Button variant="contained" color="primary">
                Analyze Fund
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Fund Performance
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" name="Portfolio Value" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Holdings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Top Holdings
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Company Name</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Weight</TableCell>
                    <TableCell align="right">Change</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topHoldings.map((holding) => (
                    <TableRow key={holding.symbol}>
                      <TableCell>{holding.symbol}</TableCell>
                      <TableCell>{holding.name}</TableCell>
                      <TableCell align="right">{holding.value}</TableCell>
                      <TableCell align="right">{holding.weight}</TableCell>
                      <TableCell align="right" 
                        sx={{ color: holding.change.startsWith('+') ? 'success.main' : 'error.main' }}>
                        {holding.change}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Fund Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Fund Details
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Assets Under Management: $25.3B
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Number of Holdings: 312
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Portfolio Turnover: 45%
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Latest Filing Date: 2024-01-15
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Investment Strategy */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Investment Strategy
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" paragraph>
                Quantitative trading strategies focusing on market inefficiencies.
                High-frequency trading combined with fundamental analysis.
              </Typography>
              <Typography variant="body1">
                Key sectors: Technology (35%), Healthcare (20%), Finance (15%)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FundAnalysis;
