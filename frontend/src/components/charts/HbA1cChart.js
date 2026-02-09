import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HbA1cChart({ data, title = "HbA1c Trends" }) {
  // Handle both formats: { labels, values } and { labels, datasets }
  const chartData = data?.datasets ? {
    labels: data.labels,
    datasets: data.datasets.map((ds, index) => ({
      ...ds,
      pointBackgroundColor: ds.borderColor || 'var(--primary)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }))
  } : {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'HbA1c (%)',
        data: data?.values || [7.2, 7.0, 6.8, 6.9, 6.7, 6.5],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: data?.datasets?.length > 1,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#666',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#666',
        },
        title: {
          display: true,
          text: 'HbA1c (%)',
          color: '#666',
        }
      },
      y1: {
        type: 'linear',
        display: data?.datasets?.some(ds => ds.yAxisID === 'y1'),
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#666',
        },
        title: {
          display: true,
          text: 'Values',
          color: '#666',
        }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}