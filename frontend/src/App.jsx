import React, { useState } from "react"; // 1. Added useState here
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import About from "./components/About";
import Order from "./components/Order";
import Contact from "./components/Contact";
import Cart from "./components/Cart"; // 2. Imported your new Cart component
import Footer from "./components/Footer";

function App() {
  // 3. Create the cart state (empty array, perfect for your upcoming API)
  const [cartItems, setCartItems] = useState([]);

  // 4. Logic to change item quantities inside the cart
  const handleUpdateQuantity = (id, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  // 5. Logic to remove an item completely
  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="App">
      {/* 6. Passed cartItems down so the Navbar counter functions cleanly */}
      <Navbar cartItems={cartItems} />
      <Hero />
      <Menu />
      <About />
      <Order />
      <Contact />

      {/* 7. Added the Cart page section right before the footer */}
      <Cart
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <Footer />
    </div>
  );
}

export default App;
