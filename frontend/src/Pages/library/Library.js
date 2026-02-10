import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Link as LinkIcon,
  Download as DownloadIcon,
  FolderZip as ZipIcon,
  FilterList as FilterIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

import { useNotification } from '../../context/NotificationContext';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function Library() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openUpload, setOpenUpload] = useState(false);
  const [newFile, setNewFile] = useState({ title: '', resource_type: 'PDF', category: 'Lecture Notes' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const showNotification = useNotification();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/library');
      setResources(response.data);
    } catch (error) {
      showNotification('Failed to fetch library resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'PDF': return <PdfIcon sx={{ color: '#F44336' }} />;
      case 'DOC': return <DocIcon sx={{ color: '#2196F3' }} />;
      case 'ZIP': return <ZipIcon sx={{ color: '#FF9800' }} />;
      default: return <LinkIcon sx={{ color: '#9E9E9E' }} />;
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/library/${id}/download`);
      showNotification(response.data.message, 'success');
    } catch (error) {
      showNotification('Download failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    setConfirmDelete({ open: true, id });
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/library/${confirmDelete.id}`);
      showNotification('Resource deleted successfully', 'success');
      setConfirmDelete({ open: false, id: null });
      fetchResources();
    } catch (error) {
       showNotification('Failed to delete resource', 'error');
    }
  };

  const handleUpload = async () => {
    if (!newFile.title) {
      showNotification('Please enter a title', 'warning');
      return;
    }
    try {
      const payload = {
        ...newFile,
        file_path: 'uploads/' + newFile.title.toLowerCase().replace(/ /g, '_'),
        file_size: '2.0 MB', // Mock size
        uploaded_by: user.id || 1
      };
      await axios.post('http://localhost:5000/api/library', payload);
      showNotification('Resource uploaded successfully', 'success');
      setOpenUpload(false);
      setNewFile({ title: '', resource_type: 'PDF', category: 'Lecture Notes' });
      fetchResources();
    } catch (error) {
       showNotification('Upload failed', 'error');
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
      <Helmet>
        <title> Library | Neutral UI </title>
      </Helmet>

      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Resource Library
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access study materials, question papers, and shared academic assets.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Search & Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search resources..."
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outlined" startIcon={<FilterIcon />} onClick={() => setSelectedCategory('All')}>All</Button>
          </Paper>
        </Grid>

        {/* Resources List */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2 }}>
             {loading ? (
               <Box p={4} textAlign="center"><Typography>Loading...</Typography></Box>
             ) : (
               <List>
                 {filteredResources.length > 0 ? filteredResources.map((item, index) => (
                   <React.Fragment key={item.id}>
                     <ListItem sx={{ py: 2 }}>
                       <ListItemAvatar>
                         <Avatar sx={{ bgcolor: 'background.neutral' }}>
                           {getIcon(item.resource_type)}
                         </Avatar>
                       </ListItemAvatar>
                       <ListItemText
                         primary={item.title}
                         secondary={`${item.resource_type} • ${item.file_size} • Category: ${item.category} • Uploaded ${item.created_at}`}
                       />
                       <ListItemSecondaryAction>
                         <IconButton color="primary" onClick={() => handleDownload(item.id)}>
                           <DownloadIcon />
                         </IconButton>
                         <IconButton color="error" onClick={() => handleDelete(item.id)}>
                           <DeleteIcon />
                         </IconButton>
                       </ListItemSecondaryAction>
                     </ListItem>
                     {index < filteredResources.length - 1 && <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mx: 2 }} />}
                   </React.Fragment>
                 )) : (
                   <Box p={4} textAlign="center"><Typography color="text.secondary">No resources found</Typography></Box>
                 )}
               </List>
             )}
          </Card>
        </Grid>

        {/* Categories Sidebar */}
        <Grid item xs={12} md={4}>
           <Card sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.dark', color: 'white' }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>Quick Upload</Typography>
              <Box 
                 sx={{ 
                    border: '2px dashed rgba(255,255,255,0.3)', 
                    p: 4, 
                    borderRadius: 2, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                 }}
                 onClick={() => setOpenUpload(true)}
              >
                 <Typography variant="body2">Drag & Drop files here or click to browse</Typography>
              </Box>
              <Button fullWidth variant="contained" color="warning" sx={{ mt: 3 }} onClick={() => setOpenUpload(true)}>
                Upload New File
              </Button>
           </Card>

           <Card sx={{ p: 3, mt: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>Categories</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                 {['Question Papers', 'Lecture Notes', 'Projects', 'Syllabus', 'Misc'].map(tag => (
                   <Button 
                     key={tag} 
                     variant={selectedCategory === tag ? 'contained' : 'outlined'} 
                     size="small" 
                     sx={{ borderRadius: 5 }}
                     onClick={() => setSelectedCategory(prev => prev === tag ? 'All' : tag)}
                   >
                     {tag}
                   </Button>
                 ))}
              </Box>
           </Card>
        </Grid>
      </Grid>

      {/* Upload Modal */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} fullWidth maxWidth="xs">
        <DialogTitle>Upload Resource</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="File Title"
            value={newFile.title}
            onChange={(e) => setNewFile({ ...newFile, title: e.target.value })}
            sx={{ mb: 3, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Resource Type</InputLabel>
            <Select
              value={newFile.resource_type}
              label="Resource Type"
              onChange={(e) => setNewFile({ ...newFile, resource_type: e.target.value })}
            >
              <MenuItem value="PDF">PDF Document</MenuItem>
              <MenuItem value="DOC">Word Document</MenuItem>
              <MenuItem value="ZIP">Archive (ZIP)</MenuItem>
              <MenuItem value="LINK">External Link</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newFile.category}
              label="Category"
              onChange={(e) => setNewFile({ ...newFile, category: e.target.value })}
            >
              <MenuItem value="Question Papers">Question Papers</MenuItem>
              <MenuItem value="Lecture Notes">Lecture Notes</MenuItem>
              <MenuItem value="Projects">Projects</MenuItem>
              <MenuItem value="Syllabus">Syllabus</MenuItem>
              <MenuItem value="Misc">Miscellaneous</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} color="primary">Upload Now</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog 
        open={confirmDelete.open}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This item will be permanently removed from the library."
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        color="error"
        confirmText="Remove File"
      />
    </Container>
  );
}
