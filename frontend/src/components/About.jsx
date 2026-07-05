import React from "react";
import "./About.css";

const stats = [
  { value: "5+", label: "Years in NYC" },
  { value: "40+", label: "Ingredients sourced locally" },
  { value: "3", label: "Bread types baked daily" },
  { value: "★ 4.9", label: "On Google" },
];

const About = () => {
  return (
    <section id="about" className="about">
      <div className="about__inner">
        <div className="about__left">
          <p className="about__eyebrow">Our story</p>
          <h2 className="about__title">
            Built on the<br />
            <em>obsession</em><br />
            with a good fold.
          </h2>
          <p className="about__body">
            FOLD started in 2019 out of a tiny Lower East Side kitchen with one rule: 
            no filler, no shortcuts. Every sandwich is built around a single great 
            ingredient — the bread, a house-cured meat, a ferment — and everything 
            else amplifies it.
          </p>
          <p className="about__body">
            We source from farms within 200 miles, bake our own loaves each morning, 
            and refuse to serve anything that doesn't earn its place on the plate. 
            It's not fast food. It's food worth waiting for.
          </p>
          <button
            className="about__btn"
            onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
          >
            See what we're making today →
          </button>
        </div>

        <div className="about__right">
          <div className="about__visual">
            <div className="about__visual-card about__visual-card--top">
              <span className="about__visual-icon">🌾</span>
              <p>House-baked bread, every morning</p>
            </div>
            <div className="about__visual-bg">
              <div className="about__visual-circle" />
              <span className="about__visual-center">FOLD</span>
            </div>
            <div className="about__visual-card about__visual-card--bottom">
              <span className="about__visual-icon">🥬</span>
              <p>Local farms, seasonal ingredients</p>
            </div>
          </div>
        </div>
      </div>

      <div className="about__stats">
        {stats.map((s, i) => (
          <div key={i} className="about__stat">
            <span className="about__stat-value">{s.value}</span>
            <span className="about__stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;
