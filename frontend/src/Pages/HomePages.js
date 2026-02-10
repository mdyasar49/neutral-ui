import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  useTheme,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as ExamIcon,
  EmojiEvents as TrophyIcon,
  Timeline as ActivityIcon,
  Add as AddIcon,
  ArrowForward as ArrowIcon,
  Assessment as AssessmentIcon,
  Class as ClassIcon,
  LibraryBooks as LibraryIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import userService from '../services/userService';
import examService from '../services/examService';
import { useNotification } from '../context/NotificationContext';

// ----------------------------------------------------------------------

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const showNotification = useNotification();
  
  // Load User Data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user.firstName || 'User';
  const role = user.role || 'student';

  // Dashboard Metrics State
  const [stats, setStats] = useState({
    users: 0,
    exams: 0,
    pendingExams: 0,
    completedExams: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Counts (Parallel requests)
        const [usersData, examsData] = await Promise.all([
          userService.getAllUsers({ limit: 1000 }), 
          examService.getAllExams()
        ]);

        const usersList = usersData.users || usersData || [];
        const examsList = examsData.exams || examsData || [];

        setStats({
          users: usersList.length,
          exams: examsList.length,
          pendingExams: examsList.filter(e => e.status === 'draft' || e.status === 'active').length,
          completedExams: examsList.filter(e => e.status === 'completed').length
        });
      } catch (error) {
        console.error("Dashboard data fetch error", error);
        showNotification("Failed to fetch dashboard metrics", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* Removed manual drawer logic as DashboardLayout handles it */
  
  const WelcomeHero = () => (
    <Card 
      sx={{ 
        mb: 5, 
        p: 3, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, 
        color: 'white',
        borderRadius: 2,
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)'
      }}
    >
      <Grid container alignItems="center" spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Welcome back, {userEmail}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
            You have <strong>{stats.pendingExams} active exams</strong> scheduled. 
            Stay updated with your progress and manage your tasks efficiently.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } 
            }}
            onClick={() => navigate('/exam-list')}
          >
            Go to Exams
          </Button>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'center' }}>
           <Typography variant="h1" sx={{ fontSize: '80px', opacity: 0.2 }}>
              🎓
           </Typography>
        </Grid>
      </Grid>
    </Card>
  );

  const StatCard = ({ title, value, icon, color, subtext }) => (
    <Card sx={{ borderRadius: 2, height: '100%', display: 'flex', alignItems: 'center', p: 3, boxShadow: 2 }}>
      <Avatar variant="rounded" sx={{ bgcolor: `${color}.light`, color: `${color}.contractText` || 'white', width: 56, height: 56, mr: 2 }}>
        {icon}
      </Avatar>
      <Box flexGrow={1}>
        <Typography variant="h4" fontWeight="bold">{loading ? '-' : value}</Typography>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        {subtext && (
          <Typography variant="caption" sx={{ color: `${color}.main`, mt: 0.5, display: 'block' }}>
            {subtext}
          </Typography>
        )}
      </Box>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
       <Helmet>
        <title> Dashboard | Neutral UI </title>
      </Helmet>

      {/* Hero Section */}
      <WelcomeHero />

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Users" 
            value={stats.users} 
            icon={<PeopleIcon />} 
            color="info" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Exams" 
            value={stats.exams} 
            icon={<ExamIcon />} 
            color="warning" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Results Published" 
            value={stats.completedExams} 
            icon={<TrophyIcon />} 
            color="error" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Sessions" 
            value="12" 
            icon={<ActivityIcon />} 
            color="success" 
            subtext="+24% this week"
          />
        </Grid>
      </Grid>

      {/* Quick Actions & Recent */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
           <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                 <Typography variant="h6" fontWeight="bold">Quick Actions</Typography>
              </Box>
              <Grid container spacing={2}>
                 <Grid item xs={6} sm={4}>
                    <Button 
                       fullWidth 
                       variant="outlined" 
                       sx={{ py: 3, flexDirection: 'column', gap: 1, borderRadius: 2, borderColor: 'divider' }}
                       onClick={() => navigate('/exam/create')}
                    >
                       <AddIcon color="primary"/> 
                       <Typography variant="body2" color="text.primary">Create Exam</Typography>
                    </Button>
                 </Grid>
                 <Grid item xs={6} sm={4}>
                    <Button 
                       fullWidth 
                       variant="outlined" 
                       sx={{ py: 3, flexDirection: 'column', gap: 1, borderRadius: 2, borderColor: 'divider' }}
                       onClick={() => navigate('/user-list')}
                    >
                       <PeopleIcon color="info"/> 
                       <Typography variant="body2" color="text.primary">Manage Users</Typography>
                    </Button>
                 </Grid>
                 <Grid item xs={6} sm={4}>
                    <Button 
                       fullWidth 
                       variant="outlined" 
                       sx={{ py: 3, flexDirection: 'column', gap: 1, borderRadius: 2, borderColor: 'divider' }}
                       onClick={() => navigate('/exam-list')}
                    >
                       <ExamIcon color="warning"/> 
                       <Typography variant="body2" color="text.primary">Grade Exams</Typography>
                    </Button>
                 </Grid>
                  <Grid item xs={6} sm={4}>
                    <Button 
                       fullWidth 
                       variant="outlined" 
                       sx={{ py: 3, flexDirection: 'column', gap: 1, borderRadius: 2, borderColor: 'divider' }}
                       onClick={() => navigate('/results')}
                    >
                       <AssessmentIcon color="success"/> 
                       <Typography variant="body2" color="text.primary">View Results</Typography>
                    </Button>
                 </Grid>
                 <Grid item xs={6} sm={4}>
                    <Button 
                       fullWidth 
                       variant="outlined" 
                       sx={{ py: 3, flexDirection: 'column', gap: 1, borderRadius: 2, borderColor: 'divider' }}
                       onClick={() => navigate('/classes')}
                    >
                       <ClassIcon color="secondary"/> 
                       <Typography variant="body2" color="text.primary">Class List</Typography>
                    </Button>
                 </Grid>
                 <Grid item xs={6} sm={4}>
                    <Button 
                       fullWidth 
                       variant="outlined" 
                       sx={{ py: 3, flexDirection: 'column', gap: 1, borderRadius: 2, borderColor: 'divider' }}
                       onClick={() => navigate('/calendar')}
                    >
                       <CalendarIcon color="error"/> 
                       <Typography variant="body2" color="text.primary">Calendar</Typography>
                    </Button>
                 </Grid>
              </Grid>
           </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 2, height: '100%', bgcolor: 'primary.dark', color: 'white' }}>
             <Stack spacing={2} alignItems="flex-start">
               <Typography variant="h6" fontWeight="bold">Need Help?</Typography>
               <Typography variant="body2" sx={{ opacity: 0.8 }}>
                 Check our documentation or contact support for assistance with the Exam Portal.
               </Typography>
               <Button variant="contained" color="warning" endIcon={<ArrowIcon />}>
                 Contact Support
               </Button>
             </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
