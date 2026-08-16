-- Published blog content and marketplace listings are public pages. The
-- previous policies said "public" in comments but granted/select-scoped them
-- only to authenticated users, so anonymous visitors always saw empty states.

-- Published blog posts: anyone may read; authors/admins may also read drafts.
drop policy if exists "blog_select_published" on public.blog_posts;
create policy "blog_select_published" on public.blog_posts
  for select to anon, authenticated
  using (published = true or auth.uid() = author_id or public.is_admin());
grant select on public.blog_posts to anon;

-- Coaching center and course directory: public read, authenticated owner write.
drop policy if exists "coaching_centers_select_all" on public.coaching_centers;
create policy "coaching_centers_select_all" on public.coaching_centers
  for select to anon, authenticated using (true);

drop policy if exists "coaching_courses_select_all" on public.coaching_courses;
create policy "coaching_courses_select_all" on public.coaching_courses
  for select to anon, authenticated using (true);

grant select on public.coaching_centers to anon;
grant select on public.coaching_courses to anon;
