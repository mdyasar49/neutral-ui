import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Card,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import Loading from '../../components/Loading';
import { useNotification } from '../../context/NotificationContext';

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showNotification = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Setup
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      duration: 60,
      totalMarks: 100,
      questions: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  // Fetch Exam Data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/exams/${id}`);
        const examData = response.data;
        
        // Transform data to match form structure
        // Specifically parse options if they are JSON strings
        const formattedQuestions = (examData.questions || []).map(q => {
             let opts = q.options;
             if (typeof opts === 'string') {
                 try { opts = JSON.parse(opts); } catch (e) { opts = []; }
             }
             return {
                 question_text: q.question_text,
                 question_type: q.question_type,
                 marks: q.marks,
                 // Ensure options is array of strings
                 options: Array.isArray(opts) ? opts : ['', '', '', ''],
                 correct_answer: q.correct_answer
             };
        });

        reset({
            title: examData.title,
            description: examData.description,
            duration: examData.duration_minutes,
            totalMarks: examData.total_marks,
            status: examData.status || 'draft',
            questions: formattedQuestions
        });
      } catch (error) {
        console.error("Failed to load exam", error);
        showNotification("Failed to load exam details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        questions: data.questions.map(q => ({
          ...q,
          options: q.options || []
        }))
      };

      await axios.put(`http://localhost:5000/api/exams/${id}`, payload);
      showNotification('Exam updated successfully!', 'success');
      navigate('/exam-list');
    } catch (error) {
      console.error(error);
      showNotification('Failed to update exam', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading exam editor..." fullScreen />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
       <Helmet>
        <title> Edit Exam | Neutral UI </title>
      </Helmet>

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Edit Exam
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>Exam Details</Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Exam Title"
                  {...register('title', { required: 'Title is required' })}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  InputLabelProps={{ shrink: true }} 
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  {...register('description')}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Duration (minutes)"
                  {...register('duration')}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  select
                  label="Status"
                  {...register('status')}
                  defaultValue="draft"
                  SelectProps={{ native: true }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </TextField>

                <TextField
                  fullWidth
                  type="number"
                  label="Total Marks"
                  {...register('totalMarks')}
                  InputLabelProps={{ shrink: true }}
                />
                <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                  Save Changes
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
             <Typography variant="h6" gutterBottom>Questions ({fields.length})</Typography>
              <Stack spacing={3}>
                {fields.map((field, index) => (
                  <Card key={field.id} sx={{ p: 3, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                       <IconButton color="error" onClick={() => remove(index)}><DeleteIcon /></IconButton>
                    </Box>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Question {index + 1}</Typography>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        multiline
                        label="Question Text"
                        {...register(`questions.${index}.question_text`, { required: true })}
                        defaultValue={field.question_text} 
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                           <TextField
                              fullWidth
                              select
                              label="Type"
                              defaultValue={field.question_type || "mcq"}
                              {...register(`questions.${index}.question_type`)}
                              SelectProps={{ native: true }}
                           >
                              <option value="mcq">Multiple Choice</option>
                              <option value="text">Written Answer</option>
                           </TextField>
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Marks"
                            {...register(`questions.${index}.marks`)}
                            defaultValue={field.marks}
                          />
                        </Grid>
                      </Grid>

                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Options & Correct Answer</Typography>
                      <Grid container spacing={2}>
                         {[0, 1, 2, 3].map((optIndex) => (
                           <Grid item xs={6} key={optIndex}>
                              <TextField
                                fullWidth
                                label={`Option ${optIndex + 1}`}
                                {...register(`questions.${index}.options.${optIndex}`)}
                                defaultValue={field.options && field.options[optIndex]}
                              />
                           </Grid>
                         ))}
                      </Grid>

                      <TextField
                        fullWidth
                        label="Correct Answer (Exact Text)"
                        {...register(`questions.${index}.correct_answer`, { required: true })}
                        defaultValue={field.correct_answer}
                      />
                    </Stack>
                  </Card>
                ))}
                <Button 
                   variant="outlined" 
                   startIcon={<AddIcon />} 
                   onClick={() => append({ question_text: '', question_type: 'mcq', marks: 5, options: ['', '', '', ''], correct_answer: '' })}
                   sx={{ py: 2, borderStyle: 'dashed' }}
                >
                   Add Question
                </Button>
              </Stack>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}
