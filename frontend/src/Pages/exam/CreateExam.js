import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useNotification } from '../../context/NotificationContext';
import aiService from '../../services/aiService';
import { AutoAwesome as AIIcon } from '@mui/icons-material';

// ----------------------------------------------------------------------

export default function CreateExam() {
  const navigate = useNavigate();
  const showNotification = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  // Form Setup
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      duration: 60,
      totalMarks: 100,
      questions: [
        { question_text: '', question_type: 'mcq', marks: 5, options: ['', '', '', ''], correct_answer: '' }
      ]
    }
  });

  const { fields,append, remove, replace } = useFieldArray({
    control,
    name: "questions"
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare payload
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const creatorName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Admin';
      
      const payload = {
        ...data,
        created_by: creatorName,
        questions: data.questions.map(q => ({
          ...q,
          // Ensure options is an array
          options: q.options || []
        }))
      };

      await axios.post('http://localhost:5000/api/exams', payload);
      showNotification('Exam created successfully!', 'success');
      navigate('/exam-list');
    } catch (error) {
      console.error(error);
      showNotification('Failed to create exam', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiTopic) {
      showNotification('Please enter a topic for AI generation', 'info');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await aiService.generateQuestions({ topic: aiTopic, count: 5 });
      if (response.questions) {
        // Map AI response to form structure
        const aiQuestions = response.questions.map(q => ({
          question_text: q.question_text,
          question_type: q.question_type || 'mcq',
          marks: q.marks || 5,
          options: q.options || ['', '', '', ''],
          correct_answer: q.correct_answer || ''
        }));
        
        replace(aiQuestions);
        showNotification(`AI generated ${aiQuestions.length} questions successfully!`, 'success');
      }
    } catch (error) {
      console.error(error);
      showNotification('AI Generation failed. Check backend/logs.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
       <Helmet>
        <title> Create Exam | Neutral UI </title>
      </Helmet>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Create New Exam
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Left Column: Exam Details */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Exam Details
              </Typography>
              
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Exam Title"
                  {...register('title', { required: 'Title is required' })}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  {...register('description')}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Duration (minutes)"
                  {...register('duration')}
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
                />

                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" color="text.secondary">AI ASSISTANT</Typography>
                </Divider>

                <Box sx={{ 
                  p: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(145, 158, 171, 0.12)' : 'primary.lighter', 
                  borderRadius: 2, 
                  border: '1px dashed', 
                  borderColor: 'primary.main',
                  mb: 3
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                     <AIIcon fontSize="small" color="primary" /> AI Question Generator
                  </Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Enter topic (e.g. React Hooks)" 
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <LoadingButton
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<AIIcon />}
                    loading={isGenerating}
                    onClick={handleAiGenerate}
                  >
                    Generate Questions
                  </LoadingButton>
                </Box>
                
                <LoadingButton 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  loading={isSubmitting}
                >
                  Publish Exam
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>

          {/* Right Column: Questions using Field Array */}
          <Grid item xs={12} md={8}>
             <Typography variant="h6" gutterBottom>
                Questions ({fields.length})
              </Typography>

              <Stack spacing={3}>
                {fields.map((field, index) => (
                  <Card key={field.id} sx={{ p: 3, position: 'relative' }}>
                    
                    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                       <IconButton color="error" onClick={() => remove(index)}>
                          <DeleteIcon />
                       </IconButton>
                    </Box>

                    <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary', fontWeight: 'bold' }}>
                       Question {index + 1}
                    </Typography>

                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        multiline
                        label="Question Text"
                        {...register(`questions.${index}.question_text`, { required: true })}
                        placeholder="e.g. What is the capital of France?"
                      />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                           <TextField
                              fullWidth
                              select
                              label="Type"
                              defaultValue="mcq"
                              {...register(`questions.${index}.question_type`)}
                              inputProps={{
                                // Select components in standard HTML
                              }}
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
                          />
                        </Grid>
                      </Grid>

                      {/* Options (Only for MCQ) - Simplified for demo: 4 fixed options */}
                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Options & Correct Answer</Typography>
                      
                      <Grid container spacing={2}>
                         {[0, 1, 2, 3].map((optIndex) => (
                           <Grid item xs={6} key={optIndex}>
                              <TextField
                                fullWidth
                                label={`Option ${optIndex + 1}`}
                                {...register(`questions.${index}.options.${optIndex}`)}
                              />
                           </Grid>
                         ))}
                      </Grid>

                      <TextField
                        fullWidth
                        label="Correct Answer (Exact Text)"
                        {...register(`questions.${index}.correct_answer`, { required: true })}
                        helperText="Copy one of the options above exactly"
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
