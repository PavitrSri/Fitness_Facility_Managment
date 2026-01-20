import React, { useEffect, useState } from "react";
import request from "./ConnectBackend";
import Cookies from "js-cookie";
import "./Admin.css";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = Cookies.get("token");

      // Check if admin
      const info = await request("getUser", [token]);
      if (!info || !info.isAdmin) {
        window.location.href = "/login";
        return;
      }

      // Load users
      const list = await request("getAllUsers", [token]);
      if (list) setUsers(list);

      setLoading(false);
    }

    load();
  }, []);

  async function removeMember(email) {
    const token = Cookies.get("token");
    const success = await request("removeUser", [email, token]);

    if (success === true) {
      setUsers(users.filter((u) => u.email !== email));
    } else {
      alert("Couldn't remove this member.");
    }
  }

  function handleLogout() {
    Cookies.remove("token");
    window.location.href = "/login";
  }

  if (loading) return <p>Loading members…</p>;

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

 return (
  <div className="admin">

    <div className="admin-header">
      <h2>SPOT Fitness Members</h2>

      <button className="admin-logout-btn" onClick={handleLogout}>
        Log Out
      </button>
    </div>

    <div className="admin-search-container">
      <input
        type="text"
        className="admin-search-bar"
        placeholder="Search by email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    <div className="admin-members-list">
      {filtered.map((user, index) => (
        <div key={index} className="admin-member-row">
          <div className="admin-member-info">
            <strong>{user.name}</strong>
            <br />
            {user.email}
          </div>

          <button
            className="admin-remove-btn"
            onClick={() => removeMember(user.email)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>

  </div>
);
}
