import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { LeftPanel } from "@/components/LeftPanel";
import { CalendarView } from "@/components/CalendarView";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={40} minSize={30}>
          <LeftPanel
            showAIChat={showAIChat}
            onToggleAIChat={() => setShowAIChat(!showAIChat)}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border hover:bg-primary/20 transition-colors" />

        <ResizablePanel defaultSize={60} minSize={40}>
          <CalendarView />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
