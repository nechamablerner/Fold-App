import React from "react";
import "./Contact.css";

const hours = [
  { day: "Monday – Thursday", time: "11:00 AM – 9:00 PM" },
  { day: "Friday", time: "11:00 AM – 3:00 PM" },
  { day: "Saturday", time: "Closed" },
  { day: "Sunday", time: "12:00 PM – 9:00 PM" },
];

const Contact = () => {
  return (
    <section id="contact" className="contact">
      <div className="contact__inner">
        <div className="contact__left">
          <p className="contact__eyebrow">Visit us</p>
          <h2 className="contact__title">Come find us.</h2>
          <p className="contact__address">
            147 Orchard Street
            <br />
            Lower East Side
            <br />
            New York, NY 10002
          </p>

          <div className="contact__hours">
            {hours.map((h, i) => (
              <div key={i} className="contact__hour">
                <span className="contact__day">{h.day}</span>
                <span className="contact__time">{h.time}</span>
              </div>
            ))}
          </div>

          <div className="contact__links">
            <a href="tel:+12125550100" className="contact__link">
              📞 (212) 555-0100
            </a>
            <a href="mailto:hello@eatfold.com" className="contact__link">
              ✉️ hello@eatfold.com
            </a>
          </div>
        </div>

        <div className="contact__right">
          <div className="contact__map-placeholder">
            <div className="contact__map-inner">
              <div className="contact__map-pin">📍</div>
              <p className="contact__map-label">FOLD — Lower East Side</p>
              <p className="contact__map-sub">147 Orchard St, NYC</p>
              <a
                href="https://maps.google.com/?q=147+Orchard+St,+New+York,+NY+10002"
                target="_blank"
                rel="noopener noreferrer"
                className="contact__map-btn"
              >
                Open in Maps →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
