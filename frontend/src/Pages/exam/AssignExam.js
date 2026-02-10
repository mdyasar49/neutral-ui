import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ArrowBack as BackIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import Loading from '../../components/Loading';
import { useNotification } from '../../context/NotificationContext';

export default function AssignExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showNotification = useNotification();
  const [users, setUsers] = useState([]);
  const [exam, setExam] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, examRes] = await Promise.all([
           axios.get('http://localhost:5000/api/users', { params: { limit: 1000 } }),
           axios.get(`http://localhost:5000/api/exams/${id}`)
        ]);
        
        // Filter only 'student' role if desired, or show all
        const allUsers = usersRes.data.users || [];
        const students = allUsers.filter(u => u.role === 'student'); 
        setUsers(students);
        setExam(examRes.data);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleToggle = (userId) => {
    const currentIndex = selectedUsers.indexOf(userId);
    const newChecked = [...selectedUsers];

    if (currentIndex === -1) {
      newChecked.push(userId);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setSelectedUsers(newChecked);
  };

  const handleSelectAll = (selectAll) => {
      if (selectAll) {
          setSelectedUsers(users.map(u => u.id));
      } else {
          setSelectedUsers([]);
      }
  };

  const handleSubmit = async () => {
      if (selectedUsers.length === 0) return;
      setSubmitting(true);
      try {
          await axios.post(`http://localhost:5000/api/exams/${id}/assign`, {
              student_ids: selectedUsers
          });
          showNotification(`Successfully assigned exam to ${selectedUsers.length} students.`, "success");
          navigate('/exam-list');
      } catch (error) {
          console.error(error);
          showNotification("Failed to assign students.", "error");
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return <Loading message="Loading student list..." fullScreen />;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 10 }}>
       <Helmet>
        <title> Assign Exam | Neutral UI </title>
      </Helmet>

      <Button startIcon={<BackIcon />} onClick={() => navigate('/exam-list')} sx={{ mb: 2 }}>
        Back to Exams
      </Button>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Assign Exam: {exam?.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
         Select students to assign this exam to.
      </Typography>

      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: 'grey.100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Students List ({users.length})</Typography>
              <Box>
                  <Button onClick={() => handleSelectAll(true)}>Select All</Button>
                  <Button onClick={() => handleSelectAll(false)}>Deselect All</Button>
              </Box>
          </Box>
          <Divider />
          
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {users.length === 0 ? (
                  <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No students found.</Typography>
              ) : (
                  users.map((user) => {
                      const isSelected = selectedUsers.indexOf(user.id) !== -1;
                      return (
                        <ListItem
                            key={user.id}
                            button
                            onClick={() => handleToggle(user.id)}
                            divider
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={isSelected}
                                    tabIndex={-1}
                                    disableRipple
                                />
                            </ListItemIcon>
                            <ListItemText 
                                primary={`${user.firstName} ${user.lastName}`} 
                                secondary={user.email} 
                            />
                        </ListItem>
                      );
                  })
              )}
          </List>
      </Paper>

      <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => navigate('/exam-list')}>Cancel</Button>
          <LoadingButton 
              variant="contained" 
              onClick={handleSubmit} 
              loading={submitting}
              disabled={selectedUsers.length === 0}
              startIcon={<CheckIcon />}
          >
              Assign Selected ({selectedUsers.length})
          </LoadingButton>
      </Box>

    </Container>
  );
}
