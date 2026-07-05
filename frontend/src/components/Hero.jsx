import React from "react";
import "./Hero.css";

const Hero = () => {
  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToOrder = () => {
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="hero">
      <div className="hero__bg-text" aria-hidden="true">FOLD</div>

      <div className="hero__content">
        <p className="hero__eyebrow">Handcrafted in NYC since 2019</p>
        <h1 className="hero__headline">
          Every fold tells<br />
          <span className="hero__headline--accent">a story.</span>
        </h1>
        <p className="hero__sub">
          Sandwiches and wraps built with intention — from charcoal sourdough to
          hand-pressed lavash, topped with ingredients you'll actually remember.
        </p>
        <div className="hero__actions">
          <button className="hero__btn hero__btn--primary" onClick={scrollToOrder}>
            Order for pickup
          </button>
          <button className="hero__btn hero__btn--ghost" onClick={scrollToMenu}>
            See the menu ↓
          </button>
        </div>
      </div>

      <div className="hero__marquee" aria-hidden="true">
        <div className="hero__marquee-track">
          {[...Array(3)].map((_, i) => (
            <span key={i}>
              SANDWICHES &nbsp;·&nbsp; WRAPS &nbsp;·&nbsp; FRESH DAILY &nbsp;·&nbsp; NYC &nbsp;·&nbsp;
              SMOKED &nbsp;·&nbsp; PRESSED &nbsp;·&nbsp; FOLDED &nbsp;·&nbsp; CRAFTED &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <div className="hero__scroll-line" />
        <span>scroll</span>
      </div>
    </section>
  );
};

export default Hero;
