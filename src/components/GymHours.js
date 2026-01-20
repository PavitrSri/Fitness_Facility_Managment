import React, { useState } from "react";
import "./Gymhours.css";
import hoursImg from "../assets/hours.jpg";

function GymHours() {
  const [showHoliday, setShowHoliday] = useState(false);

  return (
    <div className="hours-container">

      <div className="hours-image">
        <img src={hoursImg} alt="Gym" />
      </div>

      <div className="hours-content">


        <p className="about-text">
          SPOT Fitness is a modern training facility focused on helping members
          reach their goals through strength training, cardio conditioning, and
          guided coaching. Whether you’re just starting out or building on years
          of experience, our space is designed to support every level.
        </p>

        <h3 className="title">Hours of Operation</h3>

<div className="hours">
  <ul>
    <li>Monday - Friday: 6 a.m – 11 p.m</li>
    <li>Saturday - Sunday: 8 a.m – 10 p.m</li>
    <li><em>Holiday hours may differ</em></li>
  </ul>
</div>

        <div
          className="holiday-toggle"
          onClick={() => setShowHoliday(!showHoliday)}
        >
          {showHoliday ? "- Holiday Hours" : "+ Holiday Hours"}
        </div>

        {showHoliday && (
          <ul className="holiday-list">
            <li>New Year’s Day: Closed</li>
            <li>Family Day: 10 a.m. - 10 p.m.</li>
            <li>Good Friday: 10 a.m. - 10 p.m.</li>
            <li>Easter Monday: 10 a.m. - 10 p.m.</li>
            <li>Victoria Day: 10 a.m. - 10 p.m.</li>
            <li>Canada Day: 8 a.m. - 6 p.m.</li>
            <li>New Brunswick Day: 8 a.m. - 6 p.m.</li>
            <li>Labour Day: 8 a.m. - 6 p.m.</li>
            <li>Truth & Reconciliation Day: 4 - 11 p.m.</li>
            <li>Thanksgiving Day: 10 a.m. - 10 p.m.</li>
            <li>Remembrance Day: 2 - 11 p.m.</li>
            <li>Dec 24–26: Closed</li>
            <li>Dec 27–30: 10 a.m. - 10 p.m.</li>
            <li>Dec 31: Closed</li>
          </ul>
        )}

      </div>
    </div>
  );
}

export default GymHours;
