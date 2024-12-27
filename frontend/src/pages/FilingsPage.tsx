import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const Input = styled('input')({
  display: 'none',
});

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Mock data - will be replaced with real API data
const mockFilings = [
  {
    id: 1,
    fundName: 'Renaissance Technologies',
    quarter: 'Q4 2023',
    filingDate: '2024-02-14',
    totalValue: '$86.4B',
    status: 'Processed',
  },
  {
    id: 2,
    fundName: 'Bridgewater Associates',
    quarter: 'Q4 2023',
    filingDate: '2024-02-13',
    totalValue: '$92.1B',
    status: 'Processed',
  },
  {
    id: 3,
    fundName: 'BlackRock',
    quarter: 'Q4 2023',
    filingDate: '2024-02-12',
    totalValue: '$134.2B',
    status: 'Processing',
  },
];

const FilingsPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // TODO: Implement actual file upload
      setUploadStatus('success');
      // Reset file selection
      setSelectedFile(null);
    } catch (error) {
      setUploadStatus('error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* File Upload Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload 13F Filing
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<UploadIcon />}
              >
                Select File
                <VisuallyHiddenInput
                  type="file"
                  accept=".xml,.txt"
                  onChange={handleFileSelect}
                />
              </Button>
              {selectedFile && (
                <>
                  <Typography variant="body2">
                    {selectedFile.name}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                  >
                    Upload
                  </Button>
                </>
              )}
            </Box>
            {uploadStatus === 'success' && (
              <Alert severity="success">File uploaded successfully!</Alert>
            )}
            {uploadStatus === 'error' && (
              <Alert severity="error">Error uploading file. Please try again.</Alert>
            )}
          </Paper>
        </Grid>

        {/* Filings Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Filings
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fund Name</TableCell>
                    <TableCell>Quarter</TableCell>
                    <TableCell>Filing Date</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockFilings.map((filing) => (
                    <TableRow key={filing.id}>
                      <TableCell>{filing.fundName}</TableCell>
                      <TableCell>{filing.quarter}</TableCell>
                      <TableCell>{filing.filingDate}</TableCell>
                      <TableCell align="right">{filing.totalValue}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: filing.status === 'Processed' ? 'success.main' : 'warning.main',
                          }}
                        >
                          {filing.status}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" title="View">
                          <ViewIcon />
                        </IconButton>
                        <IconButton color="primary" title="Download">
                          <DownloadIcon />
                        </IconButton>
                        <IconButton color="error" title="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FilingsPage;
