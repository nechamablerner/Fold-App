import React, { useState } from "react";
import "./Order.css";

const Order = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section id="order" className="order">
      <div className="order__inner">
        <div className="order__badge">Now taking online orders</div>
        <h2 className="order__title">
          Ready to fold
          <br />
          something good?
        </h2>
        <p className="order__sub">
          Order ahead for pickup — skip the wait, get your food faster. We'll
          have it ready exactly when you arrive.
        </p>

        <div className="order__channels">
          <a href="#menu" className="order__channel order__channel--primary">
            <span className="order__channel-icon">🛒</span>
            <div>
              <strong>Order Now</strong>
              <span>Fastest pickup, loyalty points</span>
            </div>
            <span className="order__arrow">→</span>
          </a>
        </div>

        <div className="order__divider">
          <span>or get early access to specials</span>
        </div>

        {submitted ? (
          <div className="order__success">
            ✦ You're on the list. We'll be in touch.
          </div>
        ) : (
          <form className="order__form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              className="order__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="order__submit">
              Join the list
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Order;
