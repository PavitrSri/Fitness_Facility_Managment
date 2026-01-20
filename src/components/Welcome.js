import React from "react";
import mainPic from "../assets/main.jpg";
import ReviewDisplay from "./ReviewDisplay.js";

function Welcome({ setCurrentView }) {
  return (
    <div>
      <img
        src={mainPic}
        alt="Gym"
        style={{
          width: "100%",
          maxHeight: "350px",
          objectFit: "cover",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      />

      <h2>Welcome to Spot Fitness</h2>
      <p>Your journey to a stronger, healthier lifestyle starts today.</p>
      <ReviewDisplay />
    </div>
  );
}

export default Welcome;
