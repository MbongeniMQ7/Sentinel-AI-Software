-- ============================================================================
-- SentinelAI — operational demo data
--
-- Populates companies, org structure, workforce, devices, telemetry, alerts,
-- requests, billing and activity so the application renders real data. Safe to
-- run once (guarded by an existence check on companies).
-- ============================================================================

do $seed$
declare
  v_company_ids   uuid[] := '{}';
  v_company_names text[] := array['NorthBay Logistics','Vertex Manufacturing','Apex Freight','Helios Mining'];
  v_slugs         text[] := array['northbay-logistics','vertex-manufacturing','apex-freight','helios-mining'];
  v_industries    text[] := array['Logistics','Manufacturing','Freight','Mining'];
  v_plan_tiers    plan_tier[] := array['growth','enterprise','starter','growth']::plan_tier[];
  v_company_status company_status[] := array['active','active','trial','active']::company_status[];

  v_dept_names    text[] := array['Operations','Logistics','Assembly','Quality','Maintenance','Warehouse'];
  v_first         text[] := array['Alex','Priya','Marcus','Lena','Omar','Sofia','Kai','Nadia','Diego','Yuki','Ravi','Grace','Tom','Ivy','Noah','Zara','Liam','Maya','Ethan','Chloe','Aria','Jonas','Mila','Theo','Nina','Cole','Ada','Ben'];
  v_last          text[] := array['Mercer','Nair','Cole','Frost','Hadid','Reyes','Tanaka','Khan','Santos','Sato','Patel','Lee','Brooks','Wong','Adams','Ali','Murphy','Singh','Hughes','Park','Reed','Vance','Cruz','Hall','Diaz','Ford','Shaw','Bell'];
  v_job_titles    text[] := array['Line Operator','Forklift Driver','Technician','QA Inspector','Supervisor','Picker'];
  v_monitoring    monitoring_type[] := array['camera','wearable','hybrid']::monitoring_type[];
  v_emp_status    employee_status[] := array['active','active','active','on_break','offline','on_leave']::employee_status[];
  v_risk          risk_level[] := array['low','moderate','high','critical']::risk_level[];

  v_alert_types   alert_type[] := array['fatigue','drowsiness','distraction','absence','heart_rate','no_helmet']::alert_type[];
  v_alert_status  alert_status[] := array['open','acknowledged','escalated','resolved']::alert_status[];
  v_alert_msg     text[] := array[
    'Sustained fatigue index above threshold',
    'Micro-sleep / eye-closure detected',
    'Prolonged attention deviation detected',
    'Operator left monitored zone',
    'Abnormal heart-rate spike detected',
    'PPE compliance breach — helmet missing'];

  v_dev_types     device_type[] := array['camera','wearable_band','edge_gateway','helmet_sensor']::device_type[];
  v_dev_status    device_status[] := array['online','online','online','offline','maintenance']::device_status[];

  v_leave_types   leave_type[] := array['annual','sick','personal','emergency']::leave_type[];
  v_req_status    request_status[] := array['pending','pending','approved','rejected']::request_status[];
  v_break_status  break_status[] := array['pending','approved','active','rejected']::break_status[];

  v_cid           uuid;
  v_plan_id       uuid;
  v_sub_id        uuid;
  v_dept_ids      uuid[];
  v_did           uuid;
  v_shift_ids     uuid[];
  v_sid           uuid;
  v_mgr_id        uuid;
  v_emp_id        uuid;
  v_emp_ids       uuid[] := '{}';
  v_emp_companies uuid[] := '{}';
  v_dev_id        uuid;
  v_dev_ids       uuid[] := '{}';
  v_sess_id       uuid;
  v_alert_id      uuid;
  v_seats         int;
  v_rate          int;
  v_fatigue       int;
  v_name          text;
  v_email         text;
  i               int;
  j               int;
  k               int;
  m               int;
