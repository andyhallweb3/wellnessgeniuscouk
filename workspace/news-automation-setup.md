# Automated News Sending Setup (Wellness Genius + Resend)

This project now supports secure scheduled sends via `newsletter-run` using:
- `action: "auto-send"`
- Header: `x-newsletter-secret: <NEWSLETTER_AUTOMATION_SECRET>`

Manual admin sends still require normal admin auth.

## 1. Set required secrets in Supabase Edge Functions
In Supabase project secrets, set:
- `RESEND_API_KEY`
- `LOVABLE_API_KEY`
- `UNSUBSCRIBE_SECRET`
- `NEWSLETTER_AUTOMATION_SECRET` (new)

## 2. Validate one automated send call manually
Use this from terminal (replace values):

```bash
curl -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/newsletter-run" \
  -H "Content-Type: application/json" \
  -H "x-newsletter-secret: <NEWSLETTER_AUTOMATION_SECRET>" \
  -d '{"action":"auto-send"}'
```

Expected response includes:
- `success: true`
- `message: "Newsletter sending started"`
- `sendId`

## 3. Create cron jobs in the SQL editor
Use `workspace/cron-setup-vzjissteombeycnhoyhz.sql`.

Important:
- Replace `{{NEWSLETTER_AUTOMATION_SECRET}}` at runtime in the SQL editor.
- Do not commit real secrets to git.

## 4. Check cron jobs
```sql
SELECT * FROM cron.job ORDER BY jobid DESC;
```

## 5. Remove old/incorrect job
```sql
SELECT cron.unschedule('newsletter-auto-send-weekly');
```

## Notes
- `newsletter-run` auto-selects recent RSS items if no manual article selection is provided.
- Sends are logged in `newsletter_sends` and `newsletter_send_recipients`.
- Resend delivery/open/click events continue to flow through existing webhook/event tables.
