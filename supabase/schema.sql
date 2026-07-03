-- =====================================================
-- LearnIT — Schéma Supabase
-- À coller dans l'éditeur SQL de ton projet Supabase
-- =====================================================

-- =====================================================
-- PROFILES (étend auth.users)
-- doit être créée AVANT get_my_role()
-- =====================================================
create table public.profiles (
  id        uuid references auth.users(id) on delete cascade primary key,
  name      text not null,
  role      text not null default 'apprenante'
              check (role in ('apprenante', 'formateur', 'admin')),
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

-- =====================================================
-- FONCTION UTILITAIRE (créée après profiles)
-- évite la récursion infinie dans les politiques RLS
-- =====================================================
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer;

-- =====================================================
-- RLS POLICIES — profiles
-- =====================================================
create policy "Profil visible par son propriétaire"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin voit tous les profils"
  on public.profiles for select
  using (public.get_my_role() = 'admin');

create policy "Profil modifiable par son propriétaire"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin peut modifier tous les profils"
  on public.profiles for update
  using (public.get_my_role() = 'admin');

-- =====================================================
-- TRIGGER : crée un profil à chaque inscription
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- COURSES
-- =====================================================
create table public.courses (
  id            uuid default gen_random_uuid() primary key,
  title         text not null,
  description   text,
  instructor_id uuid references public.profiles(id),
  published     boolean default false not null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

alter table public.courses enable row level security;

create policy "Cours publiés visibles par tous"
  on public.courses for select
  using (published = true);

create policy "Formateur voit ses propres cours"
  on public.courses for select
  using (instructor_id = auth.uid());

create policy "Admin voit tous les cours"
  on public.courses for select
  using (public.get_my_role() = 'admin');

create policy "Formateur peut créer des cours"
  on public.courses for insert
  with check (
    instructor_id = auth.uid() and
    public.get_my_role() in ('formateur', 'admin')
  );

create policy "Formateur peut modifier ses cours"
  on public.courses for update
  using (instructor_id = auth.uid());

create policy "Admin peut modifier tous les cours"
  on public.courses for update
  using (public.get_my_role() = 'admin');

-- =====================================================
-- LESSONS
-- =====================================================
create table public.lessons (
  id          uuid default gen_random_uuid() primary key,
  course_id   uuid references public.courses(id) on delete cascade not null,
  title       text not null,
  content     text default '' not null,
  order_index integer default 0 not null,
  created_at  timestamptz default now() not null
);

alter table public.lessons enable row level security;

create policy "Leçons visibles si cours publié"
  on public.lessons for select
  using (
    exists (
      select 1 from public.courses
      where id = course_id
        and (published = true or instructor_id = auth.uid())
    )
  );

create policy "Admin voit toutes les leçons"
  on public.lessons for select
  using (public.get_my_role() = 'admin');

create policy "Formateur gère ses leçons"
  on public.lessons for insert
  with check (
    exists (
      select 1 from public.courses
      where id = course_id and instructor_id = auth.uid()
    )
  );

create policy "Formateur modifie ses leçons"
  on public.lessons for update
  using (
    exists (
      select 1 from public.courses
      where id = course_id and instructor_id = auth.uid()
    )
  );

create policy "Formateur supprime ses leçons"
  on public.lessons for delete
  using (
    exists (
      select 1 from public.courses
      where id = course_id and instructor_id = auth.uid()
    )
  );

-- =====================================================
-- EXERCISES
-- =====================================================
create table public.exercises (
  id         uuid default gen_random_uuid() primary key,
  lesson_id  uuid references public.lessons(id) on delete cascade not null,
  title      text not null,
  created_at timestamptz default now() not null
);

alter table public.exercises enable row level security;

create policy "Exercices visibles si leçon visible"
  on public.exercises for select
  using (
    exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = lesson_id
        and (c.published = true or c.instructor_id = auth.uid())
    )
  );

create policy "Formateur gère ses exercices"
  on public.exercises for insert
  with check (
    exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = lesson_id and c.instructor_id = auth.uid()
    )
  );

-- =====================================================
-- QUESTIONS
-- =====================================================
create table public.questions (
  id             uuid default gen_random_uuid() primary key,
  exercise_id    uuid references public.exercises(id) on delete cascade not null,
  question       text not null,
  type           text not null check (type in ('qcm', 'vrai_faux', 'texte_libre')),
  options        jsonb,
  correct_answer text not null,
  order_index    integer default 0 not null
);

alter table public.questions enable row level security;

create policy "Questions visibles si exercice visible"
  on public.questions for select
  using (
    exists (
      select 1 from public.exercises e
      join public.lessons l on l.id = e.lesson_id
      join public.courses c on c.id = l.course_id
      where e.id = exercise_id
        and (c.published = true or c.instructor_id = auth.uid())
    )
  );

create policy "Formateur gère ses questions"
  on public.questions for insert
  with check (
    exists (
      select 1 from public.exercises e
      join public.lessons l on l.id = e.lesson_id
      join public.courses c on c.id = l.course_id
      where e.id = exercise_id and c.instructor_id = auth.uid()
    )
  );

-- =====================================================
-- PROGRESS (suivi des leçons complétées)
-- =====================================================
create table public.progress (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  lesson_id    uuid references public.lessons(id) on delete cascade not null,
  completed    boolean default false not null,
  completed_at timestamptz,
  created_at   timestamptz default now() not null,
  unique(user_id, lesson_id)
);

alter table public.progress enable row level security;

create policy "Progression visible par l'utilisateur"
  on public.progress for select
  using (user_id = auth.uid());

create policy "Utilisateur crée sa progression"
  on public.progress for insert
  with check (user_id = auth.uid());

create policy "Utilisateur met à jour sa progression"
  on public.progress for update
  using (user_id = auth.uid());

create policy "Admin voit toute la progression"
  on public.progress for select
  using (public.get_my_role() = 'admin');
