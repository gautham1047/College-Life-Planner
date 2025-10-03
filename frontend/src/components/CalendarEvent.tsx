import { cn } from "@/lib/utils";
import { CalendarEvent as CalendarEventType } from "./CalendarView";
import { Button } from "./ui/button";
import { X } from "lucide-react";

type CalendarEventProps = {
  event: CalendarEventType;
  style: React.CSSProperties;
  onDelete: (eventId: string) => void;
};

export const CalendarEvent = ({ event, style, onDelete }: CalendarEventProps) => {
  const eventColor = event.color || "bg-primary";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(event.id);
  };

  return (
    <div
      style={style}
      className={cn(
        "absolute p-1 rounded-lg text-xs text-primary-foreground overflow-hidden flex justify-between items-start gap-1",
        eventColor,
      )}
    >
      <div className="flex-grow overflow-hidden">
        <p className="font-semibold truncate">{event.title}</p>
        <p className="truncate">
          {event.start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 flex-shrink-0 text-primary-foreground/70 hover:bg-white/20 hover:text-primary-foreground"
        onClick={handleDelete}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};