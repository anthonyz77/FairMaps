import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const HistogramChart = () => {
  const [chartData, setChartData] = useState(null);

  const loadData = async () => {
    const response = await fetch('white_non_white_trump.json'); // Ensure this file is in your public folder
    const data = await response.json();

    // Extract group data
    const group1Values = data.map((row) => row.white);
    const group2Values = data.map((row) => row.non_white);

    // Generate histogram data
    const createHistogram = (values, bins = 2000) => {
      const min = 0;
      const max = 1;
      const binWidth = (max - min) / bins;
      const counts = new Array(bins).fill(0);

      values.forEach((value) => {
        const index = Math.min(
          Math.floor((value - min) / binWidth),
          bins - 1
        );
        counts[index]++;
      });

      const labels = Array.from({ length: bins }, (_, i) =>
        `${(min + i * binWidth).toFixed(2)}`
      );

      return { labels, counts };
    };

    const histogram1 = createHistogram(group1Values);
    const histogram2 = createHistogram(group2Values);

    // Combine chart data for both groups
    setChartData({
      labels: histogram1.labels,
      datasets: [
        {
          label: 'White',
          data: histogram1.counts,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjusted opacity
          borderColor: 'rgba(0, 0, 0, 1)',
          borderWidth: 1,
          barThickness: 8, // Narrower bars
        },
        {
          label: 'Non-White',
          data: histogram2.counts,
          backgroundColor: 'rgba(255, 99, 132, 0.5)', // Adjusted opacity
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          barThickness: 8, // Narrower bars
        },
      ],
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1>Histogram for Group 1 and Group 2</h1>
      <div className="chart-container">
        {chartData ? (
          <Bar
            data={chartData}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: 'Combined Histogram',
                },
                legend: {
                  display: true,
                  position: 'top',
                },
              },
              responsive: true,
              scales: {
                x: {
                  title: { display: true, text: 'Bins' },
                  stacked: false, // To ensure groups don't stack
                },
                y: {
                  title: { display: true, text: 'Frequency' },
                  beginAtZero: true,
                },
              },
            }}
          />
        ) : (
          <p>Loading Data...</p>
        )}
      </div>
    </div>
  );
};

export default HistogramChart;
