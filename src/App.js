import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, GeoJSON, TileLayer} from 'react-leaflet';
import {statesData} from "./data"
import 'leaflet/dist/leaflet.css';
import './styles/App.css';
import InfoPanel from './components/InfoPanel';
import Tab from './components/Tab';
import Legend from './components/Legend';
import Papa from 'papaparse';
import axios from 'axios';
import useFetchLegendColor from './api/useFetchLegendColor';

const centerLouisiana = [30.38592258905744, -84.96937811139156];
const centerNewJersey = [40.220596, -71.369913];
const centerDefault = [38.697719608746134, -91.89299027955271];

const zoomLevels = {
  louisiana: 7,
  newjersey: 8.4,
  default: 4.5,
};

let allVoteData = [];
const defaultZoom = 4.5

export default function App() {
  const [geojsonDataLA, setGeojsonDataLA] = useState(null);
  const [geojsonDataNJ, setGeojsonDataNJ] = useState(null);
  const [currentMap, setCurrentMap] = useState('home');
  const [highlightedFeature, setHighlightedFeature] = useState(null);
  const [isAccordionOpen, setAccordionOpen] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [showTileLayer, setShowTileLayer] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(false);
  const [precinctsDataLA, setPrecinctsDataLA] = useState(null);
  const [precinctsDataNJ, setPrecinctsDataNJ] = useState(null);
  const [showPrecinctsLA, setShowPrecinctsLA] = useState(false); 
  const [showPrecinctsNJ, setShowPrecinctsNJ] = useState(false);
  const [isPrecinctsActive, setIsPrecinctsActive] = useState(false);
  const [showDistrictsLA, setShowDistrictsLA] = useState(false);
  const [showDistrictsNJ, setShowDistrictsNJ] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [isMinimized, setMinimizeSidebar] = useState(false);
  const [currArea, setCurrArea] = useState(null);
  const [fakecurrArea, setFakeCurrArea] = useState(null)
  const [isLegendVisible, setLegendVisible] = useState(false);
  const [allVoteData2, setAllVoteData2] = useState([]);
  const [minorityDensityDataLA, setMinorityDensityDataLA] = useState([]);
  const [isIncomeLegend, setIncomeLegend]=useState("district");
  const [isAllIncomeData, setisAllIncomeData] = useState([]);
  const [isAllIncomeData2, setisAllIncomeData2] = useState([]);
  const [minorityDensityDataNJ, setMinorityDensityDataNJ] = useState([]);
  const [colors, setColors] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [race, setRace] = useState("white");
  const [reset, setReset] = useState("false");

  const StateEnum = Object.freeze({
    LOUISIANA: 'louisiana',
    NEW_JERSEY: 'newjersey',
  });

  //FETCHING COLORS-----------------------------
  const {colors: fetchedColors} = useFetchLegendColor(isIncomeLegend);

  const changeLegendColor = (type) => {
    setIncomeLegend(type);
  };

  //temp fix
  useEffect(() => {
    if (fetchedColors) {
      setColors(fetchedColors);
    }
  }, [fetchedColors]);
//------------------------------------------------

//GEOJSON API CALLS-----------------------------------------
const fetch_NJ_Districts_GeoJson = async () => {
  try {
    const response = await axios.get('http://localhost:8080/district-boundary/New Jersey');
    setGeojsonDataNJ(response.data);
  } catch (error) {
      console.error('Error fetching GeoJSON:', error);
  }
};

const fetch_LA_Districts_GeoJson = async () => {
  try {
    const response = await axios.get('http://localhost:8080/district-boundary/Louisiana');
    setGeojsonDataLA(response.data);
  } catch (error) {
    console.error('Error fetching GeoJSON:', error);
  }
};

const fetchLAPrecinctsData = async() => {
  try {
    const response = await axios.get('http://localhost:8080/precinct-boundary/Louisiana');
    setPrecinctsDataLA(response.data);
    console.log(response.data);
    setPrecinctsDataNJ(null);
  } catch (error) {
    console.error('Error fetching GeoJSON:', error);
  }
};

const fetchNJPrecinctsData = async() => {
  try {
    const response = await axios.get('http://localhost:8080/precinct-boundary/New Jersey');
    setPrecinctsDataNJ(response.data);
    setPrecinctsDataLA(null);
  } catch (error) {
    console.error('Error fetching GeoJSON:', error);
  }
};
//------------------------------------------------------------

const handleSelectedDistrict = (district) => {
  if(district === null)
  {
    setSelectedDistrict(null);
  }
  else
  {
    setSelectedDistrict(district);
  }
}

  const mapRef = useRef();

  const loadDataLAIncome = () => {
    const csvFilePath = 'LA_District_income_2020_data_2.csv';

    return new Promise((resolve, reject) => {
      Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: (result) => {
          const incomeData = result.data.map(row => ({
            district: row['Geography'],
            houseHoldIncomeRange: parseFloat(row['ID Household Income Bucket']),
          }));
          resolve(incomeData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const loadDataNJIncome = () => {
    const csvFilePath = 'NJ_District_income_2020_data_2.csv';

    return new Promise((resolve, reject) => {
      Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: (result) => {
          const incomeData = result.data.map(row => ({
            district: row['Geography'],
            houseHoldIncomeRange: parseFloat(row['ID Household Income Bucket']),
          }));
          resolve(incomeData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  const loadData = () => {
    const csvFilePath = 'LA_Precinct_Voting_Data.csv';
  
    return new Promise((resolve, reject) => {
      Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: (result) => {
          console.log("Hey, this was called");
          const voteData = result.data.map(row => ({  
            precinct: row['Precinct'],
            bidenVote: parseFloat(row['BIDEN']),
            trumpVote: parseFloat(row['TRUMP'])
          }));
  

          resolve(voteData);
        },
        error: (error) => {

          reject(error);
        }
      });
    });
  };

  const loadData2 = () => {
    const csvFilePath = 'NJ_Precinct_Voting_Data.csv';
  
    return new Promise((resolve, reject) => {
      Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: (result) => {
  
          const voteData2 = result.data.map(row => ({
            mun_name: row['MUN_NAME'],
            ward_code: row['WARD_CODE'],
            elecd_code: row['ELECD_CODE'],
            bidenVote: parseFloat(row['BIDEN']),
            trumpVote: parseFloat(row['TRUMP'])
          }));
  
          // console.log(allVoteData2)
          resolve(voteData2);
        },
        error: (error) => {

          reject(error);
        }
      });
    });
  };

  useEffect(() => {
    loadDataLAIncome()
    .then(incomeData => {
      // allIncomeData = incomeData;
      setisAllIncomeData(incomeData)
    })
    .catch(error => {
      console.error('Error loading data:', error);
    });
  loadDataLAIncome();
  }, []);

  useEffect(() => {
    loadDataNJIncome()
    .then(incomeData2 => {
      // allIncomeData = incomeData;
      setisAllIncomeData2(incomeData2)
    })
    .catch(error => {
      console.error('Error loading data:', error);
    });
    loadDataNJIncome();
  }, []);

  const loadData_Minority_LA = () => {
    const csvFilePath = 'LA_District_Minority_Density.csv';
  
    return new Promise((resolve, reject) => {
      Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: (result) => {
  
          const minorityData = result.data.map(row => ({
            district: row['Location'],
            minorityPercent: parseFloat(row['Minority Density']),
          }));
  

          resolve(minorityData);
        },
        error: (error) => {

          reject(error);
        }
      });
    });
  };

  const loadData_Minority_NJ = () => {
    const csvFilePath = 'NJ_District_Minority_Density.csv';
  
    return new Promise((resolve, reject) => {
      Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: (result) => {
  
          const minorityData = result.data.map(row => ({
            district: row['Location'],
            minorityPercent: parseFloat(row['Minority Density']),
          }));
  

          resolve(minorityData);
        },
        error: (error) => {

          reject(error);
        }
      });
    });
  };

  useEffect(() => {
    loadData()
    .then(voteData => {
      allVoteData = voteData;
    })
    .catch(error => {
      console.error('Error loading data:', error);
    });
  loadData();
  }, []);

  useEffect(() => {
    loadData2()
    .then(voteData2 => {
      // console.log(allVoteData2)
      setAllVoteData2(voteData2)
    })
    .catch(error => {
      console.error('Error loading data:', error);
    });
  loadData2();
  }, []);

  useEffect(() => {
    loadData_Minority_LA()
    .then(minorityData => {
      setMinorityDensityDataLA(minorityData);
    })
    .catch(error => {
      console.error('Error loading data:', error);
    });
  loadData_Minority_LA();
  }, []);

  useEffect(() => {
    loadData_Minority_NJ()
    .then(minorityData => {
      setMinorityDensityDataNJ(minorityData);
    })
    .catch(error => {
      console.error('Error loading data:', error);
    });
    loadData_Minority_NJ();
  }, []);

  const handleDistrictsClick = () => {
    if (selectedState === 'Louisiana') {
      setShowDistrictsLA(true);
      setShowDistrictsNJ(false);
      setShowPrecinctsLA(false);
      setSelectedDistrict(null);
    } else if (selectedState === 'New Jersey') {
      setShowDistrictsNJ(true);
      setShowDistrictsLA(false);
      setShowPrecinctsNJ(false);
      setSelectedDistrict(null);
    }
  };

  const handleArrowClick = (isMinimized) => {
    if (isMinimized) {
      if (selectedState === 'Louisiana') {
        centerMap([30.98592258905744, -90.96937811139156], 8);
      } else if (selectedState === 'New Jersey') {
        centerMap([40.220596, -74.369913], 8.4);
      }
    } else {

      if (selectedState === 'Louisiana') {
        centerMap(centerLouisiana, zoomLevels.louisiana);
      } else if (selectedState === 'New Jersey') {
        centerMap(centerNewJersey, zoomLevels.newjersey);
      }
      else{
        centerMap(centerDefault, zoomLevels.default)
      }
    }
  };

  const handlePrecinctsClickLA = () => {
    if (!showPrecinctsLA) {
        fetchLAPrecinctsData();
    }
    setShowPrecinctsLA(true);
    setIsPrecinctsActive(true);  
    setShowDistrictsLA(false);
};

const handlePrecinctsClickNJ = () => {
  if (!showPrecinctsNJ) {
      fetchNJPrecinctsData();
  }
  setShowPrecinctsNJ(true);
  setIsPrecinctsActive(true);
  setShowDistrictsNJ(false);
};

//DISTRICT VOTING COLORS
const getFeatureStyle = (feature) => {
  const party = feature.properties.winning_party;
  
  // Capitalize the first letter of the party string
  const capitalizedParty = party
    ? party.charAt(0).toUpperCase() + party.slice(1).toLowerCase()
    : '';

  const partyColor = colors[capitalizedParty] || '#ffffff';

  return {
    fillColor: partyColor,
    color: '#000000',
    weight: 0.5,
    opacity: 1,
    fillOpacity: highlightedFeature === feature ? 0.7 : 0.5,
  };
};


  const getDistrictLAStyleIncome = (feature) => {
    let districtName = feature.properties.name;
    let incomeRange = "";

    isAllIncomeData.forEach(data => {
      if (districtName === data.district) {
        if (data.houseHoldIncomeRange < 2) {
          incomeRange = "10k-20k";
        } else if (data.houseHoldIncomeRange < 5) {
          incomeRange = "20k-35k";
        } else if (data.houseHoldIncomeRange < 8) {
          incomeRange = "35k-50k";
        } else if (data.houseHoldIncomeRange < 11) {
          incomeRange = '50k-100k';
        } else if (data.houseHoldIncomeRange < 14) {
          incomeRange = '100k-200k';
        } else if (data.houseHoldIncomeRange >= 14) {
          incomeRange = '200k+';
        }
      }
    });

  const fillColor = colors[incomeRange] || 'white';  

  return {
    fillColor: fillColor,
    color: '#000000',
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.6,
  };
  }

  const getDistrictNJStyleIncome =(feature) =>{
    let districtName = feature.properties.DISTRICT;
    let incomeRange = "";

  isAllIncomeData2.forEach(data => {
    if (("District " + districtName) === data.district) {
      if (data.houseHoldIncomeRange < 2) {
        incomeRange = "10k-20k";
      } else if (data.houseHoldIncomeRange < 5) {
        incomeRange = "20k-35k";
      } else if (data.houseHoldIncomeRange < 8) {
        incomeRange = "35k-50k";
      } else if (data.houseHoldIncomeRange < 11) {
        incomeRange = '50k-100k';
      } else if (data.houseHoldIncomeRange < 14) {
        incomeRange = '100k-200k';
      } else if (data.houseHoldIncomeRange >= 14) {
        incomeRange = '200k+';
      }
    }
  });

  const fillColor = colors[incomeRange] || 'white'; 

  return {
    fillColor: fillColor,
    color: '#000000',
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.6,
  };
  }
  //RACE COLORING FOR LA
  const getFeatureStyle_Race_Heat_Map_LA = (feature) => {
    let districtName = feature.properties.name;
    let color = "";

    minorityDensityDataLA.forEach(data => {
    if (districtName === data.district) {
      if (data.minorityPercent > 91) {
        color = "90%-100%";
      } else if (data.minorityPercent > 81) {
        color = "80%-90%";
      } else if (data.minorityPercent > 71) {
        color = "70%-80%";
      } else if (data.minorityPercent > 61) {
        color = "60%-70%";
      } else if (data.minorityPercent > 51) {
        color = "50%-60%";
      } else if (data.minorityPercent > 41) {
        color = "40%-50%";
      } else if (data.minorityPercent > 31) {
        color = "30%-40%";
      } else if (data.minorityPercent > 21) {
        color = "20%-30%";
      } else if (data.minorityPercent > 11) {
        color = "10%-20%";
      } else {
        color = "0%-10%";
      }
      return;
    }
  });

  const fillColor = colors[color] || '#ffffff';  

  return {
    fillColor: fillColor,
    color: '#000000',
    weight: 0.5,
    opacity: 1,
    fillOpacity: highlightedFeature === feature ? 0.7 : 0.5,
  };
  };

  const getFeatureStyle_Race_Heat_Map_NJ = (feature) => {
    let districtName = feature.properties.DIST_LABEL;
    let color = "";
  
    minorityDensityDataNJ.forEach(data => {
      if (districtName === data.district) {
        if (data.minorityPercent > 91) {
          color = "90%-100%";
        } else if (data.minorityPercent > 81) {
          color = "80%-90%";
        } else if (data.minorityPercent > 71) {
          color = "70%-80%";
        } else if (data.minorityPercent > 61) {
          color = "60%-70%";
        } else if (data.minorityPercent > 51) {
          color = "50%-60%";
        } else if (data.minorityPercent > 41) {
          color = "40%-50%";
        } else if (data.minorityPercent > 31) {
          color = "30%-40%";
        } else if (data.minorityPercent > 21) {
          color = "20%-30%";
        } else if (data.minorityPercent > 11) {
          color = "10%-20%";
        } else {
          color = "0%-10%";
        }
        return; 
      }
    });

    const fillColor = colors[color] || '#ffffff'; 

   return {
      fillColor: fillColor,
      color: '#000000',
      weight: 0.5,
      opacity: 1,
      fillOpacity: highlightedFeature === feature ? 0.7 : 0.5,
    };
  };

  //DISTRICT STYLE
  const getDistrictStyle = (feature) => {
    const isSelected = feature.properties.NAME === selectedDistrict;
    const party = feature.properties.winning_party;
  
    const fillColor = party === 'republican'
      ? 'red'
      : party === 'democrat'
      ? 'blue'
      : '#cccccc';
  
    return {
      fillColor: fillColor,
      color: isSelected ? 'yellow' : '#000000',
      weight: isSelected ? 5 : 0.4,
      opacity: 1,
      fillOpacity: isSelected ? 0.6 : 0.2,
    };
  };
  
//RACE PRECINCT STYLE (BLACK)
const getPrecinctBlackStyle = (feature) => {
  let raceOption= race.toUpperCase()+"_POP";
  const { TOT_POP } = feature.properties;
  const racePopulation = feature.properties[raceOption]; 
  const blackPercent = (racePopulation / TOT_POP) * 100;

  let color = "";
  if (blackPercent > 90) {
      color = "90%-100%";
  } else if (blackPercent > 75) {
      color = "75%-90%";
  } else if (blackPercent > 60) {
      color = "60%-75%";
  } else if (blackPercent > 45) {
      color = "45%-60%";
  } else if (blackPercent > 30) {
      color = "30%-45%";
  } else if (blackPercent > 15) {
      color = "15%-30%";
  } else {
      color = "0%-15%";
  }

  let raceColor=colors[color];

  return {
      fillColor: raceColor,
      weight: 0.5,
      opacity: 1,
      color: "black",
      fillOpacity: highlightedFeature === feature ? 0.5 : 0.7,
  };
};

//VOTE MARGIN PRECINCT STYLE
const getPrecinctVoteMarginStyle=(feature)=>{
  let partyColor=0;
  let hueColor=100;
  let total=feature.properties.G20PREDBID+feature.properties.G20PRERTRU;
  const marginDiff= ((Math.abs(feature.properties.G20PREDBID-feature.properties.G20PRERTRU))/(total))*100;
  if(feature.properties.G20PREDBID > feature.properties.G20PRERTRU)
  {
    partyColor=240;
  }
  else
  {
    partyColor=0;
  }

  if (marginDiff === 0){
    hueColor="100%";
  }
  else if(marginDiff < 5){
    hueColor="75%";
  }
  else if(marginDiff < 10){
    hueColor="60%";
  }
  else if(marginDiff < 15){
    hueColor="45%";
  }
  else if(marginDiff < 30){
    hueColor="30%";
  }
  else if(marginDiff >= 30){
    hueColor="15%";
  }

  const adjustedColor = `hsl(${partyColor}, 100%, ${hueColor})`; 
  return {
    fillColor: adjustedColor || '#ffffff',
    color: '#000000',
    weight: 0.5,
    opacity: 1,
    fillOpacity: highlightedFeature === feature ? 0.7 : 0.8,
  };

}

//VOTING PRECINCT STYLE
  const getPrecinctStyle = (feature) => {
    let partyColor=0;
    let hueColor=100;
    const { AVG_INC } = feature.properties;
    if(feature.properties.G20PREDBID > feature.properties.G20PRERTRU)
    {
      partyColor=240;
    }
    else
    {
      partyColor=0;
    }

    if (AVG_INC < 25000){
      hueColor="90%";
    }
    else if(AVG_INC < 50000){
      hueColor="75%";
    }
    else if(AVG_INC < 75000){
      hueColor="60%";
    }
    else if(AVG_INC < 125000){
      hueColor="45%";
    }
    else if(AVG_INC < 150000){
      hueColor="30%";
    }
    else if(AVG_INC >= 150000){
      hueColor="15%";
    }

    const adjustedColor = `hsl(${partyColor}, 100%, ${hueColor})`; 
  return {
    fillColor: adjustedColor || '#ffffff', // Use the adjusted color
    color: '#000000',
    weight: 0.5,
    opacity: 1,
    fillOpacity: highlightedFeature === feature ? 0.5 : 0.8,
  };
  }

//AVERAGE INCOME PRECINCT STYLE
const getPrecinctIncomeStyle = (feature) => {
  const { AVG_INC } = feature.properties;
  let color ="";
  if (AVG_INC < 25000){
    color = ">25k";
  }
  else if(AVG_INC < 50000){
    color = "25k-50k";
  }
  else if(AVG_INC < 75000){
    color = "50k-75k";
  }
  else if(AVG_INC < 125000){
    color = "75k-125k";
  }
  else if(AVG_INC < 150000){
    color = "125k-150k";
  }
  else if(AVG_INC >= 150000){
    color = "150k+";
  }

  const fillColor = colors[color] || 'white';  
  return {
    fillColor: fillColor,
    color: '#000000',
    weight: 0.5,
    opacity: 1,
    fillOpacity: highlightedFeature === feature ? 0.5 : 0.85,
  };

}
//REGION PRECINCT STYLE
const getPrecinctRegionStyle = (feature) =>{
    const { classification } = feature.properties;
    const upperClassification= classification.charAt(0).toUpperCase() + classification.slice(1).toLowerCase();
    const color=colors[upperClassification];
    return {
      fillColor: color || '#ffffff',
      color: '#000000',
      weight: 0.5,
      opacity: 1,
      fillOpacity: highlightedFeature === feature ? 0.5 : 0.8,
    };
}

//POVERTY PRECINCT STYLE
const getPrecinctPovertyStyle = (feature) =>{
    const { poverty_fraction }=feature.properties;
    const poverty_percentage=poverty_fraction*100;
    let color="";
    if (poverty_percentage > 90) {
      color = "90%-100%";
  } else if (poverty_percentage > 75) {
      color = "75%-90%";
  } else if (poverty_percentage > 60) {
      color = "60%-75%";
  } else if (poverty_percentage > 45) {
      color = "45%-60%";
  } else if (poverty_percentage > 30) {
      color = "30%-45%";
  } else if (poverty_percentage > 15) {
      color = "15%-30%";
  } else {
      color = "0%-15%";
  }
  let povertyColor=colors[color];

  return {
    fillColor: povertyColor,
    weight: 0.5,
    opacity: 1,
    color: "black",
    fillOpacity: highlightedFeature === feature ? 0.5 : 0.88,
};
}

  const defaultStateStyle = (feature) => ({
    fillColor: '#ffffff',
    color: '#ffffff',
    weight: 3,
    opacity: 1,
    fillOpacity: 0,
  });

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: () => {
        setHighlightedFeature(feature);
        
        if (feature.properties.NAME) {
          setFakeCurrArea(feature.properties.NAME);
        } 
        if (feature.properties.name) {
          setFakeCurrArea(feature.properties.name.replace("Congressional", "").trim());
        }
      },
      mouseout: () => {
        setHighlightedFeature(null);
        setFakeCurrArea('')
      },
      click: () => {
        console.log("test");
        const stateName = feature.properties.NAME20;
        const stateNameNJ = feature.properties.NAME;
        if (stateName === 'Louisiana' || stateNameNJ === 'Louisiana') {
          handleSelection('louisiana');
        } else if (stateNameNJ === 'New Jersey' || stateName === 'New Jersey') {
          handleSelection('newjersey');
        }

        if (feature.properties.NAME) {
          setCurrArea(feature.properties.NAME);
        } 
        if (feature.properties.name) {
          setCurrArea(feature.properties.name.replace("Congressional", "").trim());
        }

        if (feature.properties.NAME) {
          setCurrArea(feature.properties.NAME);
        }
        if (feature.properties.name) {
          setCurrArea(feature.properties.name.replace("Congressional", "").trim());
        }
      },
    });

  };

