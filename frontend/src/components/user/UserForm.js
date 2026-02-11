import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import userService from '../../services/userService';

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),
  isEdit: yup.boolean(),
  password: yup.string().min(6, 'Password must be at least 6 characters'),
});

const UserForm = ({ open, onClose, user = null, onSave }) => {
  const isEdit = Boolean(user);
  const [error, setError] = useState('');
  const [teachers, setTeachers] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';
  const isTeacher = currentUser.role === 'staff' || currentUser.role === 'teacher';

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: user?.role || 'student',
      teacher_id: user?.teacher_id || '',
      password: '',
      isEdit,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setError('');
        const creatorName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Admin';
        
        const userData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: values.role,
          teacher_id: isTeacher ? currentUser.id : values.teacher_id,
          ...(values.password && { password: values.password }),
          [isEdit ? 'modified_by' : 'created_by']: creatorName
        };
        
        await onSave(userData, user?.id);
        formik.resetForm();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to save user');
      }
    },
  });

  const fetchTeachers = React.useCallback(async () => {
    try {
      const staffResponse = await userService.getAllUsers({ role: 'staff' });
      const teacherResponse = await userService.getAllUsers({ role: 'teacher' });
      
      const staffList = staffResponse.users || staffResponse || [];
      const teacherList = teacherResponse.users || teacherResponse || [];
      
      const combined = [...staffList, ...teacherList];
      const uniqueTeachers = Array.from(new Map(combined.map(item => [item.id, item])).values());
      
      setTeachers(uniqueTeachers);
    } catch (err) {
      console.error('Failed to fetch teachers', err);
    }
  }, []);

  useEffect(() => {
    if (open && isAdmin) {
      fetchTeachers();
    }
    if (!open) {
      formik.resetForm();
      setError('');
    }
  }, [open, isAdmin, fetchTeachers, formik]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formik.values.role}
                  label="Role"
                  onChange={formik.handleChange}
                  error={formik.touched.role && Boolean(formik.errors.role)}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(formik.values.role === 'student' && isAdmin) && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Assign Teacher</InputLabel>
                  <Select
                    name="teacher_id"
                    value={formik.values.teacher_id}
                    label="Assign Teacher"
                    onChange={formik.handleChange}
                    error={formik.touched.teacher_id && Boolean(formik.errors.teacher_id)}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {teachers.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                label={isEdit ? 'New Password (optional)' : 'Password'}
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={
                  formik.touched.password && formik.errors.password
                    ? formik.errors.password
                    : isEdit
                    ? 'Leave blank to keep current password'
                    : ''
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;
