create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.grant_studio_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'info@epicaurastudio.com' then
    insert into public.user_roles(user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.grant_studio_admin();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  client text,
  is_confidential boolean not null default false,
  anonymous_label text,
  summary text,
  cover_url text,
  cover_alt text,
  thumbnail_url text,
  categories text[] not null default '{}',
  services text[] not null default '{}',
  role text,
  industry text,
  timeline text,
  blocks jsonb not null default '[]',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create policy "published projects public" on public.projects for select to anon, authenticated using (status = 'published');
create policy "admins read all projects" on public.projects for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins write projects" on public.projects for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  number text,
  short_description text,
  description text,
  problems text,
  capabilities text[] not null default '{}',
  media_url text,
  featured boolean not null default true,
  status text not null default 'published' check (status in ('draft','published')),
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "published services public" on public.services for select to anon, authenticated using (status = 'published');
create policy "admins read all services" on public.services for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins write services" on public.services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger services_touch before update on public.services for each row execute function public.touch_updated_at();

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content jsonb not null default '{}',
  seo_title text,
  seo_description text,
  status text not null default 'published' check (status in ('draft','published')),
  updated_at timestamptz not null default now()
);
grant select on public.pages to anon;
grant select, insert, update, delete on public.pages to authenticated;
grant all on public.pages to service_role;
alter table public.pages enable row level security;
create policy "published pages public" on public.pages for select to anon, authenticated using (status = 'published');
create policy "admins read all pages" on public.pages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins write pages" on public.pages for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger pages_touch before update on public.pages for each row execute function public.touch_updated_at();

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  logo_url text,
  contact_email text,
  social_links jsonb not null default '[]',
  cta_text text not null default 'Start a project',
  footer_text text,
  default_seo_title text,
  default_seo_description text,
  default_og_image text,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon;
grant select, insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "settings public" on public.site_settings for select to anon, authenticated using (true);
create policy "admins write settings" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  website text,
  need text,
  services text[] not null default '{}',
  context text,
  engagement text,
  budget text,
  timeline text,
  status text not null default 'new' check (status in ('new','reviewed','archived')),
  created_at timestamptz not null default now()
);
grant select, update, delete on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "admins read enquiries" on public.enquiries for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins update enquiries" on public.enquiries for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins delete enquiries" on public.enquiries for delete to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.site_settings (id, contact_email, cta_text, footer_text, default_seo_title, default_seo_description)
values (1, 'info@epicaurastudio.com', 'Start a project', 'A strategic design partner for brands and digital products.', 'EpicAura Studio — Brand, product & digital design', 'EpicAura Studio partners with ambitious teams on brand identity, product design and digital experiences.');

insert into public.services (title, slug, number, short_description, description, problems, capabilities, sort_order) values
('Product design','product-design','01','Digital products designed around real user needs, clear workflows and purposeful interactions.','We shape products from the flow up — clarifying what people are trying to do, removing friction, and building interface systems a team can keep extending.','Products that grew faster than their structure. Workflows users struggle to complete. Interfaces that feel inconsistent across features.', array['UX and interaction design','User flows and information architecture','Wireframes and prototypes','Interface design','Design systems','Usability evaluation'],1),
('Brand identity','brand-identity','02','Coherent visual identities that give businesses a distinctive, consistent presence.','We build identities as systems — a clear point of view expressed through typography, colour, and form, documented so it holds together wherever the brand appears.','A brand that no longer reflects the business. Inconsistent expression across channels. A new venture that needs to look credible from day one.', array['Brand discovery and positioning support','Visual identity systems','Typography and colour systems','Brand guidelines','Brand applications'],2),
('Digital experiences','digital-experiences','03','Digital touchpoints that communicate clearly and guide people toward meaningful actions.','Websites and digital surfaces built on a clear structure and a confident message, designed in close collaboration with the people who will build them.','A website that undersells the business. Unclear messaging and structure. Pages that are hard to maintain or extend.', array['Website strategy and structure','Website and landing-page design','Digital interface design','Responsive experiences','Design-to-development collaboration'],3);