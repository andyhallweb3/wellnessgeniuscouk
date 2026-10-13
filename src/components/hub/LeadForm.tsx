import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { captureLead } from "@/lib/leads";

interface LeadFormProps {
  source: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
  compact?: boolean;
}

const LeadForm = ({
  source,
  title = "Get the free briefing",
  description = "Weekly wellness, hospitality and AI intelligence. Free. Unsubscribe any time.",
  buttonLabel = "Get the free briefing",
  compact = false,
}: LeadFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      await captureLead(email, source, name);
      setDone(true);
      toast.success("You're on the list.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`bg-card border border-border rounded-2xl ${compact ? "p-4" : "p-6 sm:p-8"}`}>
      <h3 className={`${compact ? "text-base" : "text-xl"} font-semibold mb-1`}>{title}</h3>
      <p className={`text-sm text-muted-foreground ${compact ? "mb-3" : "mb-5"}`}>{description}</p>
      {done ? (
        <p className="text-sm font-medium text-accent">Thanks. Look out for the next briefing in your inbox.</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="sm:max-w-[180px]" />
          <Input type="email" required placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" variant="accent" disabled={busy}>{busy ? "Sending..." : buttonLabel}</Button>
        </form>
      )}
      <p className="text-xs text-muted-foreground mt-3">
        By signing up you agree to our <a href="/privacy" className="underline">privacy policy</a>.
      </p>
    </div>
  );
};

export default LeadForm;
