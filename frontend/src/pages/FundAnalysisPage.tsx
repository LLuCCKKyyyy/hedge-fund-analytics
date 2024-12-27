import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import PerformanceMetrics from '../components/fund-analysis/PerformanceMetrics';
import HoldingsAnalysis from '../components/fund-analysis/HoldingsAnalysis';
import HistoricalPerformance from '../components/fund-analysis/HistoricalPerformance';
import SectorAnalysis from '../components/fund-analysis/SectorAnalysis';
import { fundDataService } from '../services/fundDataService';
import { Fund, Filing13F, FundMetrics } from '../services/api/types';

const FundAnalysisPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [selectedFund, setSelectedFund] = useState<string>('');
  const [fundData, setFundData] = useState<Filing13F | null>(null);
  const [metrics, setMetrics] = useState<FundMetrics | null>(null);
  const [performance, setPerformance] = useState<any[]>([]);

  useEffect(() => {
    loadFunds();
  }, []);

  useEffect(() => {
    if (selectedFund) {
      loadFundData(selectedFund);
    }
  }, [selectedFund]);

  const loadFunds = async () => {
    try {
      const fundList = await fundDataService.getFunds();
      setFunds(fundList);
      if (fundList.length > 0) {
        setSelectedFund(fundList[0].cik);
      }
    } catch (err) {
      setError('Failed to load fund list');
      console.error(err);
    }
  };

  const loadFundData = async (cik: string) => {
    setLoading(true);
    setError(null);
    try {
      const filing = await fundDataService.getFundHoldings(cik);
      if (!filing) {
        throw new Error('No filing data found');
      }
      setFundData(filing);

      // Calculate performance and metrics
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);

      const [perfData, metricsData] = await Promise.all([
        fundDataService.getFundPerformance(filing.holdings.filter(holding => holding.sshPrnamtType !== 'PRN'), startDate, endDate),
        fundDataService.calculateFundMetrics(filing.holdings.filter(holding => holding.sshPrnamtType !== 'PRN')),
      ]);

      setPerformance(perfData);
      setMetrics(metricsData);
    } catch (err) {
      setError('Failed to load fund data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFundChange = (event: SelectChangeEvent<string>) => {
    setSelectedFund(event.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fund Analysis
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Fund</InputLabel>
        <Select value={selectedFund} onChange={handleFundChange}>
          {funds.map((fund) => (
            <MenuItem key={fund.cik} value={fund.cik}>
              {fund.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Overview" />
          <Tab label="Holdings" />
          <Tab label="Sectors" />
          <Tab label="Performance" />
        </Tabs>

        <Box role="tabpanel" hidden={tabValue !== 0} sx={{ p: 3 }}>
          {tabValue === 0 && metrics && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                <PerformanceMetrics metrics={metrics} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Historical Performance
                </Typography>
                <HistoricalPerformance data={performance} />
              </Grid>
            </Grid>
          )}
        </Box>

        <Box role="tabpanel" hidden={tabValue !== 1} sx={{ p: 3 }}>
          {tabValue === 1 && fundData && (
            <>
              <Typography variant="h6" gutterBottom>
                Portfolio Holdings
              </Typography>
              <HoldingsAnalysis holdings={fundData.holdings.filter(h => h.sshPrnamtType !== 'PRN')} />
            </>
          )}
        </Box>

        <Box role="tabpanel" hidden={tabValue !== 2} sx={{ p: 3 }}>
          {tabValue === 2 && fundData && (
            <>
              <Typography variant="h6" gutterBottom>
                Sector Analysis
              </Typography>
              <SectorAnalysis holdings={fundData.holdings.filter(h => h.sshPrnamtType !== 'PRN')} />
            </>
          )}
        </Box>

        <Box role="tabpanel" hidden={tabValue !== 3} sx={{ p: 3 }}>
          {tabValue === 3 && metrics && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Performance Analysis
                </Typography>
                <HistoricalPerformance data={performance} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Risk Metrics
                </Typography>
                <PerformanceMetrics metrics={metrics} />
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default FundAnalysisPage;
