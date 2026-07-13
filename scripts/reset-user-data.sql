-- Reset a beta user's progress (run in Supabase SQL Editor)
-- Replace the email below.

do $$
declare
  uid uuid;
begin
  select id into uid from profiles where email = '657696471@qq.com';

  if uid is null then
    raise exception 'User not found';
  end if;

  delete from mock_exam_attempts where user_id = uid;
  delete from practice_attempts where user_id = uid;
  delete from srs_cards where user_id = uid;

  raise notice 'Reset complete for user %', uid;
end $$;
