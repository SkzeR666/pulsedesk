create extension if not exists "pgcrypto";

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all routines in schema public to authenticated;
grant select, insert on public.waitlist_leads to service_role;

alter default privileges in schema public
grant all on tables to service_role;

alter default privileges in schema public
grant all on sequences to service_role;

alter default privileges in schema public
grant all on routines to service_role;

alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
grant usage, select on sequences to authenticated;

alter default privileges in schema public
grant execute on routines to authenticated;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar_url text,
  account_status text not null default 'active' check (account_status in ('active', 'suspended')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_admins_identity_check check (user_id is not null or email <> '')
);

create table if not exists public.admin_access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null check (kind in ('workspace_admin')) default 'workspace_admin',
  label text not null default 'Workspace admin',
  note text not null default '',
  max_uses integer not null default 1 check (max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  active boolean not null default true,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  logo_url text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  icon text not null default 'users',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists teams_workspace_id_name_key
  on public.teams (workspace_id, lower(name));

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  team_id uuid references public.teams(id) on delete set null,
  joined_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, user_id)
);

create table if not exists public.admin_access_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  access_code_id uuid not null references public.admin_access_codes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  redeemed_email text not null,
  redeemed_at timestamptz not null default timezone('utc', now()),
  unique (access_code_id, user_id)
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null check (status in ('open', 'in_progress', 'waiting', 'resolved', 'closed')) default 'open',
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  requester_id uuid not null references public.profiles(id) on delete cascade,
  assignee_id uuid references public.profiles(id) on delete set null,
  team_id uuid not null references public.teams(id) on delete restrict,
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists requests_workspace_id_updated_at_idx
  on public.requests (workspace_id, updated_at desc);

create index if not exists requests_workspace_id_status_idx
  on public.requests (workspace_id, status);

create index if not exists requests_workspace_id_assignee_idx
  on public.requests (workspace_id, assignee_id);

create table if not exists public.request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists request_comments_request_id_created_at_idx
  on public.request_comments (request_id, created_at asc);

create table if not exists public.workspace_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists workspace_messages_workspace_id_created_at_idx
  on public.workspace_messages (workspace_id, created_at asc);

create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  views integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists knowledge_articles_workspace_id_updated_at_idx
  on public.knowledge_articles (workspace_id, updated_at desc);

create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.knowledge_articles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists article_comments_article_id_created_at_idx
  on public.article_comments (article_id, created_at asc);

create table if not exists public.saved_views (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  icon text not null default 'inbox',
  statuses text[] not null default '{}',
  priorities text[] not null default '{}',
  team_id uuid references public.teams(id) on delete set null,
  assignee_filter text,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists saved_views_workspace_id_name_key
  on public.saved_views (workspace_id, lower(name));

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'member')) default 'member',
  team_id uuid references public.teams(id) on delete set null,
  token text not null unique,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'revoked')) default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  accepted_at timestamptz
);

create index if not exists workspace_invitations_workspace_id_status_idx
  on public.workspace_invitations (workspace_id, status, created_at desc);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'system',
  accent_color text not null default 'blue',
  sidebar_density text not null default 'comfortable',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  daily_digest boolean not null default false,
  weekly_digest boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type text not null check (
    type in (
      'new-request',
      'assigned',
      'comment',
      'mention',
      'resolved',
      'status-change',
      'priority-change',
      'new-member',
      'kb-update'
    )
  ),
  title text not null,
  body text not null default '',
  link text,
  entity_type text check (entity_type in ('request', 'comment', 'article', 'workspace', 'member')),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_role_permissions (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  manage_members boolean not null default false,
  manage_views boolean not null default false,
  manage_knowledge boolean not null default false,
  manage_settings boolean not null default false,
  update_requests boolean not null default false,
  view_all_requests boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (workspace_id, role)
);

create table if not exists public.waitlist_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'landing',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_access_codes_active_created_at_idx
  on public.admin_access_codes (active, created_at desc);

create index if not exists admin_access_code_redemptions_access_code_id_idx
  on public.admin_access_code_redemptions (access_code_id, redeemed_at desc);

