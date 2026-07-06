import React, { useState, useEffect } from "react";
import "./Navbar.css";

const Navbar = ({ cartItems = [] }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        <button className="navbar__logo" onClick={() => scrollTo("hero")}>
          FOLD
        </button>

        <ul
          className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}
        >
          <li>
            <button onClick={() => scrollTo("menu")}>Menu</button>
          </li>
          <li>
            <button onClick={() => scrollTo("about")}>Our Story</button>
          </li>
          <li>
            <button onClick={() => scrollTo("contact")}>Visit Us</button>
          </li>
          {/* <li>
            <button className="navbar__cta" onClick={() => scrollTo("order")}>
              Order Now
            </button>
          </li> */}
          <li>
            <button className="navbar__cta" onClick={() => scrollTo("cart")}>
              🛒 Cart ({cartItems.length})
            </button>
          </li>
        </ul>

        <button
          className={`navbar__burger ${menuOpen ? "navbar__burger--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
