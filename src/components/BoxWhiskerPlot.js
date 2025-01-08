import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

export default function BoxWhiskerPlot({ stateName }) {
  const [plotData, setPlotData] = useState([]);
  const [layout, setLayout] = useState({});
  const [raceCategory, setRaceCategory] = useState("white_POP");
  const [raceData, setRaceData] = useState({});
  const [selectedDisplay, setSelectedDisplay] = useState("Race");
  const [raceGroup, setRaceGroup] = useState("White");
  const [incomeGroup, setIncomeGroup] = useState("Low Income");
  const [regionType, setRegionType] = useState("Rural");
  const [regionTypeForRace, setRegionTypeForRace] = useState("Overall");
  const displayCategory = ["Race", "Income", "Region"];
  const incomeGroups = ["Low Income", "Medium Income", "High Income"];
  const regionTypes = ["Rural", "Suburban", "Urban"];
  const regionTypesForRace = ["Overall", "Rural", "Suburban", "Urban"];

  let raceGroups = [];
  if(stateName == "Louisiana"){
    raceGroups = ["White", "Black"];
  }
  if(stateName == "New Jersey"){
    raceGroups = ["White", "Black", "Asian", "Other"];
  }

  const stateNameWithSpace = stateName;
  stateName = stateName.replace(/ /g, "_");

  useEffect(() => {
    fetchBoxWhiskData(selectedDisplay, regionTypeForRace);
  }, [stateName, raceGroup, raceCategory, incomeGroup, regionType, selectedDisplay, regionTypeForRace]);

  const fetchBoxWhiskData = async (displayCategory, regionTypeForRace) => {
    if(displayCategory == "Race" && regionTypeForRace == "noRegion"){
      regionTypeForRace = "Overall";
    }
    console.log(displayCategory);
    console.log(regionTypeForRace);
    try {
      const response = await axios.get(`http://localhost:8080/box-and-whisker/${stateName}/${displayCategory}/${regionTypeForRace}`);
      //console.log(response.data);
      if(displayCategory == "Race"){
        //console.log(response.data);
        setRaceData(response.data);
        let modifiedString = raceGroup.charAt(0).toLowerCase() + raceGroup.slice(1);
        updatePlot(response.data, modifiedString, stateNameWithSpace); 
      }
      if(displayCategory == "Income"){
        //console.log(response.data);
        setRaceData(response.data);
        let modifiedString = incomeGroup.replace(/ /g, "_");
        modifiedString = modifiedString.charAt(0).toLowerCase() + modifiedString.slice(1);
        updatePlot(response.data, modifiedString, stateNameWithSpace, null); 
      }
      if(displayCategory == "Region"){
        //console.log(response.data);
        setRaceData(response.data);
        let modifiedString = regionType.charAt(0).toLowerCase() + regionType.slice(1);
        updatePlot(response.data, modifiedString, stateNameWithSpace, null); 
      }
    } catch (error) {
      console.error("Error fetching race data:", error);
    }
  };

  const updatePlot = (data, category, stateName, regionTypeForRace) => {
    //console.log(data[category]);
    const selectedRaceData = data[category];
    if (!selectedRaceData) {
      console.error("Invalid category:", category);
      return;
    }

    const boxTraces = [];
    const scatterTrace = {
      x: [],
      y: [],
      mode: "markers",
      type: "scatter",
      marker: { color: "red", size: 8 },
      name: "Enacted Plan",
      showlegend: true,
    };

    const recomTrace = {
      x: [null],  // Add a dummy x value to ensure it's visible
      y: [null],  // Add a dummy y value to ensure it's visible
      mode: "markers",
      type: "scatter",
      marker: { color: "grey", size: 12, symbol: "square" },
      name: "ReCom Ensemble", // This will appear in the legend
      showlegend: true, // Show this trace in the legend
      hoverinfo: "none", // Optional: Remove hover information for the recom trace
    };

    const bucketNames = Object.keys(selectedRaceData);
    bucketNames.forEach((bucket) => {
      const stats = selectedRaceData[bucket];
      boxTraces.push({
        y: [
          stats.min,
          stats.first_quartile,
          stats.median,
          stats.third_quartile,
          stats.max,
        ],  
        type: "box",
        name: bucket,
        boxmean: false,
        marker: { color: "lightblue" },
        line: { color: "black" }, 
        showlegend: false,
      });
      scatterTrace.x.push(bucket);
      scatterTrace.y.push(stats.enacted);
    });
    
    setPlotData([...boxTraces, recomTrace, scatterTrace]);

    let modifiedString = null;
    if(category == "white" || category == "black" || category == "asian" || category == "native" || category == "pacific" || category == "other" ){
      modifiedString = category.charAt(0).toUpperCase() + category.slice(1);
    }
    else{
      modifiedString = category.charAt(0).toUpperCase() + category.slice(1).replace("_"," ");
    }

    setLayout({
      title: {
        text: `Percentage of ${modifiedString} Population in ${stateName} In Large Ensemble (5000 Plans)`,
        font: {
          size: 24, // Adjust font size as needed
          weight: "bold" // Makes the title bold
        },
        color: "black",
      },
      xaxis: {
        title: {
          text: "Indexed Districts",
          font: {
            size: 18, // Adjust font size as needed
          },
          color: "black",
        },
        tickangle: 0,
        tickvals: bucketNames,
        ticktext: bucketNames.map((bucket) => bucket),
      },
      yaxis: {
        title: {
          text: "Population (%)",
          font: {
            size: 18, // Adjust font size as needed
          },
          color: "black",
        },
      },
      showlegend: true,
      autosize: true,
      height:540  ,
    });
  };

  const handleRaceChange = (event) => {
    // const selectedCategory = event.target.value;
    setRaceGroup(event.target.value);
    //updatePlot(raceData, selectedCategory);
  };

  const handleRegionTypeForRaceChange = (event) => {
    // const selectedCategory = event.target.value;
    setRegionTypeForRace(event.target.value);
    //updatePlot(raceData, selectedCategory);
  };

  const handleDisplayChange = (event) => {
    setSelectedDisplay(event.target.value);
    if(event.target.value != "race"){
      setRegionTypeForRace("noRegion");
    }
  };

  const handleIncomeGroupChange = (event) => {
    setIncomeGroup(event.target.value);
  };

  const handleRegionTypeChange = (event) => {
    setRegionType(event.target.value);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ marginBottom: "20px"}}>
        <label htmlFor="display-select" style={{ marginRight: "10px" }}>Select Display:</label>
        <select
          className="allDropDown"
          id="display-select"
          value={selectedDisplay}
          onChange={handleDisplayChange}
        >
          {displayCategory.map((display, index) => (
            <option key={index} value={display}>
              {display}
            </option>
          ))}
        </select>
        
        {selectedDisplay == "Race" && (
          <>
          <label htmlFor="race-select" style={{ marginRight: "10px", marginLeft: "10px" }}>Select Race:</label>
          <select
            className="allDropDown"
            id="race-select"
            value={raceGroup}
            onChange={handleRaceChange}
          >
            {raceGroups.map((raceGroup, index) => (
              <option key={index} value={raceGroup}>
                {raceGroup}
              </option>
            ))}

            {/* {Object.keys(raceData).map((category) => (
              <option key={category} value={category}>
                {category.replace("_POP", "").toUpperCase()}
              </option>
            ))} */}
          </select>
          
          <label htmlFor="race-select" style={{ marginRight: "10px", marginLeft: "10px" }}>Select Region:</label>
          <select
            className="allDropDown"
            id="race-select"
            value={regionTypeForRace}
            onChange={handleRegionTypeForRaceChange}
          >
            {regionTypesForRace.map((regionTypeForRace, index) => (
              <option key={index} value={regionTypeForRace}>
                {regionTypeForRace}
              </option>
            ))}

            {/* {Object.keys(raceData).map((category) => (
              <option key={category} value={category}>
                {category.replace("_POP", "").toUpperCase()}
              </option>
            ))} */}
          </select>
          </>
        )}

        {selectedDisplay == "Income" && (
          <>
          <label htmlFor="income-select" style={{ marginRight: "10px", marginLeft: "10px"  }}>Select Income Group:</label>
          <select
            className="allDropDown"
            id="income-select"
            value={incomeGroup}
            onChange={handleIncomeGroupChange}
          >
            {incomeGroups.map((incomeGroup, index) => (
              <option key={index} value={incomeGroup}>
                {incomeGroup}
              </option>
            ))}

          </select>
          </>
        )}

        {selectedDisplay == "Region" && (
          <>
          <label htmlFor="region-select" style={{ marginRight: "10px", marginLeft: "10px"  }}>Select Region Type:</label>
          <select
            className="allDropDown"
            id="region-select"
            value={regionType}
            onChange={handleRegionTypeChange}
          >
            {regionTypes.map((regionType, index) => (
              <option key={index} value={regionType}>
                {regionType}
              </option>
            ))}

          </select>
          </>
        )}

        </div>

      <Plot
        data={plotData}
        layout={layout}
        config={{ responsive: true }}
        style={{ width: '100%', height: '80%' }}
      />
    </div>
  );
}
