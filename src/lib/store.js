// src/lib/store.js
export const users = []; 
// user: { id, name, email, passwordHash, createdAt }

export const items = [];
// item: { id, name, description, ownerId, createdAt, updatedAt }

// Utility id sederhana
let _id = 1;
export function nextId() {
  return (_id++).toString();
}