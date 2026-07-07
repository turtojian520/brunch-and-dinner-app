const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const crypto = require('crypto');

const OTP_EXPIRE_MINUTES = 10;

function getAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return null;

  const host = req.headers.host;
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) {
    return origin;
  }

  const allowList = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowList.includes(origin)) {
    return origin;
  }

  return null;
}

module.exports = async function handler(req, res) {
  const allowedOrigin = getAllowedOrigin(req);

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.status(allowedOrigin ? 204 : 403).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.headers.origin && !allowedOrigin) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Parse body
  const body = typeof req.body === 'string' ? safeJsonParse(req.body) : req.body;
  if (!body || !body.email) {
    return res.status(400).json({ error: '请提供邮箱地址' });
  }

  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }

  // Check env vars
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'WhatToEat <noreply@resend.dev>';

  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length > 0) {
    console.error('Missing env vars:', missing);
    return res.status(500).json({ error: `服务器配置错误，缺少环境变量: ${missing.join(', ')}` });
  }

  if (!resendApiKey || resendApiKey.startsWith('re_placeholder')) {
    console.error('RESEND_API_KEY is missing or still placeholder');
    return res.status(500).json({ error: '邮件服务未配置，RESEND_API_KEY 无效' });
  }

  try {
    // 1. Generate 6-digit OTP
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    // 2. Store hash in Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: insertError } = await supabase.from('otp_codes').insert({
      email,
      code_hash: codeHash,
      expires_at: new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000).toISOString(),
    });

    if (insertError) {
      console.error('Failed to store OTP:', insertError);
      return res.status(500).json({ error: '验证码存储失败，请稍后重试' });
    }

    // 3. Send email via Resend
    const resend = new Resend(resendApiKey);
    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'WhatToEat 登录验证码',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="color: #FF5F5F; font-size: 24px; margin: 0 0 8px;">WhatToEat</h1>
          <p style="color: #525252; font-size: 16px; line-height: 1.6;">你的登录验证码是：</p>
          <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0F172A; margin: 16px 0; text-align: center; background: #FAF9F5; padding: 16px; border-radius: 12px;">
            ${code}
          </p>
          <p style="color: #A2A292; font-size: 14px;">验证码 ${OTP_EXPIRE_MINUTES} 分钟内有效。如果这不是你本人操作，请忽略此邮件。</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend send error:', emailError);
      return res.status(500).json({ error: '验证码发送失败，请稍后重试' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('send-otp error:', error);
    return res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
