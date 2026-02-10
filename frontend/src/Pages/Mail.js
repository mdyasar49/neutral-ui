import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Email as EmailIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import io from 'socket.io-client';
import Loading from '../components/Loading';
import { useNotification } from '../context/NotificationContext';

const socket = io('http://localhost:5000');

export default function Mail() {
  const showNotification = useNotification();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [users, setUsers] = useState([]);
  
  // Compose State
  const [currentTab, setCurrentTab] = useState('inbox'); // 'inbox' or 'sent'
  const [toUsers, setToUsers] = useState([]); // Multiple recipients
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // User Context (Simulated or from Storage)
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = userData.id || 1; 
  const currentUserRole = userData.role || 'admin';

  useEffect(() => {
    fetchMessages();

    // Socket Listener
    socket.on('new_mail', (data) => {
        // If I am a recipient, refresh
        // currentUserId is number, recipient_ids is likely strings or numbers
        if (data.recipient_ids && data.recipient_ids.includes(currentUserId)) {
            fetchMessages();
            showNotification("New mail received!", "info");
        }
    });

    return () => {
        socket.off('new_mail');
    };
  }, []);

  // Async Search Effect
  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
          if (searchQuery) {
              performSearch(searchQuery);
          } else {
              setSearchResults([]);
          }
      }, 300); 

      return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query) => {
      setSearching(true);
      try {
          // Role Logic: Admin -> All, Staff/Student -> Student only
          let roleParam = '';
          // If NOT admin, filter by student role (as requested: "student only")
          if (currentUserRole !== 'admin') {
              roleParam = '&role=student'; 
          }
          
          const res = await axios.get(`http://localhost:5000/api/users?search=${query}&limit=20${roleParam}`);
          setSearchResults(res.data.users || []);
      } catch (e) {
          console.error(e);
      } finally {
          setSearching(false);
      }
  };

  const fetchMessages = async () => {
     setLoading(true);
     try {
         const response = await axios.get(`http://localhost:5000/api/messages/${currentUserId}`, {
             params: { type: currentTab }
         });
         setMessages(response.data);
         // Do not auto-select first message
         setSelectedMessage(null);
     } catch (e) {
         console.error(e);
     } finally {
         setLoading(false);
     }
  };

  useEffect(() => {
     fetchMessages();
  }, [currentTab]);

  const handleSend = async () => {
      // Split recipients into Internal (ID) and External (Email string)
      const internalIds = [];
      const externalEmails = [];
      
      toUsers.forEach(u => {
          if (typeof u === 'string') {
              // Basic email validation could be here
              if (u.includes('@')) externalEmails.push(u);
          } else if (u && u.id) {
              internalIds.push(u.id);
          }
      });

      if (internalIds.length === 0 && externalEmails.length === 0) {
          showNotification("Please select at least one recipient.", "warning");
          return;
      }
      
      if (!subject || !body) return;

      setSending(true);
      try {
          await axios.post('http://localhost:5000/api/messages', {
              sender_id: currentUserId,
              receiver_ids: internalIds, 
              receiver_emails: externalEmails,
              subject,
              body
          });
          setComposeOpen(false);
          setSubject('');
          setBody('');
          setToUsers([]);
          showNotification(`Message sent to ${internalIds.length + externalEmails.length} recipients!`, "success");
          fetchMessages(); 
      } catch(e) {
          showNotification("Failed to send: " + (e.response?.data?.error || e.message), "error");
      } finally {
          setSending(false);
      }
  };

  if (loading) return <Loading />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 10, height: '80vh' }}>
       <Helmet>
        <title> Mail | Neutral UI </title>
      </Helmet>

      <Grid container spacing={2} sx={{ height: '100%' }}>
         {/* Inbox List */}
         <Grid item xs={12} md={4} sx={{ height: '100%' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
               <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight="bold">
                      {currentTab === 'inbox' ? 'Inbox' : 'Sent Items'}
                  </Typography>
                  <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => setComposeOpen(true)}>
                     Compose
                  </Button>
               </Box>
               <Box px={2} pb={1} display="flex" gap={1}>
                   <Button 
                       size="small" 
                       variant={currentTab === 'inbox' ? 'contained' : 'outlined'} 
                       onClick={() => setCurrentTab('inbox')}
                   >
                       Inbox
                   </Button>
                   <Button 
                       size="small" 
                       variant={currentTab === 'sent' ? 'contained' : 'outlined'} 
                       onClick={() => setCurrentTab('sent')}
                   >
                       Sent
                   </Button>
               </Box>
               <Divider />
               <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {messages.length === 0 ? (
                      <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No messages</Typography>
                  ) : (
                      messages.map((msg) => {
                          const isSent = currentTab === 'sent';
                          // For Sent: name of receiver (internal) OR email (external)
                          // For Inbox: name of sender (internal)
                          const displayName = isSent 
                            ? (msg.internalEmail ? `${msg.firstName} ${msg.lastName}` : msg.receiver_email) 
                            : `${msg.firstName} ${msg.lastName}`;
                          
                          const label = isSent ? `To: ${displayName}` : displayName;
                          const statusText = isSent && msg.status ? ` • ${msg.status}` : '';

                          return (
                          <ListItem 
                             key={msg.id} 
                             button 
                             selected={selectedMessage?.id === msg.id}
                             onClick={() => setSelectedMessage(msg)}
                             divider
                          >
                             <ListItemAvatar>
                                <Avatar sx={{ bgcolor: isSent ? 'primary.main' : 'secondary.main' }}>
                                   {displayName?.[0]?.toUpperCase() || 'U'}
                                </Avatar>
                             </ListItemAvatar>
                             <ListItemText 
                                primary={msg.subject} 
                                secondary={`${label} ${statusText} • ${msg.created_at}`}
                                primaryTypographyProps={{ fontWeight: !msg.is_read && !isSent ? 'bold' : 'normal' }}
                             />
                          </ListItem>
                          );
                      })
                  )}
               </List>
            </Card>
         </Grid>

         {/* Message Detail */}
         <Grid item xs={12} md={8} sx={{ height: '100%' }}>
            <Card sx={{ height: '100%', p: 4, overflow: 'auto' }}>
               {selectedMessage ? (
                   (() => {
                       const isSent = currentTab === 'sent';
                       let label, name, email;
                       
                       if (isSent) {
                           label = "To:";
                           // Handle internal vs external logic carefully
                           name = selectedMessage.internalEmail 
                               ? `${selectedMessage.firstName} ${selectedMessage.lastName}` 
                               : (selectedMessage.receiver_email ? 'External Recipient' : 'Unknown');
                           email = selectedMessage.internalEmail || selectedMessage.receiver_email;
                       } else {
                           label = "From:";
                           name = `${selectedMessage.firstName} ${selectedMessage.lastName}`;
                           email = selectedMessage.senderEmail;
                       }

                       const dName = (name || 'User').trim();
                       const initials = dName[0]?.toUpperCase() || 'U';

                       return (
                           <>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                                 <Box display="flex" gap={2}>
                                    <Avatar sx={{ width: 56, height: 56, bgcolor: isSent ? 'primary.main' : 'secondary.main' }}>
                                        {initials}
                                    </Avatar>
                                    <Box>
                                       <Typography variant="h5" fontWeight="bold">{selectedMessage.subject}</Typography>
                                       <Typography variant="body2" color="text.secondary">
                                          {label} {dName} &lt;{email || 'No Email'}&gt;
                                          {isSent && selectedMessage.status && ` • ${selectedMessage.status}`}
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary">
                                          {selectedMessage.created_at}
                                       </Typography>
                                    </Box>
                                 </Box>
                                 <IconButton color="error"><DeleteIcon /></IconButton>
                              </Box>
                              <Divider sx={{ mb: 3 }} />
                              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                 {selectedMessage.body}
                              </Typography>
                           </>
                       );
                   })()
               ) : (
                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                       <EmailIcon sx={{ fontSize: 80, mb: 2 }} />
                       <Typography variant="h6">Select a message to read</Typography>
                   </Box>
               )}
            </Card>
         </Grid>
      </Grid>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} fullWidth maxWidth="sm">
         <DialogTitle>New Message</DialogTitle>
         <DialogContent>
            <Box sx={{ mt: 1 }}>
               <Autocomplete
                  multiple
                  freeSolo
                  options={searchResults}
                  loading={searching}
                  getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      return `${option.firstName} ${option.lastName} (${option.email})`;
                  }}
                  value={toUsers}
                  onChange={(e, newValue) => {
                      setToUsers(newValue);
                  }}
                  onInputChange={(e, v) => setSearchQuery(v)}
                  filterOptions={(x) => x} 
                  renderInput={(params) => (
                      <TextField 
                          {...params} 
                          label="To (Recipients)" 
                          placeholder="Search by name or email..."
                          fullWidth 
                          margin="dense"
                          helperText="Type to search for users"
                      />
                  )}
               />
               <TextField 
                  fullWidth 
                  label="Subject" 
                  margin="dense" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
               />
               <TextField 
                  fullWidth 
                  label="Message" 
                  multiline 
                  rows={6} 
                  margin="dense" 
                  value={body} 
                  onChange={(e) => setBody(e.target.value)} 
               />
            </Box>
         </DialogContent>
         <DialogActions>
            <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSend} disabled={sending || toUsers.length === 0}>
               {sending ? 'Sending...' : 'Send'}
            </Button>
         </DialogActions>
      </Dialog>
      
    </Container>
  );
}
