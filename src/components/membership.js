import React, { useEffect, useState } from "react";
import { MembershipManager } from "./MembershipManager";
import "./membership.css";
import Loyalty from "./Loyalty";
import gymImage from "../assets/member.jpg";


const membershipManager = new MembershipManager();

export default function Membership() {
  const [status, setStatus] = useState("Checking...");
  const [isMember, setIsMember] = useState(false); // default false

  // Check membership status every time the component mounts
  useEffect(() => {
    async function loadStatus() {
      try {
        const member = await membershipManager.checkMembershipStatus();
        setIsMember(member);
        setStatus(member ? "You are already a member." : "You are not a member yet.");
      } catch (err) {
        console.error("Failed to fetch membership status:", err);
        setStatus("Unable to check membership status.");
      }
    }
    loadStatus();
  }, []); // only runs once on mount

  // Handle enrollment
  async function handleEnroll() {
    try {
      await membershipManager.enrollMember();
      // Immediately re-check status from backend to ensure it's persisted
      const member = await membershipManager.checkMembershipStatus();
      setIsMember(member);
      setStatus(member ? "Enrollment successful! You are now a member." : "Enrollment failed.");
    } catch (err) {
      console.error("Enrollment failed:", err);
      setStatus("Enrollment failed. Please try again.");
    }
  }

  return (
    
    <div className="membership-layout"> {/*CSS changes - TAskina*/}
      <img
        className="member-image"
        src={gymImage}
        alt="Gym img"
      />

      
      <div className="membership-text">
        <h1 className="membership-title">Become a Member Today!</h1>
        <p className="membership-subtext">
          Unlock exclusive benefits, premium access, and priority registration.
        </p>
      </div>

      <div className="membership-card">
        <h2 className="plan-title">Annual Membership</h2>
        <p className="plan-price">$49.99 / year</p>
        <Loyalty/>

        <ul className="perks-list">
          <li>✔ Early access to events</li>
          <li>✔ Discounted tickets</li>
          <li>✔ Exclusive giveaways</li>
          <li>✔ Priority workshop registration</li>
        </ul>

        <p className="current-status">
          <strong>Status:</strong> {status}
        </p>

        {!isMember && (
          <button className="join-btn" onClick={handleEnroll}>
            Join Now
          </button>
        )}

        {isMember && (
          <p className="member-confirmation">🎉 You're already a member!</p>
        )}

      </div>
      

    </div>
  );
}