create or replace function public.increment_article_views(article_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.knowledge_articles
  set views = views + 1
  where id = article_id;
end;
$$;

create or replace function public.is_workspace_member(workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace
      and wm.user_id = auth.uid()
      and wm.role = 'admin'
  );
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins pa
    left join public.profiles p
      on p.id = auth.uid()
    where pa.user_id = auth.uid()
       or lower(pa.email) = lower(coalesce(p.email, ''))
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || coalesce(new.raw_user_meta_data ->> 'name', new.email)
  )
  on conflict (id) do update
  set email = excluded.email,
      name = coalesce(public.profiles.name, excluded.name),
      avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
      updated_at = timezone('utc', now());

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  update public.platform_admins
  set user_id = new.id,
      updated_at = timezone('utc', now())
  where user_id is null
    and lower(email) = lower(new.email);

  return new;
end;
$$;

create or replace function public.handle_updated_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email,
      name = coalesce(new.raw_user_meta_data ->> 'name', public.profiles.name, split_part(new.email, '@', 1)),
      updated_at = timezone('utc', now())
  where id = new.id;

  update public.platform_admins
  set user_id = new.id,
      updated_at = timezone('utc', now())
  where lower(email) = lower(new.email)
    and (user_id is null or user_id = new.id);

  return new;
end;
$$;

create or replace function public.bump_access_code_used_count()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.admin_access_codes
  set used_count = (
    select count(*)
    from public.admin_access_code_redemptions
    where access_code_id = new.access_code_id
  ),
      updated_at = timezone('utc', now())
  where id = new.access_code_id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update on auth.users
for each row execute procedure public.handle_updated_auth_user();

drop function if exists public.accept_workspace_invitation(text);
drop function if exists public.accept_workspace_invitation(text, uuid);
create or replace function public.accept_workspace_invitation(invitation_token text, selected_team_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_row public.workspace_invitations;
  resolved_team_id uuid;
begin
  select *
  into invitation_row
  from public.workspace_invitations
  where token = invitation_token
    and status = 'pending';

  if invitation_row.id is null then
    raise exception 'Invite not found or already used';
  end if;

  if lower(invitation_row.email) <> lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'Invite email does not match the authenticated user';
  end if;

  resolved_team_id := coalesce(invitation_row.team_id, selected_team_id);

  if resolved_team_id is null then
    raise exception 'Team is required to accept this invitation';
  end if;

  if not exists (
    select 1
    from public.teams
    where id = resolved_team_id
      and workspace_id = invitation_row.workspace_id
  ) then
    raise exception 'Invalid team for this workspace';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role, team_id)
  values (invitation_row.workspace_id, auth.uid(), invitation_row.role, resolved_team_id)
  on conflict (workspace_id, user_id) do update
  set role = excluded.role,
      team_id = excluded.team_id;

  update public.workspace_invitations
  set status = 'accepted',
      accepted_at = timezone('utc', now())
  where id = invitation_row.id;

  return invitation_row.workspace_id;
end;
$$;

create or replace function public.enforce_profile_update_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.account_status is distinct from new.account_status and not public.is_platform_admin() then
    raise exception 'Only platform admins can change account status';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_workspace_update_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status and not public.is_platform_admin() then
    raise exception 'Only platform admins can change workspace status';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_workspace_members_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_admins integer;
begin
  if tg_op in ('INSERT', 'UPDATE') and new.team_id is not null then
    if not exists (
      select 1
      from public.teams
      where id = new.team_id
        and workspace_id = new.workspace_id
    ) then
      raise exception 'Team does not belong to this workspace';
    end if;
  end if;

  if tg_op = 'UPDATE' and old.role = 'admin' and new.role <> 'admin' then
    select count(*)
    into remaining_admins
    from public.workspace_members
    where workspace_id = old.workspace_id
      and role = 'admin'
      and user_id <> old.user_id;

    if remaining_admins = 0 then
      raise exception 'Workspace must keep at least one admin';
    end if;
  end if;

  if tg_op = 'DELETE' and old.role = 'admin' then
    select count(*)
    into remaining_admins
    from public.workspace_members
    where workspace_id = old.workspace_id
      and role = 'admin'
      and user_id <> old.user_id;

    if remaining_admins = 0 then
      raise exception 'Workspace must keep at least one admin';
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.enforce_request_workspace_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.teams
    where id = new.team_id
      and workspace_id = new.workspace_id
  ) then
    raise exception 'Request team must belong to the same workspace';
  end if;

  if new.assignee_id is not null and not exists (
    select 1
    from public.workspace_members
    where workspace_id = new.workspace_id
      and user_id = new.assignee_id
  ) then
    raise exception 'Assignee must belong to the same workspace';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_saved_view_workspace_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.team_id is not null and not exists (
    select 1
    from public.teams
    where id = new.team_id
      and workspace_id = new.workspace_id
  ) then
    raise exception 'View team must belong to the same workspace';
  end if;

  if new.assignee_filter is not null and not exists (
    select 1
    from public.workspace_members
    where workspace_id = new.workspace_id
      and user_id::text = new.assignee_filter
  ) then
    raise exception 'View assignee must belong to the same workspace';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_invitation_workspace_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.team_id is not null and not exists (
    select 1
    from public.teams
    where id = new.team_id
      and workspace_id = new.workspace_id
  ) then
    raise exception 'Invitation team must belong to the same workspace';
  end if;

  new.email := lower(trim(new.email));
  return new;
