import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  LinearProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  EmojiEvents as TrophyIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Trophy as TrophyIconLarge
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useNotification } from '../../context/NotificationContext';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const showNotification = useNotification();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const url = user.role === 'student' ? `http://localhost:5000/api/results?user_id=${user.id}` : 'http://localhost:5000/api/results';
      const response = await axios.get(url);
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      showNotification('Failed to fetch results', 'error');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pass' || s === 'passed') return 'success';
    if (s === 'fail' || s === 'failed') return 'error';
    return 'warning';
  };

  const handleDelete = async (id) => {
    setConfirmDelete({ open: true, id });
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/results/${confirmDelete.id}`);
      showNotification('Result deleted successfully', 'success');
      setConfirmDelete({ open: false, id: null });
      fetchResults();
    } catch (error) {
      showNotification('Failed to delete result', 'error');
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/results/${id}/download`);
      showNotification(response.data.message, 'success');
    } catch (error) {
       showNotification('Download failed', 'error');
    }
  };

  const handleView = (result) => {
    setSelectedResult(result);
    setOpenView(true);
  };

  const handleCloseView = () => {
    setOpenView(false);
    setSelectedResult(null);
  };

  const calculateStats = () => {
    if (!results.length) return { avg: 0, passed: 0, failed: 0 };
    const passed = results.filter(r => r.status?.toLowerCase().includes('pass')).length;
    const failed = results.filter(r => r.status?.toLowerCase().includes('fail')).length;
    const avg = results.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / results.length;
    return { 
      avg: Math.round(avg * 100), 
      passed, 
      failed 
    };
  };

  const stats = calculateStats();

  if (loading) return <Loading message="Loading results..." fullScreen />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
      <Helmet>
        <title> Exam Results | Neutral UI </title>
      </Helmet>

      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Exam Results
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track student performance and detailed score breakdowns.
          </Typography>
        </Box>
        
        <TextField
          placeholder="Search results..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
             <TrophyIcon sx={{ fontSize: 40, mb: 1 }} />
             <Typography variant="h5">{stats.avg}%</Typography>
             <Typography variant="subtitle2">Average Score</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
             <Typography variant="h5">{stats.passed}</Typography>
             <Typography variant="subtitle2">Passed Exams</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
             <Typography variant="h5">{stats.failed}</Typography>
             <Typography variant="subtitle2">Failed Exams</Typography>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.neutral' }}>
            <TableRow>
              <TableCell fontWeight="bold">Exam Title</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results
              .filter(r => r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || r.examTitle.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">{row.examTitle}</Typography>
                </TableCell>
                <TableCell>{row.studentName}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Typography variant="body2" fontWeight="bold">{row.score}/{row.total}</Typography>
                     <LinearProgress 
                        variant="determinate" 
                        value={(row.score / row.total) * 100} 
                        sx={{ width: 100, height: 6, borderRadius: 5 }} 
                        color={getStatusColor(row.status)}
                     />
                  </Box>
                </TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Unknown'} 
                    color={getStatusColor(row.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleView(row)}>
                    <ViewIcon />
                  </IconButton>
                  <IconButton color="info" onClick={() => handleDownload(row.id)}>
                    <DownloadIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Result Modal */}
      <Dialog open={openView} onClose={handleCloseView} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Result Details
          <IconButton onClick={handleCloseView}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
           {selectedResult && (
             <Box sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                   <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress 
                         variant="determinate" 
                         value={(selectedResult.score / selectedResult.total) * 100} 
                         size={80}
                         color={getStatusColor(selectedResult.status)}
                      />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Typography variant="caption" component="div" color="text.secondary" fontWeight="bold">
                            {Math.round((selectedResult.score / selectedResult.total) * 100)}%
                         </Typography>
                      </Box>
                   </Box>
                   <Box>
                      <Typography variant="h5" fontWeight="bold">{selectedResult.examTitle}</Typography>
                      <Typography variant="subtitle2" color="text.secondary">{selectedResult.studentName}</Typography>
                   </Box>
                </Box>

                <Grid container spacing={2}>
                   <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Total Marks</Typography>
                      <Typography variant="h6">{selectedResult.total}</Typography>
                   </Grid>
                   <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Obtained Marks</Typography>
                      <Typography variant="h6">{selectedResult.score}</Typography>
                   </Grid>
                   <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Submission Date</Typography>
                      <Typography variant="body1">{selectedResult.date}</Typography>
                   </Grid>
                   <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Status</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                           label={selectedResult.status.toUpperCase()} 
                           color={getStatusColor(selectedResult.status)} 
                        />
                      </Box>
                   </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                   <Typography variant="subtitle2" gutterBottom>Performance Note</Typography>
                   <Typography variant="body2" color="text.secondary">
                      {selectedResult.status.toLowerCase().includes('pass') 
                        ? 'Great job! You have successfully cleared this assessment.' 
                        : 'Better luck next time. We recommend reviewing the study materials in the Library.'}
                   </Typography>
                </Box>
             </Box>
           )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
           <Button onClick={handleCloseView} variant="outlined">Close</Button>
           <Button 
              variant="contained" 
              color="info" 
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(selectedResult.id)}
           >
              Download PDF
           </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog 
        open={confirmDelete.open}
        title="Delete Record"
        message="Are you sure you want to delete this result record? This action will permanently remove the student's score from the system."
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        color="error"
        confirmText="Confirm Delete"
      />
    </Container>
  );
}
