import React, { useState } from "react";
import { menuItems, tagColors } from "../data/menuData";
import "./Menu.css";

const MenuItem = ({ item }) => {
  const tag = tagColors[item.tag];
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
  const [activeTab, setActiveTab] = useState("sandwiches");

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

        <div className="menu__tabs">
          <button
            className={`menu__tab ${activeTab === "sandwiches" ? "menu__tab--active" : ""}`}
            onClick={() => setActiveTab("sandwiches")}
          >
            Sandwiches
          </button>
          <button
            className={`menu__tab ${activeTab === "wraps" ? "menu__tab--active" : ""}`}
            onClick={() => setActiveTab("wraps")}
          >
            Wraps
          </button>
        </div>

        <div className="menu__grid">
          {menuItems[activeTab].map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>

        <p className="menu__note">
          ✦ All items can be made gluten-free upon request. Ask about seasonal specials.
        </p>
      </div>
    </section>
  );
};

export default Menu;
