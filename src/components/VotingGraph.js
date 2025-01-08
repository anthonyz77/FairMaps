import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const VotingChart = ({ currArea, currState, stateData, precinctsDataLA, precinctsDataNJ, geojsonDataLA, geojsonDataNJ }) => {
  const [chartData, setChartData] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [chartTitle, setChartTitle] = useState('');

  const findPrecinct = (precinctName, precinctBound) => {
    return precinctBound.features.find(
      (feature) => feature.properties.NAME === precinctName
    );
  };

  // Race mapping for labels and corresponding keys in stateData
  const voteMapping = [
    {key: "G20PREDBID", category: "Biden"},
    {key: "G20PRERTRU", category: "Trump"}
  ];

  // Function to prepare filtered data and calculate total population
  const prepareChartData = () => {
    if (!stateData) return;

    // Create chart data from stateData using raceMapping
    const filteredData = voteMapping.map((vote) => {
      let votes;
      if(currArea===currState){
        votes = (stateData[vote.key]/(stateData.G20PREDBID + stateData.G20PRERTRU))*100 || 0; // Default to 0 if the key doesn't exist
        console.log(votes);
      }
      else if(currArea.includes("District ")){
        let test1;
        let bound1;
        if(currState==="Louisiana"){
          bound1=geojsonDataLA;
          test1=findPrecinct(currArea, bound1);
          votes= (test1.properties[vote.key]/(test1.properties.G20PREDBID + test1.properties.G20PRERTRU))*100 || 0;
        }
        else{
          bound1=geojsonDataNJ;
          test1=findPrecinct(currArea, bound1);
          votes= (test1.properties[vote.key]/(test1.properties.G20PREDBID + test1.properties.G20PRERTRU))*100 || 0;
        }
      }
      else{
        let test;
        let bound;
        if(currState==="Louisiana"){
            bound=precinctsDataLA;
            test=findPrecinct(currArea, bound);
            if((test.properties.G20PREDBID+test.properties.G20PRERTRU) === 0){
              votes=0;
              console.log("WE HAVE 0 VOTES")
            }
            else{
              votes= (test.properties[vote.key]/(test.properties.G20PREDBID + test.properties.G20PRERTRU))*100 || 0;
              console.log("WE HAVE MORE THAN 0 VOTES: ", votes);
            }
        }
        else{
            bound=precinctsDataNJ;
            test=findPrecinct(currArea, bound);
            if((test.properties.G20PREDBID+test.properties.G20PRERTRU) === 0){
              votes=0;
            }
            else{
              votes= (test.properties[vote.key]/(test.properties.G20PREDBID + test.properties.G20PRERTRU))*100 || 0;
            }
        }
      }
      return { category: vote.category, votes };


    });

    // Calculate total population
    let total;
    if(currArea===currState){
      total = stateData.G20PREDBID + stateData.G20PRERTRU;
    }
    else if(currArea.includes("District ")){
      let test;
      let bound;
      if(currState==="Louisiana"){
        bound=geojsonDataLA;
        test=findPrecinct(currArea, bound);
        total=test.properties.G20PREDBID+test.properties.G20PRERTRU;
      }
      else{
        bound=geojsonDataNJ;
        test=findPrecinct(currArea, bound);
        total=test.properties.G20PREDBID+test.properties.G20PRERTRU;
      }
    }
    else{
      let test;
      let bound;
      if(currState==="Louisiana"){
        bound=precinctsDataLA;
        test=findPrecinct(currArea, bound);
        total=test.properties.G20PREDBID+test.properties.G20PRERTRU;
      }
      else{
        bound=precinctsDataNJ;
        test=findPrecinct(currArea, bound);
        total=test.properties.G20PREDBID+test.properties.G20PRERTRU;
      }
    }
    

    // Prepare chart configuration
    const chartData = {
      labels: filteredData.map((item) => item.category),
      datasets: [
        {
          label: 'Total Votes (%)',
          data: filteredData.map((item) => item.votes),
          backgroundColor: [
            'rgb(0, 0, 255)',
            'rgb(255, 0, 0)',
          ],
          borderColor: [
            'rgb(0, 0, 255)',
            'rgb(255, 0, 0)',
          ],
          borderWidth: 1,
        },
      ],
    };

    setChartData(chartData);
    setTotalVotes(total);
    setChartTitle(`Vote Distribution for ${currArea}`);
  };

  useEffect(() => {
    prepareChartData();
  }, [currArea, stateData]);

  return (
    <div>
      {/* <div>
        <strong>Total Votes: </strong>
        {totalVotes.toLocaleString()}
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
                    text: 'Candidates',
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
                    text: 'Total Votes (%)',
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
        <strong>Total Votes: </strong>
        {totalVotes.toLocaleString()}
      </div>
    </div>
  );
};

export default VotingChart;
