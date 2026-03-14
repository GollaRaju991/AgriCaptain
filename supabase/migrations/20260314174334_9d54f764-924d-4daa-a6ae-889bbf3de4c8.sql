SELECT cron.schedule(
  'simulate-delivery-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://vxbzggftzldttlhtvcej.supabase.co/functions/v1/simulate-delivery',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4YnpnZ2Z0emxkdHRsaHR2Y2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjM5NTgsImV4cCI6MjA2NDU5OTk1OH0.pkqQ_Z4WC1CLxpW8NVnZwBFol_Msi7HndUMG92qwQlE"}'::jsonb,
    body:='{"time": "now"}'::jsonb
  ) AS request_id;
  $$
);