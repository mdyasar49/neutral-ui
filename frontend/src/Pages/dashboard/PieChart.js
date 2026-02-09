import React, { useState, useEffect } from 'react';

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
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2>Completed Exams by User Role</h2>
      {chartUrl ? (
        <img
          src={chartUrl}
          alt="Pie Chart"
          style={{ width: '80%', maxWidth: '400px', borderRadius: '10px' }}
        />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default PieChart;
