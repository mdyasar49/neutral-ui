import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PieChart from './dashboard/PieChart';
import { Box, Button, Drawer, Typography, Divider, List, ListItem, ListItemText } from '@mui/material';

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user_id, firstname, id, user_role, user_email, institude_id } = location.state || {};

  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setDrawerVisible((prev) => !prev);
  };

  const handleNavigation = (path, params) => {
    navigate(path, { state: params });
    setDrawerVisible(false);
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
      {/* Welcome message */}
      <Box
        sx={{
          textAlign: 'center',
          backgroundColor: '#f0f0f0',
          padding: '20px',
          borderRadius: '10px',
          margin: '20px auto',
          maxWidth: '500px',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome Back {capitalLetter(user_email || 'Guest')}!
        </Typography>
      </Box>

      {/* Drawer toggle button */}
      <Button
        variant="contained"
        color="primary"
        onClick={toggleDrawer}
        sx={{ marginTop: '20px' }}
      >
        {drawerVisible ? 'Close Drawer' : 'Open Drawer'}
      </Button>

      {/* Drawer for menu items */}
      <Drawer anchor="left" open={drawerVisible} onClose={toggleDrawer}>
        <Box
          sx={{
            width: 250,
            padding: 2,
          }}
          role="presentation"
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Menu
          </Typography>
          <Divider />
          <List>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem
                  button
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
                </ListItem>
                {index < menuItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* PieChart component */}
      <PieChart />
    </Box>
  );
};

export default HomePage;
