import React, { useState } from 'react';
import { signIn, signUp } from '../services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;

    setError('');

    if (isRegistering) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    const result = isRegistering
      ? await signUp(trimmedEmail, password)
      : await signIn(trimmedEmail, password);

    if (!result.success) {
      setError(result.error || 'Authentication failed.');
    }

    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setConfirmPassword('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-background px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg shadow-brand-primary/5 border border-brand-primary/10">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="text-5xl mb-3">🍳🥗🍝</div>
          <h1 className="text-2xl font-bold text-brand-primary">What To Eat</h1>
          <p className="mt-1 text-sm text-gray-400">Your daily meal companion</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-brand-primary/15 bg-brand-background px-4 py-3 text-gray-800 placeholder-gray-300 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegistering ? 'Min. 6 characters' : 'Enter your password'}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              className="w-full rounded-xl border border-brand-primary/15 bg-brand-background px-4 py-3 text-gray-800 placeholder-gray-300 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-brand-primary/15 bg-brand-background px-4 py-3 text-gray-800 placeholder-gray-300 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!email.trim() || !password || isLoading}
            className="w-full rounded-2xl bg-brand-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              isRegistering ? 'Sign Up' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            {isRegistering
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
