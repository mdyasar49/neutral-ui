import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

const PieChart = () => {
  const [chartUrl, setChartUrl] = useState('');

  useEffect(() => {
    const fetchPieChart = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pie-chart/user-role-exams');
        if (response.ok) {
          const data = await response.json();
          setChartUrl(data.chart_url);
        } else {
          console.error('Failed to fetch pie chart data');
        }
      } catch (error) {
        console.error('Error fetching pie chart:', error);
      }
    };

    fetchPieChart();
  }, []);

  return (
    <Card sx={{ maxWidth: 500, margin: '20px auto', textAlign: 'center', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Completed Exams by User Role
        </Typography>
        {chartUrl ? (
          <Box
            component="img"
            src={chartUrl}
            alt="Pie Chart"
            sx={{
              width: '100%',
              maxWidth: '400px',
              borderRadius: '10px',
              margin: '0 auto',
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
            <CircularProgress />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChart;
