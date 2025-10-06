import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteRecurringDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDeleteInstance: () => void;
  onDeleteSeries: () => void;
};

export const DeleteRecurringDialog = ({
  isOpen,
  onOpenChange,
  onDeleteInstance,
  onDeleteSeries,
}: DeleteRecurringDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Recurring Event</AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to delete only this event, or all events in this series?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-center">
          <AlertDialogAction onClick={onDeleteInstance}>This event only</AlertDialogAction>
          <AlertDialogAction onClick={onDeleteSeries} variant="destructive">All events in series</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};