import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const feedbackSchema = z.object({
  featureArea: z.string().min(1, 'Please select a feature area'),
  description: z.string().min(10, 'Please provide more detail (at least 10 characters)').max(2000),
  severity: z.string(),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FEATURE_AREAS = [
  'AI Genie Chat',
  'Daily Brief',
  'Document Upload',
  'Business Context',
  'Session History',
  'Voice Interface',
  'Navigation',
  'Authentication',
  'Performance',
  'Mobile Experience',
  'Other',
];

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low - Minor inconvenience' },
  { value: 'medium', label: 'Medium - Affects my workflow' },
  { value: 'high', label: 'High - Blocking issue' },
  { value: 'critical', label: 'Critical - Cannot use feature at all' },
];

interface ReportProblemFormProps {
  defaultFeatureArea?: string;
  onSuccess?: () => void;
}

export function ReportProblemForm({ defaultFeatureArea, onSuccess }: ReportProblemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      featureArea: defaultFeatureArea || '',
      description: '',
      severity: 'medium',
      email: user?.email || '',
    },
  });

  const selectedSeverity = watch('severity');
  const selectedFeatureArea = watch('featureArea');

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('submit-feedback', {
        body: {
          featureArea: data.featureArea,
          description: data.description,
          severity: data.severity,
          userEmail: data.email || user?.email,
          userName: user?.user_metadata?.full_name,
        },
      });

      if (error) throw error;

      toast({
        title: 'Feedback submitted',
        description: 'Thank you! We\'ll review your report and work on improvements.',
      });

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="featureArea">Feature Area</Label>
        <Select
          value={selectedFeatureArea}
          onValueChange={(value) => setValue('featureArea', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select feature area" />
          </SelectTrigger>
          <SelectContent>
            {FEATURE_AREAS.map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.featureArea && (
          <p className="text-sm text-destructive">{errors.featureArea.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity">Severity</Label>
        <Select
          value={selectedSeverity}
          onValueChange={(value) => setValue('severity', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the problem you encountered. Include steps to reproduce if possible..."
          className="min-h-[120px]"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
          />
          <p className="text-xs text-muted-foreground">
            Provide your email if you'd like us to follow up
          </p>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Report'
        )}
      </Button>
    </form>
  );
}
