import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { FormAlert } from '@/components/auth/FormAlert';
import { PasswordInput } from '@/components/ui/Input';
import { useApp } from '@/context/AppContext';

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { pushToast } = useApp();
  const email = params.get('email') ?? 'player@cricrex.demo';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!password) nextErrors.password = 'Create a new password.';
    else if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      nextErrors.password = 'Include uppercase, lowercase and a number.';
    }
    if (!confirm) nextErrors.confirm = 'Confirm your new password.';
    else if (confirm !== password) nextErrors.confirm = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      pushToast({
        title: 'Password reset simulated',
        description: 'No real password was changed — this demo does not store accounts on a server.',
        tone: 'success',
      });
    }, 750);
  };

  if (done) {
    return (
      <AuthShell
        title="Password updated (simulated)"
        subtitle="Your reset journey is complete. In this demo, no real credential was changed and no email was sent."
        footer={
          <p className="text-sm text-slateink-light">
            Need to explore again?{' '}
            <Link to="/forgot-password" className="font-bold text-cricket transition hover:text-forest">Request another link</Link>
          </p>
        }
      >
        <div className="card p-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-9 w-9 text-success" />
          </div>
          <h2 className="mt-4 font-display text-xl font-extrabold text-forest">You’re all set</h2>
          <p className="mt-2 text-sm leading-relaxed text-slateink-light">
            The new password for <span className="font-semibold text-forest">{email}</span> would now be active. For this
            demo, your original demo password still works.
          </p>

          <div className="mt-5 rounded-xl border border-matchday/25 bg-matchday/[0.08] p-3 text-left text-[11px] leading-relaxed text-[#8A5000]">
            <strong>Demo note:</strong> Use <span className="font-bold">Demo@123</span> (or <span className="font-bold">Admin@123</span> for
            the admin account) when signing in. No real account password was changed.
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cricket text-sm font-bold text-white transition hover:bg-cricket-dark"
          >
            Return to login <ArrowRight className="h-4 w-4" />
          </button>
          <Link to="/" className="mt-2 flex h-11 w-full items-center justify-center rounded-xl border border-forest/15 text-sm font-semibold text-forest transition hover:bg-offwhite">
            Back to CRICREX
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong demo password. This screen is part of a simulated recovery flow and does not change any real account."
      footer={
        <p className="text-sm text-slateink-light">
          <Link to="/login" className="inline-flex items-center gap-1.5 font-bold text-cricket transition hover:text-forest">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>
        </p>
      }
    >
      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-cricket/15 bg-cricket/[0.04] p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cricket text-white">
            <KeyRound className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slateink-faint">Reset link for</p>
            <p className="truncate text-xs font-semibold text-forest">{email}</p>
          </div>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[9px] font-bold text-success">
            <ShieldCheck className="h-3 w-3" /> Demo verified
          </span>
        </div>

        <form onSubmit={submit} noValidate className="space-y-4">
          <div>
            <PasswordInput
              label="New password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              error={errors.password}
              required
            />
            <PasswordStrength password={password} />
          </div>

          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
              setErrors((current) => ({ ...current, confirm: undefined }));
            }}
            error={errors.confirm}
            required
          />

          <FormAlert tone="info">
            Password reset is local-only. After submitting, the demo will not update any stored credentials.
          </FormAlert>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cricket text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(33,115,70,0.8)] transition hover:bg-cricket-dark disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : <><Lock className="h-4 w-4" /> Reset Password <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
