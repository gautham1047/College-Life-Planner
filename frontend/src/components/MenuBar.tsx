import { Button } from "@/components/ui/button";

export type MenuBarItem = {
  id: string;
  label: string;
};

type MenuBarProps = {
  items: MenuBarItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
};

export const MenuBar = ({ items, activeItem, onItemClick }: MenuBarProps) => {
  return (
    <div className="flex items-center gap-1 p-2 border-b bg-card">
      {items.map((item) => (
        <Button
          key={item.id}
          variant={activeItem === item.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onItemClick(item.id)}
          className="rounded-md"
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
};
