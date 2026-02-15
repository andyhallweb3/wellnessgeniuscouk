#!/usr/bin/env python3
"""Import newsletter subscribers from a CSV into Supabase (PostgREST).

Uses anon key (VITE_SUPABASE_PUBLISHABLE_KEY) and relies on INSERT policy.
Does INSERT with `resolution=ignore-duplicates` to avoid conflicts.

Supports common header variants:
- Google Sheet export: `Email`, `First Name`, `Last Name`
- Resend contact export: `email`, `first_name`, `last_name`, `unsubscribed`
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from typing import Dict, Iterable, List, Tuple

# Must match DB constraint `valid_email_format`:
#   email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


def load_env_file(path: str) -> Dict[str, str]:
    out: Dict[str, str] = {}
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def chunked(items: List[dict], size: int) -> Iterable[List[dict]]:
    for i in range(0, len(items), size):
        yield items[i : i + size]


def postgrest_insert(
    url: str,
    anon_key: str,
    rows: List[dict],
    on_conflict: str,
    max_retries: int = 6,
) -> Tuple[bool, str]:
    endpoint = f"{url.rstrip('/')}/rest/v1/newsletter_subscribers?on_conflict={on_conflict}"

    body = json.dumps(rows).encode("utf-8")
    req = urllib.request.Request(endpoint, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("apikey", anon_key)
    req.add_header("Authorization", f"Bearer {anon_key}")
    req.add_header("Prefer", "resolution=ignore-duplicates,return=minimal")

    for attempt in range(max_retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                # 201 Created is typical; PostgREST might return 200 in some cases.
                if resp.status in (200, 201, 204):
                    return True, ""
                return False, f"Unexpected status {resp.status}"
        except urllib.error.HTTPError as e:
            # Retry on rate limits / transient issues
            if e.code in (408, 409, 425, 429, 500, 502, 503, 504) and attempt < max_retries:
                wait = min(30, (2 ** attempt) + 0.5)
                time.sleep(wait)
                continue
            try:
                err_body = e.read().decode("utf-8", errors="replace")
            except Exception:
                err_body = ""
            return False, f"HTTP {e.code}: {err_body[:500]}"
        except Exception as e:
            if attempt < max_retries:
                wait = min(30, (2 ** attempt) + 0.5)
                time.sleep(wait)
                continue
            return False, str(e)

    return False, "Retries exhausted"

def edge_import_contacts(
    edge_url: str,
    newsletter_secret: str,
    rows: List[dict],
    source: str,
    max_retries: int = 6,
) -> Tuple[bool, str]:
    """Call edge function which imports contacts using service role (bypasses RLS)."""
    endpoint = edge_url
    body = json.dumps({"contacts": rows, "source": source}).encode("utf-8")

    req = urllib.request.Request(endpoint, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("x-newsletter-secret", newsletter_secret)

    for attempt in range(max_retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                if resp.status in (200, 201):
                    return True, ""
                txt = resp.read().decode("utf-8", errors="replace")
                return False, f"Unexpected status {resp.status}: {txt[:500]}"
        except urllib.error.HTTPError as e:
            if e.code in (408, 425, 429, 500, 502, 503, 504) and attempt < max_retries:
                wait = min(30, (2 ** attempt) + 0.5)
                time.sleep(wait)
                continue
            try:
                err_body = e.read().decode("utf-8", errors="replace")
            except Exception:
                err_body = ""
            return False, f"HTTP {e.code}: {err_body[:500]}"
        except Exception as e:
            if attempt < max_retries:
                wait = min(30, (2 ** attempt) + 0.5)
                time.sleep(wait)
                continue
            return False, str(e)

    return False, "Retries exhausted"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True, help="Path to CSV file")
    ap.add_argument(
        "--env",
        default=os.path.join(os.getcwd(), ".env"),
        help="Path to .env containing VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY",
    )
    ap.add_argument("--source", default="csv-import", help="Value for source column")
    ap.add_argument("--batch", type=int, default=500, help="Rows per request")
    ap.add_argument(
        "--edge-url",
        default="",
        help="If set, imports via edge function URL (bypasses RLS). Example: https://<ref>.supabase.co/functions/v1/import-resend-subscribers",
    )
    ap.add_argument(
        "--newsletter-secret",
        default="",
        help="Value for x-newsletter-secret header (required for --edge-url).",
    )
    args = ap.parse_args()

    use_edge = bool(args.edge_url.strip())
    supabase_url = None
    anon_key = None
    if not use_edge:
        env = load_env_file(args.env)
        supabase_url = env.get("VITE_SUPABASE_URL")
        anon_key = env.get("VITE_SUPABASE_PUBLISHABLE_KEY")
        if not supabase_url or not anon_key:
            print("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env", file=sys.stderr)
            return 2
    else:
        # Allow `--newsletter-secret` or env var for convenience.
        if not args.newsletter_secret.strip():
            args.newsletter_secret = os.environ.get("NEWSLETTER_AUTOMATION_SECRET", "")
        if not args.newsletter_secret.strip():
            print("--newsletter-secret (or env NEWSLETTER_AUTOMATION_SECRET) is required when using --edge-url", file=sys.stderr)
            return 2

    rows: List[dict] = []
    seen = set()
    invalid = 0

    with open(args.csv, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for r in reader:
            email = (r.get("Email") or r.get("email") or "").strip()
            if not email:
                invalid += 1
                continue
            email_norm = email.lower()
            if email_norm in seen:
                continue
            if not EMAIL_RE.match(email_norm):
                invalid += 1
                continue
            seen.add(email_norm)

            first = (r.get("First Name") or r.get("first_name") or "").strip()
            last = (r.get("Last Name") or r.get("last_name") or "").strip()
            name = (first + " " + last).strip() or None

            unsub = (r.get("unsubscribed") or "").strip().lower()
            is_active = not (unsub in ("1", "true", "yes", "y"))

            if use_edge:
                rows.append(
                    {
                        "email": email_norm,
                        "first_name": first or None,
                        "last_name": last or None,
                        "name": name,
                        "unsubscribed": (not is_active),
                    }
                )
            else:
                rows.append(
                    {
                        "email": email_norm,
                        "name": name,
                        "source": args.source,
                        "is_active": is_active,
                    }
                )

    if not rows:
        print("No valid rows found.")
        return 0

    total = len(rows)
    print(f"Prepared {total} unique valid emails (skipped invalid/blank: {invalid}).")

    ok_total = 0
    batch_num = 0
    for batch in chunked(rows, args.batch):
        batch_num += 1
        if use_edge:
            ok, err = edge_import_contacts(args.edge_url.strip(), args.newsletter_secret.strip(), batch, args.source)
        else:
            ok, err = postgrest_insert(supabase_url, anon_key, batch, on_conflict="email")
        if not ok:
            print(f"Batch {batch_num} failed: {err}", file=sys.stderr)
            return 1
        ok_total += len(batch)
        print(f"Inserted batch {batch_num}: {ok_total}/{total}")

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
