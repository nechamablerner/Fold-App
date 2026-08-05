import React, { useEffect, useState } from "react";
import {
  getAdminMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../utils/api";
import "./AdminDashboard.css";
import { Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadMenu() {
    const data = await getAdminMenu();

    setItems(
      data.map((item) => ({
        ...item,
        id: item.PK.replace("MENUITEM#", ""),
      })),
    );
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function handleDelete(id) {
    try {
      await deleteMenuItem(id);
      setSaveError(null);
      await loadMenu();
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      // If missing ID token, give a clear message and suggest re-sign-in.
      if (error?.code === "MISSING_ID_TOKEN" || (error?.message || "").startsWith("MISSING_ID_TOKEN")) {
        setSaveError("Admin session missing ID token. Please sign out and sign in again.");
      } else if (error?.status === 403 || error?.message?.toLowerCase?.().includes("forbidden")) {
        setSaveError("You are not authorized to perform this action.");
      } else {
        setSaveError(error?.message || "Unable to delete menu item.");
      }
      throw error;
    }
  }

  async function handleSave(item) {
    try {
      if (item.id) {
        await updateMenuItem(item);
      } else {
        await createMenuItem(item);
      }

      setSaveError(null);
      setEditing(null);
      await loadMenu();
    } catch (error) {
      console.error("Failed to save menu item:", error);
      setSaveError(error?.message || "Unable to save menu item.");
    }
  }

  return (
    <main className="admin">
      <aside className="admin__sidebar">
        <h1 className="admin__logo">FOLD ADMIN</h1>

        <nav>
          <button className="active">Menu</button>
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
                  className="danger trash-button"
                  onClick={() => setDeleteTarget(item)}
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {saveError && (
          <p role="alert" className="admin__error">
            {saveError}
          </p>
        )}

        {editing && (
          <MenuEditor
            item={editing}
            close={() => {
              setSaveError(null);
              setEditing(null);
            }}
            save={handleSave}
          />
        )}
      </section>
      {deleteTarget && (
        <div className="delete-modal">
          <div className="delete-modal__card">
            <h3>Delete Item</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?
            </p>

            <div className="delete-modal__actions">
              <button
                className="delete-modal__cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                className="delete-modal__confirm"
                onClick={async () => {
                  await handleDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MenuEditor({ item, close, save }) {
  const [form, setForm] = useState(item);
  const nameInputRef = React.useRef(null);

  useEffect(() => {
    nameInputRef.current?.focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  return (
    <div className="modal">
      <div
        className="modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-editor-title"
      >
        <h3 id="menu-editor-title">{item.id ? "Edit Item" : "New Item"}</h3>

        <div className="modal__field">
          <label htmlFor="menu-name" className="modal__label">
            Name
          </label>
          <input
            ref={nameInputRef}
            id="menu-name"
            placeholder="Name"
            value={form.name || ""}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />
        </div>

        <div className="modal__field modal__field--full">
          <label htmlFor="menu-description" className="modal__label">
            Description
          </label>
          <textarea
            id="menu-description"
            placeholder="Description"
            value={form.description || ""}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

        <div className="modal__field">
          <label htmlFor="menu-price" className="modal__label">
            Price
          </label>
          <input
            id="menu-price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            value={form.price || ""}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
          />
        </div>

        <div className="modal__field">
          <label htmlFor="menu-category" className="modal__label">
            Category
          </label>
          <input
            id="menu-category"
            placeholder="Category"
            value={form.category || ""}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          />
        </div>

        <div className="modal__field">
          <label htmlFor="menu-emoji" className="modal__label">
            Emoji
          </label>
          <input
            id="menu-emoji"
            placeholder="Emoji"
            value={form.emoji || ""}
            onChange={(e) =>
              setForm({
                ...form,
                emoji: e.target.value,
              })
            }
          />
        </div>

        <div className="modal__field">
          <label htmlFor="menu-tag" className="modal__label">
            Tag
          </label>
          <input
            id="menu-tag"
            placeholder="Tag"
            value={form.tag || ""}
            onChange={(e) =>
              setForm({
                ...form,
                tag: e.target.value,
              })
            }
          />
        </div>

        <div className="modal__actions">
          <button type="button" className="cancel__button" onClick={close}>
            Cancel
          </button>

          <button
            type="button"
            className="admin__button"
            onClick={() => save(form)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
