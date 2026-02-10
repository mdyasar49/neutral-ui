import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  Typography,
  Switch,
  FormControlLabel,
  Button
} from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import { Helmet } from 'react-helmet-async';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Settings() {
  const showNotification = useNotification();
  // Initialize state from localStorage
  const [notifications, setNotifications] = useState(() => {
     return localStorage.getItem('settings_notifications') === 'true';
  });
  
  const [darkMode, setDarkMode] = useState(() => {
     return localStorage.getItem('settings_darkMode') === 'true';
  });

  const [confirmReload, setConfirmReload] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Effects to persist changes
  useEffect(() => {
     localStorage.setItem('settings_notifications', notifications);
     if (notifications) {
         // Logic to enable notifications (e.g. request permission)
     }
  }, [notifications]);

  useEffect(() => {
     localStorage.setItem('settings_darkMode', darkMode);
     // Reload page to apply theme if necessary, or context would handle it
     // For now, we'll just save it. true Dark Mode requires ThemeProvider context update.
     if (darkMode) {
         document.body.style.backgroundColor = '#121212';
         document.body.style.color = '#ffffff';
     } else {
         document.body.style.backgroundColor = '#F9FAFB';
         document.body.style.color = '#212B36';
     }
  }, [darkMode]);

  const handleSave = (settingName) => {
      showNotification(`${settingName} updated successfully!`, "success");
  };

  const handleReset = () => {
    setConfirmReset(true);
  };

  const executeReset = () => {
      setNotifications(true);
      setDarkMode(false);
      localStorage.setItem('settings_darkMode', 'false');
      localStorage.setItem('settings_notifications', 'true');
      setConfirmReset(false);
      showNotification('All settings reset to default.', "info");
  };

  const handle2FA = () => {
      // Mock 2FA flow
      showNotification('2FA verification code sent!', "info");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
       <Helmet>
        <title> Settings | Neutral UI </title>
      </Helmet>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Application Settings
      </Typography>

      <Grid container spacing={3}>
         <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, mb: 3 }}>
               <Typography variant="h6" gutterBottom>General Preferences</Typography>
               
               <FormControlLabel 
                  control={
                    <Switch 
                        checked={notifications} 
                        onChange={(e) => {
                            setNotifications(e.target.checked);
                            handleSave('Notifications');
                        }} 
                    />
                  } 
                  label="Enable Email Notifications" 
                  sx={{ width: '100%', mb: 2, display: 'block' }}
               />
               
               <FormControlLabel 
                  control={
                    <Switch 
                        checked={darkMode} 
                        onChange={(e) => {
                            const newValue = e.target.checked;
                            setDarkMode(newValue);
                            localStorage.setItem('settings_darkMode', newValue); // Force save immediately
                            handleSave('Dark Mode');
                            setConfirmReload(true);
                        }} 
                    />
                  } 
                  label="Dark Mode (Experimental)" 
                  sx={{ width: '100%', mb: 2, display: 'block' }}
               />

               <Button 
                 variant="outlined" 
                 color="error" 
                 onClick={handleReset}
                 sx={{ mt: 1 }}
               >
                 Reset All Settings
               </Button>
            </Card>

            <Card sx={{ p: 3 }}>
               <Typography variant="h6" gutterBottom>Security</Typography>
               <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={handle2FA}
                  sx={{ mb: 2, bgcolor: 'primary.dark' }}
               >
                  Enable Two-Factor Auth (2FA)
               </Button>
               <Typography variant="caption" display="block" color="text.secondary">
                  Manage sessions and devices connected to your account.
               </Typography>
            </Card>
         </Grid>
      </Grid>
      
      <ConfirmDialog 
        open={confirmReload}
        title="Reload Required"
        message="The application needs to reload to apply the dark theme changes fully. Would you like to reload now?"
        onConfirm={() => window.location.reload()}
        onCancel={() => setConfirmReload(false)}
        confirmText="Reload Now"
      />

      <ConfirmDialog 
        open={confirmReset}
        title="Reset Settings"
        message="Are you sure you want to reset all preferences to their default values? This cannot be undone."
        onConfirm={executeReset}
        onCancel={() => setConfirmReset(false)}
        color="warning"
        confirmText="Reset Now"
      />

    </Container>
  );
}
