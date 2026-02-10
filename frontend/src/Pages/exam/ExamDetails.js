import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Divider,
  Grid
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ArrowBack as BackIcon, PlayArrow as StartIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import Loading from '../../components/Loading';
import { useNotification } from '../../context/NotificationContext';

export default function ExamDetails() {
  const showNotification = useNotification();
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/exams/${id}`);
        setExam(response.data);
      } catch (error) {
        console.error("Failed to fetch exam", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  if (loading) return <Loading message="Loading exam details..." fullScreen />;
  if (!exam) return <Typography variant="h6" align="center" sx={{ mt: 10 }}>Exam not found</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
       <Helmet>
        <title> {exam.title} | Neutral UI </title>
      </Helmet>

      <Button startIcon={<BackIcon />} onClick={() => navigate('/exam-list')} sx={{ mb: 3 }}>
        Back to Exams
      </Button>

      <Grid container spacing={4}>
         <Grid item xs={12} md={8}>
            <Card sx={{ p: 4, mb: 4 }}>
               <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                     <Typography variant="h3" fontWeight="bold" gutterBottom>
                        {exam.title}
                     </Typography>
                     <Chip label={exam.status} color={exam.status === 'published' ? 'success' : 'warning'} />
                  </Box>
                  <Typography variant="h4" color="primary">
                     {exam.total_marks} Marks
                  </Typography>
               </Box>

               <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
                  {exam.description}
               </Typography>

               <Stack direction="row" spacing={4} sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Box>
                     <Typography variant="caption" color="text.secondary">For Duration</Typography>
                     <Typography variant="h6">{exam.duration_minutes} Minutes</Typography>
                  </Box>
                  <Box>
                     <Typography variant="caption" color="text.secondary">Questions</Typography>
                     <Typography variant="h6">{exam.questions?.length || 0}</Typography>
                  </Box>
                  <Box>
                     <Typography variant="caption" color="text.secondary">Passing Score</Typography>
                     <Typography variant="h6">{exam.passing_marks || 'N/A'}</Typography>
                  </Box>
               </Stack>

               <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>Questions Preview</Typography>
                  <Stack spacing={2}>
                     {exam.questions?.map((q, index) => (
                        <Card key={q.id} variant="outlined" sx={{ p: 2 }}>
                           <Stack direction="row" justifyContent="space-between">
                              <Typography variant="subtitle1" fontWeight="bold">
                                 Q{index + 1}. {q.question_text}
                              </Typography>
                              <Chip size="small" label={`${q.marks} Marks`} />
                           </Stack>
                           {/* Mask options for students, show for admin? Assuming admin view for now */}
                           <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Type: {q.question_type}
                           </Typography>
                        </Card>
                     ))}
                  </Stack>
               </Box>
            </Card>
         </Grid>

         <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
               <Typography variant="h6" gutterBottom>Actions</Typography>
               <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  startIcon={<StartIcon />}
                  sx={{ mb: 2 }}
                  onClick={() => showNotification("Start Exam feature coming soon!", "info")}
               >
                  Start Exam
               </Button>
               <Button fullWidth variant="outlined" color="info" sx={{ mb: 2 }}>
                  Assign to Students
               </Button>
               <Typography variant="caption" color="text.secondary" align="center" display="block">
                  Created on {new Date(exam.created_at).toLocaleDateString()}
               </Typography>
            </Card>
         </Grid>
      </Grid>
    </Container>
  );
}
