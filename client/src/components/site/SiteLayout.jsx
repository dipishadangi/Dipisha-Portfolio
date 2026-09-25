import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useContent } from '../../lib/content';
import { useScrollProgress } from '../../lib/useParallax';
import { Burst } from '../art/Illustrations';
import { SocialLinks } from './SocialLinks';
import { MotionToggle } from './MotionToggle';
import { Button, Dot, cx } from '../ui';
import { MenuIcon } from '../ui/MenuIcon';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/work', label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
];

function Monogram({ profile }) {
  const initials =
    `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() ||
    'DC';

  return (
    <Link
      to="/"
      className="btn btn-yellow btn-icon font-display text-base"
      aria-label="Home"
    >
      {initials}
    </Link>
  );
}

function Header({ profile }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  // The bar tightens up and turns white once you leave the top of the page,
  // so it reads as a layer over the content rather than part of it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cx(
        'sticky top-0 z-50 border-b-[3px] border-ink transition-colors duration-300',
        scrolled ? 'bg-white' : 'bg-cream',
      )}
    >
      <div
        className={cx(
          'shell flex items-center gap-3 transition-all duration-300',
          scrolled ? 'py-1.5' : 'py-3',
        )}
      >
        <Monogram profile={profile} />

        <span className="hidden font-display text-lg font-extrabold sm:block">
          {profile.full_name || 'Portfolio'}
        </span>

        <nav aria-label="Primary" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1.5">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cx('btn btn-sm', isActive ? 'btn-ink' : 'bg-transparent')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Button to="/contact" tone="coral" size="sm" className="hidden lg:inline-flex">
            Hire me
          </Button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="btn btn-icon md:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t-[3px] border-ink bg-cream md:hidden">
          <ul className="shell flex flex-col gap-2 py-4">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cx('btn w-full', isActive && 'btn-ink')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Button to="/contact" tone="coral" className="w-full">
                Hire me
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function Footer({ profile }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-[3px] border-ink bg-indigo text-white">
      <div className="shell py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <Burst fill="#ffc61a" className="size-10 spin-slow" />
              <p className="font-display text-2xl font-extrabold">
                {profile.full_name || 'Portfolio'}
              </p>
            </div>
            <p className="mt-4 leading-relaxed text-white/80">
              {profile.headline}
              {profile.location ? ` · ${profile.location}` : ''}
            </p>

            <span className="mt-5 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-white px-4 py-2 text-ink">
              <Dot on={profile.available} />
              <span className="eyebrow">
                {profile.available ? 'Taking work' : 'Booked up'}
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <div>
              <p className="eyebrow text-white/70">Pages</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="font-semibold hover:text-yellow"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow text-white/70">Elsewhere</p>
              <div className="mt-4">
                <SocialLinks socials={profile.socials} tone="dark" />
              </div>
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="mt-4 inline-block font-semibold break-all hover:text-yellow"
                >
                  {profile.email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-ink/30 pt-6 text-sm text-white/70">
          <p>
            © {year} {profile.full_name}. Built with React and a lot of
            rectangles.
          </p>
          <div className="flex items-center gap-4">
            <MotionToggle />
            <Link to="/admin" className="hover:text-yellow">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout() {
  const { profile } = useContent();
  const { pathname } = useLocation();
  const progressRef = useScrollProgress();

  // React Router keeps the scroll position between routes; on a normal site
  // a new page starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <div
        ref={progressRef}
        className="progress-bar"
        style={{ transform: 'scaleX(0)' }}
        aria-hidden
      />
      <Header profile={profile} />
      {/* Keying on the path restarts the entrance animation on every
          navigation, so a new page arrives rather than simply swapping in. */}
      <main key={pathname} className="page-enter flex-1">
        <Outlet />
      </main>
      <Footer profile={profile} />
    </div>
  );
}
