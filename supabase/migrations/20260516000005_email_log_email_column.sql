alter table email_automation_log add column if not exists email text;
alter table email_automation_log alter column user_id drop not null;
create index if not exists email_automation_log_email_idx on email_automation_log(email);
