import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Group = {
  id: string;
  name: string;
  color: string;
};

type GroupManagerDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  groups: Group[];
  onGroupAdd: (name: string, color: string) => Promise<void>;
  onGroupDelete: (groupId: string) => Promise<void>;
  onGroupUpdate: (groupId: string, name: string, color: string) => Promise<void>;
};

export const GroupManagerDialog = ({
  isOpen,
  onOpenChange,
  groups,
  onGroupAdd,
  onGroupDelete,
  onGroupUpdate,
}: GroupManagerDialogProps) => {
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("bg-gray-500");

  const availableColors = [
    "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500",
    "bg-teal-500", "bg-blue-500", "bg-indigo-500", "bg-purple-500",
    "bg-pink-500", "bg-gray-500"
  ];

  useEffect(() => {
    setNewGroupColor(availableColors[Math.floor(Math.random() * availableColors.length)]);
  }, [newGroupName]);

  const handleAdd = async () => {
    await onGroupAdd(newGroupName, newGroupColor);
    setNewGroupName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Groups</DialogTitle>
          <DialogDescription>
            Add, remove, and manage your task groups.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="New group name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <Button onClick={handleAdd}>Add Group</Button>
          </div>
          <ScrollArea className="h-60">
            <div className="space-y-2 pr-4">
              {groups.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-2 rounded-md border">
                  <div className="flex items-center gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={cn("w-4 h-4 rounded-full cursor-pointer", g.color)} />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-5 gap-2">
                          {availableColors.map(color => (
                            <button key={color} className={cn("w-6 h-6 rounded-full", color)} onClick={() => onGroupUpdate(g.id, g.name, color)} />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <span>{g.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onGroupDelete(g.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};