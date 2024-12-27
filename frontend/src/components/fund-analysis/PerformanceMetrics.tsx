import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { FundMetrics } from '../../utils/fundAnalysis';

interface MetricCardProps {
  title: string;
  value: string | number;
  tooltip: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, tooltip }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Tooltip title={tooltip}>
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="h5" component="div">
        {typeof value === 'number' ? value.toFixed(2) : value}
      </Typography>
    </CardContent>
  </Card>
);

interface PerformanceMetricsProps {
  metrics: FundMetrics;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <MetricCard
          title="Alpha"
          value={metrics.alpha}
          tooltip="Excess return of the investment relative to the return of a benchmark index"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <MetricCard
          title="Beta"
          value={metrics.beta}
          tooltip="Measure of a stock's volatility in relation to the overall market"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <MetricCard
          title="Sharpe Ratio"
          value={metrics.sharpeRatio}
          tooltip="Average return earned in excess of the risk-free rate per unit of volatility"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <MetricCard
          title="Volatility"
          value={`${(metrics.volatility * 100).toFixed(2)}%`}
          tooltip="Degree of variation of returns over time"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <MetricCard
          title="Max Drawdown"
          value={`${(metrics.maxDrawdown * 100).toFixed(2)}%`}
          tooltip="Maximum observed loss from a peak to a trough"
        />
      </Grid>
    </Grid>
  );
};

export default PerformanceMetrics;
