import { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RRule } from "rrule";
import { format } from "date-fns";
import { setHours, setMinutes } from "date-fns";
import { GroupManagerDialog } from "./GroupManagerDialog";
import { RecurringEventDialog, RecurrenceRuleOptions } from "./RecurringEventDialog";
import { cn } from "@/lib/utils";

type TaskInputProps = {
  onTaskAdd: () => void;
};

type Group = {
  id: string;
  name: string;
  color: string;
};

export const TaskInput = ({ onTaskAdd }: TaskInputProps) => {
  const [task, setTask] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [startDateTime, setStartDateTime] = useState<Date>();
  const [endDateTime, setEndDateTime] = useState<Date>();
  const [isGroupManagerOpen, setGroupManagerOpen] = useState(false);
  const [isRecurrenceOpen, setRecurrenceOpen] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRuleOptions | null>(null);

  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/groups");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleSubmit = async () => {
    if (!task.trim() || !startDateTime || !endDateTime) {
      // Maybe show an error to the user
      return;
    }

    const isRecurring = recurrenceRule !== null;
    const endpoint = isRecurring ? "http://localhost:5000/recurring-events" : "http://localhost:5000/events";

    const startRuleOptions = isRecurring ? { ...recurrenceRule, dtstart: startDateTime } : undefined;
    const endRuleOptions = isRecurring ? { ...recurrenceRule, dtstart: endDateTime } : undefined;

    const body = isRecurring
      ? {
          title: task,
          color: group ? groups.find((g) => g.name === group)?.color : "bg-primary",
          rruleStart: startRuleOptions,
          rruleEnd: endRuleOptions,
        }
      : {
          title: task,
          start: startDateTime,
          end: endDateTime,
          color: group ? groups.find((g) => g.name === group)?.color : "bg-primary",
        };

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      setTask("");
      setStartDateTime(undefined);
      setEndDateTime(undefined);
      setGroup(null);
      setRecurrenceRule(null);
      onTaskAdd(); // Notify parent component to refetch events
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleDateSelect = (selectedDate?: Date) => {
    if (!selectedDate) {
      setStartDateTime(undefined);
      setEndDateTime(undefined);
      return;
    }

    const now = new Date();
    const newStart = setMinutes(setHours(selectedDate, now.getHours()), now.getMinutes());
    const newEnd = setHours(newStart, now.getHours() + 1);

    setStartDateTime(newStart);
    setEndDateTime(newEnd);
  };

  const handleTimeChange = (time: string, type: 'start' | 'end') => {
    const [hour, minute] = time.split(':').map(Number);
    if (type === 'start') {
      if (!startDateTime) return;
      const newStart = setMinutes(setHours(startDateTime, hour), minute);
      setStartDateTime(newStart);
      // Optional: auto-adjust end time
      if (endDateTime && newStart >= endDateTime) {
        setEndDateTime(setHours(newStart, hour + 1));
      }
    } else {
      if (!endDateTime) return;
      setEndDateTime(setMinutes(setHours(endDateTime, hour), minute));
    }
  };

  const handleAddGroup = async (name: string, color: string) => {
    if (!name.trim()) return;
    try {
      await fetch("http://localhost:5000/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      fetchGroups();
    } catch (error) {
      console.error("Failed to add group:", error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await fetch(`http://localhost:5000/groups/${groupId}`, {
        method: "DELETE",
      });
      fetchGroups();
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  const handleUpdateGroup = async (groupId: string, name: string, color: string) => {
    try {
      await fetch(`http://localhost:5000/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      fetchGroups();
    } catch (error) {
      console.error("Failed to update group:", error);
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
            className={cn("w-[280px] justify-start text-left font-normal", !startDateTime && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDateTime && endDateTime
              ? `${format(startDateTime, "MMM d, yyyy")} from ${format(startDateTime, "h:mm a")} to ${format(endDateTime, "h:mm a")}`
              : "Pick date & time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {recurrenceRule ? (
            <div className="p-4 text-sm text-muted-foreground">
              Date selection is handled by the recurrence rule.
            </div>
          ) : (
            <CalendarComponent
              mode="single"
              selected={startDateTime}
              onSelect={handleDateSelect}
              initialFocus
              className="pointer-events-auto"
            />
          )}
          <div className="p-3 border-t border-border flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Input
                type="time"
                value={startDateTime ? format(startDateTime, "HH:mm") : ""}
                onChange={(e) => handleTimeChange(e.target.value, 'start')}
                disabled={!startDateTime}
              />
              <span>-</span>
              <Input
                type="time"
                value={endDateTime ? format(endDateTime, "HH:mm") : ""}
                onChange={(e) => handleTimeChange(e.target.value, 'end')}
                disabled={!endDateTime}
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>{group ? group : "Add to Group"}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <div className="max-h-60 overflow-y-auto">
                {groups.map((g) => (
                  <DropdownMenuItem key={g.id} onClick={() => setGroup(g.name)}>
                    <div className="flex items-center">
                      <span className={cn("w-2 h-2 rounded-full mr-2", g.color)} />
                      {g.name}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setGroupManagerOpen(true)}>
                Edit Groups...
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onSelect={() => setRecurrenceOpen(true)}>
            {recurrenceRule
              ? "Update recurring schedule"
              : "Make recurring"}
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            Add people to task (coming soon)
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            Set priority (coming soon)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={handleSubmit} size="icon">
        <Plus className="h-4 w-4" />
      </Button>

      <RecurringEventDialog
        isOpen={isRecurrenceOpen}
        onOpenChange={setRecurrenceOpen}
        onSave={setRecurrenceRule}
      />

      <GroupManagerDialog
        isOpen={isGroupManagerOpen}
        onOpenChange={setGroupManagerOpen}
        groups={groups}
        onGroupAdd={handleAddGroup}
        onGroupDelete={handleDeleteGroup}
        onGroupUpdate={handleUpdateGroup}
      />
    </div>
  );
};
