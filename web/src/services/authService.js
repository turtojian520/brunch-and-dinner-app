import { supabase } from '../config/supabase';

// ========== Email/Password Auth ==========

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user, session: data.session };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user, session: data.session };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
};

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

// ========== Email OTP Auth (via Resend) ==========

/**
 * Send a 6-digit OTP code to the given email address.
 * The code is generated and sent by our /api/auth/send-otp Vercel function
 * using the Resend API.
 */
export const sendOtp = async (email) => {
  try {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || '发送验证码失败' };
    return { success: true };
  } catch (err) {
    console.error('sendOtp error:', err);
    return { success: false, error: '网络错误，请检查网络连接' };
  }
};

/**
 * Verify the OTP code and sign in.
 * The /api/auth/verify-otp endpoint validates the code, creates/updates the
 * Supabase Auth user, and returns session tokens. We then call setSession()
 * to establish the local session.
 */
export const verifyOtp = async (email, code) => {
  try {
    // 1. Verify OTP via our backend
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || '验证失败' };

    // 2. Establish Supabase session with returned tokens
    const { data: sessionData, error } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    if (error) {
      console.error('setSession error:', error);
      return { success: false, error: '登录失败，请重试' };
    }
    return { success: true, user: sessionData.user, session: sessionData.session };
  } catch (err) {
    console.error('verifyOtp error:', err);
    return { success: false, error: '网络错误，请检查网络连接' };
  }
};

// ========== Password Management ==========

/**
 * Send a password reset email via Supabase's built-in email service.
 * The reset link redirects back to the app origin.
 */
export const resetPasswordForEmail = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error('resetPasswordForEmail error:', err);
    return { success: false, error: '发送重置邮件失败，请稍后重试' };
  }
};

/**
 * Update the password for the currently logged-in user.
 * Typically used after completing a password reset flow.
 */
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  } catch (err) {
    console.error('updatePassword error:', err);
    return { success: false, error: '更新密码失败' };
  }
};
