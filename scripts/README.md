# Scripts

## Import Newsletter Subscribers From CSV

File: `scripts/import_newsletter_subscribers_from_csv.py`

Use this when `newsletter_subscribers` is empty (new Supabase project) and you need to import contacts from a CSV export (Google Sheets, Resend export, etc).

Preferred (bypasses RLS via edge function):
```bash
export NEWSLETTER_AUTOMATION_SECRET='...'
python3 scripts/import_newsletter_subscribers_from_csv.py \
  --csv "/path/to/contacts.csv" \
  --source "resend-csv-YYYY-MM-DD" \
  --edge-url "https://<project-ref>.supabase.co/functions/v1/import-resend-subscribers"
```

Fallback (direct PostgREST insert with anon key; may fail if RLS disallows bulk insert):
```bash
python3 scripts/import_newsletter_subscribers_from_csv.py \
  --csv "/path/to/contacts.csv" \
  --source "csv-import-YYYY-MM-DD"
```
