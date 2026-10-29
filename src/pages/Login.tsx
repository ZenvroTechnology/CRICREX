import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, KeyRound, Loader2, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { FormAlert } from '@/components/auth/FormAlert';
import { Input, PasswordInput, Checkbox } from '@/components/ui/Input';
import { roles, roleFromSlug } from '@/config/roles';
import { useApp } from '@/context/AppContext';
import { cn, roleHome } from '@/lib/utils';
import type { Role } from '@/types';

export function Login() {
  const { login } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialRole = roleFromSlug(params.get('role')) ?? 'Player';

  const [role, setRole] = useState<Role>(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [filledRole, setFilledRole] = useState<Role | null>(null);

  const next = params.get('next');

  useEffect(() => {
    const fromQuery = roleFromSlug(params.get('role'));
    if (fromQuery) setRole(fromQuery);
  }, [params]);

  const fillDemo = (selectedRole: Role) => {
    const meta = roles.find((item) => item.role === selectedRole)!;
    setRole(selectedRole);
    setIdentifier(meta.demoEmail);
    setPassword(meta.demoPassword);
    setErrors({});
    setFilledRole(selectedRole);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!identifier.trim()) nextErrors.identifier = 'Enter your email address or username.';
    else if (identifier.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      nextErrors.identifier = 'That email address doesn’t look right.';
    }
    if (!password) nextErrors.password = 'Enter your demo password.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      const result = login(identifier, password, role);
      setSubmitting(false);
      if (!result.ok) {
        setErrors({ form: result.error });
        return;
      }
      const destination = next && next.startsWith('/') ? next : roleHome(result.user!.role);
      navigate(destination, { replace: true });
    }, 650);
  };

  return (
    <AuthShell
      title="Welcome back to CRICREX"
      subtitle="Sign in to your role-based dashboard. Choose a demo role below — no real credentials required."
      footer={
        <p className="text-sm text-slateink-light">
          New to CRICREX?{' '}
          <Link to="/register" className="font-bold text-cricket transition hover:text-forest">
            Create a demo account
          </Link>
        </p>
      }
    >
      <div className="card p-5 sm:p-6">
        <div className="mb-5">
          <p className="label">Sign in as</p>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((item) => {
              const Icon = item.icon;
              const active = role === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    setRole(item.role);
                    setErrors({});
                  }}
                  aria-pressed={active}
                  className={cn(
                    'group relative flex flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2.5 text-center transition',
                    active
                      ? 'border-cricket bg-cricket/[0.06] shadow-sm'
                      : 'border-forest/10 hover:border-cricket/30 hover:bg-offwhite',
                  )}
                >
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cricket text-white">
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                    </span>
                  )}
                  <Icon className={cn('h-[18px] w-[18px]', active ? 'text-cricket' : 'text-slateink-light')} />
                  <span className={cn('text-[10.5px] font-bold leading-tight', active ? 'text-forest' : 'text-slateink')}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {errors.form && (
          <FormAlert tone="error" title="Unable to sign in" className="mb-4">
            {errors.form}
          </FormAlert>
        )}

        <form onSubmit={submit} noValidate className="space-y-4">
          <Input
            label="Email address or username"
            type="text"
            autoComplete="username"
            placeholder="you@club.com"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setErrors((current) => ({ ...current, identifier: undefined, form: undefined }));
            }}
            error={errors.identifier}
            icon={<UserRound className="h-4 w-4" />}
            required
          />

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined, form: undefined }));
            }}
            error={errors.password}
            required
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
            <Link
              to={`/forgot-password${identifier.includes('@') ? `?email=${encodeURIComponent(identifier)}` : ''}`}
              className="text-xs font-bold text-cricket transition hover:text-forest"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cricket text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(33,115,70,0.8)] transition hover:bg-cricket-dark disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Login to dashboard <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-forest/[0.07]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slateink-faint">Or use a demo account</span>
          <span className="h-px flex-1 bg-forest/[0.07]" />
        </div>

        <div className="rounded-xl border border-dashed border-cricket/25 bg-cricket/[0.035] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
              <KeyRound className="h-3.5 w-3.5 text-cricket" /> One-click demo sign in
            </p>
            {filledRole && <span className="text-[10px] font-semibold text-success">Credentials filled</span>}
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {roles.map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => fillDemo(item.role)}
                className={cn(
                  'rounded-lg border bg-white px-1.5 py-1.5 text-[10px] font-semibold transition hover:border-cricket/40 hover:text-cricket',
                  filledRole === item.role ? 'border-cricket text-cricket' : 'border-forest/10 text-slateink',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slateink-light">
            Passwords: <span className="font-semibold text-forest">Admin@123</span> for Admin,{' '}
            <span className="font-semibold text-forest">Demo@123</span> for every other role.
          </p>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-offwhite p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cricket" />
          <p className="text-[10.5px] leading-relaxed text-slateink-light">
            This is a simulated login. No server, database or real authentication is used. Admin access is provisioned
            through the demo account only.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
