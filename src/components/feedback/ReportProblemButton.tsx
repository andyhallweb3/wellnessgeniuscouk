import { useState } from 'react';
import { MessageSquareWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ReportProblemForm } from './ReportProblemForm';

interface ReportProblemButtonProps {
  featureArea?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ReportProblemButton({
  featureArea = 'General',
  variant = 'ghost',
  size = 'sm',
  className,
}: ReportProblemButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <MessageSquareWarning className="h-4 w-4 mr-1" />
          Report Problem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report a Problem</DialogTitle>
          <DialogDescription>
            Help us improve by reporting issues you encounter. Your feedback will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>
        <ReportProblemForm
          defaultFeatureArea={featureArea}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
