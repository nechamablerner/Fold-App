import "./amplify-config.js"; // <-- Make this the absolute first line in both files!
import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import About from "./components/About";
import Order from "./components/Order";
import Contact from "./components/Contact";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Footer from "./components/Footer";
import { useCart } from "./hooks/useCart";
import { Authenticator } from "@aws-amplify/ui-react"; // [cite: 214]
import "@aws-amplify/ui-react/styles.css";
import { Chatbot } from "./components/Chatbot.jsx";

const NYC_TAX_RATE = 0.08875;

function App() {
  // Cart state is now backed by the real API (GetCart/updateCartItem/deleteFromCart)
  const { cartItems, addToCart, updateQuantity, removeItem, checkout } =
    useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const total = subtotal + subtotal * NYC_TAX_RATE;

  return (
    <Authenticator>
      {(
        { signOut, user }, //
      ) => (
        <div className="App">
          {/* Passed signOut and user down to Navbar so you can handle signout buttons and display usernames there */}
          <Navbar cartItems={cartItems} signOut={signOut} user={user} />{" "}
          {/*  */}
          <Hero />
          <Menu onAddToCart={addToCart} />
          <About />
          <Order />
          <Contact />
          <Cart
            cartItems={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onCheckout={() => setShowCheckout(true)}
          />
          {showCheckout && (
            <Checkout
              total={total}
              onSubmit={checkout}
              onClose={() => setShowCheckout(false)}
            />
          )}
          <Footer />
          <Chatbot />
        </div>
      )}
    </Authenticator> // [cite: 225]
  );
}

export default App;
