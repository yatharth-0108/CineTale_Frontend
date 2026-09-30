# Supabase setup (phase 2)
Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Add `http://localhost:5173/reset-password` to Auth > Redirect URLs.

```sql
create table public.profiles (id uuid primary key references auth.users on delete cascade, username text unique not null, full_name text);
create table public.user_preferences (
  user_id uuid primary key references auth.users on delete cascade,
  genres text[], liked_movie_ids bigint[], disliked_movie_ids bigint[], moods text[], onboarded_at timestamptz);
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
create policy "profiles readable" on public.profiles for select using (true);
create policy "own profile write" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own prefs" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```
Note: `profiles` rows must be created by a trigger on `auth.users` (from signup metadata `username` / `full_name`); this is not yet included.
Note: getPreferences reads `onboarded_at`; the demo store uses `onboardedAt`.

## Phase 3 tables
```sql
create table public.interactions (user_id uuid references auth.users on delete cascade, movie_id bigint, type text check (type in ('like','dislike')), rating int check (rating between 1 and 5), movie jsonb, updated_at timestamptz default now(), primary key (user_id, movie_id));
create table public.watchlist (user_id uuid references auth.users on delete cascade, movie_id bigint, movie jsonb, added_at timestamptz default now(), primary key (user_id, movie_id));
alter table public.interactions enable row level security; alter table public.watchlist enable row level security;
create policy "own interactions" on public.interactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own watchlist" on public.watchlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```
Recommendation backend contract: see the comment at the top of `src/services/recommendationService.js`.

## Phase 4 tables (social)
Author joins require foreign keys to `profiles` (default constraint names are used by the client).
```sql
alter table public.profiles add column if not exists bio text, add column if not exists favorite_genres text[];
create table public.posts (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, type text default 'post', body text not null check (char_length(body) <= 500), movie jsonb, rating int, spoiler boolean default false, created_at timestamptz default now());
create table public.post_likes (post_id uuid references public.posts on delete cascade, user_id uuid references auth.users on delete cascade, primary key (post_id, user_id));
create table public.comments (id uuid primary key default gen_random_uuid(), post_id uuid references public.posts on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, body text not null, created_at timestamptz default now());
create table public.follows (follower_id uuid references auth.users on delete cascade, followee_id uuid references auth.users on delete cascade, primary key (follower_id, followee_id));
create table public.reviews (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, movie_id bigint not null, movie jsonb, rating int not null, title text not null, body text not null, spoiler boolean default false, created_at timestamptz default now(), unique (user_id, movie_id));
create table public.collections (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade, title text not null, description text, is_public boolean default false, created_at timestamptz default now());
create table public.collection_movies (collection_id uuid references public.collections on delete cascade, movie_id bigint, movie jsonb, primary key (collection_id, movie_id));
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade, type text, text text, link text, read boolean default false, created_at timestamptz default now());
```
RLS to write (not included): posts/comments/reviews readable by authenticated users, writable by owner; likes and follows writable by the acting user; collections readable when `is_public` or owner, movies follow their collection; notifications readable/updatable by owner only. Notifications must be inserted by database triggers (follow, like, comment), not by clients.
