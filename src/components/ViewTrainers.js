import React from "react";
import "./ViewTrainers.css";
import request from "./ConnectBackend.js";

function ViewTrainers({ onBack }) {
  getStaff();

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Back</button>

      <h2>Our Trainers</h2>

      <div id="trainer-list" className="trainer-grid"/>
    </div>
  );
}

async function getStaff() {
	const trainers = await request("getStaff", null);
	const display = document.getElementById("trainer-list");
	display.innerHTML = "";
	trainers.map((trainer, index) => (
		display.innerHTML += `
		  <div key=${index} className="trainer-card">
		    <strong>${trainer.name}</strong>
		    <p>${trainer.title}</p>
		    <p>${trainer.description}</p>
		  </div>
		`
	));
}
	

export default ViewTrainers;
