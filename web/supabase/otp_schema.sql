-- OTP Codes table for email verification code login
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Speed up lookups by email
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);

-- Speed up cleanup of expired codes
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON otp_codes(expires_at);

-- Enable RLS to prevent client-side access (only service_role bypasses RLS)
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Optional: periodic cleanup of expired codes
-- Run this function on a schedule (e.g. via pg_cron) or manually
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes WHERE expires_at < now() OR used = true;
END;
$$ LANGUAGE plpgsql;
