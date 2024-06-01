// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend, ArcElement, TimeScale } from 'chart.js';
import 'chartjs-adapter-moment';
import zoomPlugin from 'chartjs-plugin-zoom';
import moment from 'moment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  zoomPlugin
);

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/output.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setData(data))
      .catch(error => console.error('Fetching error:', error));
  }, []);

  const processData = (data) => {
    const eventTypeCounts = {};
    const srcIpCounts = {};
    const timestamps = [];
    const alertCategories = {};
    const ipAttackTypes = {};
    const timeAttackTypes = {};
    const alertFrequency = {};

    data.forEach(item => {
      // Event Type Counts
      eventTypeCounts[item.event_type] = (eventTypeCounts[item.event_type] || 0) + 1;

      // Source IP Counts
      srcIpCounts[item.src_ip] = (srcIpCounts[item.src_ip] || 0) + 1;

      // Timestamps
      timestamps.push(item.timestamp);

      // Alert Categories
      if (item.alert) {
        const category = item.alert.category;
        alertCategories[category] = (alertCategories[category] || 0) + 1;

        // IP Attack Types
        if (!ipAttackTypes[item.src_ip]) {
          ipAttackTypes[item.src_ip] = {};
        }
        ipAttackTypes[item.src_ip][category] = (ipAttackTypes[item.src_ip][category] || 0) + 1;

        // Time Attack Types
        const timeKey = moment(item.timestamp).format('YYYY-MM-DD HH:00'); // Grouping by hour
        if (!timeAttackTypes[timeKey]) {
          timeAttackTypes[timeKey] = {};
        }
        timeAttackTypes[timeKey][category] = (timeAttackTypes[timeKey][category] || 0) + 1;

        // Alert Frequency
        if (!alertFrequency[timeKey]) {
          alertFrequency[timeKey] = 0;
        }
        alertFrequency[timeKey] += 1;
      }
    });

    return { eventTypeCounts, srcIpCounts, timestamps, alertCategories, ipAttackTypes, timeAttackTypes, alertFrequency };
  };

  if (data.length === 0) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const { eventTypeCounts, srcIpCounts, timestamps, alertCategories, ipAttackTypes, timeAttackTypes, alertFrequency } = processData(data);

  // Prepare event type data for the pie chart
  const eventTypeData = {
    labels: Object.keys(eventTypeCounts),
    datasets: [
      {
        label: 'Event Types',
        data: Object.values(eventTypeCounts),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare source IP data for the stacked bar chart
  const ipLabels = Object.keys(ipAttackTypes);
  const categories = Object.keys(alertCategories);

  const ipAttackData = {
    labels: ipLabels,
    datasets: categories.map((category, index) => ({
      label: category,
      data: ipLabels.map(ip => ipAttackTypes[ip][category] || 0),
      backgroundColor: `rgba(${index * 30}, ${100 + index * 30}, ${200 - index * 30}, 0.6)`,
      borderColor: `rgba(${index * 30}, ${100 + index * 30}, ${200 - index * 30}, 1)`,
      borderWidth: 1,
    })),
  };

  // Prepare timestamp data for the line chart
  const timeLabels = Object.keys(timeAttackTypes);
  const timeAttackData = {
    labels: timeLabels,
    datasets: categories.map((category, index) => ({
      label: category,
      data: timeLabels.map(time => timeAttackTypes[time][category] || 0),
      borderColor: `rgba(${index * 30}, ${150 - index * 30}, ${200 - index * 30}, 1)`,
      backgroundColor: `rgba(${index * 30}, ${150 - index * 30}, ${200 - index * 30}, 0.2)`,
      fill: true,
      tension: 0.4,
    })),
  };

  // Prepare alert categories data for the pie chart
  const categoryData = {
    labels: Object.keys(alertCategories),
    datasets: [
      {
        label: 'Categories',
        data: Object.values(alertCategories),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare alert frequency data for the new line chart
  const alertFrequencyData = {
    labels: Object.keys(alertFrequency),
    datasets: [
      {
        label: 'Alert Frequency',
        data: Object.values(alertFrequency),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Zoom and Pan options
  const zoomOptions = {
    pan: {
      enabled: true,
      mode: 'xy',
    },
    zoom: {
      enabled: true,
      mode: 'xy',
    },
  };

  return (
    <Container maxWidth="lg" style={{ padding: '24px' }}>
      <Typography variant="h4" gutterBottom style={{ color: '#333', textAlign: 'center', marginBottom: '24px' }}>
        Network Security Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '24px', borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" style={{ marginBottom: '16px' }}>Event Types</Typography>
            <Pie data={eventTypeData} options={{ plugins: { zoom: zoomOptions } }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '24px', borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" style={{ marginBottom: '16px' }}>Alert Categories</Typography>
            <Pie data={categoryData} options={{ plugins: { zoom: zoomOptions } }} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper style={{ padding: '24px', borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" style={{ marginBottom: '16px' }}>Events Over Time</Typography>
            <Line 
              data={timeAttackData} 
              options={{ 
                plugins: { 
                  zoom: zoomOptions 
                },
                scales: {
                  x: {
                    type: 'time',
                    time: {
                      unit: 'hour'
                    },
                    title: {
                      display: true,
                      text: 'Timestamp (Grouped by Hour)',
                    },
                  },
                  y: {
                    stacked: true,
                    title: {
                      display: true,
                      text: 'Number of Events',
                    },
                  }
                }
              }} 
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper style={{ padding: '24px', borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" style={{ marginBottom: '16px' }}>Alert Frequency Over Time</Typography>
            <Line 
              data={alertFrequencyData} 
              options={{ 
                plugins: { 
                  zoom: zoomOptions 
                },
                scales: {
                  x: {
                    type: 'time',
                    time: {
                      unit: 'hour'
                    },
                    title: {
                      display: true,
                      text: 'Timestamp (Grouped by Hour)',
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Number of Alerts',
                    },
                  }
                }
              }} 
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '24px', borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" style={{ marginBottom: '16px' }}>Source IPs by Attack Types</Typography>
            <Bar 
              data={ipAttackData} 
              options={{ 
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const dataset = context.dataset;
                        const datasetIndex = context.datasetIndex;
                        const index = context.dataIndex;
                        const value = context.raw;

                        return `${dataset.label}: ${value}`;
                      }
                    }
                  },
                  legend: {
                    display: true,
                    position: 'bottom'
                  },
                  zoom: zoomOptions
                },
                scales: {
                  x: {
                    stacked: true,
                    title: {
                      display: true,
                      text: 'Source IPs',
                    },
                  },
                  y: {
                    stacked: true,
                    title: {
                      display: true,
                      text: 'Number of Attacks',
                    },
                  }
                }
              }} 
            />
          </Paper>
        </Grid>
  
        
      
      </Grid>
    </Container>
  );
};

export default Dashboard;
