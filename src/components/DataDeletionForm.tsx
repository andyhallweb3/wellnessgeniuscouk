import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { z } from "zod";

const deletionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  details: z.string().trim().max(1000, "Details must be less than 1000 characters").optional(),
});

export const DataDeletionForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    details: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = deletionSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Send to edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-data-deletion-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(result.data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      setIsSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "We've received your data deletion request and will process it within 30 days.",
      });
    } catch (error) {
      console.error("Error submitting deletion request:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try emailing us directly at andy@wellnessgenius.co.uk",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 text-center">
        <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Request Received</h3>
        <p className="text-muted-foreground text-sm">
          We've received your data deletion request. You'll receive a confirmation email shortly, 
          and we'll process your request within 30 days as required by GDPR.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="deletion-name" className="block text-sm font-medium mb-1.5">
          Full Name <span className="text-destructive">*</span>
        </label>
        <Input
          id="deletion-name"
          type="text"
          placeholder="Your full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? "border-destructive" : ""}
          disabled={isSubmitting}
          maxLength={100}
        />
        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="deletion-email" className="block text-sm font-medium mb-1.5">
          Email Address <span className="text-destructive">*</span>
        </label>
        <Input
          id="deletion-email"
          type="email"
          placeholder="The email address associated with your data"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={errors.email ? "border-destructive" : ""}
          disabled={isSubmitting}
          maxLength={255}
        />
        {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="deletion-details" className="block text-sm font-medium mb-1.5">
          Additional Details (Optional)
        </label>
        <Textarea
          id="deletion-details"
          placeholder="Any specific details about which data you'd like deleted (e.g., newsletter subscription, AI Coach data, assessment results)"
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          className={errors.details ? "border-destructive" : ""}
          disabled={isSubmitting}
          rows={3}
          maxLength={1000}
        />
        {errors.details && <p className="text-destructive text-xs mt-1">{errors.details}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          {formData.details.length}/1000 characters
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Deletion Request
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        By submitting this form, you're requesting deletion of your personal data in accordance 
        with your rights under GDPR. We'll verify your identity and process your request within 30 days.
      </p>
    </form>
  );
};

export default DataDeletionForm;
