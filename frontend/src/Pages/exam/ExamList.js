import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Pagination,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Timer as TimeIcon,
  Assignment as QuestionIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import Page from '../../components/Page';
import axios from 'axios';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../../components/ConfirmDialog';

// ----------------------------------------------------------------------

export default function ExamList() {
  const navigate = useNavigate();
  const showNotification = useNotification();
  
  // State
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch Exams
  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/exams', {
        params: { page, limit: 9, search } // Grid usually fits 3x3 nicely
      });
      setExams(response.data.exams || []);
      const total = response.data.total || 0;
      setTotalPages(Math.ceil(total / 9));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        fetchExams();
    }, 500); // Debounce search
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedExamId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExamId(null);
  };

  const handleEdit = () => {
      navigate(`/exam/edit/${selectedExamId}`);
      handleMenuClose();
  };

  const handleAssign = () => {
      navigate(`/exam/${selectedExamId}/assign`);
      handleMenuClose();
  };

  const handleDelete = () => {
      setConfirmDelete(true);
      setAnchorEl(null);
  };

  const executeDelete = async () => {
      try {
          await axios.delete(`http://localhost:5000/api/exams/${selectedExamId}`);
          showNotification("Exam deleted successfully", "success");
          setConfirmDelete(false);
          setSelectedExamId(null);
          fetchExams();
      } catch(e) {
          showNotification("Failed to delete exam", "error");
      }
  };

  const handleView = () => {
      navigate(`/exam/${selectedExamId}`);
      handleMenuClose();
  };

  return (
    <Page 
        title="Exams" 
        subtitle="Create, manage and assign assessments."
    >
      <Box sx={{ position: 'absolute', top: 32, right: 24 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/exam/create')}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            New Exam
          </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 5, borderRadius: 2 }}>
         <TextField
            fullWidth
            placeholder="Search exams by title or description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            InputProps={{
               startAdornment: (
                  <InputAdornment position="start">
                     <SearchIcon sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
               )
            }}
            sx={{ 
                '& .MuiOutlinedInput-root': { 
                    bgcolor: 'background.default',
                    borderRadius: 1 
                } 
            }}
         />
      </Card>

      {/* Content Grid */}
      <Grid container spacing={3}>
         {loading ? (
             [...Array(6)].map((_, i) => (
                 <Grid item xs={12} sm={6} md={4} key={i}>
                     <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                     <Box sx={{ pt: 1 }}>
                         <Skeleton />
                         <Skeleton width="60%" />
                     </Box>
                 </Grid>
             ))
         ) : exams.length === 0 ? (
             <Grid item xs={12}>
                 <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                     <Typography variant="h6" color="text.secondary">No exams found</Typography>
                     <Button sx={{ mt: 2 }} onClick={() => navigate('/exam/create')}>Create your first exam</Button>
                 </Box>
             </Grid>
         ) : (
             exams.map((exam) => (
                 <Grid item xs={12} sm={6} md={4} key={exam.id}>
                     <Card sx={{ 
                         height: '100%', 
                         display: 'flex', 
                         flexDirection: 'column',
                         transition: 'transform 0.2s',
                         '&:hover': { transform: 'translateY(-4px)', boxShadow: (theme) => theme.customShadows.z12 }
                     }}>
                         <Box sx={{ position: 'relative', p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                              <Chip 
                                 label={exam.status || 'Draft'} 
                                 color={exam.status === 'published' ? 'success' : 'default'} 
                                 size="small" 
                                 sx={{ position: 'absolute', top: 16, left: 16, textTransform: 'capitalize' }}
                              />
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, exam.id)}>
                                  <MoreVertIcon />
                              </IconButton>
                         </Box>
                         
                         <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                             <Typography variant="h6" fontWeight="bold" noWrap gutterBottom title={exam.title}>
                                 {exam.title}
                             </Typography>
                             <Typography variant="body2" color="text.secondary" sx={{ 
                                 display: '-webkit-box',
                                 WebkitLineClamp: 2,
                                 WebkitBoxOrient: 'vertical',
                                 overflow: 'hidden',
                                 mb: 2,
                                 height: 40
                             }}>
                                 {exam.description || 'No description provided.'}
                             </Typography>
                             
                             <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                 <Box display="flex" alignItems="center" gap={0.5}>
                                     <TimeIcon fontSize="small" />
                                     {exam.duration}m
                                 </Box>
                                 <Box display="flex" alignItems="center" gap={0.5}>
                                     <QuestionIcon fontSize="small" />
                                     {exam.questionCount || 0} Qs
                                 </Box>
                                 <Box display="flex" alignItems="center" gap={0.5}>
                                     <SchoolIcon fontSize="small" />
                                     {exam.totalMarks} Pts
                                 </Box>
                             </Stack>
                         </CardContent>

                         <CardActions sx={{ p: 2, pt: 0 }}>
                             <Button 
                                fullWidth 
                                variant="outlined" 
                                onClick={() => navigate(`/exam/${exam.id}`)}
                                sx={{ borderRadius: 1 }}
                             >
                                 View Details
                             </Button>
                         </CardActions>
                     </Card>
                 </Grid>
             ))
         )}
      </Grid>
      
      {/* Pagination */}
      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
             count={totalPages} 
             page={page} 
             onChange={(e, v) => setPage(v)} 
             color="primary" 
             shape="rounded" 
             size="large"
          />
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 140, boxShadow: (theme) => theme.customShadows.z8 } }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleView}>View</MenuItem>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleAssign}>Assign Students</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      <ConfirmDialog 
        open={confirmDelete}
        title="Delete Exam"
        message="Are you sure you want to permanently delete this exam? This will also remove any student records associated with it."
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(false)}
        color="error"
        confirmText="Delete Exam"
      />

    </Page>
  );
}
