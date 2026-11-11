// Shared mail helper for edge functions.
// Sends via Gmail SMTP (smtp.gmail.com:465) when GMAIL_APP_PASSWORD is set,
// otherwise falls back to Resend. Exposes a Resend-compatible `Resend` class
// so existing `resend.emails.send({...})` calls keep working unchanged.
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { Resend as ResendSdk } from "https://esm.sh/resend@2.0.0";

export interface SendOptions {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  reply_to?: string | string[];
  replyTo?: string | string[];
  headers?: Record<string, string>;
  [key: string]: unknown;
}

export interface SendResult {
  data: { id: string } | null;
  error: { message: string; name?: string } | null;
}

const list = (v?: string | string[]) => (v ? (Array.isArray(v) ? v : [v]) : undefined);

export function gmailConfigured(): boolean {
  return !!Deno.env.get("GMAIL_APP_PASSWORD");
}

// Gmail only sends as the authenticated mailbox, so keep the display name and
// replace the address with GMAIL_USER. The original address becomes reply-to.
function gmailFrom(from: string, user: string): { from: string; original?: string } {
  const m = from.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  const name = m ? m[1].trim() : "";
  const addr = m ? m[2].trim() : from.trim();
  const out = name ? `${name} <${user}>` : user;
  return { from: out, original: addr.toLowerCase() !== user.toLowerCase() ? addr : undefined };
}

export async function sendViaGmail(opts: SendOptions): Promise<SendResult> {
  const user = Deno.env.get("GMAIL_USER") ?? "andy@wellnessgenius.ai";
  const password = (Deno.env.get("GMAIL_APP_PASSWORD") ?? "").replace(/\s+/g, "");
  const { from } = gmailFrom(opts.from, user);
  const replyTo = list(opts.reply_to ?? opts.replyTo)?.[0];
  const client = new SMTPClient({
    connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: user, password } },
  });
  try {
    await client.send({
      from,
      to: list(opts.to)!,
      cc: list(opts.cc),
      bcc: list(opts.bcc),
      replyTo,
      subject: opts.subject,
      content: opts.text ?? "auto",
      html: opts.html,
      headers: opts.headers,
    });
    return { data: { id: `gmail-${crypto.randomUUID()}` }, error: null };
  } catch (e) {
    console.error("Gmail SMTP send failed:", e instanceof Error ? e.message : e);
    return { data: null, error: { name: "gmail_smtp_error", message: e instanceof Error ? e.message : String(e) } };
  } finally {
    try { await client.close(); } catch (_) { /* ignore */ }
  }
}

export async function sendEmail(opts: SendOptions, resendApiKey?: string | null): Promise<SendResult> {
  if (gmailConfigured()) return await sendViaGmail(opts);
  const key = resendApiKey ?? Deno.env.get("RESEND_API_KEY");
  if (!key) return { data: null, error: { name: "no_provider", message: "No email provider configured" } };
  // deno-lint-ignore no-explicit-any
  return (await new ResendSdk(key).emails.send(opts as any)) as SendResult;
}

/** Drop-in replacement for the Resend SDK class. */
export class Resend {
  constructor(private apiKey?: string | null) {}
  emails = {
    send: (opts: SendOptions) => sendEmail(opts, this.apiKey),
  };
}
