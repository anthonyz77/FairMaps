import React from 'react';
import '../styles/App.css';

export default function Legend({ isVisible, legendColor, colors }) {
  if (!isVisible || !colors) return null; 

  if(legendColor === "voting"){
    return(
    <>
        <div className="legend-container">
          <h4>Republican</h4>
          <ul className="legend-list">
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 20%)' }}></span>
                150k+
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 30%)' }}></span>
                125k-150k
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 45%)' }}></span>
                75k-125k
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 60%)' }}></span>
                50k-75k
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 75%)' }}></span>
                25k-50k
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 90%)' }}></span>
                {'>'}25k
              </li>
          </ul>
        </div>
        <div className="legend-container-2">
          <h4>Democratic</h4>
          <ul className="legend-list">
          <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 20%)' }}></span>
                150k+
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 30%)' }}></span>
                125k-150k
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 45%)' }}></span>
                75k-125k
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 60%)' }}></span>
                50k-75k
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 75%)' }}></span>
                25k-50k
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 90%)' }}></span>
                {'>'}25k
              </li>
          </ul>
        </div>
      </>
    );
      
  }
  if(legendColor === "margin"){
    return(
    <>
        <div className="legend-container">
          <h4>Voting Margin Trump</h4>
          <ul className="legend-list">
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 0.00%, 0.00%)' }}></span>
                Tie / No Data
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 20%)' }}></span>
                 {'>'}30%
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 30%)' }}></span>
                15%-30%
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 45%)' }}></span>
                10%-30%
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 60%)' }}></span>
                5%-10%
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 100%, 75%)' }}></span>
                {'<'}5%
              </li>
          </ul>
        </div>
        <div className="legend-container-3">
          <h4>Voting Margin Biden</h4>
          <ul className="legend-list">
          <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(0, 0.00%, 0.00%)' }}></span>
                Tie / No Data
              </li>
          <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 20%)' }}></span>
                {'>'}30%
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 30%)' }}></span>
                15%-30%
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 45%)' }}></span>
                10%-15%
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 60%)' }}></span>
                5%-10%
              </li>
              <li>
                <span className="legend-color" style={{ backgroundColor: 'hsl(240, 100%, 75%)' }}></span>
                {'<'}5%
              </li>
          </ul>
        </div>
      </>
    );
      
  }
  else if(legendColor === "district"){
    return(
      <div className="legend-container">
      <h4>Voting</h4>
      <ul className="legend-list">
        {Object.entries(colors).map(([label, color]) => (
          <li key={label}>
            <span className="legend-color" style={{ backgroundColor: color }}></span>
            {label}
          </li>
        ))}
      </ul>
    </div>
    );
  }
  else{
  return (
    <div className="legend-container">
      <h4>{legendColor.charAt(0).toUpperCase() + legendColor.slice(1)}</h4>
      <ul className="legend-list">
        {Object.entries(colors).map(([label, color]) => (
          <li key={label}>
            <span className="legend-color" style={{ backgroundColor: color }}></span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
}