end;
$$;

alter table public.profiles enable row level security;
alter table public.platform_admins enable row level security;
alter table public.admin_access_codes enable row level security;
alter table public.admin_access_code_redemptions enable row level security;
alter table public.workspaces enable row level security;
alter table public.teams enable row level security;
alter table public.workspace_members enable row level security;
alter table public.requests enable row level security;
alter table public.request_comments enable row level security;
alter table public.workspace_messages enable row level security;
alter table public.knowledge_articles enable row level security;
alter table public.article_comments enable row level security;
alter table public.saved_views enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.workspace_role_permissions enable row level security;
alter table public.user_preferences enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.waitlist_leads enable row level security;

create policy "profiles read own or coworkers" on public.profiles
for select using (
  id = auth.uid()
  or exists (
    select 1
    from public.workspace_members mine
    join public.workspace_members peer
      on mine.workspace_id = peer.workspace_id
    where mine.user_id = auth.uid()
      and peer.user_id = profiles.id
  )
);

create policy "profiles update self" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "platform admins read own access" on public.platform_admins
for select using (
  user_id = auth.uid()
  or lower(email) = lower(coalesce((select email from public.profiles where id = auth.uid()), ''))
);

create policy "platform admin codes no direct access" on public.admin_access_codes
for all using (false) with check (false);

create policy "platform admin code redemptions no direct access" on public.admin_access_code_redemptions
for all using (false) with check (false);

create policy "workspaces select member" on public.workspaces
for select using (public.is_workspace_member(id));

create policy "workspaces update admin" on public.workspaces
for update using (public.is_workspace_admin(id)) with check (public.is_workspace_admin(id));

create policy "teams select member" on public.teams
for select using (public.is_workspace_member(workspace_id));

create policy "teams insert admin" on public.teams
for insert with check (public.is_workspace_admin(workspace_id));

create policy "teams update admin" on public.teams
for update using (public.is_workspace_admin(workspace_id));

create policy "workspace members select member" on public.workspace_members
for select using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace members insert self or admin" on public.workspace_members;
create policy "workspace members insert admin" on public.workspace_members
for insert with check (public.is_workspace_admin(workspace_id));

create policy "workspace members update admin" on public.workspace_members
for update using (public.is_workspace_admin(workspace_id)) with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace members delete admin or self" on public.workspace_members;
create policy "workspace members delete admin" on public.workspace_members
for delete using (public.is_workspace_admin(workspace_id));

create policy "requests select member" on public.requests
for select using (public.is_workspace_member(workspace_id));

create policy "requests insert member" on public.requests
for insert with check (
  public.is_workspace_member(workspace_id)
  and requester_id = auth.uid()
);

create policy "requests update member" on public.requests
for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "comments select member" on public.request_comments
for select using (
  exists (
    select 1
    from public.requests r
    where r.id = request_id
      and public.is_workspace_member(r.workspace_id)
  )
);

create policy "comments insert member" on public.request_comments
for insert with check (
  author_id = auth.uid()
  and exists (
    select 1
    from public.requests r
    where r.id = request_id
      and public.is_workspace_member(r.workspace_id)
  )
);

create policy "workspace messages select member" on public.workspace_messages
for select using (public.is_workspace_member(workspace_id));

create policy "workspace messages insert member" on public.workspace_messages
for insert with check (
  author_id = auth.uid()
  and public.is_workspace_member(workspace_id)
);

create policy "articles select member" on public.knowledge_articles
for select using (public.is_workspace_member(workspace_id));

create policy "articles insert member" on public.knowledge_articles
for insert with check (
  public.is_workspace_member(workspace_id)
  and author_id = auth.uid()
);

create policy "articles update member" on public.knowledge_articles
for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "article comments select member" on public.article_comments
for select using (
  exists (
    select 1
    from public.knowledge_articles ka
    where ka.id = article_id
      and public.is_workspace_member(ka.workspace_id)
  )
);

