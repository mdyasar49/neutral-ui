import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Button,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Class as ClassIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
} from '@mui/material';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Helmet } from 'react-helmet-async';

import { useNotification } from '../../context/NotificationContext';
import axios from 'axios';

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]); // List of users with 'teacher' role
  const [loading, setLoading] = useState(true);
  
  // Modals & Menu State
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({ name: '', teacher_id: '', class_code: '', description: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const showNotification = useNotification();

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
       setLoading(true);
       const response = await axios.get('http://localhost:5000/api/classes');
       setClasses(response.data);
    } catch (error) {
       showNotification('Failed to fetch classes', 'error');
    } finally {
       setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
       const response = await axios.get('http://localhost:5000/api/users?role=teacher');
       setTeachers(response.data.users || []);
    } catch (error) {
       console.error('Failed to fetch teachers', error);
    }
  };

  const handleOpenAdd = () => {
    setSelectedClass(null);
    setFormData({ name: '', teacher_id: '', class_code: '', description: '' });
    setOpenForm(true);
  };

  const handleOpenEdit = () => {
    setFormData({ 
      name: selectedClass.name, 
      teacher_id: selectedClass.teacher_id, 
      class_code: selectedClass.class_code, 
      description: selectedClass.description 
    });
    setOpenForm(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.teacher_id) {
       showNotification('Class name and teacher are required', 'warning');
       return;
    }
    try {
       if (selectedClass) {
          await axios.put(`http://localhost:5000/api/classes/${selectedClass.id}`, formData);
          showNotification('Class updated successfully', 'success');
       } else {
          await axios.post('http://localhost:5000/api/classes', formData);
          showNotification('Class created successfully', 'success');
       }
       setOpenForm(false);
       fetchClasses();
    } catch (error) {
       showNotification('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/classes/${selectedClass.id}`);
      showNotification('Class deleted', 'success');
      setConfirmDelete(false);
      fetchClasses();
    } catch(e) {
      showNotification('Failed to delete class', 'error');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
      <Helmet>
        <title> Classes | Neutral UI </title>
      </Helmet>

      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Classes & Batches
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your student groups and academic departments.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>New Class</Button>
      </Box>

      <Grid container spacing={3}>
        {classes.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ 
              borderRadius: 2, 
              '&:hover': { transform: 'translateY(-5px)', transition: '0.3s' },
              boxShadow: 3
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                    <ClassIcon />
                  </Avatar>
                  <IconButton onClick={(e) => handleMenuOpen(e, item)}><MoreVertIcon /></IconButton>
                </Box>
                
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {item.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Department Code: <strong>{item.class_code}</strong>
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2">{item.students} Students</Typography>
                  </Box>
                  <Chip label={item.teacher} size="small" variant="outlined" color="primary" />
                </Stack>

                <Button 
                  fullWidth 
                  variant="outlined" 
                  sx={{ mt: 3, borderRadius: 2 }}
                  onClick={() => { setSelectedClass(item); setOpenDetails(true); }}
                >
                  Manage Class
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleOpenEdit}><EditIcon sx={{ mr: 1 }} fontSize="small" /> Edit</MenuItem>
        <MenuItem onClick={() => { setConfirmDelete(true); setAnchorEl(null); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" /> Delete
        </MenuItem>
      </Menu>

      {/* Class Form Modal (Add/Edit) */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="xs">
        <DialogTitle>{selectedClass ? 'Edit Class' : 'Create New Class'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
           <TextField
              fullWidth label="Class Name" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
           />
           <TextField
              fullWidth label="Class Code" value={formData.class_code}
              onChange={(e) => setFormData({ ...formData, class_code: e.target.value })}
              sx={{ mb: 2 }}
           />
           <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Teacher</InputLabel>
              <Select
                value={formData.teacher_id} label="Select Teacher"
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
              >
                {teachers.map(t => <MenuItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</MenuItem>)}
              </Select>
           </FormControl>
           <TextField
              fullWidth label="Description" multiline rows={3} value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
           />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Class Details
          <IconButton onClick={() => setOpenDetails(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedClass && (
            <Box py={2}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>{selectedClass.name}</Typography>
              <Typography variant="subtitle2" color="secondary" gutterBottom>{selectedClass.class_code}</Typography>
              
              <Box my={3} p={2} bgcolor="background.neutral" borderRadius={2}>
                <Typography variant="subtitle2" gutterBottom>Description</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedClass.description || 'No description available for this class.'}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                 <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Class Teacher</Typography>
                    <Typography variant="body1">{selectedClass.teacher}</Typography>
                 </Grid>
                 <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Enrolled Students</Typography>
                    <Typography variant="body1">{selectedClass.students} Members</Typography>
                 </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
           <Button variant="contained" fullWidth>Manage Student Roster</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog 
        open={confirmDelete}
        title="Delete Class"
        message="Are you sure you want to delete this class? This will also unassign all students."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        color="error"
      />
    </Container>
  );
}
