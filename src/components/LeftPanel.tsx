import { TaskInput } from "./TaskInput";
import { AIChat } from "./AIChat";

type LeftPanelProps = {
  showAIChat: boolean;
  onToggleAIChat: () => void;
};

export const LeftPanel = ({ showAIChat, onToggleAIChat }: LeftPanelProps) => {
  if (showAIChat) {
    return <AIChat isExpanded={showAIChat} onToggle={onToggleAIChat} />;
  }

  return (
    <div className="flex flex-col h-full p-6 relative">
      <div className="mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          College Planner
        </h1>
        <p className="text-muted-foreground">
          Organize your academic life with ease
        </p>
      </div>

      <TaskInput />

      <AIChat isExpanded={false} onToggle={onToggleAIChat} />
    </div>
  );
};
