import { useState, useMemo } from "react";
import { MenuBar, MenuBarItem } from "./MenuBar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  format,
  addDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addWeeks,
  addMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  getMinutes,
  getHours,
} from "date-fns";
import { CalendarEvent as CalendarEventComponent } from "./CalendarEvent";
import { RRule, RRuleSet } from "rrule";
import { RecurringEvent } from "@/types";
import { DeleteRecurringDialog } from "./DeleteRecurringDialog";

const menuItems: MenuBarItem[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  isRecurring?: boolean;
  recurringEventId?: string;
};

type CalendarViewProps = {
  events: CalendarEvent[];
  recurringEvents: RecurringEvent[];
  onDeleteEvent: (eventId: string) => void;
  onDeleteRecurringInstance: (eventId: string, date: Date) => void;
};

export const CalendarView = ({ events = [], recurringEvents = [], onDeleteEvent, onDeleteRecurringInstance }: CalendarViewProps) => {
  const [activeView, setActiveView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);

  const allEvents = useMemo(() => {
    let startRange: Date;
    let endRange: Date;

    if (activeView === 'day') {
      startRange = startOfDay(currentDate);
      endRange = endOfDay(currentDate);
    } else if (activeView === 'week') {
      startRange = startOfWeek(currentDate, { weekStartsOn: 0 });
      endRange = endOfWeek(currentDate, { weekStartsOn: 0 });
    } else { // month
      const monthStart = startOfMonth(currentDate);
      startRange = startOfWeek(monthStart, { weekStartsOn: 0 });
      // Month view shows 35 days (5 weeks)
      endRange = endOfDay(addDays(startRange, 34));
    }

    const expandedRecurringEvents: CalendarEvent[] = recurringEvents.flatMap(re => {
      // Ensure dtstart and until are Date objects
      const { exdate: startExdates, ...rruleStartOptions } = {
        ...re.rruleStart,
        dtstart: new Date(re.rruleStart.dtstart),
        until: re.rruleStart.until ? new Date(re.rruleStart.until) : null,
      };
      const { exdate: endExdates, ...rruleEndOptions } = {
        ...re.rruleEnd,
        dtstart: new Date(re.rruleEnd.dtstart),
        until: re.rruleEnd.until ? new Date(re.rruleEnd.until) : null,
      };

      const startRuleSet = new RRuleSet();
      const endRuleSet = new RRuleSet();

      startRuleSet.rrule(new RRule(rruleStartOptions));
      endRuleSet.rrule(new RRule(rruleEndOptions));

      // Add exclusion dates to the rules
      (re.rruleStart.exdate || []).forEach((d: string | Date) => startRuleSet.exdate(new Date(d)));
      (re.rruleEnd.exdate || []).forEach((d: string | Date) => endRuleSet.exdate(new Date(d)));

      const startDates = startRuleSet.between(startRange, endRange);
      const endDates = endRuleSet.between(startRange, endRange);

      return startDates.map((start, index) => ({
        id: `${re.id}-${start.toISOString()}`, // Create a unique ID for each instance
        title: re.title,
        start: start,
        end: endDates[index],
        color: re.color,
        isRecurring: true,
        recurringEventId: re.id,
      }));
    });

    return [...events, ...expandedRecurringEvents];
  }, [activeView, currentDate, events, recurringEvents]);

  const handlePrevious = () => {
    if (activeView === "day") setCurrentDate(addDays(currentDate, -1));
    else if (activeView === "week") setCurrentDate(addWeeks(currentDate, -1));
    else if (activeView === "month") setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNext = () => {
    if (activeView === "day") setCurrentDate(addDays(currentDate, 1));
    else if (activeView === "week") setCurrentDate(addWeeks(currentDate, 1));
    else if (activeView === "month") setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDeleteRequest = (event: CalendarEvent) => {
    if (event.isRecurring) {
      setDeleteTarget(event);
    } else {
      onDeleteEvent(event.id);
    }
  };

  const handleDeleteInstance = () => {
    if (deleteTarget) {
      onDeleteRecurringInstance(deleteTarget.recurringEventId!, deleteTarget.start);
      setDeleteTarget(null);
    }
  };

  const handleDeleteSeries = () => {
    if (deleteTarget && deleteTarget.recurringEventId) {
      onDeleteEvent(deleteTarget.recurringEventId);
      setDeleteTarget(null);
    }
  };

  const renderDayView = () => {
    const dayEvents = allEvents.filter((event) => isSameDay(event.start, currentDate));
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
      <div className="flex-1 overflow-auto relative">
        <div className="min-w-full relative">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b h-16">
              <div className="w-16 text-sm text-muted-foreground p-2">
                {format(new Date().setHours(hour), "ha")}
              </div>
              <div className="flex-1 border-l hover:bg-accent/50 cursor-pointer transition-colors" />
            </div>
          ))}
          {dayEvents.map((event) => {
            const top = (getHours(event.start) + getMinutes(event.start) / 60) * 4; // 4rem (h-16) per hour
            const durationInMinutes = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
            const height = (durationInMinutes / 60) * 4; // 4rem (h-16) per hour

            return (
              <CalendarEventComponent 
                key={event.id}
                event={event}
                onDelete={() => handleDeleteRequest(event)}
                style={{ top: `${top}rem`, height: `${height}rem`, left: "calc(4rem + 1px)" }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const hourRowHeight = 4; // in rem, from h-16

    return (
      <div className="flex-1 overflow-auto relative">
        <div className="grid grid-cols-[4rem_repeat(7,1fr)]">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card" />
          {days.map((day) => (
            <div key={day.toString()} className="p-2 text-center border-l sticky top-0 z-10 bg-card border-b">
              <div className="font-medium ">{format(day, "EEE")}</div>
              <div className="text-sm text-muted-foreground">{format(day, "d")}</div>
            </div>
          ))}

          {/* Grid */}
          <div className="col-start-1 col-end-2 row-start-2 row-end-26">
            {hours.map((hour) => (
              <div key={hour} className="h-16 text-sm text-muted-foreground p-2 text-right border-t">
                {format(new Date(0, 0, 0, hour), "ha")}
              </div>
            ))}
          </div>
          {days.map((day, dayIndex) => (
            <div key={day.toString()} className="col-start-auto row-start-2 row-end-26 border-l relative">
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-t" />
              ))}
              {allEvents.filter((event) => isSameDay(event.start, day)).map((event) => {
                const top = (getHours(event.start) + getMinutes(event.start) / 60) * hourRowHeight;
                const durationInMinutes = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
                const height = (durationInMinutes / 60) * hourRowHeight;
                return <CalendarEventComponent key={event.id} event={event} onDelete={() => handleDeleteRequest(event)} style={{ top: `${top}rem`, height: `${height}rem`, left: '1px', right: '1px' }} />;
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const weekStartsOn = 0; // Sunday
    const firstDayOfMonth = startOfWeek(monthStart, { weekStartsOn });
    const days = Array.from({ length: 35 }, (_, i) => addDays(firstDayOfMonth, i));

    return (
      <div className="flex-1 p-4">
        <div className="grid grid-cols-7 gap-px bg-border border-l border-t">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium text-sm p-2 bg-card">
              {day}
            </div>
          ))}
          {days.map((day, idx) => (
            <div
              key={idx}
              className="aspect-square p-2 hover:bg-accent/50 cursor-pointer transition-colors bg-card border-r border-b"
            >
              <div className={`text-sm ${
                day.getMonth() !== currentDate.getMonth() ? "text-muted-foreground" : ""
              }`}>
                {format(day, "d")}
              </div>
              <div className="space-y-1 mt-1">
                {allEvents
                  .filter((event) => isSameDay(event.start, day))
                  .slice(0, 4) // Show max 4 events
                  .map((event) => (
                    <div key={event.id} className="text-xs bg-primary text-primary-foreground rounded px-1 truncate">
                      {event.title}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <MenuBar
        items={menuItems}
        activeItem={activeView}
        onItemClick={setActiveView}
      />
      
      <div className="p-4 border-b flex items-center justify-between bg-card">
        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {activeView === "month"
            ? format(currentDate, "MMMM yyyy")
            : format(currentDate, "MMMM d, yyyy")}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNext}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <DeleteRecurringDialog
        isOpen={!!deleteTarget}
        onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}
        onDeleteInstance={handleDeleteInstance}
        onDeleteSeries={handleDeleteSeries}
      />

      {activeView === "day" && renderDayView()}
      {activeView === "week" && renderWeekView()}
      {activeView === "month" && renderMonthView()}
    </div>
  );
};
