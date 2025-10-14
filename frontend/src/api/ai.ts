import { API_URL } from "./api";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

export const postChatMessage = async (message: string, history: Message[], isAgentMode: boolean) => {
  const response = await fetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history,
      mode: isAgentMode ? 'agent' : 'chatbot',
    }),
  });

  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};