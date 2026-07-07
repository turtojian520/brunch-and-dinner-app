import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  signIn,
  signUp,
  sendOtp,
  verifyOtp,
  resetPasswordForEmail,
} from '../services/authService';

const OTP_COUNTDOWN = 60;

export default function LoginScreen() {
  // Shared state
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('otp');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password tab state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // OTP tab state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const digitRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // ==================== OTP Tab Handlers ====================

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('请输入邮箱地址');
      return;
    }

    clearMessages();
    setIsLoading(true);

    const result = await sendOtp(trimmedEmail);
    if (result.success) {
      setOtpSent(true);
      setOtpCountdown(OTP_COUNTDOWN);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccess('验证码已发送，请查收邮件');
      // Focus first digit box
      setTimeout(() => digitRefs.current[0]?.focus(), 100);
    } else {
      setError(result.error || '发送验证码失败');
    }

    setIsLoading(false);
  };

  const handleDigitChange = (index, value) => {
    // Only accept single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    clearMessages();

    // Auto-advance to next box
    if (digit && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits filled
    if (digit && index === 5) {
      const full = [...newDigits];
      full[5] = digit;
      if (full.every((d) => d !== '')) {
        // Small delay so user sees the last digit
        setTimeout(() => handleVerifyOtp(full.join('')), 200);
      }
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move back and clear previous
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        digitRefs.current[index - 1]?.focus();
      } else if (otpDigits[index]) {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);
    clearMessages();

    // Focus the next empty box or the last box
    const nextEmpty = newDigits.findIndex((d) => d === '');
    if (nextEmpty >= 0) {
      digitRefs.current[nextEmpty]?.focus();
    } else {
      digitRefs.current[5]?.focus();
      // Auto-verify if all filled
      if (newDigits.every((d) => d !== '')) {
        setTimeout(() => handleVerifyOtp(newDigits.join('')), 200);
      }
    }
  };

  const handleVerifyOtp = async (codeOverride) => {
    const code = codeOverride || otpDigits.join('');
    const trimmedEmail = email.trim();

    if (!trimmedEmail || code.length !== 6) return;

    clearMessages();
    setIsVerifying(true);

    const result = await verifyOtp(trimmedEmail, code);
    if (!result.success) {
      setError(result.error || '验证失败');
      setIsVerifying(false);
    }
    // On success, AuthGuard will detect session change and redirect
  };

  // ==================== Password Tab Handlers ====================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;

    clearMessages();

    if (isRegistering) {
      if (password.length < 6) {
        setError('密码至少需要 6 个字符');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
    }

    setIsLoading(true);

    const result = isRegistering
      ? await signUp(trimmedEmail, password)
      : await signIn(trimmedEmail, password);

    if (!result.success) {
      // Map common Supabase error messages to Chinese
      const msg = result.error || '认证失败';
      if (msg.includes('Invalid login credentials')) {
        setError('邮箱或密码错误');
      } else if (msg.includes('Email not confirmed')) {
        setError('邮箱尚未验证，请先查收验证邮件');
      } else if (msg.includes('already registered')) {
        setError('该邮箱已注册，请直接登录');
      } else if (msg.includes('User already registered')) {
        setError('该邮箱已注册，请直接登录');
      } else {
        setError(msg);
      }
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('请先输入邮箱地址');
      return;
    }

    clearMessages();
    setIsLoading(true);

    const result = await resetPasswordForEmail(trimmedEmail);
    if (result.success) {
      setSuccess('重置密码邮件已发送，请查收邮箱');
    } else {
      setError(result.error || '发送重置邮件失败');
    }

    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setConfirmPassword('');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  // ==================== Render ====================

  const allDigitsFilled = otpDigits.every((d) => d !== '');
  const canSendOtp = email.trim() && !isLoading && otpCountdown === 0;
  const canSubmitPassword = email.trim() && password && !isLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-background px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg shadow-brand-primary/5 border border-brand-primary/10">
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="text-5xl mb-3">🍳🥗🍝</div>
          <h1 className="text-2xl font-bold text-brand-primary">What To Eat</h1>
          <p className="mt-1 text-sm text-gray-400">你的每日饮食搭档</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-6 bg-brand-background rounded-2xl p-1">
          <button
            type="button"
            onClick={() => switchTab('otp')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'otp'
                ? 'bg-white text-brand-primary shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            📧 验证码登录
          </button>
          <button
            type="button"
            onClick={() => switchTab('password')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'password'
                ? 'bg-white text-brand-primary shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            🔑 密码登录
          </button>
        </div>

        {/* OTP Tab */}
        {activeTab === 'otp' && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearMessages();
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-brand-primary/15 bg-brand-background px-4 py-3 text-gray-800 placeholder-gray-300 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!canSendOtp}
                className="w-full rounded-2xl bg-brand-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  '发送验证码'
                )}
              </button>
            ) : (
              <>
                {/* 6-Digit Input */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    输入验证码
                  </label>
                  <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (digitRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        className="w-12 h-14 text-center text-xl font-bold text-gray-800 rounded-xl border border-brand-primary/15 bg-brand-background outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpCountdown > 0 || isLoading}
                    className="text-sm font-medium text-brand-primary hover:underline disabled:text-gray-300 disabled:no-underline"
                  >
                    {otpCountdown > 0 ? `${otpCountdown}s 后重新发送` : '重新发送'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={!allDigitsFilled || isVerifying}
                  className="w-full rounded-2xl bg-brand-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    '验证'
                  )}
                </button>
              </>
            )}

            <p className="text-center text-xs text-gray-400">
              未注册的邮箱将自动创建账号
            </p>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearMessages();
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-brand-primary/15 bg-brand-background px-4 py-3 text-gray-800 placeholder-gray-300 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearMessages();
                }}
                placeholder={isRegistering ? '至少 6 个字符' : '输入密码'}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                className="w-full rounded-xl border border-brand-primary/15 bg-brand-background px-4 py-3 text-gray-800 placeholder-gray-300 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              />
            </div>

            {isRegistering && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearMessages();
                  }}
                  placeholder="再次输入密码"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-brand-primary/15 bg-brand-background px-4 py-3 text-gray-800 placeholder-gray-300 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                />
              </div>
            )}

            {/* Forgot password link (login mode only) */}
            {!isRegistering && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="text-sm font-medium text-brand-secondary hover:underline disabled:text-gray-300"
                >
                  忘记密码?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmitPassword}
              className="w-full rounded-2xl bg-brand-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : isRegistering ? (
                '注册'
              ) : (
                '登录'
              )}
            </button>
          </form>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600 text-center">
            {success}
          </div>
        )}

        {/* Toggle register/login (password tab only) */}
        {activeTab === 'password' && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              {isRegistering ? '已有账号？去登录' : '没有账号？去注册'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
