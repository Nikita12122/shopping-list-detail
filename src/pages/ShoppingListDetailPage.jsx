import React, { useState } from "react";
import { MOCK_LIST } from "../data/mockList";

export default function ShoppingListDetailPage() {
    const [list, setList] = useState(MOCK_LIST);
    const [showResolved, setShowResolved] = useState(false);
    const [newItem, setNewItem] = useState("");

    const isOwner = list.currentUserId === list.ownerId;

    const handleAddItem = () => {
        if (!newItem.trim()) return;
        const newItemObj = {
            id: Date.now().toString(),
            text: newItem,
            isResolved: false,
            createdBy: list.currentUserId,
        };
        setList({ ...list, items: [...list.items, newItemObj] });
        setNewItem("");
    };

    const handleToggleItem = (itemId) => {
        setList({
            ...list,
            items: list.items.map((it) =>
                it.id === itemId ? { ...it, isResolved: !it.isResolved } : it
            ),
        });
    };

    const handleDeleteItem = (itemId) => {
        setList({ ...list, items: list.items.filter((it) => it.id !== itemId) });
    };

    const handleRenameList = (e) => {
        if (!isOwner) return;
        setList({ ...list, name: e.target.value });
    };

    const visibleItems = showResolved
        ? list.items
        : list.items.filter((i) => !i.isResolved);

    return (
        <div style={{ color: "white", padding: "2rem", maxWidth: "600px" }}>
            <h1>
                {isOwner ? (
                    <input
                        value={list.name}
                        onChange={handleRenameList}
                        style={{
                            fontSize: "1.5rem",
                            background: "transparent",
                            border: "1px solid #666",
                            color: "white",
                            padding: "0.25rem",
                        }}
                    />
                ) : (
                    list.name
                )}
            </h1>

            {/*  Owner & Members */}
            <div
                style={{
                    background: "#051d54",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                }}
            >
                <p style={{ marginBottom: "0.5rem" }}>
                    <strong>Owner:</strong>{" "}
                    {
                        list.members.find((m) => m.id === list.ownerId)?.name ||
                        "Unknown Owner"
                    }
                </p>
                <p style={{ marginBottom: 0 }}>
                    <strong>Members:</strong>{" "}
                    {list.members
                        .filter((m) => m.id !== list.ownerId)
                        .map((m) => m.name)
                        .join(", ") || "No members yet"}
                </p>
            </div>

            <hr />

            <div style={{ marginBottom: "1rem" }}>
                <label>
                    <input
                        type="checkbox"
                        checked={showResolved}
                        onChange={() => setShowResolved(!showResolved)}
                    />{" "}
                    Show resolved
                </label>
            </div>

            <ul>
                {visibleItems.map((item) => (
                    <li key={item.id} style={{ marginBottom: "0.5rem" }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={item.isResolved}
                                onChange={() => handleToggleItem(item.id)}
                            />{" "}
                            <span
                                style={{
                                    textDecoration: item.isResolved ? "line-through" : "none",
                                }}
                            >
              {item.text}
            </span>
                        </label>
                        <button
                            onClick={() => handleDeleteItem(item.id)}
                            style={{
                                marginLeft: "1rem",
                                background: "transparent",
                                color: "red",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            ❌
                        </button>
                    </li>
                ))}
            </ul>

            <div style={{ marginTop: "1rem" }}>
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add new item"
                    style={{ padding: "0.5rem", width: "70%" }}
                />
                <button
                    onClick={handleAddItem}
                    style={{
                        marginLeft: "0.5rem",
                        padding: "0.5rem",
                        cursor: "pointer",
                    }}
                >
                    Add
                </button>
            </div>
        </div>
    );

}
