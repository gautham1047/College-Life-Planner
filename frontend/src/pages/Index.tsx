import { useState, useEffect, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { LeftPanel } from "@/components/LeftPanel";
import { CalendarView, CalendarEvent } from "@/components/CalendarView";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [showAIChat, setShowAIChat] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const API_URL = "http://localhost:5000";

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();
      // Dates from JSON need to be converted back to Date objects
      const formattedEvents = data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDeleteEvent = async (eventId: string) => {
    console.log
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={40} minSize={30}>
          <LeftPanel
            showAIChat={showAIChat}
            onToggleAIChat={() => setShowAIChat(!showAIChat)}
            onTaskAdd={fetchEvents}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border hover:bg-primary/20 transition-colors" />

        <ResizablePanel defaultSize={60} minSize={40}>
          <CalendarView events={events} onDeleteEvent={handleDeleteEvent} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
