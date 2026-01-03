import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Download, Loader2, CheckCircle, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateAIMythsDeck, generate90DayChecklist, generateQuickCheck } from "@/lib/pdf-generators";

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
  const navigate = useNavigate();
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
    } else if (productId === "quick-check-lite") {
      const doc = generateQuickCheck();
      filename = "AI-Readiness-Quick-Check.pdf";
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
      // Save to newsletter_subscribers table (ignore if already exists)
      const { error: subError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          source: `download-${productId}`,
        });

      // Ignore duplicate email error (23505 is unique_violation)
      if (subError && !subError.message?.includes("duplicate key")) {
        console.error("Subscriber error:", subError);
      }

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

    } catch (error: unknown) {
      console.error("Error saving subscriber:", error);
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = () => {
    // Store email for pre-filling signup form
    sessionStorage.setItem("signup_email", email.trim().toLowerCase());
    sessionStorage.setItem("signup_name", name.trim() || "");
    onClose();
    setIsSuccess(false);
    setName("");
    setEmail("");
    navigate("/auth?mode=signup&from=download");
  };

  const handleSkipAccount = () => {
    onClose();
    setIsSuccess(false);
    setName("");
    setEmail("");
  };

  const handleClose = () => {
    if (!isSubmitting && !isSuccess) {
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
            {isSuccess ? (
              <>
                <CheckCircle size={20} className="text-green-500" />
                Download Complete!
              </>
            ) : (
              <>
                <Download size={20} className="text-accent" />
                Download {productName}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuccess 
              ? "Create a free account to access your downloads anytime and get personalised AI insights."
              : "Enter your email to receive your free PDF. We will also send you occasional insights (you can unsubscribe anytime)."
            }
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Check your downloads folder for the PDF.
              </p>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <UserPlus size={16} className="text-accent" />
                Why create an account?
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Access your downloads anytime</li>
                <li>• Get personalised AI recommendations</li>
                <li>• Track your AI readiness progress</li>
                <li>• Unlock member-only resources</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="accent"
                className="w-full"
                onClick={handleCreateAccount}
              >
                <UserPlus size={16} />
                Create Free Account
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleSkipAccount}
              >
                Maybe Later
              </Button>
            </div>
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
