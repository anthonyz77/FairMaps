import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EnsembleSummaryBarGraph = ({ stateName }) => {
  stateName = stateName.replace(/ /g, "_");
  const [data, setData] = useState(null);
  const [ensemble, setEnsemble] = useState("Large");
  let numOfPlan = 0;

  useEffect(() => {
    fetchData(ensemble);
  }, [stateName, ensemble]);

  const fetchData = async (ensemble) => {
    try {
      const response = await axios.get(`http://localhost:8080/ensemble-summary/${stateName}/${ensemble}`);
      console.log(response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching ensemble summary data:", error);
    }
  };

  const prepareChartData = (jsonData) => {
    if (!jsonData || !jsonData.summary_data) return { labels: [], datasets: [] };

    const summaryData = jsonData.summary_data;
    numOfPlan = jsonData.total_plans;
    let maxDistricts = 0;
    const splitCounts = {};

    Object.values(summaryData).forEach(([dem, rep]) => {
      maxDistricts = Math.max(maxDistricts, dem + rep); // Calculate max districts dynamically
      const splitKey = `${dem}/${rep}`;
      splitCounts[splitKey] = (splitCounts[splitKey] || 0) + 1;
    });

    // Generate labels for X-axis
    const labels = [];
    for (let dem = 0; dem <= maxDistricts; dem++) {
      const rep = maxDistricts - dem;
      labels.push(`${dem}/${rep}`);
    }

    // Prepare dataset
    const chartData = labels.map((label) => splitCounts[label] || 0);

    return {
      labels, // X-axis labels
      datasets: [
        {
          label: "Number of Plans",
          data: chartData, // Y-axis values
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = prepareChartData(data);

  const options = {
    responsive: true,
    animation: false,
    plugins: {
      legend: { position: "top" },
      labels: {
        color: "black", // Explicit color for legend labels
      },
      title: { 
        display: true, 
        text: `Democratic/Republican District Splits for ${ensemble.charAt(0).toUpperCase() + ensemble.slice(1)} Ensemble (${numOfPlan} Plans)`,
        font: {
          size: 24, // Adjust the size as needed
          weight: "bold", // Optional: Make the text bold
        },
        color: "black",
      },
    },
    scales: {
        x: { 
          title: { 
            display: true, 
            text: "District Splits (Democratic/Republican)", 
            font: { size: 18 }, // Set the font size for the x-axis label
            color: "black",
          } 
        },
        y: { 
          title: { 
            display: true, 
            text: "Number of Random District Plans", 
            font: { size: 18 }, // Set the font size for the y-axis label
            color: "black",
          } 
        },
      },
    };
  
  return (
    <div>
      {/* Dropdown for ensemble selection */}
      <label htmlFor="ensemble-select">Select Ensemble: </label>
      <select
        className="allDropDown"
        id="ensemble-select"
        value={ensemble}
        onChange={(e) => setEnsemble(e.target.value)}
      >
        <option value="large">Large Ensemble</option>
        <option value="test">Test Ensemble</option>
      </select>

        <Bar data={chartData} options={options} height={'47.5%'} width={'100%'}/>
    </div>
  );
};

export default EnsembleSummaryBarGraph;
