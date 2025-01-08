import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function ScatterPlot({ stateName}) {
  const [selectedRace, setSelectedRace] = useState("white");
  const [selectedDisplay, setSelectedDisplay] = useState("race");
  const [selectedRegion, setSelectedRegion] = useState("Overall");
  const [ginglesData, setGinglesData] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [precinctsDataLA, setPrecinctsDataLA] = useState(null);
  const [precinctsDataNJ, setPrecinctsDataNJ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [races, setRaces] = useState(["White", "Black", "Asian", "Other"]);
  const regions = ["Overall", "Rural", "Urban", "Suburban"];

  const stateRaceMap = {
    Louisiana: ["White", "Black", "Other"],
    NJ: ["White", "Black", "Asian"],
  };

  useEffect(() => {
    if (!showTable) return;
  
    const fetchPrecinctsData = async () => {
      try {
        if (stateName === "Louisiana") {
          setLoading(true);
          const response = await axios.get('http://localhost:8080/precinct-boundary/Louisiana');
          setPrecinctsDataLA(response.data);
          setPrecinctsDataNJ(null);
        } else if (stateName === "New Jersey") {
          setLoading(true);
          const response = await axios.get('http://localhost:8080/precinct-boundary/New Jersey');
          setPrecinctsDataNJ(response.data);
          setPrecinctsDataLA(null);
        }
      } catch (error) {
        console.error('Error fetching GeoJSON:', error);
      }finally {
        setLoading(false); 
      }
    };
  
    fetchPrecinctsData();
  }, [showTable]);

  useEffect(() => {
    if (stateRaceMap[stateName]) {
      setRaces(stateRaceMap[stateName]);
      if (!stateRaceMap[stateName].includes(selectedRace)) {
        setSelectedRace(stateRaceMap[stateName][0].toLowerCase());
      }
    }
  }, [stateName]);

  const fetchGinglesData = async (race, display) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/gingles/${display}/${stateName}/${race}`
      );
      setGinglesData(response.data);
    } catch (error) {
      console.error('Error fetching state data:', error);
    }
  };

  useEffect(() => {
    fetchGinglesData(selectedRace, selectedDisplay);
  }, [stateName, selectedRace, selectedDisplay]);

  const handleRaceChange = (event) => setSelectedRace(event.target.value);
  const handleDisplayChange = (event) => {
    setSelectedDisplay(event.target.value);
    if (event.target.value === "race") {
      setSelectedRace(races[0].toLowerCase());
    } else if (event.target.value === "income") {
      setSelectedRace(selectedRegion.toLowerCase());
    } else if (event.target.value === "income_race") {
      setSelectedRace(races[0].toLowerCase());
    }
  };
  const handleRegionChange = (event) => {
    const selectedRegionType = event.target.value;
    setSelectedRegion(selectedRegionType);
    if (selectedDisplay === "income") {
      setSelectedRace(selectedRegionType.toLowerCase());
    }
  };

  const processPrecinctData = (precinctsData) => {
    if (!precinctsData?.features) return [];
    
    return precinctsData.features.map((feature) => {
      const props = feature.properties;
      return {
        precinct: props.NAME,
        totalPopulation: props.TOT_POP,
        regionType: props.classification.charAt(0).toUpperCase()+props.classification.slice(1),
        nonWhitePopulation: props.TOT_POP - props.WHITE_POP,
        avgIncome: props.AVG_INC,
        republicanVotes: props.G20PRERTRU,
        democraticVotes: props.G20PREDBID,
      };
    });
  };

  const precinctsTableData =
    stateName === "Louisiana"
      ? processPrecinctData(precinctsDataLA)
      : processPrecinctData(precinctsDataNJ);

  const extractDataPoints = (precincts) => {
    const precinctNames = Object.keys(precincts);
    const bidenPoints = [];
    const trumpPoints = [];
    precinctNames.forEach((name) => {
      const [x, trumpY, bidenY] = precincts[name];
      bidenPoints.push({ x, y: bidenY });
      trumpPoints.push({ x, y: trumpY });
    });
    return { bidenPoints, trumpPoints, precinctNames };
  };

  let bidenPoints = [];
  let trumpPoints = [];
  let bidenRegressionPoints = [];
  let trumpRegressionPoints = [];
  let xMin = 0;
  let xMax = 100;

  if (ginglesData) {
    const { fields, precincts, regression_points } = ginglesData;
    const data = extractDataPoints(precincts, fields);
    bidenPoints = data.bidenPoints;
    trumpPoints = data.trumpPoints;
    bidenRegressionPoints = regression_points.map(([x, , bidenY]) => ({ x, y: bidenY }));
    trumpRegressionPoints = regression_points.map(([x, trumpY]) => ({ x, y: trumpY }));

    const allXValues = [...bidenPoints, ...trumpPoints].map((point) => point.x);
    xMin = Math.floor(Math.min(...allXValues));
    xMax = Math.ceil(Math.max(...allXValues));
  }

  const data = {
    datasets: [
      {
        label: 'Biden',
        data: bidenPoints,
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
      },
      {
        label: 'Trump',
        data: trumpPoints,
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
      },
      {
        label: 'Biden Regression Line',
        data: bidenRegressionPoints,
        type: 'line',
        borderColor: 'rgba(0,0,255,2)',
        backgroundColor: 'rgba(0,0,255,2)',
        fill: false,
      },
      {
        label: 'Trump Regression Line',
        data: trumpRegressionPoints,
        type: 'line',
        borderColor: 'rgba(255,0,0,2)',
        backgroundColor: 'rgba(255,0,0,2)',
        fill: false,
      },
    ],
  };

  const options = {
    animation: false,
    scales: {
      x: {
        title: {
          display: true,
          font: { size: 18 }, // Set the font size for the x-axis label
          color: "black",
          text:
            selectedDisplay === "income"
              ? "Average Household Income"
              : selectedDisplay === "income_race"
              ? `Average Household Income/${selectedRace.charAt(0).toUpperCase() + selectedRace.slice(1)}`
              : `Percent ${selectedRace.charAt(0).toUpperCase() + selectedRace.slice(1)}`,
        },
        ticks: {
          callback: (value) => (selectedDisplay === "income" ? `$${value.toLocaleString()}` : `${value}%`),
        },
        min: selectedDisplay === "income" ? 0 : xMin,
        max: selectedDisplay === "income" ? Math.max(xMax, 100000) : xMax,
      },
      y: {
        title: {
          display: true,
          text: "Vote Share",
          font: { size: 18 }, // Set the font size for the x-axis label
          color: "black",
        },
        ticks: {
          callback: (value) => `${value}%`,
        },
        min: 0,
        max: 100,
      },
    },
  };

  if (loading) {
    return (
      <div style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginLeft: "20px", marginRight: "20px"}}>
        Loading state data...
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: '24px'}}>Precinct-by-Precinct Voting and Demographic Analysis</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ visibility: showTable ? "hidden" : "visible" }}>
          <label htmlFor="display-select">Select Display:</label>
          <select className="allDropDown" id="display-select" value={selectedDisplay} onChange={handleDisplayChange}>
            <option value="race">Race</option>
            <option value="income">Income</option>
            <option value="income_race">Income/Race</option>
          </select>
          {selectedDisplay !== "income" && (
            <>
              <label style={{ paddingLeft: "20px" }} htmlFor="race-select">Select Race:</label>
              <select className="allDropDown" id="race-select" value={selectedRace} onChange={handleRaceChange}>
                {races.map((race) => (
                  <option key={race} value={race.toLowerCase()}>
                    {race}
                  </option>
                ))}
              </select>
            </>
          )}
          {selectedDisplay === "income" && (
            <>
              <label style={{ paddingLeft: "20px" }} htmlFor="region-select">Select Region:</label>
              <select className="allDropDown" id="region-select" value={selectedRegion} onChange={handleRegionChange}>
                {regions.map((region) => (
                  <option key={region} value={region.toLowerCase()}>
                    {region}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        <button onClick={() => setShowTable((prev) => !prev)}>
          {showTable ? "Chart Display" : "Table Display"}
        </button>
      </div>
      {showTable ? (
        <div style={{ maxHeight: '450px', overflowY: 'auto', marginTop: '20px' }}>
          <table border="1" style={{width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, backgroundColor: '#f1f1f1', zIndex: 1 }}>
                <th>Precinct</th>
                <th>Total Population</th>
                <th>Region Type</th>
                <th>Non-White Population</th>
                <th>Average Household Income</th>
                <th>Republican Votes</th>
                <th>Democratic Votes</th>
              </tr>
            </thead>
            <tbody>
              {precinctsTableData.map((data, index) => (
                <tr key={index}>
                  <td>{data.precinct}</td>
                  <td>{data.totalPopulation}</td>
                  <td>{data.regionType}</td>
                  <td>{data.nonWhitePopulation}</td>
                  <td>${data.avgIncome.toLocaleString()}</td>
                  <td>{data.republicanVotes}</td>
                  <td>{data.democraticVotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Scatter data={data} options={options} height={'40%'} width={'100%'}/>
      )}
    </div>
  );
}
