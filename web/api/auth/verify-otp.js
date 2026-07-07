const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

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
  if (!body || !body.email || !body.code) {
    return res.status(400).json({ error: '请提供邮箱和验证码' });
  }

  const email = body.email.trim().toLowerCase();
  const code = body.code.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: '验证码格式不正确' });
  }

  // Check env vars
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  if (missing.length > 0) {
    console.error('Missing env vars:', missing);
    return res.status(500).json({ error: `服务器配置错误，缺少环境变量: ${missing.join(', ')}` });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Hash the submitted code and look it up
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    const { data: otpRecords, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code_hash', codeHash)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (otpError) {
      console.error('OTP lookup error:', otpError);
      return res.status(500).json({ error: '验证失败，请稍后重试' });
    }

    if (!otpRecords || otpRecords.length === 0) {
      return res.status(401).json({ error: '验证码无效或已过期' });
    }

    const otpRecord = otpRecords[0];

    // 2. Mark OTP as used
    await supabase.from('otp_codes').update({ used: true }).eq('id', otpRecord.id);

    // 3. Find or create user in Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('List users error:', listError);
      return res.status(500).json({ error: '用户查询失败' });
    }

    let user = users.find((u) => u.email === email);
    const tempPassword = crypto.randomBytes(32).toString('hex');

    if (!user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { signup_method: 'otp' },
      });

      if (createError) {
        console.error('Create user error:', createError);
        return res.status(500).json({ error: '创建用户失败' });
      }
      user = newUser.user;
    } else {
      // Update existing user's password to temp password
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: tempPassword,
      });

      if (updateError) {
        console.error('Update user error:', updateError);
        return res.status(500).json({ error: '更新用户失败' });
      }
    }

    // 4. Exchange temp password for session tokens
    const tokenResponse = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          email,
          password: tempPassword,
          gotrue_meta_security: {},
        }),
      }
    );

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json().catch(() => ({}));
      console.error('Token exchange error:', tokenError);
      return res.status(500).json({ error: '登录凭证生成失败' });
    }

    const tokens = await tokenResponse.json();

    // 5. Return tokens to client
    return res.status(200).json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('verify-otp error:', error);
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