const onEachStateFeature = (feature, layer) => {
  const handleClick = () => {
    if (selectedState) {
      return;
    }

    console.log(`${feature.properties.name} was clicked.`);
    const stateName = feature.properties.name;

    if (stateName === 'Louisiana') {
      handleSelection('louisiana');
    } else if (stateName === 'New Jersey') {
      handleSelection('newjersey');
    }

    layer.off('click', handleClick);
  };

  layer.on({
    mouseover: () => {
      setHighlightedFeature(feature);
    },
    mouseout: () => {
      setHighlightedFeature(null);
    },
    click: handleClick,
  });

  layer._handleClick = handleClick;
};

const resetStateClickHandlers = () => {
  if (mapRef.current) {
    mapRef.current.eachLayer((layer) => {

      if (layer._handleClick) {
        layer.on('click', layer._handleClick);
      }
    });
  }
};

const onEachPrecinctFeature = (feature, layer) => {
  layer.on({
      mouseover: () => {
          setHighlightedFeature(feature);
          if(feature.properties.MUN_NAME){
            setFakeCurrArea(feature.properties.MUN_NAME + " " + feature.properties.WARD_CODE + " " + feature.properties.ELECD_CODE);
          }
          else if(feature.properties.NAME){
            setFakeCurrArea(feature.properties.NAME);
          }
      },
      mouseout: () => {
        setHighlightedFeature(null);
        setFakeCurrArea('')
      },
      click: () => {
        console.log(selectedState)
        if(feature.properties.MUN_NAME){
          setCurrArea(feature.properties.MUN_NAME + " " + feature.properties.WARD_CODE + " " + feature.properties.ELECD_CODE);
        } 
        else if(feature.properties.NAME){
          setCurrArea(feature.properties.NAME);
        }
      },
  });
  
};

  const getLAFeature = (data) => {
    return data.features.find(
      (feature) => feature.properties.name === 'Louisiana'
    );
  };
  
  const LAFeature = getLAFeature(statesData);
  
  const LAStyle = {
    fillColor:'#FF0000',
    color: '#ffffff',
    weight: 2,
    opacity: 1,
    fillOpacity: selectedState === 'Louisiana' ? 0 : 1,
  };

  const getNewJerseyFeature = (data) => {
    return data.features.find(
      (feature) => feature.properties.name === 'New Jersey'
    );
  };
  
  const newJerseyFeature = getNewJerseyFeature(statesData);
  
  const newJerseyStyle = {
    fillColor:'#0000ff',
    color: '#ffffff',
    weight: 2,
    opacity: 1,
    fillOpacity: selectedState === 'New Jersey' ? 0 : 1,
  };

  const centerMap = (center, zoom) => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom, {
        animate: true,
        duration: 0,
      });
    }
  };
  
  const handleSelection = (selection) => {
    if (selection === StateEnum.LOUISIANA) {
      fetch_LA_Districts_GeoJson();
      setCurrentMap(StateEnum.LOUISIANA);
      setSelectedState("Louisiana");
      setCurrArea("Louisiana");

      setReset(true);

      centerMap(centerLouisiana, zoomLevels.louisiana);
      setShowTileLayer(true);
      setIsInfoVisible(true);
      setShowWelcome(false);
      setIsTabVisible(true);
      setMinimizeSidebar(true);
      setLegendVisible(true);
      setShowPrecinctsLA(false);
      setShowPrecinctsNJ(false);
      setIsPrecinctsActive(false);
      setShowDistrictsLA(true);
      setSelectedDistrict(null);

    } else if (selection === StateEnum.NEW_JERSEY) {
      fetch_NJ_Districts_GeoJson();
      setCurrentMap(StateEnum.NEW_JERSEY);
      setSelectedState("New Jersey");
      setCurrArea("New Jersey");

      setReset(true);

      centerMap(centerNewJersey, zoomLevels.newjersey);
      setShowTileLayer(true);
      setIsInfoVisible(true);
      setShowWelcome(false);
      setIsTabVisible(true);
      setMinimizeSidebar(true);
      setLegendVisible(true);
      setShowPrecinctsLA(false);
      setShowPrecinctsNJ(false);
      setIsPrecinctsActive(false);
      setShowDistrictsNJ(true);
      setSelectedDistrict(null);
    } else {
      setCurrentMap('home');
      setSelectedState('');
      centerMap(centerDefault, zoomLevels.default);
      setShowTileLayer(false);
      setIsInfoVisible(false);
      setShowWelcome(true);
      setIsTabVisible(false);
      setMinimizeSidebar(false);
      setLegendVisible(false);
      setPrecinctsDataLA(null);
      setPrecinctsDataNJ(null);
      setShowPrecinctsLA(false);
      setShowPrecinctsNJ(false);
      setIsPrecinctsActive(false);
      setShowDistrictsLA(false);
      setShowDistrictsNJ(false);
      resetStateClickHandlers();
      setSelectedDistrict(null);
    }
  };

