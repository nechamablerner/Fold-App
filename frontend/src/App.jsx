import "./amplify-config.js"; // Must stay first
import React, { useEffect, useState } from "react";
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
import AdminDashboard from "./components/AdminDashboard";
import { useCart } from "./hooks/useCart";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { fetchAuthSession } from "aws-amplify/auth";
import { Chatbot } from "./components/Chatbot.jsx";

const NYC_TAX_RATE = 0.08875;

/* App only handles authentication.
  user and signOut are passed into the authenticated application. */

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <AuthenticatedApp signOut={signOut} user={user} />
      )}
    </Authenticator>
  );
}

/* Everything that requires an authenticated user lives here. */
function AuthenticatedApp({ signOut, user }) {
  const { cartItems, addToCart, updateQuantity, removeItem, checkout } =
    useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // RBAC state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  /* Check Cognito groups after login.
    If the user belongs to the Admin group:
      isAdmin = true */
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const session = await fetchAuthSession();
        const rawGroups =
          session.tokens?.idToken?.payload?.["cognito:groups"] ?? [];
        const groups = Array.isArray(rawGroups) ? rawGroups : [rawGroups];
        setIsAdmin(
          groups
            .filter(Boolean)
            .map((group) => String(group).trim().toLowerCase())
            .some((group) => group === "admin"),
        );
      } catch (error) {
        console.error("Could not determine admin status:", error);
        setIsAdmin(false);
      } finally {
        setAdminChecked(true);
      }
    }
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const total = subtotal + subtotal * NYC_TAX_RATE;

  return (
    <div className="App">
      {isAdminView ? (
        /* Extra protection:
          Even if someone manually triggers admin view,
          non-admins cannot see the dashboard. */
        isAdmin ? (
          <AdminDashboard onBackToStore={() => setIsAdminView(false)} />
        ) : (
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You do not have permission to view this page.</p>

            <button onClick={() => setIsAdminView(false)}>
              Return to Store
            </button>
          </div>
        )
      ) : (
        <>
          <Navbar
            cartItems={cartItems}
            signOut={signOut}
            user={user}
            isAdmin={isAdmin}
            onOpenAdmin={() => {
              if (isAdmin) {
                setIsAdminView(true);
              }
            }}
          />
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
        </>
      )}
    </div>
  );
}

export default App;
