import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import Chart from './Charts';
import axios from 'axios';
import IncomeChart from './IncomeGraph';
import VotingChart from './VotingGraph';
import ScatterPlot from './ScatterChart';
import CongressionalTable from './CongressionalTable';
import BoxWhiskerPlot from './BoxWhiskerPlot';
import EnsembleSummaryBarGraph from './EnsembleSummaryBarGraph';
import HistogramChart from './HistogramChart';
import RegionChart from './RegionChart';
import EcologicalInference from './EcologicalInference';
import '../styles/Tabs.css';

export default function InfoPanel({ stateName, currArea, handleArrowClick, currState, handleSelectedDistrict, precinctsDataLA, precinctsDataNJ, geojsonDataLA, geojsonDataNJ }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isPointLeft, setPointLeft] = useState(true);
  const [isMinimized, setMinimizeInfoPanel] = useState(false);
  const [stateData, setStateData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isPopupVisibleReps, setPopupVisibleReps] = useState(false);
  const [repData, setRepData] = useState(null);

  const fetchStateData = async () => {
    try {
      setLoading(true); // Start loading
      const response = await axios.get(`http://localhost:8080/info/${stateName}`);
      setStateData(response.data);
    } catch (error) {
      console.error('Error fetching state data:', error);
    } finally {
      setLoading(false); // End loading
    }
  };


  const fetchCongressionalTableData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/congressional-table/${stateName}`
      );
      console.log(response.data);
      const districts = Object.entries(response.data)
        .filter(([key]) => key.startsWith('district'))
        .map(([_, value]) => value)
        .sort((a, b) => a.DISTRICTNUM - b.DISTRICTNUM);
      setRepData(districts);
    } catch (error) {
      console.error('Error fetching state data:', error);
    }
  };

  useEffect(() => {
    setMinimizeInfoPanel(false);
    fetchStateData();
    fetchCongressionalTableData();
  }, [stateName]);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const togglePopup = () => {
    setPopupVisible((prev) => !prev);
  };

  const togglePopupReps = () => {
    setPopupVisibleReps((prev) => !prev);
  };

  const toggleArrow = () => {
    setPointLeft((prev) => !prev);
    setMinimizeInfoPanel((prev) => !prev);

    handleArrowClick(!isMinimized);
  };

  // Render a loading state while fetching stateData
  if (loading) {
    return (
      <div style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginTop: '20px', marginLeft: "20px", marginRight: "20px"}}>
        Loading state data...
      </div>
    );
  }

  return (
    <div className={`info-panel ${isMinimized ? 'minimized' : ''}`}>
      {!isMinimized && (
        <>
          <div className='infoDiv'>
            <h2 className='stateNameInfoPanel'>{stateName}</h2>
            <div style={{ fontSize: '20px' }}>
              <span style={{fontWeight: 'bold' }}>Political Lean: </span>
              <span>{stateData?.winning_party?.toLocaleString() || ''}</span>
              <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>Party Control: </span>
              <span>{stateData?.party_control_redistricting?.toLocaleString() || ''}</span>
              <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>Drawing Process: </span>
              <a
                href={stateData?.drawing_process?.toLocaleString() || ''}
                target="_blank"
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                click here
              </a>
            </div>
            <div style={{ fontSize: '20px' }}>
              <span style={{ fontWeight: 'bold' }}>Total State Population: </span>
              <span>{stateData?.TOT_POP?.toLocaleString() || ''} </span>
              <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>Population Density: </span>
              <span>{(stateData?.population_density)}/sq mi</span>
              <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>Districts (Dem/Rep): </span>
              <span>{(stateData?.democratic_districts + stateData?.republican_districts)} (<span style={{ color: 'blue' }}>{stateData?.democratic_districts}</span>/<span style={{ color: 'red' }}>{stateData?.republican_districts}</span>)</span>
              <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>Precincts: </span>
              <span>{stateData?.total_precincts?.toLocaleString() || ''}</span>
            </div>
            <div style={{ fontSize: '20px' }}>
              <span style={{ fontWeight: 'bold' }}>Average Household Income ($): </span>
              <span>{stateData?.AVG_INC?.toLocaleString() || ''}</span>
              <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>Median Household Income ($): </span>
              <span>{stateData?.median_inc?.toLocaleString() || ''}</span>
              <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>Poverty Rate (%): </span>
              <span>{(stateData?.percent_poverty)}</span>
            </div>
            <Tabs value={activeTab} onChange={handleChange}>
              <Tab style={{ borderBottom: '1px solid lightgray' }} label="Overview" className="tabs-label" />
              <Tab style={{ borderBottom: '1px solid lightgray' }} label="Congressional Table" className="tabs-label" />
              <Tab style={{ borderBottom: '1px solid lightgray' }} label="Gingles" className="tabs-label" />
              <Tab style={{ borderBottom: '1px solid lightgray' }} label="Ecological Inference" className="tabs-label" />
              <Tab style={{ borderBottom: '1px solid lightgray' }} label="Ensemble Summary" className="tabs-label" />
              <Tab style={{ borderBottom: '1px solid lightgray' }} label="Ensemble Analysis" className="tabs-label" />
            </Tabs>
            <Box sx={{ padding: 2 }}>
              {activeTab === 0 && (
                <div className='tab-box'>
                  <div style={{display: 'flex'}}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', width: '60%'}}>
                      <div style={{ fontSize: '20px', marginRight: '20px', fontWeight: 'bold' }}>Current Area: {currArea}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'right', justifyContent: 'flex-end', marginBottom: '10px', width: '38.5%'}}>
                        <button 
                          onClick={togglePopupReps} 
                          style={{ 
                            marginRight: '10px',
                            padding: '5px', 
                            cursor: 'pointer', 
                            backgroundColor: '#1976d2', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '5px' 
                          }}
                        >
                          Show District Representatives
                        </button>
                        <button 
                          onClick={togglePopup} 
                          style={{ 
                            padding: '5px', 
                            cursor: 'pointer', 
                            backgroundColor: '#1976d2', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '5px' 
                          }}
                        >
                          Show Available Ensembles
                        </button>
                    </div>
                  </div>
                  <div className="topChartsContainer">
                    <div className="PopChart">
                      {/* {currArea && <Chart currArea={currArea} stateData={stateData} />} */}
                      <Chart currArea={currArea} stateData={stateData} currState={currState}
                        precinctsDataLA={precinctsDataLA} precinctsDataNJ={precinctsDataNJ}
                        geojsonDataLA={geojsonDataLA} geojsonDataNJ={geojsonDataNJ}
                      />
                    </div>
                    <div className="VotingChart">
                      {currArea && (
                        <VotingChart currArea={currArea} currState={currState} stateData={stateData}
                        precinctsDataLA={precinctsDataLA} precinctsDataNJ={precinctsDataNJ}
                        geojsonDataLA={geojsonDataLA} geojsonDataNJ={geojsonDataNJ} />
                      )}
                    </div>
                  </div>
                  <div className="DoubleContainer">
                    <div className="IncomeChart" style={{width: currArea === stateName ? '46%' : '100%', marginTop: '20px'}}>
                      {currArea && (
                        <IncomeChart currArea={currArea} currState={currState} stateData={stateData} precinctsDataLA={precinctsDataLA} precinctsDataNJ={precinctsDataNJ} />
                      )}
                    </div>
                    <div className="RegionChart" style={{width: currArea === stateName ? '46%' : '0%', marginTop: '20px'}}>
                      {currArea === stateName && <RegionChart currArea={currArea} stateData={stateData} />}
                    </div>
                  </div>
                  {isPopupVisibleReps && (
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2000,
                      }}
                      onClick={togglePopupReps} // Close the popup when clicking outside the table
                    >
                      <div
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: '10px',
                          padding: '20px',
                          width: '50%',
                          maxHeight: '80%',
                          overflowY: 'auto',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
                      >
                        <h3 style={{ textAlign: 'center' }}>District Representatives</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black'}}>
                          <thead>
                            <tr>
                              <th style={{ paddingLeft: '3px',textAlign: 'left', border: '1px solid black'}}>District</th>
                              <th style={{ paddingLeft: '3px',textAlign: 'left', border: '1px solid black'}}>Representative</th>
                              <th style={{ paddingLeft: '3px',textAlign: 'left', border: '1px solid black'}}>Party</th>
                              <th style={{ paddingLeft: '3px',textAlign: 'left', border: '1px solid black'}}>Racial/Ethnic Group</th>
                              <th style={{ paddingLeft: '3px',textAlign: 'left', border: '1px solid black'}}>Vote Margin (D)(%)</th>
                              <th style={{ paddingLeft: '3px',textAlign: 'left', border: '1px solid black'}}>Vote Margin (R)(%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {repData.map((district, index) => (
                              <tr
                                key={index}
                              >
                                <td
                                  style={{
                                    border: '1px solid black',
                                    padding: '5px',
                                    backgroundColor: district.winning_party === 'Democratic' 
                                      ? '#d0e8ff' 
                                      : district.winning_party === 'Republican' 
                                      ? '#ffe6e6' 
                                      : 'transparent', // Default background if no condition matches
                                  }}
                                >
                                  {district.DISTRICTNUM}
                                </td>
                                <td style={{ paddingLeft: '3px',border: '1px solid black'}}>{district.Representative}</td>
                                <td style={{ paddingLeft: '3px',border: '1px solid black'}}>{district.winning_party}</td>
                                <td style={{ paddingLeft: '3px',border: '1px solid black'}}>{district.Representative_race}</td>
                                <td style={{ paddingLeft: '3px',border: '1px solid black'}}>{district.democratic_votes}%</td>
                                <td style={{ paddingLeft: '3px',border: '1px solid black'}}>{district.republican_votes}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                          <button
                            onClick={togglePopupReps}
                            style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '5px' }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {isPopupVisible && (
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2000,
                      }}
                      onClick={togglePopup} // Close the popup when clicking outside the table
                    >
                      <div
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: '10px',
                          padding: '20px',
                          width: '50%',
                          maxHeight: '80%',
                          overflowY: 'auto',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
                      >
                        <h3 style={{ textAlign: 'center' }}>Available Ensembles</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>Available Ensembles</th>
                              <th style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>Number of District Plans</th>
                              <th style={{ textAlign: 'left', border: '1px solid black', padding: '8px' }}>Population Equality Threshold</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ border: '1px solid black', padding: '8px' }}>Large Ensemble</td>
                              <td style={{ border: '1px solid black', padding: '8px' }}>5000 Random District Plans</td>
                              <td style={{ border: '1px solid black', padding: '8px' }}>5%</td>
                            </tr>
                          </tbody>
                        </table>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                          <button
                            onClick={togglePopup}
                            style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '5px' }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 1 && (
                <div className='tab-box'>
                  <CongressionalTable stateName={stateName} handleSelectedDistrict={handleSelectedDistrict} />
                </div>
              )}
              {activeTab === 2 && (
                <div className='tab-box' >
                  <ScatterPlot 
                  stateName={stateName} />
                </div>
              )}
              {activeTab === 3 && (
                <div className='tab-box'>
                  <EcologicalInference stateName={stateName} />
                </div>
              )}
              {activeTab === 4 && (
                <div className='tab-box'>
                  <EnsembleSummaryBarGraph stateName={stateName} />
                </div>
              )}
              {activeTab === 5 && (
                <div className='tab-box'>
                  <BoxWhiskerPlot stateName={stateName} />
                </div>
              )}
            </Box>
          </div>
        </>
      )}
      <div className={`infoMinimizeButtonDiv ${isMinimized ? 'minimized' : ''}`}>
        <button className="infoPanelArrow" onClick={toggleArrow}>
          <span
            className="infoPanelArrowTop"
            style={{
              transform: isPointLeft ? 'rotate(-135deg)' : 'rotate(-45deg)',
              transition: 'transform 0.3s',
            }}
          ></span>
          <span
            className="infoPanelArrowBottom"
            style={{
              transform: isPointLeft ? 'rotate(135deg)' : 'rotate(45deg)',
              transition: 'transform 0.3s',
            }}
          ></span>
        </button>
      </div>
    </div>
  );
}
