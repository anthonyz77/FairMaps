import React, { useState, useEffect } from 'react';
import '../styles/App.css';

const Tab = ({ isVisible, stateName, onPrecinctsClickLA, onPrecinctsClickNJ, onDistrictsClick, fakecurrArea, changeLegendColor2, changeRaceOption, reset, setReset }) => {
  const [activeLegendButton, setActiveLegendButton] = useState(''); // Initial highlight for Voting
  const [activePrecinctDistrict, setActivePrecinctDistrict] = useState('district'); // Initial highlight for Districts
  const [selectedRaceOption, setSelectedRaceOption] = useState(''); // Track selected race option
  const [selectedPoliticalOption, setSelectedPoliticalOption] = useState(''); // Track selected political/income option

  const isDistrictActive = activePrecinctDistrict === 'district';

  const checkReset =()=>{
    if (reset === true){
      setActiveLegendButton("");
      setSelectedRaceOption("");
      setActivePrecinctDistrict("district");

      setSelectedPoliticalOption('');

      changeLegendColor2("district");
      setReset(false);
    }
  }

  useEffect(() => {
    checkReset();
  }, [reset]);

  const handleLegendButtonClick = (buttonId) => {
    if (isDistrictActive) return; // Prevent interaction if District is active
    setActiveLegendButton(buttonId);
    if (buttonId === 'votingbutton') changeLegendColor2("voting");
    else if (buttonId === 'incomebutton') changeLegendColor2("income");
    else if (buttonId === "regionbutton") changeLegendColor2("region");
    else if (buttonId === "povertybutton") changeLegendColor2("poverty");
    else if (buttonId === "marginbutton") changeLegendColor2("margin");
    setSelectedRaceOption("");
    setSelectedPoliticalOption('');
  };

  const handleRaceOptionChange = (event) => {
    if (isDistrictActive) return; // Prevent interaction if District is active
    const selectedOption = event.target.value;
    setSelectedRaceOption(selectedOption);
    setSelectedPoliticalOption('');
    changeRaceOption(selectedOption);
    changeLegendColor2("race");
    setActiveLegendButton("");
  };


  const handlePoliticalOptionChange = (event) => {
    if (isDistrictActive) return; // Prevent interaction if District is active
    const selectedOption = event.target.value;
    setSelectedPoliticalOption(selectedOption);
    setSelectedRaceOption("");
    if (selectedOption === "Political/Income") changeLegendColor2("voting");
    else if (selectedOption === "VotingMargin") changeLegendColor2("margin");
    setActiveLegendButton("");
  };

  const handlePrecinctDistrictClick = (type) => {
    setActivePrecinctDistrict(type);
    if (type === 'precinct') {
      if (stateName === "Louisiana") onPrecinctsClickLA();
      else if (stateName === "New Jersey") onPrecinctsClickNJ();
      changeLegendColor2("voting");
      setSelectedPoliticalOption("Politcal/Income")
      setActiveLegendButton('votingbutton');
    } else {
      onDistrictsClick();
      setActiveLegendButton('');
      setSelectedRaceOption('');
      setSelectedPoliticalOption("");
      changeLegendColor2("district");
    }
  };

  return (
    <div className={`tab ${isVisible ? 'slide-in' : 'slide-out'}`}>
      <div className="columnizebutton">
      <button
          id="districtbutton"
          className={activePrecinctDistrict === 'district' ? 'active' : ''}
          onClick={() => handlePrecinctDistrictClick('district')}
        >
          Districts
        </button>

        {(stateName === "Louisiana" || stateName === "New Jersey") && (
          <button
            id="precinctbutton"
            className={activePrecinctDistrict === 'precinct' ? 'active' : ''}
            onClick={() => handlePrecinctDistrictClick('precinct')}
          >
            Precincts
          </button>
        )}

        <select
          id="politicalDropdown"
          value={selectedPoliticalOption}
          onChange={handlePoliticalOptionChange}
          className={`political-dropdown ${isDistrictActive ? 'disabled' : ''}`}
          disabled={isDistrictActive}
        >
          <option value="" disabled>Voting:</option>
          <option value="Political/Income">Income</option>
          <option value="VotingMargin">Margin</option>
        </select>

        <select
          id="raceDropdown"
          value={selectedRaceOption}
          onChange={handleRaceOptionChange}
          className={`race-dropdown ${isDistrictActive ? 'disabled' : ''}`}
          disabled={isDistrictActive}
        >
          <option value="" disabled>Race:</option>
          <option value="white">White</option>
          <option value="black">Black</option>
          <option value="asian">Asian</option>
          <option value="native">Native</option>
          <option value="pacific">Pacific</option>
          <option value="other">Other</option>
        </select>

        <button
          id="regionbutton"
          className={`${activeLegendButton === 'regionbutton' ? 'active' : ''} ${isDistrictActive ? 'disabled' : ''}`}
          onClick={() => handleLegendButtonClick('regionbutton')}
          disabled={isDistrictActive}
        >
          Region
        </button>

        <button
          id="incomebutton"
          className={`${activeLegendButton === 'incomebutton' ? 'active' : ''} ${isDistrictActive ? 'disabled' : ''}`}
          onClick={() => handleLegendButtonClick('incomebutton')}
          disabled={isDistrictActive}
        >
          Income
        </button>
        <button
          id="povertybutton"
          className={`${activeLegendButton === 'povertybutton' ? 'active' : ''} ${isDistrictActive ? 'disabled' : ''}`}
          onClick={() => handleLegendButtonClick('povertybutton')}
          disabled={isDistrictActive}
        >
          Poverty
        </button>

      </div>

      <div id="fakecurrArea">
        {fakecurrArea}
      </div>
    </div>
  );
};

export default Tab;
