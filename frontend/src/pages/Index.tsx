import { useState, useEffect, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { LeftPanel } from "@/components/LeftPanel";
import { CalendarView, CalendarEvent } from "@/components/CalendarView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RecurringEvent } from "@/types";

const Index = () => {
  const [showAIChat, setShowAIChat] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [recurringEvents, setRecurringEvents] = useState<RecurringEvent[]>([]);

  const API_URL = "http://localhost:5000";

  const fetchEvents = useCallback(async () => {
    try {
      const [eventsResponse, recurringEventsResponse] = await Promise.all([
        fetch(`${API_URL}/events`),
        fetch(`${API_URL}/recurring-events`),
      ]);

      if (!eventsResponse.ok || !recurringEventsResponse.ok) {
        throw new Error("Failed to fetch events");
      }

      const eventsData = await eventsResponse.json();
      const recurringEventsData = await recurringEventsResponse.json();

      const formattedEvents = eventsData.map((event: any) => {
        // Dates from JSON need to be converted back to Date objects
        if (event.start && event.end) {
          return {
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          };
        }
        return event;
      });

      setEvents(formattedEvents);
      setRecurringEvents(recurringEventsData);
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDeleteEvent = async (eventId: string) => {
    // This function now handles both single events and entire recurring series
    const isRecurring = recurringEvents.some(re => re.id === eventId);
    const endpoint = isRecurring ? `${API_URL}/recurring-events/${eventId}` : `${API_URL}/events/${eventId}`;

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });
      if (response.ok) {
        if (isRecurring) {
          setRecurringEvents((prev) => prev.filter((re) => re.id !== eventId));
        } else {
          setEvents((prev) => prev.filter((e) => e.id !== eventId));
        }
        // A full refetch might be simpler to ensure calendar is up-to-date
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleDeleteRecurringInstance = async (recurringEventId: string, date: Date) => {
    try {
      const response = await fetch(`${API_URL}/recurring-events/${recurringEventId}/exclude`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: date.toISOString() }),
      });
      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to delete recurring instance:", error);
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
          <CalendarView
            events={events}
            recurringEvents={recurringEvents}
            onDeleteEvent={handleDeleteEvent}
            onDeleteRecurringInstance={handleDeleteRecurringInstance}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
