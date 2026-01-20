import React, { useEffect, useState } from "react";
import { MembershipManager } from "./MembershipManager";
import "./membership.css";
import Loyalty from "./Loyalty";

const membershipManager = new MembershipManager();

export default function MembershipSidebar() {
  const [isMember, setIsMember] = useState(null);

  useEffect(() => {
    async function load() {
      const status = await membershipManager.checkMembershipStatus();
      setIsMember(status);
    }
    load();
  }, []);

  async function enroll() {
    await membershipManager.enrollMember();
    setIsMember(true);
  }

  return (
    <div className="membership-sidebar">
      <h3>Membership</h3>

      <Loyalty/>
      {isMember === null && <p>Checking...</p>}
      {isMember === false && <p>You’re not a member yet.</p>}
      {isMember === true && <p>You’re a member! 🎉</p>}

      {!isMember && (
        <button className="sidebar-btn" onClick={enroll}>
          Join Now
        </button>
      )}

      <hr />

      <h4>Perks</h4>
      <ul className="perks-list">
        <li>Early access to events</li>
        <li>Discounted tickets</li>
        <li>Exclusive giveaways</li>
        <li>Priority workshop registration</li>
      </ul>
    </div>
  );
}
