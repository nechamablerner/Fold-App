import React from "react";
import "./AdminDashboard.css";

const AdminDashboard = ({ onBackToStore }) => {
  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard__card">
        <p className="admin-dashboard__eyebrow">Admin Portal</p>
        <h1>Dashboard</h1>
        <p>
          Manage menu items, orders, and store operations from one place.
        </p>
        <button className="admin-dashboard__button" onClick={onBackToStore}>
          Back to Storefront
        </button>
      </section>
    </main>
  );
};

export default AdminDashboard;
