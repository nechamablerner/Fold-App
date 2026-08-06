import React, { useState, useRef, useEffect } from "react";
import "./Checkout.css";

// Mock payment form — collects fake card details for the demo only.
// No real payment processing happens; onSubmit calls the placeOrder API,
// which is what actually finalizes the order in the backend.
const Checkout = ({ total, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [status, setStatus] = useState("form"); // form | processing | success | error
  const [orderInfo, setOrderInfo] = useState(null);
  const [error, setError] = useState(null);
  const closeButtonRef = useRef(null);

  // Move keyboard focus into the modal when it opens, and let Escape close it,
  // since this is a custom overlay rather than a native <dialog>.
  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const isValid =
    form.name.trim().length > 0 &&
    form.cardNumber.replace(/\s/g, "").length === 16 &&
    /^\d{2}\/\d{2}$/.test(form.expiry) &&
    form.cvc.length === 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || status === "processing") return;

    setStatus("processing");
    try {
      const result = await onSubmit();
      setOrderInfo(result);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="checkout-overlay">
      <div
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        {status === "success" ? (
          <div className="checkout-success" role="status">
            <span className="checkout-success__icon" aria-hidden="true">
              ✅
            </span>
            <h3 id="checkout-title">Order placed!</h3>
            <p className="checkout-success__order">
              Order #{orderInfo?.orderId?.slice(0, 8)}
            </p>
            <p className="checkout-success__total">
              Total: ${orderInfo?.total}
            </p>
            <p className="checkout-note">
              <span aria-hidden="true">✦ </span>
              Demo checkout — no real card was charged.
            </p>
            <button
              className="checkout-btn"
              onClick={onClose}
              ref={closeButtonRef}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="checkout-header">
              <h3 id="checkout-title">Payment</h3>
              <button
                type="button"
                className="checkout-close"
                onClick={onClose}
                aria-label="Close"
                ref={closeButtonRef}
              >
                ✕
              </button>
            </div>

            <p className="checkout-note">
              <span aria-hidden="true">✦ </span>
              Demo checkout — enter any values, no real payment is processed.
            </p>

            <form onSubmit={handleSubmit} className="checkout-form">
              <label>
                Name on card
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  autoComplete="cc-name"
                />
              </label>

              <label>
                Card number
                <input
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={handleChange}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  autoComplete="cc-number"
                  inputMode="numeric"
                />
              </label>

              <div className="checkout-form-row">
                <label>
                  Expiry
                  <input
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    autoComplete="cc-exp"
                  />
                </label>
                <label>
                  CVC
                  <input
                    name="cvc"
                    value={form.cvc}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength={3}
                    autoComplete="cc-csc"
                    inputMode="numeric"
                  />
                </label>
              </div>

              {status === "error" && (
                <p className="checkout-error" role="alert">
                  Payment failed: {error}
                </p>
              )}

              <button
                type="submit"
                className="checkout-btn"
                disabled={!isValid || status === "processing"}
              >
                {status === "processing"
                  ? "Processing..."
                  : `Pay $${total.toFixed(2)}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
