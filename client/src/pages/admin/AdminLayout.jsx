import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { usePageMeta } from '../../lib/usePageMeta';
import { Burst } from '../../components/art/Illustrations';
import { Button, Loading, cx } from '../../components/ui';
import { MenuIcon } from '../../components/ui/MenuIcon';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/profile', label: 'Profile & hero' },
  { to: '/admin/sections', label: 'Page headings' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/skills', label: 'Skills' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/journey', label: 'Journey' },
  { to: '/admin/inbox', label: 'Inbox' },
  { to: '/admin/media', label: 'Images' },
];

/* ------------------------------------------------------------------ login */

/** An eye, or an eye with a line through it. Drawn to match everything else. */
function EyeIcon({ crossed }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[1.05rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3.2" />
      {crossed && <path d="M3.5 3.5 20.5 20.5" />}
    </svg>
  );
}

function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="btn btn-sm mb-4 inline-flex">
          ← Back to the site
        </Link>

        <div className="block overflow-hidden">
          <div className="fill-indigo flex items-center gap-4 border-b-[3px] border-ink p-6 text-white">
            <Burst fill="#ffc61a" className="size-12" />
            <div>
              <h1 className="text-2xl">Control desk</h1>
              <p className="text-sm text-white/70">Sign in to edit the site</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="p-6 md:p-8">
            <div>
              <label htmlFor="admin-email" className="eyebrow mb-2 block">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
              />
            </div>

            <div className="mt-5">
              <label htmlFor="admin-password" className="eyebrow mb-2 block">
                Password
              </label>

              {/* The toggle sits inside the field, so it needs room on the
                  right and cannot live inside the <label> — a button nested in
                  a label steals the click that should focus the input. */}
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pr-14"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-pressed={showPassword}
                  aria-controls="admin-password"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="btn btn-sm absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center !p-0"
                >
                  <EyeIcon crossed={showPassword} />
                </button>
              </div>

              <p className="mt-1.5 text-xs text-ink-faint">
                {showPassword
                  ? 'Your password is visible on screen.'
                  : 'Hidden. Use the eye to check what you typed.'}
              </p>
            </div>

            {error && (
              <p className="mt-4 font-semibold text-coral-deep">{error}</p>
            )}

            <Button
              type="submit"
              tone="ink"
              disabled={busy}
              className="mt-7 w-full"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>

            <p className="mt-5 text-center text-xs leading-relaxed text-ink-faint">
              There is no public sign-up. Accounts are created on the server
              with <code className="font-mono">npm run create:admin</code>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ shell */

export function AdminLayout() {
  const { user, checking, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const { pathname } = useLocation();

  usePageMeta('Control desk');

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!user) return;
    api
      .messages()
      .then((rows) => setUnread(rows.filter((m) => !m.read).length))
      .catch(() => setUnread(0));
  }, [user, pathname]);

  if (checking) return <Loading label="Checking your session" />;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-cream">
      {/* top bar */}
      <header className="sticky top-0 z-50 border-b-[3px] border-ink bg-white">
        <div className="mx-auto flex max-w-[92rem] items-center gap-3 px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2.5">
            <Burst fill="#ffc61a" className="size-9" />
            <span className="font-display text-lg font-extrabold">
              Control desk
            </span>
          </Link>

          <span className="ml-auto hidden font-mono text-xs text-ink-faint sm:block">
            {user.email}
          </span>

          <Button to="/" tone="yellow" size="sm" className="hidden sm:inline-flex">
            View site
          </Button>
          <Button type="button" onClick={logout} size="sm">
            Sign out
          </Button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn btn-icon size-10 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[92rem] gap-6 px-4 py-6">
        {/* sidebar */}
        <aside
          className={cx(
            'fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-cream p-4 transition-transform lg:sticky lg:top-24 lg:z-auto lg:h-[calc(100vh-8rem)] lg:translate-x-0 lg:bg-transparent lg:p-0',
            open ? 'translate-x-0' : '-translate-x-[110%]',
          )}
        >
          <nav className="block p-3">
            <ul className="flex flex-col gap-1.5">
              {LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      cx(
                        'flex items-center gap-2 rounded-xl border-[3px] px-3.5 py-2.5 text-sm font-bold transition-colors',
                        isActive
                          ? 'border-ink bg-ink text-white'
                          : 'border-transparent hover:border-ink hover:bg-lavender-soft',
                      )
                    }
                  >
                    <span className="flex-1">{link.label}</span>
                    {link.to === '/admin/inbox' && unread > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full border-2 border-ink bg-coral px-1 text-[0.625rem] text-ink">
                        {unread}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {open && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
