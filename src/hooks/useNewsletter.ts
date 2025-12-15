import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });

const RATE_LIMIT_KEY = 'newsletter_last_attempt';
const RATE_LIMIT_MS = 60000; // 1 minute between attempts

export const useNewsletter = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscribe = async (e: React.FormEvent, source: string = "website") => {
    e.preventDefault();
    
    // Client-side rate limiting
    const lastAttempt = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastAttempt && Date.now() - parseInt(lastAttempt) < RATE_LIMIT_MS) {
      toast({
        title: "Please wait",
        description: "You can only subscribe once per minute. Please try again shortly.",
        variant: "destructive",
      });
      return;
    }

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: validation.data, source });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already subscribed",
            description: "This email is already on our list.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Subscribed!",
          description: "You'll receive insights on AI and automation for wellness brands.",
        });
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { email, setEmail, isSubmitting, subscribe };
};
