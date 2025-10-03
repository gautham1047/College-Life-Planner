import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { setHours, setMinutes, setSeconds } from "date-fns";
import { cn } from "@/lib/utils";

type TaskInputProps = {
  onTaskAdd: () => void;
};

export const TaskInput = ({ onTaskAdd }: TaskInputProps) => {
  const [task, setTask] = useState("");
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!task.trim() || !date || !startTime || !endTime) {
      // Maybe show an error to the user
      return;
    }
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const start = setSeconds(setMinutes(setHours(date, startHour), startMinute), 0);
    const end = setSeconds(setMinutes(setHours(date, endHour), endMinute), 0);

    try {
      await fetch("http://localhost:5000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: task, start, end }),
      });
      setTask("");
      setDate(undefined);
      setStartTime("09:00");
      setEndTime("10:00");
      onTaskAdd(); // Notify parent component to refetch events
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  return (
    <div className="flex gap-2 items-center p-4 bg-card rounded-lg border shadow-sm">
      <Input
        placeholder="Enter a task..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="flex-1"
      />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {date
              ? `${format(date, "MMM d, yyyy")} from ${startTime} to ${endTime}`
              : "Pick date & time range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            className="pointer-events-auto"
          />
          <div className="p-3 border-t border-border flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <span>-</span>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover">
          <DropdownMenuItem>Make recurring</DropdownMenuItem>
          <DropdownMenuItem>Add people to task</DropdownMenuItem>
          <DropdownMenuItem>Set priority</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={handleSubmit} size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
