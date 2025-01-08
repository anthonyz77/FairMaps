import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2'; 
import 'chart.js/auto';

const IncomeChart = ({ currArea, currState, stateData, precinctsDataLA, precinctsDataNJ }) => {
  const [chartData, setChartData] = useState(null);
  const [totalHouseholds, setTotalHouseholds] = useState(0);

  const findPrecinct = (precinctName, precinctBound) => {
    return precinctBound.features.find(
      (feature) => feature.properties.NAME === precinctName
    );
  };

  //console.log(stateData);
  const loadData = () => {
    try {
      // Access income data for the current state
      let stateIncomeData;
      if(currArea === currState){
        console.log("WE ARE STATE");
        stateIncomeData = stateData?.income_data?.[currState];
      }
      else if(currArea.includes("District ")){
        stateIncomeData=stateData?.income_data?.[currArea];
      }
      else{
        let test;
        let bound;
        if(currState === "Louisiana"){
          bound=precinctsDataLA;
          test=findPrecinct(currArea, bound);
          stateIncomeData=test?.properties?.income_data?.[currArea];
        }
        else{
          bound=precinctsDataNJ;
          test=findPrecinct(currArea, bound);
          stateIncomeData=test?.properties?.income_data?.[currArea];
        }
        console.log("WE ARE IN DISTRICT AND PRECINCT");
        
        // stateIncomeData = stateData?.income_data?.[currState];
      }

      if (!stateIncomeData) {
        console.warn(`No income data found for state: ${currState}`);
        setChartData(null); // Reset chart if no data is found
        setTotalHouseholds(0); // Reset total households
        return;
      }
  
      // Filter data for the selected area if needed (in this case, no filtering by Geography since it's per state)
      const filteredData = stateIncomeData;
  
      // Process the data
      const incomeBuckets = filteredData.map((row) =>
        formatIncomeBucket(row['bucket'])
      );
      const incomeData = filteredData.map((row) =>
        parseFloat(row['households'])
      );
      const shareData = filteredData.map((row) =>
        parseFloat(row['share']) * 100
      );
  
      // Calculate the total households
      const totalHouseholds = incomeData.reduce((acc, value) => acc + value, 0);
      setTotalHouseholds(totalHouseholds);
  
      // Prepare chart data
      const chartData = {
        labels: incomeBuckets,
        datasets: [
          {
            label: 'Share of Households (%)',
            data: shareData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
  
      setChartData(chartData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  

  const formatIncomeBucket = (bucket) => {
    return bucket
      .replace(/\$|,/g, '')
      .replace(/(\d+)-(\d+)/, (match, p1, p2) => {
        return `${Math.round(parseInt(p1) / 1000)}k-${Math.round(
          parseInt(p2) / 1000
        )}k`;
      });
  };

  useEffect(() => {
    loadData();
  }, [currArea, stateData]);

  return (
    <div>
      {/* <div className="Total">
        <strong>Total Households: </strong>{totalHouseholds.toLocaleString()}
      </div> */}
      <div className="chart-container">
        {chartData ? (
          <Bar
            height={currArea === currState ? '45%' : '10%'} // Height changes based on condition
            width={currArea === currState ? '100%' : '50%'} // Width changes based on condition
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              plugins: {
                title: {
                  display: true,
                  text: `Household Income`,
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
                    size: 14,
                  },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Household Income',
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
                    text: 'Share of Households (%)',
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
              },
            }}
            
          />
        ) : (
          <p>Loading chart data...</p>
        )}
      </div>
      <div className="Total">
        <strong>Total Households: </strong>{totalHouseholds.toLocaleString()}
      </div>
    </div>
  );
};

export default IncomeChart;
