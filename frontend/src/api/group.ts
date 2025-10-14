import { API_URL } from "./api";

export const getGroups = async () => {
  const response = await fetch(`${API_URL}/groups`);
  if (!response.ok) throw new Error("Failed to fetch groups");
  return response.json();
};

export const addGroup = async (name: string, color: string) => {
  const response = await fetch(`${API_URL}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, color }),
  });
  if (!response.ok) throw new Error("Failed to add group");
};

export const deleteGroup = async (groupId: string) => {
  const response = await fetch(`${API_URL}/groups/${groupId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete group");
};

export const updateGroup = async (groupId: string, name: string, color: string) => {
  const response = await fetch(`${API_URL}/groups/${groupId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, color }),
  });
  if (!response.ok) throw new Error("Failed to update group");
};