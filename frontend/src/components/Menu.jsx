import React, { useState, useEffect, useMemo } from "react";
import { tagColors } from "../data/TagColors";
import "./Menu.css";

const MenuItem = ({ item }) => {
  const tag = tagColors?.[item.tag];

  return (
    <div className="menu-item">
      <div className="menu-item__top">
        <div className="menu-item__emoji">{item.emoji}</div>

        {item.tag && (
          <span
            className="menu-item__tag"
            style={{ background: tag?.bg, color: tag?.text }}
          >
            {item.tag}
          </span>
        )}
      </div>

      <h3 className="menu-item__name">{item.name}</h3>
      <p className="menu-item__desc">{item.description}</p>

      <div className="menu-item__footer">
        <span className="menu-item__price">${item.price}</span>
        <button className="menu-item__add">Add to order +</button>
      </div>
    </div>
  );
};

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState("sandwiches");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          "https://47o3metume.execute-api.us-east-1.amazonaws.com/menu",
        );

        if (!res.ok) throw new Error("Failed to fetch menu");

        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // filter items by category (sandwiches / wraps)
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => item.category === activeTab);
  }, [menuItems, activeTab]);

  if (loading) {
    return <p className="menu__loading">Loading menu...</p>;
  }

  if (error) {
    return <p className="menu__error">Error: {error}</p>;
  }

  return (
    <section id="menu" className="menu">
      <div className="menu__inner">
        <div className="menu__header">
          <p className="menu__eyebrow">What we do</p>
          <h2 className="menu__title">The Menu</h2>
          <p className="menu__subtitle">
            Everything made to order. Bread baked in-house. No shortcuts.
          </p>
        </div>

        {/* Tabs */}
        <div className="menu__tabs">
          <button
            className={`menu__tab ${
              activeTab === "sandwiches" ? "menu__tab--active" : ""
            }`}
            onClick={() => setActiveTab("sandwiches")}
          >
            Sandwiches
          </button>

          <button
            className={`menu__tab ${
              activeTab === "wraps" ? "menu__tab--active" : ""
            }`}
            onClick={() => setActiveTab("wraps")}
          >
            Wraps
          </button>
        </div>

        {/* Grid */}
        <div className="menu__grid">
          {filteredItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>

        <p className="menu__note">
          ✦ All items are 100% Glatt Kosher. Gluten-free options available upon
          request.
        </p>
      </div>
    </section>
  );
};

export default Menu;
