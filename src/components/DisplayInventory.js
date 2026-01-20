import React, { useState, useEffect } from 'react';
import './DisplayInventory.css';

function DisplayInventory({ onBack }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/inventory.csv')
      .then(response => response.text())
      .then(text => {
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          return obj;
        });
        setData(data);
      });
  }, []);

  return (
    <div className="inventory-page">
      <button onClick={onBack} className="back-button">Back</button>
      <h1>Inventory</h1>

      <div className="items-container">
        {data.map((item, index) => (
          <div key={index} className="item-card">
            {Object.entries(item).map(([key, value]) => (
              <div key={key} className="item-field">
                <strong>{key}: </strong> {value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DisplayInventory;
