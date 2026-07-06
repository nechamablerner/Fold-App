import React from "react";
import "./Cart.css";

const Cart = ({ cartItems = [], onUpdateQuantity, onRemoveItem, onClose }) => {
  // Calculate pricing math
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08875; // NYC Sales Tax (8.875%)
  const total = subtotal + tax;

  return (
    <section id="cart" className="cart">
      <div className="cart__inner">
        <div className="cart__header">
          <p className="cart__eyebrow">Your order</p>
          <h2 className="cart__title">Your Cart</h2>
          {onClose && (
            <button className="cart__close-btn" onClick={onClose}>
              Close ✕
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="cart__empty">
            <span className="cart__empty-icon">🛒</span>
            <p className="cart__empty-text">
              Your cart is feeling a bit light.
            </p>
            <button
              className="cart__btn cart__btn--primary"
              onClick={() =>
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Go browse the menu
            </button>
          </div>
        ) : (
          <div className="cart__content">
            {/* Items List */}
            <div className="cart__items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__visual">
                    <span className="cart-item__emoji">
                      {item.emoji || "🥪"}
                    </span>
                  </div>

                  <div className="cart-item__details">
                    <h3 className="cart-item__name">{item.name}</h3>
                    {item.tag && (
                      <span className="cart-item__tag">{item.tag}</span>
                    )}
                    <span className="cart-item__unit-price">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="cart-item__actions">
                    <div className="cart-item__quantity-selector">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-item__remove"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="cart-item__total-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Summary Panel */}
            <div className="cart__summary">
              <h3 className="cart__summary-title">Summary</h3>

              <div className="cart__summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart__summary-row">
                <span>Estimated Tax (NYC)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="cart__summary-row cart__summary-row--total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button className="cart__btn cart__btn--checkout">
                Proceed to Checkout — ${total.toFixed(2)}
              </button>

              <p className="cart__summary-note">
                ✦ Glatt Kosher verification processed upon packaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;
