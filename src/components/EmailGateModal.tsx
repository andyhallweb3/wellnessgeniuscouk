import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateAIMythsDeck, generate90DayChecklist } from "@/lib/pdf-generators";

interface EmailGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  downloadUrl: string;
}

const EmailGateModal = ({
  isOpen,
  onClose,
  productName,
  productId,
}: EmailGateModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const generateAndDownloadPDF = () => {
    let filename = "";
    
    if (productId === "myths-deck") {
      const doc = generateAIMythsDeck();
      filename = "Wellness-AI-Myths-Deck.pdf";
      doc.save(filename);
    } else if (productId === "reality-checklist") {
      const doc = generate90DayChecklist();
      filename = "90-Day-AI-Reality-Checklist.pdf";
      doc.save(filename);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to newsletter_subscribers table
      const { error: subError } = await supabase
        .from("newsletter_subscribers")
        .upsert(
          {
            email: email.trim().toLowerCase(),
            name: name.trim() || null,
            source: `download-${productId}`,
          },
          { onConflict: "email" }
        );

      if (subError) throw subError;

      // Log the download
      const { error: downloadError } = await supabase
        .from("product_downloads")
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          product_id: productId,
          product_name: productName,
          product_type: "free",
          download_type: "free",
        });

      if (downloadError) {
        console.error("Error logging download:", downloadError);
        // Don't block the download if logging fails
      }

      setIsSuccess(true);
      toast.success("Thank you! Your download is starting...");
      
      // Trigger upsell email in background
      supabase.functions.invoke("send-download-upsell", {
        body: { 
          email: email.trim().toLowerCase(), 
          name: name.trim() || null,
          productId,
          productName,
        },
      }).catch(console.error);
      
      // Generate and download PDF after short delay
      setTimeout(() => {
        generateAndDownloadPDF();
      }, 500);

      // Close modal after download starts
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setName("");
        setEmail("");
      }, 2000);
    } catch (error: unknown) {
      console.error("Error saving subscriber:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setIsSuccess(false);
      setName("");
      setEmail("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={20} className="text-accent" />
            Download {productName}
          </DialogTitle>
          <DialogDescription>
            Enter your email to receive your free PDF. We will also send you occasional insights (you can unsubscribe anytime).
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Download Starting!</h3>
            <p className="text-sm text-muted-foreground">
              Check your downloads folder for the PDF.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              variant="accent"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Get Free Download
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By downloading, you agree to receive occasional emails from Wellness Genius. Unsubscribe anytime.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailGateModal;
