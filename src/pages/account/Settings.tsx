import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Database,
  Download,
  KeyRound,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Input, PasswordInput, Toggle } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { useApp } from '@/context/AppContext';
import { passwordStrength, readStore, roleSlug, writeStore } from '@/lib/utils';

const PREFS_KEY = 'cricrex.prefs.v1';

interface Preferences {
  bookingEmails: boolean;
  matchReminders: boolean;
  ownerPayouts: boolean;
  productNews: boolean;
  weeklyDigest: boolean;
  smsAlerts: boolean;
}

const defaultPreferences: Preferences = {
  bookingEmails: true,
  matchReminders: true,
  ownerPayouts: true,
  productNews: false,
  weeklyDigest: true,
  smsAlerts: false,
};

const tabs = [
  { value: 'preferences', label: 'Preferences' },
  { value: 'account', label: 'Account' },
  { value: 'security', label: 'Security' },
  { value: 'data', label: 'Demo data' },
];

export function Settings() {
  const { user, bookings, updateProfile, pushToast, logout } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('preferences');
  const [prefs, setPrefs] = useState<Preferences>(() => readStore<Preferences>(PREFS_KEY, defaultPreferences));
  const [account, setAccount] = useState({ email: user?.email ?? '', username: user?.username ?? '' });
  const [accountError, setAccountError] = useState('');
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [resetOpen, setResetOpen] = useState(false);

  if (!user) return null;
  const slug = roleSlug(user.role);

  const savePrefs = () => {
    writeStore(PREFS_KEY, prefs);
    pushToast({
      title: 'Preferences saved',
      description: 'Notification choices are stored in this browser only.',
      tone: 'success',
    });
  };

  const saveAccount = (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(account.email.trim())) {
      setAccountError('Enter a valid email address.');
      return;
    }
    if (account.username.trim().length < 3) {
      setAccountError('Usernames need at least 3 characters.');
      return;
    }
    setAccountError('');
    updateProfile({ email: account.email.trim(), username: account.username.trim() });
  };

  const changePassword = (event: FormEvent) => {
    event.preventDefault();
    if (passwords.current !== user.password) {
      setPasswordError('Your current password does not match the demo record.');
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordError('Choose a new password with at least 8 characters.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError('The new passwords do not match.');
      return;
    }
    setPasswordError('');
    updateProfile({ password: passwords.next });
    setPasswords({ current: '', next: '', confirm: '' });
    pushToast({ title: 'Demo password updated', description: 'Use the new password the next time you sign in.', tone: 'success' });
  };

  const downloadData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      note: 'CRICREX frontend demo export. No server data is included.',
      user,
      bookings: bookings.filter((booking) => booking.userEmail.toLowerCase() === user.email.toLowerCase()),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'cricrex-demo-profile.json';
    anchor.click();
    URL.revokeObjectURL(url);
    pushToast({ title: 'Export downloaded', description: 'A JSON copy of your demo profile and bookings was created.', tone: 'success' });
  };

  const resetDemo = () => {
    ['cricrex.auth.v1', 'cricrex.users.v1', 'cricrex.bookings.v1', PREFS_KEY].forEach((key) => localStorage.removeItem(key));
    logout();
    navigate('/');
    pushToast({ title: 'Demo reset', description: 'Local CRICREX data was cleared. You are signed out.', tone: 'info' });
  };

  const strength = passwordStrength(passwords.next);

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your simulated account, notification preferences and local demo data."
        actions={
          <Link to={`/${slug}/profile`} className={buttonStyles('outline', 'md')}>
            <UserRound className="h-4 w-4" /> Edit profile
          </Link>
        }
      />

      <Tabs options={tabs} value={tab} onChange={setTab} variant="underline" className="mb-5" />

      {tab === 'preferences' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cricket/10 text-cricket">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-[15px] font-bold text-forest">Notification preferences</h3>
                  <p className="text-[10.5px] text-slateink-light">Choose what the demo would notify you about.</p>
                </div>
              </div>
              <div className="mt-5 divide-y divide-forest/[0.06]">
                {[
                  { key: 'bookingEmails' as const, label: 'Booking confirmations', desc: 'Email-style updates when a demo booking is confirmed or cancelled.' },
                  { key: 'matchReminders' as const, label: 'Match reminders', desc: 'A nudge before an assigned fixture or booked slot begins.' },
                  { key: 'ownerPayouts' as const, label: 'Payout summaries', desc: 'Weekly earnings and payout notifications for ground owners.' },
                  { key: 'weeklyDigest' as const, label: 'Weekly digest', desc: 'A round-up of your matches, stats and upcoming fixtures.' },
                  { key: 'smsAlerts' as const, label: 'SMS alerts', desc: 'Short matchday alerts by text. No messages are actually sent.' },
                  { key: 'productNews' as const, label: 'Product news', desc: 'Occasional notes about new CRICREX features and demo releases.' },
                ].map((item) => (
                  <div key={item.key} className="py-4 first:pt-0 last:pb-0">
                    <Toggle
                      checked={prefs[item.key]}
                      onChange={(value) => setPrefs((current) => ({ ...current, [item.key]: value }))}
                      label={item.label}
                      description={item.desc}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col-reverse gap-2 border-t border-forest/[0.07] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10.5px] text-slateink-faint">Preferences are device-local.</p>
                <Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={savePrefs}>
                  Save preferences
                </Button>
              </div>
            </div>

            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-matchday/15 text-[#B25E00]">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-[15px] font-bold text-forest">Display & accessibility</h3>
                  <p className="text-[10.5px] text-slateink-light">Comfort settings for longer scorecard sessions.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { title: 'Keyboard-first navigation', detail: 'All interactive elements already expose visible focus states.' },
                  { title: 'Reduced motion', detail: 'CRICREX respects your operating system motion preference automatically.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-forest/[0.07] bg-offwhite p-3.5">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-forest">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {item.title}
                    </p>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-slateink-light">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="font-display text-[15px] font-bold text-forest">Demo tip</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-slateink-light">
                Notifications are generated from the same local store across every role. Marking one as read here also
                clears the badge in your dashboard header.
              </p>
              <Link to={`/${slug}/notifications`} className="mt-3 inline-flex text-[11px] font-bold text-cricket hover:text-forest">
                Open notifications →
              </Link>
            </div>
            <div className="rounded-2xl border border-forest/10 bg-white p-5">
              <Badge tone="grass" icon={<ShieldCheck className="h-3 w-3" />}>Privacy first</Badge>
              <p className="mt-3 text-[11px] leading-relaxed text-slateink-light">
                CRICREX never sends these preferences anywhere. They are written to localStorage under
                <code className="mx-1 rounded bg-offwhite px-1 py-0.5 text-[10px] text-forest">cricrex.prefs.v1</code>
                and nothing else.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'account' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <form onSubmit={saveAccount} className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cricket/10 text-cricket">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Sign-in details</h3>
                <p className="text-[10.5px] text-slateink-light">Used to sign in with your demo role.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Email address" type="email" value={account.email} onChange={(event) => setAccount((current) => ({ ...current, email: event.target.value }))} error={accountError} icon={<Mail className="h-4 w-4" />} />
              <Input label="Username" value={account.username} onChange={(event) => setAccount((current) => ({ ...current, username: event.target.value }))} icon={<UserRound className="h-4 w-4" />} />
            </div>
            <div className="mt-3 rounded-xl border border-matchday/25 bg-matchday/[0.08] p-3 text-[10.5px] leading-relaxed text-[#8A5000]">
              Changing your email updates the local account record. If you sign out, use the new email with your existing
              password.
            </div>
            <div className="mt-5 flex justify-end">
              <Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />}>Save account details</Button>
            </div>
          </form>

          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="font-display text-[15px] font-bold text-forest">Account summary</h3>
              <dl className="mt-3 space-y-3 text-[11.5px]">
                {[
                  ['Role', user.role],
                  ['Status', user.status],
                  ['Account ID', user.id],
                  ['Bookings', String(bookings.filter((booking) => booking.userEmail.toLowerCase() === user.email.toLowerCase()).length)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <dt className="text-slateink-light">{label}</dt>
                    <dd className="break-all text-right font-semibold text-forest">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl border border-cricket/15 bg-cricket/[0.05] p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest"><LockKeyhole className="h-3.5 w-3.5 text-cricket" /> No verification emails</p>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
                Changing your email does not trigger a confirmation link. There is no mail server in this demo.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <form onSubmit={changePassword} className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/[0.06] text-forest">
                <KeyRound className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-[15px] font-bold text-forest">Change password</h3>
                <p className="text-[10.5px] text-slateink-light">A simulated credential update — no hashing or server storage.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <PasswordInput
                label="Current password"
                placeholder="Enter your existing demo password"
                value={passwords.current}
                onChange={(event) => { setPasswords((current) => ({ ...current, current: event.target.value })); setPasswordError(''); }}
                error={passwordError}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordInput
                  label="New password"
                  placeholder="At least 8 characters"
                  value={passwords.next}
                  onChange={(event) => { setPasswords((current) => ({ ...current, next: event.target.value })); setPasswordError(''); }}
                  required
                />
                <PasswordInput
                  label="Confirm new password"
                  placeholder="Repeat the new password"
                  value={passwords.confirm}
                  onChange={(event) => { setPasswords((current) => ({ ...current, confirm: event.target.value })); setPasswordError(''); }}
                  required
                />
              </div>
              {passwords.next && (
                <div>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slateink-light">Password strength</span>
                    <span className="font-bold text-forest">{strength.label}</span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <span key={step} className={`h-1.5 rounded-full ${step <= strength.score ? (strength.score >= 4 ? 'bg-success' : strength.score >= 3 ? 'bg-cricket' : 'bg-matchday') : 'bg-forest/10'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <Button type="submit" variant="primary" icon={<KeyRound className="h-4 w-4" />}>Update password</Button>
            </div>
          </form>

          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-forest">
                <ShieldCheck className="h-4 w-4 text-cricket" /> Demo password notes
              </h3>
              <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-slateink-light">
                <li>• Passwords are stored as plain text in localStorage.</li>
                <li>• Never reuse a real password in this demo.</li>
                <li>• Clearing demo data restores the seeded accounts.</li>
                <li>• Changing your password does not sign you out.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-[11px] font-bold text-amber-800">Local-only security</p>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-amber-700">
                This is a UI demonstration, not a production auth system. There is no hashing, rate limiting, session
                token or email verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'data' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Database className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-[15px] font-bold text-forest">Your local demo data</h3>
                  <p className="text-[10.5px] text-slateink-light">Everything CRICREX remembers lives in this browser.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ['Accounts', 'Seeded + local'],
                  ['Bookings', String(bookings.length)],
                  ['Notifications', '5 seeded'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-offwhite p-3">
                    <p className="font-display text-lg font-extrabold text-forest">{value}</p>
                    <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slateink-faint">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={downloadData}>Download my data</Button>
                <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setResetOpen(true)}>Reset demo data</Button>
              </div>
            </div>

            <div className="card p-5 sm:p-6">
              <h3 className="font-display text-[15px] font-bold text-forest">How the demo stores data</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[440px]">
                  <thead className="border-b border-forest/[0.06]">
                    <tr>
                      <th className="table-th">Key</th>
                      <th className="table-th">What it holds</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/[0.05]">
                    {[
                      ['cricrex.auth.v1', 'The ID of your signed-in demo account'],
                      ['cricrex.users.v1', 'All demo accounts and profile edits'],
                      ['cricrex.bookings.v1', 'Bookings you create or cancel'],
                      ['cricrex.prefs.v1', 'Notification and display preferences'],
                    ].map(([key, value]) => (
                      <tr key={key}>
                        <td className="table-td font-mono text-[10.5px] font-bold text-forest">{key}</td>
                        <td className="table-td whitespace-normal text-[11px]">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-[11px] font-bold text-red-700">Destructive demo action</p>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-red-600">
                Resetting clears local accounts, bookings and preferences, then returns you to the public site. The demo
                accounts are restored on the next load.
              </p>
            </div>
            <div className="card p-5">
              <p className="text-[11px] font-bold text-forest">Need a fresh account?</p>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-slateink-light">
                You can register a new player, captain, scorer, umpire or owner at any time. Admin accounts are
                provisioned through the predefined demo login only.
              </p>
              <Link to="/register" className="mt-3 inline-flex text-[11px] font-bold text-cricket hover:text-forest">
                Create a demo account →
              </Link>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => { setResetOpen(false); resetDemo(); }}
        title="Reset all demo data?"
        description="This clears every local CRICREX account, booking, notification preference and session in this browser. It cannot be undone from inside the app."
        confirmLabel="Reset demo"
        cancelLabel="Keep my data"
        icon={<Trash2 className="h-6 w-6" />}
      />
    </div>
  );
}
