import { Fragment, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Luggage, Heart, Settings, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/cn';

export function UserMenu({ dark }: { dark?: boolean }) {
  const { profile, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!profile) return null;

  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  async function handleLogout() {
    setOpen(false);
    try {
      await logout();
      toast.success('Signed out', 'See you on your next trip.');
      navigate('/');
    } catch (error) {
      toast.error('Sign-out failed', error instanceof Error ? error.message : undefined);
    }
  }

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/trips', label: 'My Trips', icon: Luggage },
    { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors',
          dark ? 'hover:bg-white/10' : 'hover:bg-ink-100',
        )}
      >
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="" className="size-8 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
            {initials}
          </span>
        )}
        <ChevronDown className={cn('size-4', dark ? 'text-white/70' : 'text-ink-500')} />
      </button>

      {open && (
        <Fragment>
          <div className="absolute right-0 z-50 mt-2 w-64 animate-scale-in rounded-2xl border border-ink-100 bg-white p-2 shadow-lifted origin-top-right">
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-ink-900">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="truncate text-xs text-ink-500">{profile.email}</p>
            </div>
            <div className="my-1 h-px bg-ink-100" />
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                <item.icon className="size-4 text-ink-400" />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                <ShieldCheck className="size-4" />
                Admin dashboard
              </Link>
            )}
            <div className="my-1 h-px bg-ink-100" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger-600 hover:bg-danger-50"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </Fragment>
      )}
    </div>
  );
}
