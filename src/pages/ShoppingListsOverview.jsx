import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MOCK_LISTS } from "../data/shoppingLists";

const CURRENT_USER_ID = "u1";

export default function ShoppingListsOverview() {
    const [lists, setLists] = useState(() => {
        const saved = localStorage.getItem("shoppingLists");

        try {
            const parsed = saved ? JSON.parse(saved) : null;

            // If saved data exists AND is a non-empty array → use it
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }

            // Otherwise → load mock lists and save them
            localStorage.setItem("shoppingLists", JSON.stringify(MOCK_LISTS));
            return MOCK_LISTS;

        } catch (err) {
            // fallback if corrupted storage
            localStorage.setItem("shoppingLists", JSON.stringify(MOCK_LISTS));
            return MOCK_LISTS;
        }
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    // persist changes
    useEffect(() => {
        localStorage.setItem("shoppingLists", JSON.stringify(lists));
    }, [lists]);

    // Create new list
    const handleAddList = () => {
        if (!newListName.trim()) return;

        const newList = {
            id: Date.now().toString(),
            name: newListName.trim(),
            ownerId: CURRENT_USER_ID,
            members: [{ id: CURRENT_USER_ID, name: "Me" }],
            items: [],
            isArchived: false
        };

        setLists(prev => [...prev, newList]);
        setNewListName("");
        setShowAddModal(false);
    };

    // Delete list
    const handleDelete = (id) => {
        setLists(prev => prev.filter(l => l.id !== id));
        setConfirmDeleteId(null);
    };

    // Archive toggle
    const handleArchive = (id) => {
        setLists(prev =>
            prev.map(list =>
                list.id === id && list.ownerId === CURRENT_USER_ID
                    ? { ...list, isArchived: !list.isArchived }
                    : list
            )
        );
    };

    const visibleLists = lists.filter(list =>
        (list.ownerId === CURRENT_USER_ID ||
            list.members.some(m => m.id === CURRENT_USER_ID))
        &&
        (!list.isArchived || showArchived)
    );

    return (
        <div
            style={{
                padding: "2rem",
                color: "white",
                background: "#0b1220",
                minHeight: "100vh",
                fontFamily: "Arial, sans-serif"
            }}
        >
            <h1 style={{ marginBottom: "1rem" }}>My Shopping Lists</h1>

            {/* Toolbar */}
            <div
                style={{
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem"
                }}
            >
                <button
                    style={{
                        padding: "0.6rem 1rem",
                        background: "#2563eb",
                        color: "white",


                    }}
                    onClick={() => setShowAddModal(true)}
                >
                    + New List
                </button>

                <label style={{ color: "#cbd5e1" }}>
                    <input
                        type="checkbox"
                        checked={showArchived}
                        onChange={(e) => setShowArchived(e.target.checked)}
                        style={{ marginRight: "0.4rem" }}
                    />
                    Show archived
                </label>
            </div>

            {/* LIST CARDS */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {visibleLists.map(list => {
                    const isOwner = list.ownerId === CURRENT_USER_ID;

                    return (
                        <div
                            key={list.id}
                            style={{
                                background: "#111a2c",
                                border: "1px solid #1f2a44",
                                padding: "1rem",
                                borderRadius: "12px",
                                width: "230px",
                                position: "relative",
                                textAlign: "center"
                            }}
                        >

                            <Link
                                to={`/list/${list.id}`}
                                style={{
                                    textDecoration: "none",
                                    color: "white"
                                }}
                            >
                                <h3 style={{ marginTop: 0 }}>{list.name}</h3>
                            </Link>

                            <p style={{ color: "#94a3b8", margin: "0.3rem 0 1rem" }}>
                                {list.members.length} members
                            </p>

                            {isOwner && (
                                <button
                                    onClick={() => handleArchive(list.id)}
                                    style={{
                                        background: list.isArchived ? "#16a34a" : "#f59e0b",
                                        color: "white",
                                        padding: "0.4rem 1rem",






                                    }}
                                >
                                    {list.isArchived ? "Restore" : "Archive"}
                                </button>
                            )}

                            {isOwner && (
                                <button
                                    onClick={() => setConfirmDeleteId(list.id)}
                                    style={{
                                        position: "absolute",
                                        top: "6px",
                                        right: "8px",
                                        background: "transparent",
                                        border: "none",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        fontSize: "1.2rem"
                                    }}
                                >
                                    ✖
                                </button>
                            )}
                        </div>
                    );
                })}

                {visibleLists.length === 0 && (
                    <p style={{ color: "#94a3b8" }}>No lists found.</p>
                )}
            </div>

            {/* Add modal */}
            {showAddModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    }}
                >
                    <div
                        style={{
                            background: "#111a2c",
                            border: "1px solid #1f2a44",
                            padding: "20px",
                            borderRadius: "10px",
                            width: "300px",
                            color: "white"
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>Create List</h2>

                        <input
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="List name..."
                            style={{
                                width: "100%",
                                padding: "0.5rem",
                                borderRadius: "6px",
                                border: "1px solid #334155",
                                background: "#0d1730",
                                color: "white",
                                marginBottom: "1rem"
                            }}
                        />

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{
                                    background: "#475569",
                                    color: "white",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAddList}
                                style={{
                                    background: "#2563eb",
                                    color: "white",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer"
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {confirmDeleteId && (
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
                                onClick={() => setConfirmDeleteId(null)}
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
                                onClick={() => handleDelete(confirmDeleteId)}
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
            )}
        </div>
    );
}
