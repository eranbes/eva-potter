'use client';

import { useState } from 'react';

export default function AdminResetPage() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'confirm' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setStatus('confirm');
  };

  const handleConfirm = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult(data.error || 'Failed');
        setStatus('error');
        return;
      }

      setResult(`Reset complete. ${data.deletedUsers} user(s) deleted.`);
      setStatus('done');
    } catch {
      setResult('Network error');
      setStatus('error');
    }
  };

  const handleCancel = () => {
    setStatus('idle');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Admin Reset</h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          This will delete ALL users, progress, answers, and wordle results.
          Books, questions, and settings are kept.
        </p>

        {status === 'idle' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!password.trim()}
              className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold transition-colors"
            >
              Reset Everything
            </button>
          </form>
        )}

        {status === 'confirm' && (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-red-400 font-bold text-lg">Are you sure?</p>
            <p className="text-gray-400 text-sm">This cannot be undone. All student data will be permanently deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
              >
                Yes, delete all
              </button>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <p className="text-center text-gray-400">Resetting...</p>
        )}

        {status === 'done' && (
          <div className="text-center">
            <p className="text-green-400 font-bold text-lg mb-2">{result}</p>
            <p className="text-gray-500 text-sm">You can close this page now.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center flex flex-col gap-4">
            <p className="text-red-400 font-bold">{result}</p>
            <button
              onClick={() => setStatus('idle')}
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
