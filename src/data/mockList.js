export const MOCK_LIST = {
    id: "1",
    name: "Groceries",
    ownerId: "u1",
    currentUserId: "u1",
    members: [
        { id: "u1", name: "Me" },
        { id: "u2", name: "Emma" },
    ],
    items: [
        { id: "i1", text: "Milk", isResolved: false, createdBy: "u2" },
        { id: "i2", text: "Bread", isResolved: true, createdBy: "u1" },
    ],
};
