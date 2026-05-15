-- Allow admin users to read and manage newsletter_subscribers
create policy "Admins can read subscribers"
  on newsletter_subscribers for select
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

create policy "Admins can update subscribers"
  on newsletter_subscribers for update
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

create policy "Admins can delete subscribers"
  on newsletter_subscribers for delete
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- Allow admins to read email_automation_log
alter table email_automation_log enable row level security;

create policy "Admins can read email log"
  on email_automation_log for select
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );
