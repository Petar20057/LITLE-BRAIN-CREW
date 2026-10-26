-- The /code quiz got longer (2026-10-26): a "who's behind it?" guess on every lesson, a sleep check, a villain check
-- and a third myth. quiz_answers now also counts those, so /admin/quiz shows them. Same signature as before.

create or replace function public.quiz_answers(since timestamptz)
returns table (question text, answer text, sessions bigint)
language sql stable set search_path = '' as $$
  with answers as (
    select e.session_id, e.step, e.value
    from public.quiz_events e join public.quiz_sessions s on s.id = e.session_id
    where s.started_at >= since and e.event = 'answer'
  )
  select 'age', s.age, count(*) from public.quiz_sessions s
    where s.started_at >= since and s.age is not null group by 2
  union all
  select 'moment', m, count(*) from public.quiz_sessions s cross join unnest(s.moments) as m
    where s.started_at >= since group by 2
  union all
  select 'duo', s.duo, count(*) from public.quiz_sessions s
    where s.started_at >= since and s.duo is not null group by 2
  union all
  -- Myth answers: "myth (right)", "fact (wrong)" ...
  select a.step, (a.value ->> 'said') || case when (a.value ->> 'right')::boolean then ' (right)' else ' (wrong)' end, count(distinct a.session_id)
    from answers a where a.step like 'myth-%' group by 1, 2
  union all
  -- "Who's behind it?" guesses on the lesson screens, counted per guess (a visit makes up to three).
  select 'guess', case when (a.value ->> 'right')::boolean then 'right' else 'wrong' end, count(*)
    from answers a where a.step like 'lesson-%' and a.value ? 'right' group by 2
  union all
  select 'sleep', a.value ->> 'verdict', count(distinct a.session_id)
    from answers a where a.step = 'sleep' and a.value ? 'verdict' group by 2
  union all
  -- Villains ticked at home; 'none' = the parent ticked nothing.
  select 'villain', coalesce(v, 'none'), count(distinct a.session_id)
    from answers a
    left join lateral jsonb_array_elements_text(case when jsonb_typeof(a.value) = 'array' then a.value else '[]'::jsonb end) as v on true
    where a.step = 'villains' group by 2
  union all
  select 'tips', case when (a.value ->> 'consent')::boolean then 'yes' else 'no' end, count(distinct a.session_id)
    from answers a where a.step = 'gate' group by 2
$$;

revoke execute on function public.quiz_answers(timestamptz) from public, anon, authenticated;
grant execute on function public.quiz_answers(timestamptz) to service_role;
