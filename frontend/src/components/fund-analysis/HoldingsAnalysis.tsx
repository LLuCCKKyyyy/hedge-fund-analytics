import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { HoldingData } from '../../utils/fundAnalysis';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface HoldingsAnalysisProps {
  holdings: HoldingData[];
}

const HoldingsAnalysis: React.FC<HoldingsAnalysisProps> = ({ holdings }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="holdings table">
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell align="right">Shares</TableCell>
              <TableCell align="right">Market Value</TableCell>
              <TableCell align="right">% of Portfolio</TableCell>
              <TableCell align="right">Quarterly Change</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holdings
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((holding) => (
                <TableRow hover key={holding.symbol}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {holding.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>{holding.name}</TableCell>
                  <TableCell align="right">
                    {holding.shares.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(holding.marketValue)}
                  </TableCell>
                  <TableCell align="right">
                    {holding.percentOfPortfolio.toFixed(2)}%
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <Chip
                        icon={
                          holding.quarterlyChange >= 0 ? (
                            <TrendingUpIcon fontSize="small" />
                          ) : (
                            <TrendingDownIcon fontSize="small" />
                          )
                        }
                        label={`${holding.quarterlyChange.toFixed(2)}%`}
                        color={holding.quarterlyChange >= 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={holdings.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default HoldingsAnalysis;
