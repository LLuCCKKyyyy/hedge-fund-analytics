import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { HistoricalPerformance as HistoricalPerformanceData } from '../../utils/fundAnalysis';

interface HistoricalPerformanceProps {
  data: HistoricalPerformanceData[];
}

const HistoricalPerformance: React.FC<HistoricalPerformanceProps> = ({ data }) => {
  const chartData = [
    {
      id: 'Fund Performance',
      data: data.map((d) => ({
        x: d.date,
        y: d.value,
      })),
    },
    {
      id: 'Benchmark',
      data: data.map((d) => ({
        x: d.date,
        y: d.benchmark,
      })),
    },
  ];

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Historical Performance Comparison
      </Typography>
      <Box sx={{ height: 320 }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.2%"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Date',
            legendOffset: 45,
            legendPosition: 'middle',
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Return',
            legendOffset: -40,
            legendPosition: 'middle',
            format: '>-.2%',
          }}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      </Box>
    </Paper>
  );
};

export default HistoricalPerformance;
