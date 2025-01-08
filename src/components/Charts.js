import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const PopulationChart = ({ currArea, stateData, currState, precinctsDataNJ, precinctsDataLA, geojsonDataLA, geojsonDataNJ }) => {
  const [chartData, setChartData] = useState(null);
  const [totalPopulation, setTotalPopulation] = useState(0);
  const [chartTitle, setChartTitle] = useState('');

  const findPrecinct = (precinctName, precinctBound) => {
    return precinctBound.features.find(
      (feature) => feature.properties.NAME === precinctName
    );
  };

  // Race mapping for labels and corresponding keys in stateData
  const raceMapping = [
    { key: 'WHITE_POP', category: 'White' },
    { key: 'BLACK_POP', category: 'Black' },
    { key: 'ASIAN_POP', category: 'Asian' },
    { key: 'OTHER_POP', category: 'Other' },
  ];

  // Function to prepare filtered data and calculate total population
  const prepareChartData = () => {
    if (!stateData) return;
    // Create chart data from stateData using raceMapping
    const filteredData = raceMapping.map((race) => {
      let population;
      if(currArea===currState){
        population = (stateData[race.key]/stateData.TOT_POP)*100 || 0; // Default to 0 if the key doesn't exist
      }
      else if(currArea.includes("District ")){
        let test1;
        let bound1;
        if(currState === "Louisiana"){
          bound1=geojsonDataLA;
          test1=findPrecinct(currArea, bound1);
          if(race.key==="OTHER_POP"){
            let newOtherPop=test1.properties[race.key]+test1.properties["TWO_PLUS_POP"];
            population =(newOtherPop/test1.properties.TOT_POP)*100 || 0;
          }
          else{
            population =(test1.properties[race.key]/test1.properties.TOT_POP)*100 || 0;
          }
        }
        else{
          bound1=geojsonDataNJ;
          test1=findPrecinct(currArea, bound1);
          if(race.key==="OTHER_POP"){
            let newOtherPop=test1.properties[race.key]+test1.properties["TWO_PLUS_POP"];
            population =(newOtherPop/test1.properties.TOT_POP)*100 || 0;
          }
          else{
            population =(test1.properties[race.key]/test1.properties.TOT_POP)*100 || 0;
          }
        }
      }
      else{
        let test;
        let bound;
        if(currState === "Louisiana"){
          bound=precinctsDataLA;
          test=findPrecinct(currArea, bound);
          if(race.key==="OTHER_POP"){
            let newOtherPop=test.properties[race.key]+test.properties["TWO_PLUS_POP"];
            population =(newOtherPop/test.properties.TOT_POP)*100 || 0;
          }
          else{
            population =(test.properties[race.key]/test.properties.TOT_POP)*100 || 0;
          }
        }
        else{
          bound=precinctsDataNJ;
          test=findPrecinct(currArea, bound);
          if(race.key==="OTHER_POP"){
            let newOtherPop=test.properties[race.key]+test.properties["TWO_PLUS_POP"];
            population =(newOtherPop/test.properties.TOT_POP)*100 || 0;
          }
          else{
            population =(test.properties[race.key]/test.properties.TOT_POP)*100 || 0;
          }
          
        }
      }
      
      return { category: race.category, population };
    });
    let total;
    // Calculate total population
    if(currArea===currState){
      total = stateData.TOT_POP;
    }
    //another else if for districts
    else if(currArea.includes("District ")){
      let test;
      let bound;
      if(currState==="Louisiana"){
        bound=geojsonDataLA;
        test=findPrecinct(currArea, bound);
        total=test.properties.TOT_POP;
      }
      else{
        bound=geojsonDataNJ;
        test=findPrecinct(currArea, bound);
        total=test.properties.TOT_POP;
      }
    }
    else{
      let test;
      let bound;
      if(currState==="Louisiana"){
        bound=precinctsDataLA;
        test=findPrecinct(currArea, bound);
        total=test.properties.TOT_POP;
      }
      else{
        bound=precinctsDataNJ;
        test=findPrecinct(currArea, bound);
        total=test.properties.TOT_POP;
      }
    }

    // Prepare chart configuration
    const chartData = {
      labels: filteredData.map((item) => item.category),
      datasets: [
        {
          label: 'Population (%)',
          data: filteredData.map((item) => item.population),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(201, 203, 207, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(201, 203, 207, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    setChartData(chartData);
    setTotalPopulation(total);
    setChartTitle(`Population Distribution for ${currArea}`);
  };

  useEffect(() => {
    prepareChartData();
  }, [currArea, stateData]);

  return (
    <div>
      {/* <div>
        <strong>Total Population: </strong>
        {totalPopulation.toLocaleString()}
      </div> */}
      <div className="chart-container">
        {chartData ? (
          <Bar
            height={'45%'} // Set height in pixels
            width={'100%'} // Set width in pixels
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              plugins: {
                title: {
                  display: true,
                  text: chartTitle,
                  font: {
                    size: 18,
                    family: 'Open Sans',
                    weight: '700',
                  },
                },
                legend: {
                  display: false,
                },
                tooltip: {
                  bodyFont: {
                    family: 'Open Sans',
                    size: 12,
                  },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Race',
                    font: {
                      family: 'Open Sans',
                      size: 14,
                    },
                  },
                  ticks: {
                    font: {
                      family: 'Open Sans',
                      size: 12,
                    },
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Population (%)',
                    font: {
                      family: 'Open Sans',
                      size: 14,
                    },
                  },
                  ticks: {
                    font: {
                      family: 'Open Sans',
                      size: 12,
                    },
                    beginAtZero: true,
                    callback: function (value) {
                      return value >= 1000 ? `${value / 1000}K` : value;
                    },
                  },
                },
              },
            }}
          />
        ) : (
          <p>Loading chart data...</p>
        )}
      </div>
      <div>
        <strong>Total Population: </strong>
        {totalPopulation.toLocaleString()}
      </div>
    </div>
  );
};

export default PopulationChart;
