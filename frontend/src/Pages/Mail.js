import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Autocomplete,
  Stack
} from '@mui/material';
import { Add as AddIcon, Email as EmailIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import Page from '../components/Page';
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

  // User Context
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = userData.id || 1; 
  const currentUserRole = userData.role || 'admin';

  const fetchMessages = useCallback(async () => {
     setLoading(true);
     try {
         const response = await axios.get(`http://localhost:5000/api/messages/${currentUserId}`, {
             params: { type: currentTab }
         });
         setMessages(Array.isArray(response.data) ? response.data : []);
         // Keep selected message if it's still in the list, otherwise null
         if (selectedMessage) {
            const stillExists = response.data.find(m => m.id === selectedMessage.id);
            if (!stillExists) setSelectedMessage(null);
         }
     } catch (e) {
         console.error('Fetch Messages Error:', e);
         setMessages([]);
     } finally {
         setLoading(false);
     }
  }, [currentUserId, currentTab, selectedMessage]);

  useEffect(() => {
    fetchMessages();

    const handleNewMail = (data) => {
        if (data.recipient_ids && data.recipient_ids.map(String).includes(String(currentUserId))) {
            fetchMessages();
            showNotification("New mail received!", "info");
        }
    };

    socket.on('new_mail', handleNewMail);

    return () => {
        socket.off('new_mail', handleNewMail);
    };
  }, [currentUserId, fetchMessages, showNotification]);

  const performSearch = useCallback(async (query) => {
      setSearching(true);
      try {
          let roleParam = '';
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
  }, [currentUserRole]);

  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
          if (searchQuery) {
              performSearch(searchQuery);
          } else {
              setSearchResults([]);
          }
      }, 300); 

      return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, performSearch]);

  const handleSend = async () => {
      const internalIds = [];
      const externalEmails = [];
      
      toUsers.forEach(u => {
          if (typeof u === 'string') {
              if (u.includes('@')) externalEmails.push(u);
          } else if (u && u.id) {
              internalIds.push(u.id);
          }
      });

      if (internalIds.length === 0 && externalEmails.length === 0) {
          showNotification("Please select at least one recipient.", "warning");
          return;
      }
      
      if (!subject || !body) {
          showNotification("Please add a subject and message body.", "warning");
          return;
      }

      setSending(true);
      try {
          const senderName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User';
          await axios.post('http://localhost:5000/api/messages', {
              sender_id: currentUserId,
              receiver_ids: internalIds, 
              receiver_emails: externalEmails,
              subject,
              body,
              created_by: senderName
          });
          setComposeOpen(false);
          setSubject('');
          setBody('');
          setToUsers([]);
          showNotification(`Message sent successfully!`, "success");
          if (currentTab === 'sent') fetchMessages(); 
      } catch(e) {
          showNotification("Failed to send: " + (e.response?.data?.error || e.message), "error");
      } finally {
          setSending(false);
      }
  };

  const handleDelete = async (id) => {
      try {
          // You might need a delete endpoint
          // await axios.delete(`http://localhost:5000/api/messages/${id}`);
          showNotification("Delete functionality coming soon.", "info");
      } catch (e) {
          showNotification("Failed to delete.", "error");
      }
  };

  if (loading) return <Loading />;

  return (
    <Page 
        title="Mailbook" 
        subtitle="Manage your messages and notifications."
        action={
            <Button 
                startIcon={<AddIcon />} 
                variant="contained" 
                onClick={() => setComposeOpen(true)}
                size="medium"
            >
                Compose Message
            </Button>
        }
        sx={{ minHeight: '80vh' }}
    >
      <Grid container spacing={2}>
         <Grid item xs={12} md={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)', minHeight: 500 }}>
               <Box p={2}>
                  <Stack direction="row" spacing={1}>
                      <Button 
                          fullWidth
                          size="small" 
                          variant={currentTab === 'inbox' ? 'contained' : 'outlined'} 
                          onClick={() => setCurrentTab('inbox')}
                      >
                          Inbox
                      </Button>
                      <Button 
                          fullWidth
                          size="small" 
                          variant={currentTab === 'sent' ? 'contained' : 'outlined'} 
                          onClick={() => setCurrentTab('sent')}
                      >
                          Sent
                      </Button>
                  </Stack>
               </Box>
               <Divider />
               <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {!Array.isArray(messages) || messages.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography color="text.secondary" variant="body2" gutterBottom>
                              No messages found in your {currentTab}.
                          </Typography>
                          <Button 
                              size="small" 
                              startIcon={<AddIcon />} 
                              onClick={() => setComposeOpen(true)}
                              sx={{ mt: 1 }}
                          >
                              Compose One
                          </Button>
                      </Box>
                  ) : (
                      messages.map((msg) => {
                          const isSent = currentTab === 'sent';
                          const displayName = isSent 
                            ? (msg.internalEmail ? (`${msg.firstName || ''} ${msg.lastName || ''}`.trim() || 'Internal User') : msg.receiver_email) 
                            : (`${msg.firstName || ''} ${msg.lastName || ''}`.trim() || msg.senderEmail || 'Unknown Sender');
                          
                          const label = isSent ? `To: ${displayName}` : displayName;
                          const statusText = isSent && msg.status ? ` • ${msg.status}` : '';

                          return (
                          <ListItem 
                             key={msg.id} 
                             button 
                             selected={selectedMessage?.id === msg.id}
                             onClick={() => setSelectedMessage(msg)}
                             divider
                             sx={{
                                borderLeft: !msg.is_read && !isSent ? '4px solid #00AB55' : 'none',
                             }}
                          >
                             <ListItemAvatar>
                                <Avatar sx={{ bgcolor: isSent ? 'primary.main' : 'secondary.main' }}>
                                   {String(displayName?.[0] || 'U').toUpperCase()}
                                </Avatar>
                             </ListItemAvatar>
                             <ListItemText 
                                primary={msg.subject || '(No Subject)'} 
                                secondary={
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {label} {statusText} • {msg.created_at}
                                    </Typography>
                                }
                                primaryTypographyProps={{ 
                                    fontWeight: !msg.is_read && !isSent ? 'bold' : 'normal',
                                    noWrap: true
                                }}
                             />
                          </ListItem>
                          );
                      })
                  )}
               </List>
            </Card>
         </Grid>

         <Grid item xs={12} md={8}>
            <Card sx={{ p: 4, height: 'calc(100vh - 250px)', minHeight: 500, overflow: 'auto' }}>
               {selectedMessage ? (
                   (() => {
                       const isSent = currentTab === 'sent';
                       let label, name, email;
                       
                       if (isSent) {
                           label = "To:";
                           name = selectedMessage.internalEmail 
                               ? `${selectedMessage.firstName} ${selectedMessage.lastName}` 
                               : (selectedMessage.receiver_email || 'External Recipient');
                           email = selectedMessage.internalEmail || selectedMessage.receiver_email;
                       } else {
                           label = "From:";
                           name = `${selectedMessage.firstName} ${selectedMessage.lastName}`.trim() || 'Unknown Sender';
                           email = selectedMessage.senderEmail;
                       }

                       const dName = (name || 'User').trim();
                       const initials = String(dName[0] || 'U').toUpperCase();

                       return (
                           <>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                                 <Box display="flex" gap={2}>
                                    <Avatar sx={{ width: 56, height: 56, bgcolor: isSent ? 'primary.main' : 'secondary.main' }}>
                                        {initials}
                                    </Avatar>
                                    <Box>
                                       <Typography variant="h5" fontWeight="bold">{selectedMessage.subject || '(No Subject)'}</Typography>
                                       <Typography variant="body2" color="text.secondary">
                                          {label} {dName} &lt;{email || 'No Email'}&gt;
                                          {isSent && selectedMessage.status && ` • ${selectedMessage.status}`}
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary">
                                          {selectedMessage.created_at}
                                       </Typography>
                                    </Box>
                                 </Box>
                                 <IconButton color="error" onClick={() => handleDelete(selectedMessage.id)}>
                                    <DeleteIcon />
                                 </IconButton>
                              </Box>
                              <Divider sx={{ mb: 3 }} />
                              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                 {selectedMessage.body}
                              </Typography>
                           </>
                       );
                   })()
               ) : (
                   <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                       <EmailIcon sx={{ fontSize: 100, mb: 2 }} />
                       <Typography variant="h6">Select a message from the list to read</Typography>
                   </Box>
               )}
            </Card>
         </Grid>
      </Grid>

      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} fullWidth maxWidth="sm">
         <DialogTitle sx={{ pb: 1 }}>New Message</DialogTitle>
         <Divider />
         <DialogContent sx={{ py: 2 }}>
            <Stack spacing={2}>
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
                          label="Recipient(s)" 
                          placeholder="Search users or enter email..."
                          fullWidth 
                          helperText="Press enter for external emails"
                      />
                  )}
               />
               <TextField 
                  fullWidth 
                  label="Subject" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
               />
               <TextField 
                  fullWidth 
                  label="Message" 
                  multiline 
                  rows={10} 
                  value={body} 
                  onChange={(e) => setBody(e.target.value)} 
               />
            </Stack>
         </DialogContent>
         <Divider />
         <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setComposeOpen(false)} color="inherit">Cancel</Button>
            <Button 
                variant="contained" 
                onClick={handleSend} 
                disabled={sending || toUsers.length === 0}
                sx={{ px: 4 }}
            >
               {sending ? 'Sending...' : 'Send Now'}
            </Button>
         </DialogActions>
      </Dialog>
      
    </Page>
  );
}
