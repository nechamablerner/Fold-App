import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">FOLD</span>
          <p className="footer__tagline">
            Handcrafted sandwiches & wraps.
            <br />
            Lower East Side, NYC.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>Explore</h4>
            <ul>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("menu")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("about")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Visit Us
                </button>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>Order</h4>
            <ul>
              <li>
                <a href="#order">App Pickup</a>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>Social</h4>
            <ul>
              <li>
                <a href="#footer">Instagram</a>
              </li>
              <li>
                <a href="#footer">TikTok</a>
              </li>
              <li>
                <a href="#footer">Twitter / X</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© 2026 FOLD NYC. All rights reserved.</span>
        <span>
          Glatt Kosher · Shomer Shabbat · Under Strict Rabbinical Supervision
        </span>
      </div>
    </footer>
  );
};

export default Footer;