create policy "article comments insert member" on public.article_comments
for insert with check (
  author_id = auth.uid()
  and exists (
    select 1
    from public.knowledge_articles ka
    where ka.id = article_id
      and public.is_workspace_member(ka.workspace_id)
  )
);

create policy "views select member" on public.saved_views
for select using (public.is_workspace_member(workspace_id));

create policy "views insert member" on public.saved_views
for insert with check (public.is_workspace_member(workspace_id));

create policy "views update member" on public.saved_views
for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "views delete member" on public.saved_views
for delete using (public.is_workspace_member(workspace_id));

create policy "invites select member" on public.workspace_invitations
for select using (public.is_workspace_member(workspace_id));

create policy "invites insert admin" on public.workspace_invitations
for insert with check (public.is_workspace_admin(workspace_id));

create policy "invites update admin" on public.workspace_invitations
for update using (public.is_workspace_admin(workspace_id)) with check (public.is_workspace_admin(workspace_id));

create policy "workspace role permissions select admin" on public.workspace_role_permissions
for select using (public.is_workspace_admin(workspace_id));

create policy "workspace role permissions upsert admin" on public.workspace_role_permissions
for all using (public.is_workspace_admin(workspace_id)) with check (public.is_workspace_admin(workspace_id));

create policy "user preferences select self" on public.user_preferences
for select using (user_id = auth.uid());

create policy "user preferences upsert self" on public.user_preferences
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notification preferences select self" on public.notification_preferences
for select using (user_id = auth.uid());

create policy "notification preferences upsert self" on public.notification_preferences
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notifications select self" on public.notifications
for select using (user_id = auth.uid());

create policy "notifications update self" on public.notifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "waitlist no direct access" on public.waitlist_leads
for all using (false) with check (false);

create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

drop trigger if exists profiles_guard_before_update on public.profiles;
create trigger profiles_guard_before_update
before update on public.profiles
for each row execute procedure public.enforce_profile_update_guard();

create trigger platform_admins_updated_at
before update on public.platform_admins
for each row execute procedure public.handle_updated_at();

create trigger admin_access_codes_updated_at
before update on public.admin_access_codes
for each row execute procedure public.handle_updated_at();

create trigger workspaces_updated_at
before update on public.workspaces
for each row execute procedure public.handle_updated_at();

drop trigger if exists workspaces_guard_before_update on public.workspaces;
create trigger workspaces_guard_before_update
before update on public.workspaces
for each row execute procedure public.enforce_workspace_update_guard();

create trigger teams_updated_at
before update on public.teams
for each row execute procedure public.handle_updated_at();

drop trigger if exists workspace_members_guard_before_write on public.workspace_members;
create trigger workspace_members_guard_before_write
before insert or update or delete on public.workspace_members
for each row execute procedure public.enforce_workspace_members_guard();

create trigger requests_updated_at
before update on public.requests
for each row execute procedure public.handle_updated_at();

drop trigger if exists requests_integrity_before_write on public.requests;
create trigger requests_integrity_before_write
before insert or update on public.requests
for each row execute procedure public.enforce_request_workspace_integrity();

create trigger knowledge_articles_updated_at
before update on public.knowledge_articles
for each row execute procedure public.handle_updated_at();

drop trigger if exists saved_views_integrity_before_write on public.saved_views;
create trigger saved_views_integrity_before_write
before insert or update on public.saved_views
for each row execute procedure public.enforce_saved_view_workspace_integrity();

drop trigger if exists workspace_invitations_integrity_before_write on public.workspace_invitations;
create trigger workspace_invitations_integrity_before_write
before insert or update on public.workspace_invitations
for each row execute procedure public.enforce_invitation_workspace_integrity();

create trigger user_preferences_updated_at
before update on public.user_preferences
for each row execute procedure public.handle_updated_at();

create trigger notification_preferences_updated_at
before update on public.notification_preferences
for each row execute procedure public.handle_updated_at();

create index if not exists notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_id_read_at_idx
  on public.notifications (user_id, read_at, created_at desc);

create trigger workspace_role_permissions_updated_at
before update on public.workspace_role_permissions
for each row execute procedure public.handle_updated_at();

create trigger waitlist_leads_updated_at
before update on public.waitlist_leads
for each row execute procedure public.handle_updated_at();

create trigger admin_access_code_redemptions_bump_usage
after insert on public.admin_access_code_redemptions
for each row execute procedure public.bump_access_code_used_count();
