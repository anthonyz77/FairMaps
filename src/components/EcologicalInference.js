import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

// Add standard deviation method to Math
Math.std = function (values) {
  const mean = values.reduce((a, b) => a + b) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / values.length;
  return Math.sqrt(avgSquareDiff);
};

const EcologicalInference = ({ stateName }) => {
  const [chartData, setChartData] = useState(null);
  const [selectedDisplay, setSelectedDisplay] = useState("race");
  const [selectedRace, setSelectedRace] = useState("white");
  const [selectedCandidate, setSelectedCandidate] = useState("biden");
  const [selectedIncome, setSelectedIncome] = useState("poverty");
  const [selectedRegion, setSelectedRegion] = useState("Overall");
  const [ecoData, setEcoData] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedRace1, setSelectedRace1] = useState("white");
  const [selectedRace2, setSelectedRace2] = useState("black");
  const [comparisonCandidate, setComparisonCandidate] = useState("biden");
  const [comparisonData, setComparisonData] = useState(null);

  const races =
    stateName.toLowerCase() === "louisiana"
      ? ["White", "Black"]
      : ["White", "Black", "Asian"];
  const incomeLevels = ["Poverty", "Low Income", "Middle Income", "High Income"];
  const candidates = ["Biden", "Trump"];
  const regionTypes = ["Overall", "Rural", "Urban", "Suburban"];

  const fetchEcoData = async (raceOrIncome, display, candidate, region) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/ecologicalinference/${display}/${stateName}/${raceOrIncome}/${candidate}/${region}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching state data:", error);
      return null;
    }
  };

  useEffect(() => {
    const criteria = selectedDisplay === "race" ? selectedRace : selectedIncome;
    fetchEcoData(criteria, selectedDisplay, selectedCandidate, selectedRegion).then((data) => {
      setEcoData(data);
    });
  }, [stateName, selectedRace, selectedDisplay, selectedCandidate, selectedIncome, selectedRegion]);

  useEffect(() => {
    const validRaces =
      stateName.toLowerCase() === "louisiana" ? ["white", "black"] : ["white", "black", "asian"];
    if (!validRaces.includes(selectedRace)) {
      setSelectedRace(validRaces[0].toLowerCase());
    }
    setChartData(null);
  }, [stateName]);

  useEffect(() => {
    if (ecoData && Array.isArray(ecoData.data)) {
      const group1Values = ecoData.data.map((row) => row.group1);
      const group2Values = ecoData.data.map((row) => row.group2);

      const createHistogram = (values, bins = 2000) => {
        const min = 0;
        const max = Math.max(...values) + 0.09;
        const binWidth = (max - min) / bins;
        const counts = new Array(bins).fill(0);

        values.forEach((value) => {
          const index = Math.min(Math.floor((value - min) / binWidth), bins - 1);
          counts[index]++;
        });

        const total = values.length;
        const densities = counts.map((count) => count / (total * binWidth));
        const centers = Array.from({ length: bins }, (_, i) => min + i * binWidth + binWidth / 2);

        return { centers, densities, counts };
      };

      const calculateDensityCurve = (values, centers) => {
        const bandwidth = 3.49 * Math.std(values) * Math.pow(values.length, -1 / 3);

        const kernel = (x, xi) =>
          Math.exp(-0.5 * Math.pow((x - xi) / bandwidth, 2)) / (bandwidth * Math.sqrt(2 * Math.PI));

        const densities = centers.map((center) => {
          return values.reduce((sum, xi) => sum + kernel(center, xi), 0) / values.length;
        });

        return densities;
      };

      const histogram1 = createHistogram(group1Values);
      const histogram2 = createHistogram(group2Values);

      const densityCurve1 = calculateDensityCurve(group1Values, histogram1.centers);
      const densityCurve2 = calculateDensityCurve(group2Values, histogram2.centers);

      const filteredCenters1 = histogram1.centers.filter((_, i) => histogram1.densities[i] > 0);
      const filteredDensities1 = densityCurve1.filter((_, i) => histogram1.densities[i] > 0);

      const filteredCenters2 = histogram2.centers.filter((_, i) => histogram2.densities[i] > 0);
      const filteredDensities2 = densityCurve2.filter((_, i) => histogram2.densities[i] > 0);

      const group1Label =
        selectedDisplay === "income"
          ? selectedIncome.replace(/_/g, " ")
          : selectedRace;
      const group2Label =
        selectedDisplay === "income"
          ? `non_${selectedIncome.replace(/_/g, " ")}`
          : `non_${selectedRace}`;

      setChartData({
        centers: histogram1.centers,
        datasets: [
          {
            type: "bar",
            x: histogram1.centers,
            y: histogram1.densities,
            name: `${group1Label}`,
            marker: { color: "rgba(0, 0, 0, 0.5)" },
          },
          {
            type: "bar",
            x: histogram2.centers,
            y: histogram2.densities,
            name: `${group2Label}`,
            marker: { color: "rgba(255, 99, 132, 0.5)" },
          },
          {
            type: "scatter",
            mode: "lines",
            x: filteredCenters1,
            y: filteredDensities1,
            showlegend: false,
            line: { color: "rgb(0, 128, 0)", width: 2 },
          },
          {
            type: "scatter",
            mode: "lines",
            x: filteredCenters2,
            y: filteredDensities2,
            showlegend: false,
            line: { color: "rgb(255, 99, 132)", width: 2 },
          },
        ],
      });
    } else {
      console.warn("ecoData.data is empty or not an array");
    }
  }, [ecoData, selectedRace, selectedIncome, selectedDisplay, selectedRegion]);

  useEffect(() => {
    const handleComparisonData = async () => {
      const dataRace1 = await fetchEcoData(selectedRace1, "race", comparisonCandidate, "Overall");
      const dataRace2 = await fetchEcoData(selectedRace2, "race", comparisonCandidate, "Overall");

      if (dataRace1 && dataRace2) {
        const group1ValuesRace1 = dataRace1.data.map((row) => row.group1);
        const group1ValuesRace2 = dataRace2.data.map((row) => row.group1);

        const createHistogram = (values, bins = 2000) => {
          const min = 0;
          const max = Math.max(...values) + 0.09;
          const binWidth = (max - min) / bins;
          const counts = new Array(bins).fill(0);

          values.forEach((value) => {
            const index = Math.min(Math.floor((value - min) / binWidth), bins - 1);
            counts[index]++;
          });

          const total = values.length;
          const densities = counts.map((count) => count / (total * binWidth));
          const centers = Array.from({ length: bins }, (_, i) => min + i * binWidth + binWidth / 2);

          return { centers, densities };
        };

        const calculateDensityCurve = (values, centers) => {
          const bandwidth = 3.49 * Math.std(values) * Math.pow(values.length, -1 / 3);

          const kernel = (x, xi) =>
            Math.exp(-0.5 * Math.pow((x - xi) / bandwidth, 2)) / (bandwidth * Math.sqrt(2 * Math.PI));

          const densities = centers.map((center) => {
            return values.reduce((sum, xi) => sum + kernel(center, xi), 0) / values.length;
          });

          return densities;
        };

        const histogram1 = createHistogram(group1ValuesRace1);
        const histogram2 = createHistogram(group1ValuesRace2);

        const densityCurve1 = calculateDensityCurve(group1ValuesRace1, histogram1.centers);
        const densityCurve2 = calculateDensityCurve(group1ValuesRace2, histogram2.centers);

        const filteredCenters1 = histogram1.centers.filter((_, i) => histogram1.densities[i] > 0);
        const filteredDensities1 = densityCurve1.filter((_, i) => histogram1.densities[i] > 0);

        const filteredCenters2 = histogram2.centers.filter((_, i) => histogram2.densities[i] > 0);
        const filteredDensities2 = densityCurve2.filter((_, i) => histogram2.densities[i] > 0);

        setComparisonData({
          datasets: [
            {
              type: "bar",
              x: histogram1.centers,
              y: histogram1.densities,
              name: `${selectedRace1.charAt(0).toUpperCase() + selectedRace1.slice(1)}`,
              marker: { color: "rgba(0, 0, 0, 0.5)" },
            },
            {
              type: "bar",
              x: histogram2.centers,
              y: histogram2.densities,
              name: `${selectedRace2.charAt(0).toUpperCase() + selectedRace2.slice(1)}`,
              marker: { color: "rgba(255, 99, 132, 0.5)" },
            },
            {
              type: "scatter",
              mode: "lines",
              x: filteredCenters1,
              y: filteredDensities1,
              showlegend: false,
              line: { color: "rgb(0, 128, 0)", width: 2 },
            },
            {
              type: "scatter",
              mode: "lines",
              x: filteredCenters2,
              y: filteredDensities2,
              showlegend: false,
              line: { color: "rgb(255, 99, 132)", width: 2 },
            },
          ],
        });
      }
    };

    if (compareMode) {
      handleComparisonData();
    }
  }, [selectedRace1, selectedRace2, comparisonCandidate, selectedRegion, compareMode]);

  const getAvailableRaces = (currentRace) => {
    return races.filter((race) => race.toLowerCase() !== currentRace);
  };

  return (
    <div>
      <h1 style={{ fontSize: "24px" }}>Ecological Inference</h1>
      {!compareMode && (
        <div>
          <label style={{ paddingRight: "20px" }}>
            Display Type:
            <select className="allDropDown" value={selectedDisplay} onChange={(e) => setSelectedDisplay(e.target.value)}>
              <option value="race">Race</option>
              <option value="income">Income</option>
            </select>
          </label>

          {selectedDisplay === "race" ? (
            <label>
              Race:
              <select className="allDropDown" value={selectedRace} onChange={(e) => setSelectedRace(e.target.value.toLowerCase())}>
                {races.map((race) => (
                  <option key={race} value={race.toLowerCase()}>
                    {race}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              Income Level:
              <select className="allDropDown" value={selectedIncome} onChange={(e) => setSelectedIncome(e.target.value)}>
                {incomeLevels.map((level) => (
                  <option key={level} value={level.toLowerCase()}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label style={{ paddingLeft: "20px" }}>
            Candidate:
            <select className="allDropDown" value={selectedCandidate} onChange={(e) => setSelectedCandidate(e.target.value.toLowerCase())}>
              {candidates.map((candidate) => (
                <option key={candidate} value={candidate.toLowerCase()}>
                  {candidate}
                </option>
              ))}
            </select>
          </label>

          <label style={{ paddingLeft: "20px" }}>
            Region Type:
            <select className="allDropDown" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
              {regionTypes.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => setCompareMode(!compareMode)}>
          {compareMode ? "Back to Main Chart" : "Compare Races"}
        </button>

        {compareMode && (
          <div style={{ marginTop: "10px" }}>
            <label style={{ paddingRight: "10px" }}>
              Race 1:
              <select className="allDropDown"
                value={selectedRace1}
                onChange={(e) => setSelectedRace1(e.target.value.toLowerCase())}
              >
                {getAvailableRaces(selectedRace2).map((race) => (
                  <option key={race} value={race.toLowerCase()}>
                    {race}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ paddingRight: "10px" }}>
              Race 2:
              <select className="allDropDown"
                value={selectedRace2}
                onChange={(e) => setSelectedRace2(e.target.value.toLowerCase())}
              >
                {getAvailableRaces(selectedRace1).map((race) => (
                  <option key={race} value={race.toLowerCase()}>
                    {race}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Candidate:
              <select className="allDropDown"
                value={comparisonCandidate}
                onChange={(e) => setComparisonCandidate(e.target.value.toLowerCase())}
              >
                {candidates.map((candidate) => (
                  <option key={candidate} value={candidate.toLowerCase()}>
                    {candidate}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      <div className="chart-container" style={{ marginTop: "20px" }}>
        {compareMode ? (
          comparisonData ? (
            <Plot
              data={comparisonData.datasets}
              layout={{
                title: `Comparison of Races for ${comparisonCandidate.charAt(0).toUpperCase() + comparisonCandidate.slice(1)}`,
                xaxis: { title: "Group Vote Percentage" },
                yaxis: { title: "Probability Density" },
                barmode: "overlay",
                width: 1000,
              }}
            />
          ) : (
            <p>Loading Comparison Data...</p>
          )
        ) : chartData ? (
          <Plot
            data={chartData.datasets}
            layout={{
              title: `Support for ${selectedCandidate.charAt(0).toUpperCase() + selectedCandidate.slice(1)}`,
              xaxis: { title: "Group Vote Percentage" },
              yaxis: { title: "Probability Density" },
              barmode: "overlay",
              width: 1000,
            }}
          />
        ) : (
          <p>Loading Data...</p>
        )}
      </div>
    </div>
  );
};

export default EcologicalInference;