begin
  if exists (select 1 from companies limit 1) then
    raise notice 'companies already seeded — skipping operational seed';
    return;
  end if;

  perform setseed(0.4242);

  -- ---- Companies, subscriptions, departments, shifts, manager --------------
  for i in 1..array_length(v_company_names, 1) loop
    select id into v_plan_id from plans where tier = v_plan_tiers[i];
    v_seats := (array[80,420,30,160])[i];
    v_rate  := coalesce((select price_per_seat_cents from plans where id = v_plan_id), 900);

    insert into companies (name, slug, industry, plan_id, status, seats, primary_color, since)
    values (v_company_names[i], v_slugs[i], v_industries[i], v_plan_id, v_company_status[i],
            v_seats, '#1f43f5', (current_date - ((400 + i*120) || ' days')::interval)::date)
    returning id into v_cid;
    v_company_ids := v_company_ids || v_cid;

    insert into subscriptions (company_id, plan_id, status, seats, mrr_cents,
                               current_period_start, current_period_end)
    values (v_cid, v_plan_id,
            (case when v_company_status[i] = 'trial' then 'trialing' else 'active' end)::subscription_status,
            v_seats, v_seats * v_rate,
            date_trunc('month', current_date)::date,
            (date_trunc('month', current_date) + interval '1 month')::date)
    returning id into v_sub_id;

    -- Departments (first 4 names per company)
    v_dept_ids := '{}';
    for j in 1..4 loop
      insert into departments (company_id, name)
      values (v_cid, v_dept_names[j])
      returning id into v_did;
      v_dept_ids := v_dept_ids || v_did;
    end loop;

    -- Shifts
    v_shift_ids := '{}';
    insert into shifts (company_id, type, label, starts_at, ends_at)
      values (v_cid,'morning','Morning · 06:00–14:00','06:00','14:00') returning id into v_sid;
    v_shift_ids := v_shift_ids || v_sid;
    insert into shifts (company_id, type, label, starts_at, ends_at)
      values (v_cid,'evening','Evening · 14:00–22:00','14:00','22:00') returning id into v_sid;
    v_shift_ids := v_shift_ids || v_sid;
    insert into shifts (company_id, type, label, starts_at, ends_at)
      values (v_cid,'night','Night · 22:00–06:00','22:00','06:00') returning id into v_sid;
    v_shift_ids := v_shift_ids || v_sid;

    -- Manager (data profile; can be granted login via account_roles)
    insert into profiles (id, company_id, role, full_name, email, title, presence, last_active_at)
    values (gen_random_uuid(), v_cid, 'manager',
            (array['Priya Nair','Marcus Cole','Sofia Reyes','Diego Santos'])[i],
            'manager' || i || '@' || v_slugs[i] || '.sentinel.ai',
            'Shift Manager · Operations', 'online', now() - interval '5 min')
    returning id into v_mgr_id;

    insert into account_roles (email, role, company_id, full_name, title)
    values ('manager' || i || '@' || v_slugs[i] || '.sentinel.ai', 'manager', v_cid,
            (array['Priya Nair','Marcus Cole','Sofia Reyes','Diego Santos'])[i], 'Shift Manager · Operations')
    on conflict (email) do nothing;

    -- Employees: 7 per company
    for j in 1..7 loop
      m := ((i - 1) * 7 + j);
      v_name := v_first[m] || ' ' || v_last[m];
      v_email := lower(replace(v_name, ' ', '.')) || '@' || v_slugs[i] || '.sentinel.ai';
      v_fatigue := (random() * 95)::int;

      insert into profiles (id, company_id, role, full_name, email, title, presence, last_active_at)
      values (gen_random_uuid(), v_cid, 'employee', v_name, v_email,
              v_job_titles[((m - 1) % 6) + 1],
              (array['online','online','away','offline'])[ (m % 4) + 1 ]::presence_status,
              now() - ((1 + (random()*58)::int) || ' min')::interval)
      returning id into v_emp_id;

      insert into employee_profiles (profile_id, company_id, department_id, shift_id, manager_id,
                                     job_title, monitoring, status, fatigue_score, heart_rate, risk_level)
      values (v_emp_id, v_cid,
              v_dept_ids[((j - 1) % 4) + 1],
              v_shift_ids[((j - 1) % 3) + 1],
              v_mgr_id,
              v_job_titles[((m - 1) % 6) + 1],
              v_monitoring[((m - 1) % 3) + 1],
              v_emp_status[(m % 6) + 1],
              v_fatigue,
              62 + (random() * 46)::int,
              (case when v_fatigue >= 80 then 'critical'
                    when v_fatigue >= 60 then 'high'
                    when v_fatigue >= 40 then 'moderate'
                    else 'low' end)::risk_level);

      v_emp_ids := v_emp_ids || v_emp_id;
      v_emp_companies := v_emp_companies || v_cid;
    end loop;

    -- Devices: 5 per company
    for j in 1..5 loop
      insert into devices (company_id, name, type, status, battery_pct, firmware,
                           assigned_to, department_id, location, last_seen_at)
      values (v_cid,
              (array['Camera','Wearable','Edge GW','Helmet'])[((j - 1) % 4) + 1] || ' ' || chr(64 + j) || '-' || (10 + j),
              v_dev_types[((j - 1) % 4) + 1],
              v_dev_status[(j % 5) + 1],
              (random() * 100)::int,
              'v' || (2 + j % 3) || '.' || (j % 9) || '.' || (j % 5),
              case when random() > 0.3 then v_emp_ids[array_length(v_emp_ids,1) - (j % 5)] else null end,
              v_dept_ids[((j - 1) % 4) + 1],
              v_dept_names[((j - 1) % 4) + 1] || ' · Zone ' || (1 + (j % 6)),
              now() - ((1 + (random()*30)::int) || ' min')::interval)
      returning id into v_dev_id;
      v_dev_ids := v_dev_ids || v_dev_id;
    end loop;
  end loop;

  -- ---- Monitoring sessions + fatigue readings (recent 24h, hourly) ---------
  for k in 1..array_length(v_emp_ids, 1) loop
    v_emp_id := v_emp_ids[k];
    v_cid := v_emp_companies[k];

    insert into monitoring_sessions (company_id, employee_id, monitoring, started_at, ended_at,
                                     avg_fatigue, peak_fatigue, alert_count)
    values (v_cid, v_emp_id, v_monitoring[((k - 1) % 3) + 1],
            now() - interval '24 hour', now(),
            (30 + random()*40)::int, (60 + random()*39)::int, (random()*4)::int)
    returning id into v_sess_id;

    -- only seed dense readings for the first 12 employees to keep it light
    if k <= 12 then
      for j in 0..11 loop
        insert into fatigue_readings (session_id, employee_id, company_id, recorded_at,
                                      fatigue_score, heart_rate, focus_score, risk_level)
        values (v_sess_id, v_emp_id, v_cid,
                now() - ((j * 2) || ' hour')::interval,
                (20 + random()*60)::int,
                (64 + random()*30)::int,
                (50 + random()*45)::int,
                v_risk[(j % 4) + 1]);
      end loop;
    end if;
  end loop;

  -- ---- Alerts (24) ---------------------------------------------------------
  for k in 1..24 loop
    m := ((k - 1) % array_length(v_emp_ids, 1)) + 1;
    v_emp_id := v_emp_ids[m];
    v_cid := v_emp_companies[m];
    insert into alerts (company_id, employee_id, type, severity, status, message, location, created_at)
    values (v_cid, v_emp_id,
            v_alert_types[((k - 1) % 6) + 1],
            v_risk[(k % 4) + 1],
            v_alert_status[(k % 4) + 1],
            v_alert_msg[((k - 1) % 6) + 1],
            v_dept_names[((k - 1) % 6) + 1] || ' · Zone ' || (1 + (k % 6)),
            now() - ((1 + (random()*240)::int) || ' min')::interval)
    returning id into v_alert_id;

    insert into alert_events (alert_id, to_status, note)
    values (v_alert_id, 'open', 'Alert raised by monitoring engine');
  end loop;

  -- ---- Leave requests (12) -------------------------------------------------
  for k in 1..12 loop
    m := ((k - 1) % array_length(v_emp_ids, 1)) + 1;
    insert into leave_requests (company_id, employee_id, type, start_date, end_date, reason, status)
    values (v_emp_companies[m], v_emp_ids[m],
            v_leave_types[((k - 1) % 4) + 1],
            (current_date + ((5 + k) || ' days')::interval)::date,
            (current_date + ((5 + k + 1 + (k % 5)) || ' days')::interval)::date,
            (array['Family event','Medical appointment','Personal matters','Travel','Recovery'])[((k - 1) % 5) + 1],
            v_req_status[(k % 4) + 1]);
  end loop;

  -- ---- Break requests (8) --------------------------------------------------
  for k in 1..8 loop
    m := ((k - 1) % array_length(v_emp_ids, 1)) + 1;
    insert into break_requests (company_id, employee_id, reason, duration_min, status, requested_at)
    values (v_emp_companies[m], v_emp_ids[m],
            (array['Fatigue recovery','Meal break','Rest period','Hydration','Stretch break'])[((k - 1) % 5) + 1],
            (array[10,15,20,30])[((k - 1) % 4) + 1],
            v_break_status[(k % 4) + 1],
            now() - ((2 + (random()*40)::int) || ' min')::interval);
  end loop;

  -- ---- Invoices (last 12 months, per company) ------------------------------
  for i in 1..array_length(v_company_ids, 1) loop
    v_cid := v_company_ids[i];
    select id, mrr_cents into v_sub_id, v_seats from subscriptions where company_id = v_cid limit 1;
    for j in 0..11 loop
      insert into invoices (company_id, subscription_id, number, amount_cents, status, issued_on, due_on, paid_at)
      values (v_cid, v_sub_id,
              'INV-' || (7000 + i*100 + j),
              v_seats,
              (case when j = 0 then 'pending' else 'paid' end)::invoice_status,
              (date_trunc('month', current_date) - ((11 - j) || ' months')::interval)::date,
              (date_trunc('month', current_date) - ((11 - j) || ' months')::interval + interval '14 days')::date,
              case when j = 0 then null else (date_trunc('month', current_date) - ((11 - j) || ' months')::interval + interval '3 days') end);
    end loop;
  end loop;

  -- ---- Reports (one per template, attributed to first company) -------------
  insert into reports (company_id, template_id, title, date_range, format, status, generated_at)
  select v_company_ids[1], rt.id, rt.title, '30d', 'pdf', 'ready', now() - interval '2 day'
  from report_templates rt;

  -- ---- Audit logs + activity events ----------------------------------------
  for k in 1..16 loop
    m := ((k - 1) % array_length(v_emp_ids, 1)) + 1;
    insert into audit_logs (company_id, actor_id, action, target_type, target_id, created_at)
    values (v_emp_companies[m], v_emp_ids[m],
            (array['acknowledged alert','approved leave request','resolved alert','onboarded employee','updated device','exported report'])[((k - 1) % 6) + 1],
            (array['alert','leave_request','alert','profile','device','report'])[((k - 1) % 6) + 1],
            gen_random_uuid()::text,
            now() - ((k * 37) || ' min')::interval);

    insert into activity_events (company_id, actor_id, type, summary, created_at)
    values (v_emp_companies[m], v_emp_ids[m],
            (array['alert','onboarding','billing','device','report'])[((k - 1) % 5) + 1],
            (array['High-fatigue alert escalated','New employee onboarded','Invoice paid','Device went offline','Monthly report generated'])[((k - 1) % 5) + 1],
            now() - ((k * 53) || ' min')::interval);
  end loop;

  raise notice 'Operational seed complete: % companies, % employees, % devices',
    array_length(v_company_ids,1), array_length(v_emp_ids,1), array_length(v_dev_ids,1);
end
$seed$;
