#!/usr/bin/env bash

set -euo pipefail

DB_CONTAINER="${SUPABASE_DB_CONTAINER:-supabase_db_bvh}"
OFFERING_ID="83000000-0000-0000-0000-000000000001"
COURSE_ID="82000000-0000-0000-0000-000000000001"
USER_ONE="81000000-0000-0000-0000-000000000001"
USER_TWO="81000000-0000-0000-0000-000000000002"
TEST_TMP_DIR="$(mktemp -d)"

cleanup() {
	docker exec -i "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres >/dev/null <<'SQL'
delete from public.course_enrollments
where offering_id = '83000000-0000-0000-0000-000000000001';
delete from public.course_offerings
where id = '83000000-0000-0000-0000-000000000001';
delete from public.courses
where id = '82000000-0000-0000-0000-000000000001';
delete from public.profiles
where id in (
  '81000000-0000-0000-0000-000000000001',
  '81000000-0000-0000-0000-000000000002'
);
delete from auth.users
where id in (
  '81000000-0000-0000-0000-000000000001',
  '81000000-0000-0000-0000-000000000002'
);
SQL
	rm -rf "$TEST_TMP_DIR"
}

trap cleanup EXIT

docker exec -i "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres >/dev/null <<'SQL'
delete from public.course_enrollments
where offering_id = '83000000-0000-0000-0000-000000000001';
delete from public.course_offerings
where id = '83000000-0000-0000-0000-000000000001';
delete from public.courses
where id = '82000000-0000-0000-0000-000000000001';
delete from public.profiles
where id in (
  '81000000-0000-0000-0000-000000000001',
  '81000000-0000-0000-0000-000000000002'
);
delete from auth.users
where id in (
  '81000000-0000-0000-0000-000000000001',
  '81000000-0000-0000-0000-000000000002'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '81000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'concurrency-one@example.test',
    crypt('local-test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"Concurrency One","tipo":"individual"}'::jsonb,
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '81000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'concurrency-two@example.test',
    crypt('local-test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre":"Concurrency Two","tipo":"individual"}'::jsonb,
    now(), now()
  );

insert into public.courses (id, title, slug, description, status)
values (
  '82000000-0000-0000-0000-000000000001',
  'Concurrency course', 'concurrency-course',
  'Disposable course for concurrent enrollment testing.', 'activo'
);

insert into public.course_offerings (
  id, course_id, starts_at, timezone, modality, capacity, status
) values (
  '83000000-0000-0000-0000-000000000001',
  '82000000-0000-0000-0000-000000000001',
  now() + interval '7 days', 'America/Havana', 'online', 1, 'abierta'
);
SQL

run_enrollment() {
	local user_id="$1"
	docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
		-c "begin; set local role authenticated; select set_config('request.jwt.claim.sub', '$user_id', true); select public.enroll_in_course('$OFFERING_ID'); commit;"
}

run_enrollment "$USER_ONE" >"$TEST_TMP_DIR/one.log" 2>&1 &
PID_ONE=$!
run_enrollment "$USER_TWO" >"$TEST_TMP_DIR/two.log" 2>&1 &
PID_TWO=$!

set +e
wait "$PID_ONE"
STATUS_ONE=$?
wait "$PID_TWO"
STATUS_TWO=$?
set -e

SUCCESS_COUNT=0
FAILURE_COUNT=0
if [[ "$STATUS_ONE" -eq 0 ]]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); else FAILURE_COUNT=$((FAILURE_COUNT + 1)); fi
if [[ "$STATUS_TWO" -eq 0 ]]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); else FAILURE_COUNT=$((FAILURE_COUNT + 1)); fi

if [[ "$SUCCESS_COUNT" -ne 1 || "$FAILURE_COUNT" -ne 1 ]]; then
	echo "Expected one success and one failure; got status $STATUS_ONE and $STATUS_TWO" >&2
	cat "$TEST_TMP_DIR/one.log" >&2
	cat "$TEST_TMP_DIR/two.log" >&2
	exit 1
fi

if ! grep -q "course_full" "$TEST_TMP_DIR/one.log" && ! grep -q "course_full" "$TEST_TMP_DIR/two.log"; then
	echo "The rejected enrollment did not report course_full" >&2
	exit 1
fi

WINNER_ID="$(docker exec "$DB_CONTAINER" psql -At -U postgres -d postgres -c "select user_id from public.course_enrollments where offering_id = '$OFFERING_ID' and status = 'confirmada';")"

RETRY_RESULT="$(docker exec "$DB_CONTAINER" psql -At -v ON_ERROR_STOP=1 -U postgres -d postgres -c "begin; set local role authenticated; select set_config('request.jwt.claim.sub', '$WINNER_ID', true); select public.enroll_in_course('$OFFERING_ID') = (select id from public.course_enrollments where offering_id = '$OFFERING_ID' and user_id = '$WINNER_ID'); commit;")"

if ! grep -q '^t$' <<<"$RETRY_RESULT"; then
	echo "Retry did not return the existing enrollment id" >&2
	exit 1
fi

docker exec -i "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres >/dev/null <<'SQL'
do $$
declare
  v_capacity integer;
  v_occupied integer;
  v_rows integer;
begin
  select capacity into v_capacity
  from public.course_offerings
  where id = '83000000-0000-0000-0000-000000000001';

  select count(*) into v_occupied
  from public.course_enrollments
  where offering_id = '83000000-0000-0000-0000-000000000001'
    and status in ('confirmada', 'completada');

  select count(*) into v_rows
  from public.course_enrollments
  where offering_id = '83000000-0000-0000-0000-000000000001';

  if v_capacity <> 1 or v_occupied <> 1 or v_rows <> 1 then
    raise exception 'capacity or uniqueness invariant failed: capacity %, occupied %, rows %',
      v_capacity, v_occupied, v_rows;
  end if;
end
$$;
SQL

echo "PASS: one confirmed enrollment, one course_full rejection, idempotent retry"
