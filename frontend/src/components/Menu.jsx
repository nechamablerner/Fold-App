import React, { useState, useEffect, useMemo } from "react";
import { tagColors } from "../data/TagColors";
import { getMenu } from "../utils/api";
import "./Menu.css";

const MenuItem = ({ item, onAdd }) => {
  const tag = tagColors?.[item.tag];

  return (
    <div className="menu-item">
      <div className="menu-item__top">
        <div className="menu-item__emoji" aria-hidden="true">
          {item.emoji}
        </div>

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
        <button
          className="menu-item__add"
          onClick={() => onAdd(item)}
          aria-label={`Add ${item.name} to order`}
        >
          Add to order +
        </button>
      </div>
    </div>
  );
};

const Menu = ({ onAddToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState("sandwiches");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const data = await getMenu();
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
    return (
      <p className="menu__loading" role="status">
        Loading menu...
      </p>
    );
  }

  if (error) {
    return (
      <p className="menu__error" role="alert">
        Error: {error}
      </p>
    );
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
        <div className="menu__tabs" role="tablist" aria-label="Menu categories">
          <button
            className={`menu__tab ${
              activeTab === "sandwiches" ? "menu__tab--active" : ""
            }`}
            onClick={() => setActiveTab("sandwiches")}
            role="tab"
            aria-selected={activeTab === "sandwiches"}
          >
            Sandwiches
          </button>

          <button
            className={`menu__tab ${
              activeTab === "wraps" ? "menu__tab--active" : ""
            }`}
            onClick={() => setActiveTab("wraps")}
            role="tab"
            aria-selected={activeTab === "wraps"}
          >
            Wraps
          </button>
        </div>

        {/* Grid */}
        <div className="menu__grid">
          {filteredItems.map((item) => (
            <MenuItem key={item.PK} item={item} onAdd={onAddToCart} />
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
