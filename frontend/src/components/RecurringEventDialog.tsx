import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
 
export type RecurrenceRuleOptions = Partial<RRuleOptions>;

type RecurringEventDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (rule: RecurrenceRuleOptions | null) => void;
};

export const RecurringEventDialog = ({
  isOpen,
  onOpenChange,
  onSave,
}: RecurringEventDialogProps) => {
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");
  const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
  const [monthlyType, setMonthlyType] = useState<"day" | "weekday">("day");
  const [monthlyDay, setMonthlyDay] = useState<number>(1);
  const [monthlyOrdinal, setMonthlyOrdinal] = useState<
    "first" | "second" | "third" | "fourth" | "last"
  >("first");
  const [monthlyWeekday, setMonthlyWeekday] = useState<
    "SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA"
  >("SU");
  const [endType, setEndType] = useState<"never" | "count" | "until">("never");
  const [endCount, setEndCount] = useState<number>(1);
  const [endDate, setEndDate] = useState<Date>();


  const weekdays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  const handleSave = () => {
    const rruleOptions: Partial<RRuleOptions> = {
      freq: frequency === "weekly" ? RRule.WEEKLY : RRule.MONTHLY,
      until: endType === "until" ? endDate : null,
      count: endType === "count" ? endCount : null,
    };

    if (frequency === "weekly") {
      rruleOptions.byweekday = weeklyDays.map(d => RRule[d as keyof typeof RRule] as Weekday);
    } else {
      if (monthlyType === "day") {
        rruleOptions.bymonthday = monthlyDay;
      } else {
        const ordinals = { first: 1, second: 2, third: 3, fourth: 4, last: -1 };
        rruleOptions.byweekday = [(RRule[monthlyWeekday as keyof typeof RRule] as Weekday).nth(ordinals[monthlyOrdinal])];
      }
    }

    onSave(rruleOptions);
    onOpenChange(false);
  };

  const handleClear = () => {
    onSave(null);
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
                      onChange={(e) => setMonthlyDay(parseInt(e.target.value, 10))}
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
                        <SelectItem value="first">first</SelectItem>
                        <SelectItem value="second">second</SelectItem>
                        <SelectItem value="third">third</SelectItem>
                        <SelectItem value="fourth">fourth</SelectItem>
                        <SelectItem value="last">last</SelectItem>
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
                    onChange={(e) => setEndCount(parseInt(e.target.value, 10))}
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
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};