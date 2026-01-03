import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });

const RATE_LIMIT_KEY = 'newsletter_last_attempt';
const RATE_LIMIT_MS = 60000; // 1 minute between attempts

export const useNewsletter = (redirectOnSuccess = false) => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
      logger.log('[Newsletter] Attempting signup for:', validation.data, 'source:', source);
      
      // Use plain INSERT - RLS blocks SELECT so upsert doesn't work
      // Handle duplicate error silently to prevent email enumeration
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: validation.data, source });

      // Ignore unique constraint violations (email already exists)
      // Show success either way to prevent enumeration attacks
      if (error && error.code !== '23505') {
        logger.error('[Newsletter] Insert error:', error);
        throw error;
      }
      
      const isNewSubscriber = !error || error.code !== '23505';
      logger.log('[Newsletter] Signup successful for:', validation.data, isNewSubscriber ? '(new)' : '(already existed)');
      
      // Send confirmation email only for new subscribers
      if (isNewSubscriber) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-newsletter-confirmation', {
            body: { email: validation.data }
          });
          if (emailError) {
            logger.error('[Newsletter] Confirmation email error:', emailError);
          } else {
            logger.log('[Newsletter] Confirmation email sent to:', validation.data);
          }
        } catch (emailErr) {
          logger.error('[Newsletter] Failed to send confirmation:', emailErr);
        }
      }
      
      // Redirect or show toast based on configuration
      if (redirectOnSuccess) {
        navigate("/newsletter/thank-you");
      } else {
        toast({
          title: "You're on the list!",
          description: "You'll receive insights on AI and automation for wellness brands.",
        });
      }
      setEmail("");
    } catch (error) {
      logger.error("Newsletter subscription error:", error);
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
