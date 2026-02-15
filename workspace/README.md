# Workspace Notes

This folder contains the agent operating docs and templates used via Telegram/OpenClaw.

Key files:
- `workspace/wellness-genius-config.md`: voice, funnel, positioning (source of truth)
- `workspace/agent-actions-knowledge-base.md`: authority levels + hard limits (source of truth)
- `workspace/agent-instructions.md`: daily/weekly workflows
- `workspace/daily-brief-template.md`: template the agent fills each morning
- `workspace/content-queue.md`: drafts + approval workflow
- `workspace/pipeline.md`: lead pipeline tracker
- `workspace/newsletter-template.md`: monthly email template

Automation:
- `workspace/cron-setup-vzjissteombeycnhoyhz.sql`: run in Supabase SQL editor to schedule cron jobs.
  Replace `{{NEWSLETTER_AUTOMATION_SECRET}}` at runtime; never commit real secrets.
