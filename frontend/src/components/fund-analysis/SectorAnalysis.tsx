import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { Holding, SectorAnalysis } from '../../services/api/types';

interface SectorAnalysisProps {
  holdings: Holding[];
}

const SectorAnalysisComponent: React.FC<SectorAnalysisProps> = ({ holdings }) => {
  const sectorAnalysis = useMemo(() => {
    const sectors = new Map<string, SectorAnalysis>();
    const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.value, 0);

    // Group holdings by sector
    holdings.forEach((holding) => {
      const sector = holding.sector || 'Unknown';
      const industry = holding.industry || 'Unknown';

      if (!sectors.has(sector)) {
        sectors.set(sector, {
          sector,
          totalValue: 0,
          percentOfPortfolio: 0,
          industries: [],
        });
      }

      const sectorData = sectors.get(sector)!;
      sectorData.totalValue += holding.value;
      sectorData.percentOfPortfolio = (sectorData.totalValue / totalPortfolioValue) * 100;

      // Update industry data
      const industryIndex = sectorData.industries.findIndex(i => i.name === industry);
      if (industryIndex === -1) {
        sectorData.industries.push({
          name: industry,
          value: holding.value,
          percentOfSector: 0,
        });
      } else {
        sectorData.industries[industryIndex].value += holding.value;
      }
    });

    // Calculate percentages for industries
    sectors.forEach(sector => {
      sector.industries.forEach(industry => {
        industry.percentOfSector = (industry.value / sector.totalValue) * 100;
      });
      sector.industries.sort((a, b) => b.value - a.value);
    });

    return Array.from(sectors.values())
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [holdings]);

  const pieChartData = sectorAnalysis.map(sector => ({
    id: sector.sector,
    label: sector.sector,
    value: sector.totalValue,
  }));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '400px' }}>
          <Typography variant="h6" gutterBottom>
            Sector Allocation
          </Typography>
          <Box sx={{ height: '320px' }}>
            <ResponsivePie
              data={pieChartData}
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
              legends={[
                {
                  anchor: 'right',
                  direction: 'column',
                  justify: false,
                  translateX: 70,
                  translateY: 0,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemsSpacing: 0,
                  symbolSize: 20,
                  itemDirection: 'left-to-right',
                },
              ]}
            />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Sector Breakdown
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sector</TableCell>
                  <TableCell align="right">Value ($M)</TableCell>
                  <TableCell align="right">Portfolio %</TableCell>
                  <TableCell>Top Industries</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sectorAnalysis.map((sector) => (
                  <TableRow key={sector.sector}>
                    <TableCell component="th" scope="row">
                      {sector.sector}
                    </TableCell>
                    <TableCell align="right">
                      {(sector.totalValue / 1000000).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {sector.percentOfPortfolio.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      {sector.industries
                        .slice(0, 2)
                        .map((ind) => `${ind.name} (${ind.percentOfSector.toFixed(1)}%)`)
                        .join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SectorAnalysisComponent;
