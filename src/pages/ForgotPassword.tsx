import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail, MailCheck } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { FormAlert } from '@/components/auth/FormAlert';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/context/AppContext';
import { isValidEmail } from '@/lib/utils';

export function ForgotPassword() {
  const { users, pushToast } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setError('Enter the email address linked to your demo account.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address, for example player@cricrex.demo.');
      return;
    }
    const exists = users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase());
    if (!exists) {
      setError('No demo account found with that email. Try player@cricrex.demo or create an account.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  if (sent) {
    return (
      <AuthShell
        title="Reset link simulated"
        subtitle="This is a frontend demonstration — no email is actually sent and no account is modified."
        footer={
          <p className="text-sm text-slateink-light">
            Remembered your password?{' '}
            <Link to="/login" className="font-bold text-cricket transition hover:text-forest">Back to login</Link>
          </p>
        }
      >
        <div className="card overflow-hidden">
          <div className="p-7 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cricket/10">
              <MailCheck className="h-8 w-8 text-cricket" />
            </div>
            <h2 className="mt-4 font-display text-xl font-extrabold text-forest">Check your demo inbox</h2>
            <p className="mt-2 text-sm leading-relaxed text-slateink-light">
              A password reset link would be sent to
              <span className="mt-1 block font-semibold text-forest">{email}</span>
            </p>

            <div className="mt-5 rounded-xl border border-dashed border-cricket/25 bg-cricket/[0.04] p-4 text-left">
              <p className="flex items-center gap-2 text-[11px] font-bold text-forest">
                <Mail className="h-3.5 w-3.5 text-cricket" /> Email delivery simulation
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slateink-light">
                In a production product this email would contain a signed, time-limited reset link. Here, use the button
                below to open the reset screen directly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cricket text-sm font-bold text-white transition hover:bg-cricket-dark"
            >
              Open demo reset link <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                pushToast({
                  title: 'Reset link re-simulated',
                  description: `No email was sent to ${email}. Use the demo button above.`,
                  tone: 'info',
                });
              }}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl border border-forest/15 text-sm font-semibold text-forest transition hover:bg-offwhite"
            >
              Resend simulated link
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slateink-faint">
              <CheckCircle2 className="h-3 w-3 text-success" /> Request recorded locally only
            </p>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email linked to your demo CRICREX account and we’ll simulate sending a secure reset link."
      footer={
        <p className="text-sm text-slateink-light">
          Remembered it?{' '}
          <Link to="/login" className="font-bold text-cricket transition hover:text-forest">Back to login</Link>
        </p>
      }
    >
      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-offwhite p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cricket/10 text-cricket">
            <Mail className="h-4 w-4" />
          </span>
          <p className="text-[11px] leading-relaxed text-slateink-light">
            Use one of the demo emails, such as <span className="font-semibold text-forest">player@cricrex.demo</span>.
            No real email will be delivered.
          </p>
        </div>

        {error && (
          <FormAlert tone="error" title="Could not send reset link" className="mb-4">
            {error}
          </FormAlert>
        )}

        <form onSubmit={send} noValidate className="space-y-4">
          <Input
            label="Registered email address"
            type="email"
            autoComplete="email"
            placeholder="you@club.com"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError('');
            }}
            error={error}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cricket text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(33,115,70,0.8)] transition hover:bg-cricket-dark disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparing reset…</> : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <Link to="/login" className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-slateink-light transition hover:text-forest">
          <ArrowLeft className="h-3.5 w-3.5" /> Return to login
        </Link>

        <div className="mt-4 border-t border-forest/[0.07] pt-4 text-center">
          <p className="text-[10px] leading-relaxed text-slateink-faint">
            For security, CRICREX would never reveal whether an email is registered in production. This demo shows a
            clear error to help you explore the flow.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
