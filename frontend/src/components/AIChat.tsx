import { useState } from "react";
import { MessageCircle, Home, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { postChatMessage } from "@/api/ai";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

type AIChatProps = {
  isExpanded: boolean;
  onToggle: () => void;
};

export const AIChat = ({ isExpanded, onToggle }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant. How can I help you organize your tasks today?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: "user",
      };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);
      setInput("");

      try {
        const data = await postChatMessage(input, newMessages, isAgentMode);
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.text,
          sender: "ai",
        };
        setMessages((prev) => [...prev, aiResponse]);
      } catch (error) {
        console.error("Failed to send message:", error);
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I couldn't connect to the AI. Please try again.",
          sender: "ai",
        };
        setMessages((prev) => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={onToggle}
        className="absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 border-b flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Switch id="agent-mode" checked={isAgentMode} onCheckedChange={setIsAgentMode} />
                <Label htmlFor="agent-mode" className="cursor-pointer">Agent Mode</Label>
              </div>
            </TooltipTrigger>
            <TooltipContent><p>Toggle to allow the AI to modify your calendar.</p></TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="flex items-center space-x-2">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
