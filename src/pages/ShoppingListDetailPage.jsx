import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CURRENT_USER_ID = "u1";

export default function ShoppingListDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [list, setList] = useState(null);
    const [error, setError] = useState(null);

    const [newItemText, setNewItemText] = useState("");
    const [newMemberName, setNewMemberName] = useState("");

    const [filter, setFilter] = useState("all");

    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState("");

    const [confirmAction, setConfirmAction] = useState(null);

    const ConfirmPopup = ({ open, onCancel, onConfirm }) => {
        if (!open) return null;

        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}
            >
                <div
                    style={{
                        background: "#111a2c",
                        padding: "20px",
                        borderRadius: "8px",
                        width: "280px",
                        color: "white",
                        border: "1px solid #1f2a44"
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
                    <p>Are you sure?</p>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                            marginTop: "15px"
                        }}
                    >
                        <button
                            onClick={onCancel}
                            style={{
                                background: "#475569",
                                border: "none",
                                color: "white",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onConfirm}
                            style={{
                                background: "#ef4444",
                                border: "none",
                                color: "white",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ---------------------------------------------------------
    // LOAD LIST
    // ---------------------------------------------------------
    useEffect(() => {
        const stored = localStorage.getItem("shoppingLists");
        if (!stored) {
            setError("No shopping lists found.");
            return;
        }

        const allLists = JSON.parse(stored);

        const found = allLists.find((l) => l.id === id);
        if (!found) {
            setError("List not found.");
            return;
        }

        // Ensure items & members arrays exist
        found.items = found.items || [];
        found.members = found.members || [];

        setList(found);
    }, [id]);

    const updateList = (updated) => {
        const all = JSON.parse(localStorage.getItem("shoppingLists")) || [];

        const updatedLists = all.map((l) =>
            l.id === updated.id ? updated : l
        );

        localStorage.setItem("shoppingLists", JSON.stringify(updatedLists));
        setList(updated);
    };

    // ---------------------------------------------------------
    // ERROR / LOADING
    // ---------------------------------------------------------
    if (error) {
        return (
            <div style={{ color: "white", padding: "2rem" }}>
                <h1>{error}</h1>
                <button
                    onClick={() => navigate("/")}
                    style={{ background: "#2563eb", color: "white", padding: "0.5rem 1rem" }}
                >
                    ← Back
                </button>
            </div>
        );
    }

    if (!list) {
        return (
            <div style={{ color: "white", padding: "2rem" }}>
                <p>Loading...</p>
            </div>
        );
    }

    const isOwner = list.ownerId === CURRENT_USER_ID;
    const isMember = list.members.some((m) => m.id === CURRENT_USER_ID);

    // ---------------------------------------------------------
    // ITEM ACTIONS
    // ---------------------------------------------------------
    const toggleResolved = (itemId) => {
        if (!isMember) return; // prevent non-members

        const updatedItems = list.items.map((i) =>
            i.id === itemId ? { ...i, isResolved: !i.isResolved } : i
        );

        updateList({ ...list, items: updatedItems });
    };

    const addItem = (text) => {
        if (!isMember) return;

        const newItem = {
            id: Date.now().toString(),
            text,
            isResolved: false,
            createdBy: CURRENT_USER_ID
        };

        updateList({ ...list, items: [...list.items, newItem] });
    };

    const deleteItem = (itemId) => {
        if (!isMember) return;

        const updated = list.items.filter((i) => i.id !== itemId);
        updateList({ ...list, items: updated });
    };

    // ---------------------------------------------------------
    // MEMBER ACTIONS
    // ---------------------------------------------------------
    const addMember = () => {
        if (!isOwner) return;

        const trimmed = newMemberName.trim();
        if (!trimmed) return;

        const exists = list.members.some(
            (m) => m.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) return;

        const newMember = { id: "u_" + Date.now().toString(), name: trimmed };
        updateList({ ...list, members: [...list.members, newMember] });
        setNewMemberName("");
    };

    const removeMember = (memberId) => {
        if (!isOwner) return;
        if (memberId === list.ownerId) return;

        const updatedMembers = list.members.filter((m) => m.id !== memberId);
        updateList({ ...list, members: updatedMembers });
    };

    const leaveList = () => {
        if (!isMember) return;

        const updatedMembers = list.members.filter(
            (m) => m.id !== CURRENT_USER_ID
        );

        updateList({ ...list, members: updatedMembers });

        navigate("/");
    };

    const deleteList = () => {
        const all = JSON.parse(localStorage.getItem("shoppingLists")) || [];
        const filtered = all.filter((l) => l.id !== list.id);

        localStorage.setItem("shoppingLists", JSON.stringify(filtered));
        navigate("/");
    };

    // ---------------------------------------------------------
    // FILTER ITEMS
    // ---------------------------------------------------------
    const filteredItems = list.items.filter((item) => {
        if (filter === "all") return true;
        if (filter === "resolved") return item.isResolved;
        if (filter === "unresolved") return !item.isResolved;
        return true;
    });

    // ---------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------
    return (
        <div style={{ padding: "2rem", color: "white" }}>
            <button
                onClick={() => navigate("/")}
                style={{ background: "#475569", color: "white", padding: "0.4rem 0.8rem" }}
            >
                ← Back
            </button>

            <h1>{list.name} </h1>
            {/* Rename */}
            {isOwner && (
                <div style={{ margin: "1.5rem 0" }}>
                    {!isRenaming && (
                        <button
                            onClick={() => {
                                setRenameValue(list.name);
                                setIsRenaming(true);
                            }}
                            style={{
                                background: "#2563eb",
                                padding: "0.4rem 0.8rem",
                                color: "white"
                            }}
                        >
                            ✍ Rename List
                        </button>
                    )}

                    {isRenaming && (
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <input
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                style={{
                                    background: "#2d2d3a",
                                    color: "white",
                                    padding: "0.4rem 0.8rem"
                                }}
                            />

                            <button
                                onClick={() => {
                                    if (renameValue.trim()) {
                                        updateList({ ...list, name: renameValue.trim() });
                                    }
                                    setIsRenaming(false);
                                }}
                                style={{
                                    background: "#16a34a",
                                    padding: "0.4rem 0.8rem",
                                    color: "white"
                                }}
                            >
                                Save
                            </button>

                            <button
                                onClick={() => setIsRenaming(false)}
                                style={{
                                    background: "#ef4444",
                                    padding: "0.4rem 0.8rem",
                                    color: "white"
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
            <p>
                <strong>Owner:</strong>{" "}
                {isOwner ? "You" : list.members.find((m) => m.id === list.ownerId)?.name || "Friend"}
            </p>

            {/* Members */}
            <h3>Members</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {list.members.map((m) => (
                    <li
                        key={m.id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                            maxWidth: "300px"
                        }}
                    >
                        <span>
                            {m.name}
                            {m.id === CURRENT_USER_ID && " (you)"}
                            {m.id === list.ownerId && " (owner)"}
                        </span>

                        {isOwner && m.id !== list.ownerId && (
                            <button
                                onClick={() =>
                                    setConfirmAction({ type: "member", targetId: m.id })
                                }
                                style={{
                                    background: "#e55555",
                                    padding: "0.4rem 0.8rem",
                                    color: "white"
                                }}
                            >
                                Remove
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {isOwner && (
                <div style={{ marginBottom: "1rem" }}>
                    <input
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="New member..."
                        style={{
                            background: "#2d2d3a",
                            color: "white",
                            padding: "0.4rem",
                            marginRight: "0.5rem"
                        }}
                    />
                    <button
                        onClick={addMember}
                        style={{ background: "#2563eb", color: "white", padding: "0.4rem 0.8rem" }}
                    >
                        Add
                    </button>
                </div>
            )}

            {!isOwner && isMember && (
                <button
                    onClick={leaveList}
                    style={{
                        background: "#f59e0b",
                        padding: "0.4rem 0.8rem",
                        marginBottom: "1rem"
                    }}
                >
                    Leave list
                </button>
            )}



            {/* ITEMS */}
            <h2>Items</h2>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <button
                    onClick={() => setFilter("all")}
                    style={{
                        background: filter === "all" ? "#2563eb" : "#475569",
                        padding: "0.4rem 0.8rem",
                        color: "white"
                    }}
                >
                    All
                </button>

                <button
                    onClick={() => setFilter("unresolved")}
                    style={{
                        background: filter === "unresolved" ? "#2563eb" : "#475569",
                        padding: "0.4rem 0.8rem",
                        color: "white"
                    }}
                >
                    Unresolved
                </button>

                <button
                    onClick={() => setFilter("resolved")}
                    style={{
                        background: filter === "resolved" ? "#2563eb" : "#475569",
                        padding: "0.4rem 0.8rem",
                        color: "white"
                    }}
                >
                    Resolved
                </button>
            </div>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {filteredItems.map((item) => (
                    <li
                        key={item.id}
                        style={{
                            background: "#2d2d3a",
                            padding: "0.5rem",
                            marginBottom: "0.5rem",
                            borderRadius: "4px",
                            display: "flex",
                            justifyContent: "space-between"
                        }}
                    >
                        <span
                            style={{
                                textDecoration: item.isResolved ? "line-through" : "none"
                            }}
                        >
                            {item.text}
                        </span>

                        {isMember && (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    onClick={() => toggleResolved(item.id)}
                                    style={{
                                        background: item.isResolved ? "#38bdf8" : "#22c55e",
                                        color: "white",
                                        padding: "0.3rem 0.6rem"
                                    }}
                                >
                                    {item.isResolved ? "Undo" : "Resolve"}
                                </button>

                                <button
                                    onClick={() =>
                                        setConfirmAction({ type: "item", targetId: item.id })
                                    }
                                    style={{
                                        background: "#ef4444",
                                        color: "white",
                                        padding: "0.3rem 0.6rem"
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {/* Add item (only members) */}
            {isMember && (
                <div style={{ marginTop: "1rem" }}>
                    <input
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="Add item..."
                        style={{
                            background: "#2d2d3a",
                            color: "white",
                            padding: "0.4rem",
                            marginRight: "0.5rem"
                        }}
                    />
                    <button
                        onClick={() => {
                            if (newItemText.trim()) {
                                addItem(newItemText);
                                setNewItemText("");
                            }
                        }}
                        style={{
                            background: "#2563eb",
                            color: "white",
                            padding: "0.4rem 0.8rem"
                        }}
                    >
                        Add
                    </button>
                </div>
            )}

            {isOwner && (
                <button
                    onClick={() => setConfirmAction({ type: "list" })}
                    style={{
                        background: "#d14b4b",
                        padding: "0.4rem 0.8rem",
                        color: "white",
                        marginTop: "2rem"
                    }}
                >
                    Delete list
                </button>
            )}

            <ConfirmPopup
                open={!!confirmAction}
                onCancel={() => setConfirmAction(null)}
                onConfirm={() => {
                    if (confirmAction.type === "member") {
                        removeMember(confirmAction.targetId);
                    } else if (confirmAction.type === "item") {
                        deleteItem(confirmAction.targetId);
                    } else if (confirmAction.type === "list") {
                        deleteList();
                    }
                    setConfirmAction(null);
                }}
            />
        </div>
    );
}
