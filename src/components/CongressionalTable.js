import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CongressionalTable({ stateName, handleSelectedDistrict }) {
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

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
      setTableData(districts);
    } catch (error) {
      console.error('Error fetching state data:', error);
    }
  };

  useEffect(() => {
    fetchCongressionalTableData();
  }, [stateName]);

  const handleRowClick = (index, district) => {
    setSelectedRow(index);
    handleSelectedDistrict("District " + (++index));
  };

  const handleClearSelection = () => {
    setSelectedRow(null);
    handleSelectedDistrict(null);
  };

  const containerStyle = {
    width: '100%',
    // padding: '1rem',
    // marginLeft: '-25px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  };

  const buttonStyle = {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderRadius: '5px',
  };

  const tableWrapperStyle = {
    maxHeight: '500px',
    overflowY: 'auto',
    border: '1px solid #ddd',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    position: 'sticky',
    top: 0,
    backgroundColor: '#f1f1f1',
    textAlign: 'left',
    padding: '10px',
    border: '1px solid #ddd',
    zIndex: 2,
  };

  const tdStyle = {
    padding: '10px',
    border: '1px solid #ddd',
  };

  const districtColumnStyles = (party) => ({
    backgroundColor: party === 'Democratic' ? '#d0e8ff' : party === 'Republican' ? '#ffe6e6' : 'transparent',
    padding: '10px',
    border: '1px solid #ddd',
  });

  const selectedRowStyles = (party) => ({
    backgroundColor: party === 'Democratic' ? '#d0e8ff' : '#ffe6e6',
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>Congressional Representative Table</h2>
        <button style={buttonStyle} onClick={handleClearSelection}>
          Clear Selection
        </button>
      </div>
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>District</th>
              <th style={thStyle}>Representative</th>
              <th style={thStyle}>Party</th>
              <th style={thStyle}>Racial/Ethnic Group</th>
              <th style={thStyle}>Avg. Household Income</th>
              <th style={thStyle}>% Below Poverty</th>
              <th style={thStyle}>% Rural</th>
              <th style={thStyle}>% Suburban</th>
              <th style={thStyle}>% Urban</th>
              <th style={thStyle}>Vote Margin (D)(%)</th>
              <th style={thStyle}>Vote Margin (R)(%)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((district, index) => (
              <tr
                key={index}
                style={
                  selectedRow === index
                    ? selectedRowStyles(district.winning_party)
                    : {}
                }
                onClick={() => handleRowClick(index, district)}
              >
                <td style={districtColumnStyles(district.winning_party)}>
                  {district.DISTRICTNUM}
                </td>
                <td style={tdStyle}>{district.Representative}</td>
                <td style={tdStyle}>{district.winning_party}</td>
                <td style={tdStyle}>{district.Representative_race}</td>
                <td style={tdStyle}>${district.AVG_INC.toLocaleString()}</td>
                <td style={tdStyle}>{district.Poverty}%</td>
                <td style={tdStyle}>{district.rural_precincts}%</td>
                <td style={tdStyle}>{district.suburban_precincts}%</td>
                <td style={tdStyle}>{district.urban_precincts}%</td>
                <td style={tdStyle}>{district.democratic_votes}%</td>
                <td style={tdStyle}>{district.republican_votes}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
