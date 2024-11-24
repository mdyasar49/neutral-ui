import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Drawer, Divider, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import PieChart from './dashboard/PieChart';

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user_id, firstname, id, user_role, user_email, institude_id } = location.state || {};

  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const handleNavigation = (path, params) => {
    navigate(path, { state: params });
    closeDrawer();
  };

  useEffect(() => {
    document.title = 'Home'; // Simulating CustomHeader functionality
  }, [user_email, user_role]);

  const capitalLetter = (text) => text?.charAt(0).toUpperCase() + text?.slice(1);

  const menuItems = [
    { label: 'Institute List', path: '/institute-list' },
    { label: 'Exam List', path: '/exam-list' },
    { label: 'Staff User List', path: '/staff-user-list' },
    { label: 'Student User List', path: '/student-user-list' },
    { label: 'Draw', path: '/drawer' },
  ];

  return (
    <Box sx={{ padding: '20px' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '10px',
          margin: '20px auto',
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Welcome Back {capitalLetter(user_email || 'Guest')}!
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={toggleDrawer}
        sx={{ marginTop: '20px' }}
      >
        {drawerVisible ? 'Close Drawer' : 'Open Drawer'}
      </Button>

      <Drawer anchor="right" open={drawerVisible} onClose={closeDrawer}>
        <Box
          sx={{
            width: 250,
            padding: '10px',
            backgroundColor: '#fff',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ marginBottom: '10px' }}>
            Menu
          </Typography>
          <List>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() =>
                      handleNavigation(item.path, {
                        user_id,
                        firstname,
                        id,
                        user_role,
                        user_email,
                        institude_id,
                      })
                    }
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
                {index < menuItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
      <PieChart />
    </Box>
  );
};

export default HomePage;
