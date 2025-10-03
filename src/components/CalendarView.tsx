import { useState } from "react";
import { MenuBar, MenuBarItem } from "./MenuBar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, startOfWeek, addWeeks, addMonths, startOfMonth } from "date-fns";

const menuItems: MenuBarItem[] = [
  { id: "day", label: "Day" },
  { id: "3day", label: "3 Days" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export const CalendarView = () => {
  const [activeView, setActiveView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevious = () => {
    if (activeView === "day") setCurrentDate(addDays(currentDate, -1));
    else if (activeView === "3day") setCurrentDate(addDays(currentDate, -3));
    else if (activeView === "week") setCurrentDate(addWeeks(currentDate, -1));
    else if (activeView === "month") setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNext = () => {
    if (activeView === "day") setCurrentDate(addDays(currentDate, 1));
    else if (activeView === "3day") setCurrentDate(addDays(currentDate, 3));
    else if (activeView === "week") setCurrentDate(addWeeks(currentDate, 1));
    else if (activeView === "month") setCurrentDate(addMonths(currentDate, 1));
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
      <div className="flex-1 overflow-auto">
        <div className="min-w-full">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b h-16">
              <div className="w-16 text-sm text-muted-foreground p-2">
                {format(new Date().setHours(hour), "ha")}
              </div>
              <div className="flex-1 border-l hover:bg-accent/50 cursor-pointer transition-colors" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 border-b bg-card sticky top-0 z-10">
          <div className="w-16" />
          {days.map((day) => (
            <div key={day.toString()} className="p-2 text-center border-l">
              <div className="font-medium">{format(day, "EEE")}</div>
              <div className="text-sm text-muted-foreground">{format(day, "d")}</div>
            </div>
          ))}
        </div>
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b h-16">
            <div className="w-16 text-sm text-muted-foreground p-2">
              {format(new Date().setHours(hour), "ha")}
            </div>
            {days.map((day, idx) => (
              <div
                key={idx}
                className="border-l hover:bg-accent/50 cursor-pointer transition-colors"
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const days = Array.from({ length: 35 }, (_, i) => addDays(monthStart, i - monthStart.getDay()));

    return (
      <div className="flex-1 p-4">
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium text-sm p-2">
              {day}
            </div>
          ))}
          {days.map((day, idx) => (
            <div
              key={idx}
              className="aspect-square border rounded-lg p-2 hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <div className={`text-sm ${
                day.getMonth() !== currentDate.getMonth() ? "text-muted-foreground" : ""
              }`}>
                {format(day, "d")}
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

      {activeView === "day" && renderDayView()}
      {activeView === "3day" && renderDayView()}
      {activeView === "week" && renderWeekView()}
      {activeView === "month" && renderMonthView()}
    </div>
  );
};
