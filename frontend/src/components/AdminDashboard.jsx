import { useEffect, useState } from "react";
// import {
//   getAdminMenu,
//   createMenuItem,
//   updateMenuItem,
//   deleteMenuItem,
// } from "../api/adminApi";

import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  async function loadMenu() {
    const data = await getAdminMenu();
    setItems(data);
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function handleDelete(id) {
    await deleteMenuItem(id);
    loadMenu();
  }

  async function handleSave(item) {
    // if (item.id) {
    //   await updateMenuItem(item);
    // } else {
    //   await createMenuItem(item);
    // }

    setEditing(null);
    loadMenu();
  }

  return (
    <main className="admin">
      <aside className="admin__sidebar">
        <h1 className="admin__logo">FOLD ADMIN</h1>

        <nav>
          <button className="active">Menu</button>

          <button>Orders</button>

          <button>Users</button>
        </nav>
      </aside>

      <section className="admin__content">
        <a href="/" className="admin__back">
          ← Back to Website
        </a>
        <header className="admin__header">
          <div>
            <h2>Menu Management</h2>

            <p>Create, update, and remove menu items.</p>
          </div>

          <button className="admin__button" onClick={() => setEditing({})}>
            + Add Item
          </button>
        </header>

        <div className="admin__table">
          <div className="admin__row admin__row--head">
            <span>Name</span>
            <span>Price</span>
            <span>Category</span>
            <span>Actions</span>
          </div>

          {items.map((item) => (
            <div className="admin__row" key={item.id}>
              <span>{item.name}</span>

              <span>${item.price}</span>

              <span>{item.category}</span>

              <div className="admin__actions">
                <button onClick={() => setEditing(item)}>Edit</button>

                <button
                  className="danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <MenuEditor
            item={editing}
            close={() => setEditing(null)}
            save={handleSave}
          />
        )}
      </section>
    </main>
  );
}

function MenuEditor({ item, close, save }) {
  const [form, setForm] = useState(item);

  return (
    <div className="modal">
      <div className="modal__card">
        <h3>{item.id ? "Edit Item" : "New Item"}</h3>

        <input
          placeholder="Name"
          value={form.name || ""}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          placeholder="Price"
          value={form.price || ""}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value,
            })
          }
        />

        <input
          placeholder="Category"
          value={form.category || ""}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
        />

        <div className="modal__actions">
          <button className="cancel__button" onClick={close}>
            Cancel
          </button>

          <button className="admin__button" onClick={() => save(form)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
