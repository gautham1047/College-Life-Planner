import { API_URL } from "./api";

export const getRecurringEvents = async () => {
  const response = await fetch(`${API_URL}/recurring-events`);
  if (!response.ok) throw new Error("Failed to fetch recurring events");
  return response.json();
};

export const createRecurringEvent = async (eventData: any) => {
  const response = await fetch(`${API_URL}/recurring-events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error("Failed to create recurring event");
  return response.json();
};

export const deleteRecurringEvent = async (eventId: string) => {
  const response = await fetch(`${API_URL}/recurring-events/${eventId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete recurring event");
};

export const excludeRecurringInstance = async (recurringEventId: string, date: Date) => {
  const response = await fetch(`${API_URL}/recurring-events/${recurringEventId}/exclude`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: date.toISOString() }),
  });
  if (!response.ok) throw new Error("Failed to exclude recurring instance");
};