import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Bug, Lightbulb, Wrench } from 'lucide-react';
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
  feedbackType: z.string().min(1, 'Please select a type'),
  featureArea: z.string().min(1, 'Please select a feature area'),
  description: z.string().min(10, 'Please provide more detail (at least 10 characters)').max(2000),
  severity: z.string(),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report', icon: Bug, description: 'Something isn\'t working correctly' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, description: 'Suggest a new feature or capability' },
  { value: 'improvement', label: 'Improvement', icon: Wrench, description: 'Enhance an existing feature' },
];

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
  'Products',
  'AI Readiness Assessment',
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
  defaultType?: 'bug' | 'feature' | 'improvement';
  onSuccess?: () => void;
}

export function ReportProblemForm({ defaultFeatureArea, defaultType = 'bug', onSuccess }: ReportProblemFormProps) {
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
      feedbackType: defaultType,
      featureArea: defaultFeatureArea || '',
      description: '',
      severity: 'medium',
      email: user?.email || '',
    },
  });

  const selectedFeedbackType = watch('feedbackType');
  const selectedSeverity = watch('severity');
  const selectedFeatureArea = watch('featureArea');

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('submit-feedback', {
        body: {
          feedbackType: data.feedbackType,
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
        description: 'Thank you! We\'ll review your submission and work on it.',
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
      {/* Feedback Type Selection */}
      <div className="space-y-2">
        <Label>What would you like to submit?</Label>
        <div className="grid grid-cols-3 gap-2">
          {FEEDBACK_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedFeedbackType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setValue('feedbackType', type.value)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <Icon size={20} className={isSelected ? 'text-accent' : 'text-muted-foreground'} />
                <span className="text-xs font-medium mt-1">{type.label}</span>
              </button>
            );
          })}
        </div>
        {errors.feedbackType && (
          <p className="text-sm text-destructive">{errors.feedbackType.message}</p>
        )}
      </div>

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

      {selectedFeedbackType === 'bug' && (
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
      )}

      <div className="space-y-2">
        <Label htmlFor="description">
          {selectedFeedbackType === 'bug' 
            ? 'Description' 
            : selectedFeedbackType === 'feature'
            ? 'What feature would you like to see?'
            : 'What improvement would you suggest?'}
        </Label>
        <Textarea
          id="description"
          placeholder={
            selectedFeedbackType === 'bug'
              ? 'Describe the problem you encountered. Include steps to reproduce if possible...'
              : selectedFeedbackType === 'feature'
              ? 'Describe the feature you\'d like and how it would help you...'
              : 'Describe how this could be improved...'
          }
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
          'Submit'
        )}
      </Button>
    </form>
  );
}
