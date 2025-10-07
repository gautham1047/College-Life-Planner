import { useState, useMemo, useEffect } from "react";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { RRule } from "rrule";
import type { Weekday, Options as RRuleOptions } from "rrule";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, setHours, setMinutes, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";
 
export type RecurrenceRuleOptions = Partial<RRuleOptions>;

type RecurringEventDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (
    rule: RecurrenceRuleOptions | null,
    start?: Date,
    end?: Date
  ) => void;
};

export const RecurringEventDialog = ({
  isOpen,
  onOpenChange,
  onSave,
}: RecurringEventDialogProps) => {
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly"); // prettier-ignore
  const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
  const [monthlyType, setMonthlyType] = useState<"day" | "weekday">("day");
  const [monthlyDay, setMonthlyDay] = useState<string>("");
  const [monthlyOrdinal, setMonthlyOrdinal] = useState<
    "first" | "second" | "third" | "fourth" | "last"
  >("first");
  const [monthlyWeekday, setMonthlyWeekday] = useState<
    "SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA"
  >("SU");
  const [endType, setEndType] = useState<"never" | "count" | "until">("never");
  const [endCount, setEndCount] = useState<number>(1);
  const [endDate, setEndDate] = useState<Date>();
  const [error, setError] = useState<string | null>(null);
  const [recurrenceStartDate, setRecurrenceStartDate] = useState<string>();
  const [possibleStartDates, setPossibleStartDates] = useState<Date[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");


  const weekdays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  const isRuleDefined = useMemo(() => {
    if (frequency === "weekly") {
      return weeklyDays.length > 0;
    }
    if (frequency === "monthly") {
      return true; // Monthly always has a default
    }
    return false;
  }, [frequency, weeklyDays]);

  const isSaveDisabled = useMemo(() => {
    if (isRuleDefined && !recurrenceStartDate) {
      return true;
    }
    if (frequency === "monthly" && monthlyType === "day") {
      const day = parseInt(monthlyDay, 10);
      if (isNaN(day) || day < 1 || day > 31) {
        return true;
      }
    }
    if (endType === "count") {
      const count = parseInt(endCount as any, 10);
      if (isNaN(count) || count < 1) {
        return true;
      }
    }
    if (endType === "until" && !endDate) return true;
    return false;
  }, [
    isRuleDefined,
    recurrenceStartDate,
    frequency,
    monthlyType,
    monthlyDay,
    endType,
    endCount,
    endDate,
  ]);

  useEffect(() => {
    if (isRuleDefined) {
      const tempRuleOptions: Partial<RRuleOptions> = {
        freq: frequency === "weekly" ? RRule.WEEKLY : RRule.MONTHLY,
        // Use start of today in UTC to avoid timezone-related off-by-one errors.
        dtstart: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())),
      };

      if (frequency === "weekly") {
        tempRuleOptions.byweekday = weeklyDays.map(
          (d) => RRule[d as keyof typeof RRule] as Weekday
        );
      } else {
        if (monthlyType === "day") {
          tempRuleOptions.bymonthday = parseInt(monthlyDay, 10);
        } else {
          const ordinals = { first: 1, second: 2, third: 3, fourth: 4, last: -1 };
          tempRuleOptions.byweekday = [
            (RRule[monthlyWeekday as keyof typeof RRule] as Weekday).nth(ordinals[monthlyOrdinal]),
          ];
        }
      }
      const rule = new RRule(tempRuleOptions as RRuleOptions);
      setPossibleStartDates(rule.all((_, i) => i < 5));
    } else {
      setPossibleStartDates([]);
    }
    setRecurrenceStartDate(undefined); // Reset selection when rule changes
  }, [isRuleDefined, frequency, weeklyDays, monthlyType, monthlyDay, monthlyOrdinal, monthlyWeekday]);

  const handleSave = () => {
    setError(null);

    if (frequency === "monthly" && monthlyType === "day" && isSaveDisabled) {
      setError("Please enter a valid day of the month (1-31).");
      return;
    }

    if (!recurrenceStartDate) {
      setError("Please select a start date for the recurrence.");
      return;
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const chosenStartDate = new Date(recurrenceStartDate!);
    const finalStartDateTime = setMinutes(setHours(chosenStartDate, startHour), startMinute);
    const finalEndDateTime = setMinutes(setHours(chosenStartDate, endHour), endMinute);

    if (finalStartDateTime >= finalEndDateTime) {
      setError("End time must be after start time.");
      return;
    }

    const rruleOptions: Partial<RRuleOptions> = {
      dtstart: finalStartDateTime,
      freq: frequency === "weekly" ? RRule.WEEKLY : RRule.MONTHLY,
      until: endType === "until" ? endDate : null,
      count: endType === "count" ? endCount : null,
    };

    if (frequency === "weekly") {
      // Convert weekday strings ('SU', 'MO') to numbers (0, 1) for JSON serialization.
      const dayMap: { [key: string]: number } = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
      rruleOptions.byweekday = weeklyDays.map(d => dayMap[d]);

    } else {
      if (monthlyType === "day") {
        rruleOptions.bymonthday = parseInt(monthlyDay, 10);
      } else {
        const ordinals = { first: 1, second: 2, third: 3, fourth: 4, last: -1 };
        rruleOptions.byweekday = [(RRule[monthlyWeekday as keyof typeof RRule] as Weekday).nth(ordinals[monthlyOrdinal])];
      }
    }

    onSave(rruleOptions, finalStartDateTime, finalEndDateTime);
    onOpenChange(false);
  };

  const handleClear = () => {
    onSave(null, undefined, undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize Recurrence</DialogTitle>
          <DialogDescription>
            Set how often this task should repeat.
          </DialogDescription>
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <Label>Repeats</Label>
            <Select value={frequency} onValueChange={(v: "weekly" | "monthly") => setFrequency(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "weekly" && (
            <div>
              <Label className="mb-2 block">On</Label>
              <ToggleGroup type="multiple" value={weeklyDays} onValueChange={setWeeklyDays}>
                {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day, i) => (
                  <ToggleGroupItem key={day} value={day} aria-label={`Toggle ${day}`}>
                    {day.charAt(0)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="space-y-4">
              <Label>On</Label>
              <RadioGroup value={monthlyType} onValueChange={(v: "day" | "weekday") => setMonthlyType(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="day" id="r-day" />
                  <Label htmlFor="r-day" className="flex items-center gap-2">
                    Day
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={monthlyDay}
                      onChange={(e) => setMonthlyDay(e.target.value)}
                      className="w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={monthlyType !== 'day'}
                    />
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekday" id="r-weekday" />
                  <Label htmlFor="r-weekday" className="flex items-center gap-2">
                    The
                    <Select
                      value={monthlyOrdinal}
                      onValueChange={(v) => setMonthlyOrdinal(v as any)}
                      disabled={monthlyType !== 'weekday'}
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first">First</SelectItem>
                        <SelectItem value="second">Second</SelectItem>
                        <SelectItem value="third">Third</SelectItem>
                        <SelectItem value="fourth">Fourth</SelectItem>
                        <SelectItem value="last">Last</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={monthlyWeekday}
                      onValueChange={(v) => setMonthlyWeekday(v as any)}
                      disabled={monthlyType !== 'weekday'}
                    >
                      <SelectTrigger className="w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekdays.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {isRuleDefined && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Starts on</Label>
                <ScrollArea className="h-36 w-full rounded-md border">
                  <RadioGroup
                    value={recurrenceStartDate}
                    onValueChange={setRecurrenceStartDate}
                    className="p-4"
                  >
                    {possibleStartDates.map((date) => (
                      <div key={date.toISOString()} className="flex items-center space-x-2">
                        <RadioGroupItem value={date.toISOString()} id={date.toISOString()} />
                        <Label htmlFor={date.toISOString()} className="font-normal">
                          {format(
                            // Adjust for timezone offset to display the correct UTC date
                            addMinutes(date, date.getTimezoneOffset()),
                            "eeee, MMMM d, yyyy"
                          )}
                        </Label>
                      </div>
                    ))}
                    {possibleStartDates.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No upcoming dates match this rule.
                      </div>
                    )}
                  </RadioGroup>
                </ScrollArea>
              </div>
              <div className="flex items-center gap-2">
                <Label className="flex items-center gap-1.5">
                  From
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </Label>
                <Label className="flex items-center gap-1.5">
                  to
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </Label>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label>Ends</Label>
            <RadioGroup value={endType} onValueChange={(v: "never" | "count" | "until") => setEndType(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="r-never" />
                <Label htmlFor="r-never">Never</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="count" id="r-count" />
                <Label htmlFor="r-count" className="flex items-center gap-2">
                  After
                  <Input
                    type="number"
                    min={1}
                    value={endCount}
                    onChange={(e) => { setEndCount(parseInt(e.target.value, 10)); }}
                    className="w-20  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={endType !== 'count'}
                  />
                  {frequency === 'weekly' ? 'weeks' : 'months'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="until" id="r-until" />
                <Label htmlFor="r-until" className="flex items-center gap-2">
                  On
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-[200px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                        disabled={endType !== 'until'}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between">
            <Button variant="ghost" onClick={handleClear}>Clear</Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaveDisabled}>Save</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};