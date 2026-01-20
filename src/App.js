import React, { useState } from "react";
import "./App.css";

import Welcome from "./components/Welcome";
import ViewTrainers from "./components/ViewTrainers";
import GymHours from "./components/GymHours";
import UserManagement from "./components/UserManagement";
import Loyalty from "./components/Loyalty";
import Schedule from "./components/Schedule";
import LoginSignup from "./components/LoginSignup";
import Membership from "./components/membership";
import Admin from "./components/Admin";

import Booking from "./components/Booking";
function App() {
  const [currentView, setCurrentView] = useState("home");

  let content;

  switch (currentView) {
    case "trainers":
      content = <ViewTrainers />;
      break;

    case "schedule":
    content = <Schedule />;
    break;

    case "booking":
      content = <Booking />;
      break;

    case "membership":
      content = <Membership />;
      break;

    case "about":
      content = <GymHours />;
      break;
    case "admin":
      content = <Admin />;
      break;

    case "login":
      content = (
        <LoginSignup onLoginSuccess={(view) => setCurrentView(view)}/>
      );
      break;

    default:
      content = <Welcome setCurrentView={setCurrentView} />;
  }

  return (
    <div className="App">
      <div className="navbar">
        <span className="nav-logo">SPOT Fitness</span>

        <div className="nav-tabs">
          <button onClick={() => setCurrentView("home")}>Home</button>
          <button onClick={() => setCurrentView("trainers")}>Trainers</button>
          <button onClick={() => setCurrentView("schedule")}>Schedule</button>
          <button onClick={() => setCurrentView("booking")}>Booking</button>
          <button onClick={() => setCurrentView("membership")}>Membership</button>
          <button onClick={() => setCurrentView("about")}>About</button>
          <button className="login-btn" onClick={() => setCurrentView("login")}>
            Log In
          </button>
        </div>
      </div>

      <div className="container">{content}</div>
    </div>
  );
}

export default App;
