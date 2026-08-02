import React, { useState, useEffect } from "react";
import "./Navbar.css";

// Added signOut and user to the destructive props list
const Navbar = ({ cartItems = [], signOut, user, isAdmin, onOpenAdmin }) => {
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

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

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

          {/* Welcome Message displaying user email/login ID */}
          {user?.signInDetails?.loginId && (
            <li className="navbar__welcome">
              <span>Welcome, {user.signInDetails.loginId}!</span>{" "}
              {/* [cite: 221] */}
            </li>
          )}

          {isAdmin && (
            <li>
              <button
                className="navbar__admin"
                onClick={onOpenAdmin}
                type="button"
              >
                Dashboard
              </button>
            </li>
          )}

          <li>
            <button
              className="navbar__cta"
              onClick={() => scrollTo("cart")}
              aria-label={`Cart, ${cartItemCount} item${cartItemCount === 1 ? "" : "s"}`}
            >
              <span aria-hidden="true">🛒 Cart ({cartItemCount})</span>
            </button>
          </li>

          {/* Sign Out Button */}
          <li>
            <button className="navbar__signout" onClick={signOut}>
              Sign Out {/* [cite: 222] */}
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
