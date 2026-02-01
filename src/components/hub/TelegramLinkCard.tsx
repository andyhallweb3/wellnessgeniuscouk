import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { MessageCircle, Check, Unlink, Loader2 } from "lucide-react";

interface TelegramLink {
  id: string;
  telegram_user_id: number;
  telegram_username: string | null;
  telegram_first_name: string | null;
  created_at: string;
}

export default function TelegramLinkCard() {
  const { user } = useAuth();
  const [linkCode, setLinkCode] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [telegramLink, setTelegramLink] = useState<TelegramLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTelegramLink();
    }
  }, [user]);

  const fetchTelegramLink = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('telegram_users')
        .select('id, telegram_user_id, telegram_username, telegram_first_name, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching telegram link:', error);
      }
      
      setTelegramLink(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!user || !linkCode.trim()) {
      toast.error("Please enter a link code");
      return;
    }

    setIsLinking(true);
    try {
      // Find the telegram user with this link code
      const { data: telegramUser, error: findError } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('link_code', linkCode.toUpperCase())
        .gt('link_code_expires_at', new Date().toISOString())
        .is('user_id', null)
        .maybeSingle();

      if (findError) throw findError;

      if (!telegramUser) {
        toast.error("Invalid or expired link code. Please get a new code from the Telegram bot with /link");
        return;
      }

      // Link the account
      const { error: updateError } = await supabase
        .from('telegram_users')
        .update({ 
          user_id: user.id, 
          link_code: null, 
          link_code_expires_at: null 
        })
        .eq('id', telegramUser.id);

      if (updateError) throw updateError;

      toast.success("Telegram account linked successfully! 🎉");
      setLinkCode("");
      fetchTelegramLink();
    } catch (error) {
      console.error('Link error:', error);
      toast.error("Failed to link account. Please try again.");
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!telegramLink) return;

    try {
      const { error } = await supabase
        .from('telegram_users')
        .update({ user_id: null })
        .eq('id', telegramLink.id);

      if (error) throw error;

      toast.success("Telegram account unlinked");
      setTelegramLink(null);
    } catch (error) {
      console.error('Unlink error:', error);
      toast.error("Failed to unlink account");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <MessageCircle size={20} className="text-blue-500" />
        </div>
        <div>
          <h3 className="font-heading">Telegram Bot</h3>
          <p className="text-sm text-muted-foreground">
            Connect for 24/7 AI access on the go
          </p>
        </div>
      </div>

      {telegramLink ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <Check size={20} className="text-green-500" />
            <div className="flex-1">
              <p className="font-medium text-green-700 dark:text-green-400">
                Account Linked
              </p>
              <p className="text-sm text-muted-foreground">
                {telegramLink.telegram_first_name}
                {telegramLink.telegram_username && ` (@${telegramLink.telegram_username})`}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">Premium Commands Unlocked:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <code>/strategy</code> - Deep strategic analysis</li>
              <li>• <code>/research</code> - Market intelligence</li>
              <li>• <code>/benchmark</code> - Industry benchmarks</li>
              <li>• Unlimited chat messages</li>
            </ul>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUnlink}
            className="w-full"
          >
            <Unlink size={16} />
            Unlink Telegram
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              1. Open <a href="https://t.me/Wellnessgenius_bot" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">@Wellnessgenius_bot</a> on Telegram
            </p>
            <p className="text-sm text-muted-foreground">
              2. Send <code>/link</code> to get your code
            </p>
            <p className="text-sm text-muted-foreground">
              3. Enter the code below:
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter 6-character code"
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono text-center tracking-widest"
            />
            <Button 
              variant="accent" 
              onClick={handleLinkAccount}
              disabled={isLinking || linkCode.length < 6}
            >
              {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Link"}
            </Button>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium mb-1">Why link?</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Unlimited chat with AI Advisor</li>
              <li>• Premium commands (/strategy, /research)</li>
              <li>• Personalised responses using your profile</li>
              <li>• Access your readiness scores in chat</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