//ACCORDION COMPONENTS----------------------------
  useEffect(() => {
    const acc = document.getElementsByClassName('accordion')[0];
    const panel = document.getElementsByClassName('panel')[0];

    if (acc && panel) {
      const togglePanel = () => {
        if (panel.style.display === 'block') {
          panel.style.display = 'none';
        } else {
          panel.style.display = 'block';
        }
      };

      acc.addEventListener('click', togglePanel);

      return () => {
        acc.removeEventListener('click', togglePanel);
      };
    }
  }, []);

  const toggleAccordion = () => {
    setAccordionOpen((prev) => !prev);
  };
//-------------------------------------------------
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 0);
    }
  }, [currentMap]);


  return (
    <div className="app-container">
      <div className={`sidebar ${isMinimized ? 'minimized' : ''}`}>

        <div className={`logoDiv ${isMinimized ? 'minimized' : ''}`}>
          <img src="/la_rams_logo.jpeg" alt="la rams logo" class="ramsLogo"/>
        </div>

        <div className={`homeButtonDiv ${isMinimized ? 'minimized' : ''}`}>
          <button className={`Homebutton ${isMinimized ? 'minimized' : ''}`} onClick={() => handleSelection(null)}>
            <div className={`homeButtonIconDiv ${isMinimized ? 'minimized' : ''}`}>
            <img
              src="/home_icon.png"
              alt="home icon"
              className={`homeIcon ${isMinimized ? 'minimized' : ''}`}
              onClick={() => handleSelection(null)}
            />
            </div>
            {!isMinimized && (
              <span>Home</span>
              )}
            </button>
        </div>

        <div className={`dropdown ${isMinimized ? 'minimized' : ''}`}>
          <button className={`accordion ${isMinimized ? 'minimized' : ''}`} onClick={toggleAccordion}>
            <span className={`right-icon ${isMinimized ? 'minimized' : ''}`} style={{ transform: isAccordionOpen ? 'rotate(-135deg)' : 'rotate(-45deg)', transition: 'transform 0.3s' }}></span>
            <span className={`left-icon ${isMinimized ? 'minimized' : ''}`} style={{ transform: isAccordionOpen ? 'rotate(135deg)' : 'rotate(45deg)', transition: 'transform 0.3s' }}></span>
            {!isMinimized && (
              <span>States</span>
            )}
          </button>
          <ul className={`panel ${isMinimized ? 'minimized' : ''}`}>
            <li>
              <button className={`dropdownButtons louisiana-button${isMinimized ? 'minimized' : ''}`} onClick={() => handleSelection('louisiana')}>
                {!isMinimized && (
                <span>Louisiana</span>
                )}
                {isMinimized && (

                <span title="Louisiana">LA</span>
                
                )}
              </button>
            </li>
            <li>
              <button className={`dropdownButtons newjersey-button${isMinimized ? 'minimized' : ''}`} onClick={() => handleSelection('newjersey')}>
                {!isMinimized && (
                <span>New Jersey</span>
                )}
                {isMinimized && (
                <span title="New Jersey">NJ</span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>

    {isInfoVisible && (
      <InfoPanel 
      stateName={selectedState}
      precinctsDataLA={precinctsDataLA}
      precinctsDataNJ={precinctsDataNJ}
      geojsonDataLA={geojsonDataLA}
      geojsonDataNJ={geojsonDataNJ}
      currArea={currArea}
      currState={selectedState}
      handleArrowClick={handleArrowClick}
      handleSelectedDistrict = {handleSelectedDistrict}
    />
  )}

      <Tab 
        isVisible={isTabVisible} 
        stateName={selectedState} 
        onPrecinctsClickLA={handlePrecinctsClickLA}
        onPrecinctsClickNJ={handlePrecinctsClickNJ}
        onDistrictsClick={handleDistrictsClick}
        fakecurrArea={fakecurrArea}
        changeLegendColor2={changeLegendColor}
        changeRaceOption={setRace}
        reset={reset}
        setReset={setReset}
      />

      <Legend isVisible={isLegendVisible}
      legendColor={isIncomeLegend}
      colors={colors}
      />

      <div className={`siteBody ${isInfoVisible ? 'siteBody-shrink' : ''}`}>
      <div className='map-container'>
        
      {showWelcome && (
            <div className='welcomeDiv'>
              Welcome! Click on a state to get started.
            </div>
          )}
        <MapContainer
          ref={mapRef}
          center={centerDefault}
          zoom={defaultZoom}
          style={{ width: '100vw', height: '100vh' }}
          dragging={true}
          zoomControl={false}
          doubleClickZoom = {false}
          scrollWheelZoom = {true}
          id = 'my-leaflet-map'
        >

          {showDistrictsLA && geojsonDataLA && (
            <GeoJSON data={geojsonDataLA} style={isIncomeLegend === "income" ? getDistrictLAStyleIncome :
              selectedDistrict !== null ? getDistrictStyle :
              isIncomeLegend === "district" ? getFeatureStyle :
              isIncomeLegend === "race" ? getFeatureStyle_Race_Heat_Map_LA : getFeatureStyle} onEachFeature={onEachFeature} />
          )}

          {showDistrictsNJ && geojsonDataNJ && (
            <GeoJSON data={geojsonDataNJ} style={isIncomeLegend === "income" ? getDistrictNJStyleIncome :
              selectedDistrict !== null ? getDistrictStyle :
              isIncomeLegend === "district" ? getFeatureStyle :
              isIncomeLegend === "race" ? getFeatureStyle_Race_Heat_Map_NJ : getFeatureStyle} onEachFeature={onEachFeature} />
          )}

          {/* {showDistrictsLA && geojsonData1 && (
            <GeoJSON data={geojsonData1} style={getDistrictStyle} onEachFeature={onEachFeature} />
          )}

          {showDistrictsNJ && geojsonData2 && (
            <GeoJSON data={geojsonData2} style={getDistrictStyle} onEachFeature={onEachFeature} />
          )} */}

          {showPrecinctsLA && precinctsDataLA && (
          <GeoJSON data={precinctsDataLA} style={isIncomeLegend === "voting" ? getPrecinctStyle: 
            isIncomeLegend === "race" ? getPrecinctBlackStyle : 
            isIncomeLegend === "region" ? getPrecinctRegionStyle :
            isIncomeLegend === "poverty" ? getPrecinctPovertyStyle :
            isIncomeLegend === "margin" ? getPrecinctVoteMarginStyle :
            isIncomeLegend === "income" ? getPrecinctIncomeStyle : null
          } 
          onEachFeature={onEachPrecinctFeature}/>
          )}
          {showPrecinctsNJ && precinctsDataNJ && (
          <GeoJSON data={precinctsDataNJ} style={isIncomeLegend === "voting"? getPrecinctStyle:
            isIncomeLegend === "race" ? getPrecinctBlackStyle: 
            isIncomeLegend === "region" ? getPrecinctRegionStyle :
            isIncomeLegend === "poverty" ? getPrecinctPovertyStyle :
            isIncomeLegend === "margin" ? getPrecinctVoteMarginStyle :
            isIncomeLegend === "income" ? getPrecinctIncomeStyle: null
          } 
          onEachFeature={onEachPrecinctFeature} />
          )}

          <GeoJSON data={statesData.features} style={defaultStateStyle} onEachFeature={onEachStateFeature} />

          {newJerseyFeature && (
            <GeoJSON
              data={newJerseyFeature}
              style={newJerseyStyle}
              onEachFeature={onEachStateFeature}
            />
          )}

          {LAFeature && (
            <GeoJSON
              data={LAFeature}
              style={LAStyle}
              onEachFeature={onEachStateFeature}
            />
          )}

          {showTileLayer && (
            <TileLayer url="https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=BfOpNGWVgiTaOlbblBv9" attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
              />
          )}

        </MapContainer>
        </div>
      </div>
    </div>
  );
}