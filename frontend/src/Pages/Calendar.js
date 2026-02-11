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
  Stack,
  Badge,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Chip,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  ChevronLeft as LeftIcon,
  ChevronRight as RightIcon,
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import ConfirmDialog from '../components/ConfirmDialog';
import Page from '../components/Page';

export default function Calendar() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openAll, setOpenAll] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'event', color: 'primary' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const showNotification = useNotification();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      
      const dbResponse = await axios.get('http://localhost:5000/api/calendar');
      const dbEvents = dbResponse.data;

      let holidayEvents = [];
      try {
        const holidayResponse = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/IN`);
        holidayEvents = holidayResponse.data.map(h => ({
          id: `h-${h.date}`,
          title: h.localName,
          date: h.date,
          type: 'holiday',
          color: 'secondary',
          isPublic: true
        }));
      } catch (hError) {
        console.error('Holiday API failed', hError);
      }

      setEvents([...dbEvents, ...holidayEvents]);
    } catch (error) {
      showNotification('Failed to fetch calendar data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      showNotification('Title and date are required', 'warning');
      return;
    }
    try {
      const personaName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin';
      
      const payload = {
        title: newEvent.title,
        event_date: newEvent.date,
        event_type: newEvent.type,
        color: newEvent.color,
        created_by: personaName
      };
      await axios.post('http://localhost:5000/api/calendar', payload);
      showNotification('Event added successfully', 'success');
      setOpenAdd(false);
      setNewEvent({ title: '', date: '', type: 'event', color: 'primary' });
      fetchEvents();
    } catch (error) {
      showNotification('Failed to add event', 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    // Prevent deleting public holidays
    if (typeof id === 'string' && id.startsWith('h-')) {
       showNotification('Public holidays cannot be deleted', 'warning');
       return;
    }
    setConfirmDelete({ open: true, id });
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/calendar/${confirmDelete.id}`);
      showNotification('Event removed', 'success');
      setConfirmDelete({ open: false, id: null });
      fetchEvents();
    } catch (error) {
      showNotification('Failed to remove event', 'error');
    }
  };

  // Dynamic Date Logic
  const getMonthName = (date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  };

  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // ... (previous helper functions handleAdd/Delete)

  return (
    <Page 
      title="Academic Calendar" 
      subtitle="World Calendar mode active with festivals & campus events."
    >
       <Box sx={{ position: 'absolute', top: 32, right: 24 }}>
          <Button variant="contained" startIcon={<EventIcon />} onClick={() => setOpenAdd(true)}>Schedule Event</Button>
       </Box>

      <Grid container spacing={3}>
        {/* Calendar View */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <IconButton color="inherit" onClick={handlePrevMonth}><LeftIcon /></IconButton>
               <Typography variant="h6" fontWeight="bold">{getMonthName(currentDate)}</Typography>
               <IconButton color="inherit" onClick={handleNextMonth}><RightIcon /></IconButton>
            </Box>
            
            <Box sx={{ p: 2 }}>
               <Grid container spacing={1}>
                  {/* Empty headers for days offset */}
                  {DAYS.map(day => (
                    <Grid item xs={1.71} key={day} textAlign="center">
                       <Typography variant="caption" fontWeight="bold" color="text.secondary">{day}</Typography>
                    </Grid>
                  ))}
                  
                  {/* Leading empty spaces */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <Grid item xs={1.71} key={`empty-${i}`}>
                       <Box sx={{ height: 100, border: '0.1px solid rgba(0,0,0,0.05)' }} />
                    </Grid>
                  ))}

                  {/* Real dates */}
                  {daysInMonth.map(date => {
                    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    const dayEvents = events.filter(e => e.date === formattedDate);
                    
                    return (
                      <Grid item xs={1.71} key={date}>
                        <Paper 
                           variant="outlined" 
                           onClick={() => {
                             setNewEvent({ ...newEvent, date: formattedDate });
                             setOpenAdd(true);
                           }}
                           sx={{ 
                              height: 100, 
                              p: 1, 
                              borderRadius: 1,
                              cursor: 'pointer',
                              bgcolor: dayEvents.length > 0 ? (dayEvents.some(e => e.isPublic) ? 'secondary.lighter' : 'action.hover') : 'transparent',
                              '&:hover': { bgcolor: 'action.selected', boxShadow: (theme) => theme.customShadows.z8 },
                              overflow: 'auto',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5
                           }}
                        >
                           <Typography variant="subtitle2" fontWeight={dayEvents.length > 0 ? 'bold' : 'normal'}>{date}</Typography>
                           {dayEvents.map((event, idx) => (
                             <Box 
                                key={idx}
                                sx={{ 
                                   p: 0.5, 
                                   bgcolor: `${event.color}.main`, 
                                   color: 'white', 
                                   borderRadius: 0.5,
                                   fontSize: '9px',
                                   whiteSpace: 'nowrap',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis'
                                }}
                             >
                                {event.title}
                             </Box>
                           ))}
                        </Paper>
                      </Grid>
                    );
                  })}
               </Grid>
            </Box>
          </Card>
        </Grid>

        {/* Upcoming Events sidebar */}
        <Grid item xs={12} lg={4}>
           <Card sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>Upcoming Events</Typography>
              <Stack spacing={3}>
                 {events.map(event => (
                   <Box key={event.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: `${event.color || 'primary'}.light`, color: `${event.color || 'primary'}.contrastText` }}>
                         <FlagIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                         <Typography variant="subtitle2" fontWeight="bold">{event.title}</Typography>
                         <Typography variant="caption" color="text.secondary">{event.date} • {event.type}</Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleDeleteEvent(event.id)}>
                         <DeleteIcon fontSize="small" />
                      </IconButton>
                   </Box>
                 ))}
              </Stack>
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 4, borderRadius: 2 }}
                onClick={() => setOpenAll(true)}
              >
                View All Schedule
              </Button>
           </Card>

           <Card sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <Typography variant="subtitle1" fontWeight="bold">Did you know?</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                You can sync your exam calendar with Google Calendar or Outlook for mobile notifications.
              </Typography>
           </Card>
        </Grid>
      </Grid>

      {/* Add Event Modal */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="xs">
        <DialogTitle>Schedule New Event</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            sx={{ mb: 3, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={newEvent.type}
              label="Event Type"
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
            >
              <MenuItem value="class">Class</MenuItem>
              <MenuItem value="exam">Exam</MenuItem>
              <MenuItem value="submission">Submission</MenuItem>
              <MenuItem value="event">General Event</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Priority Style</InputLabel>
            <Select
              value={newEvent.color}
              label="Priority Style"
              onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
            >
              <MenuItem value="primary">Standard (Blue)</MenuItem>
              <MenuItem value="success">Low (Green)</MenuItem>
              <MenuItem value="warning">Medium (Yellow)</MenuItem>
              <MenuItem value="error">High (Red)</MenuItem>
              <MenuItem value="info">Info (Light Blue)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEvent} color="primary">Add to Schedule</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog 
        open={confirmDelete.open}
        title="Delete Event"
        message="Are you sure you want to remove this event from your calendar? This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        color="error"
        confirmText="Delete"
      />

      {/* View All Events Modal */}
      <Dialog open={openAll} onClose={() => setOpenAll(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Complete Schedule
          <IconButton onClick={() => setOpenAll(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
           <List>
              {events.sort((a,b) => new Date(a.date) - new Date(b.date)).map((event) => (
                <ListItem key={event.id} divider>
                   <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${event.color}.main`, color: 'white' }}>
                         <EventIcon fontSize="small" />
                      </Avatar>
                   </ListItemAvatar>
                   <ListItemText 
                      primary={event.title}
                      secondary={`${event.date} • ${event.type.toUpperCase()}`}
                   />
                   {event.isPublic && (
                     <Chip label="Public Holiday" size="small" color="secondary" variant="outlined" />
                   )}
                </ListItem>
              ))}
           </List>
        </DialogContent>
        <DialogActions>
           <Button onClick={() => setOpenAll(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
