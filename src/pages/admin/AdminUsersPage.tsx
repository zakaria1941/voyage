import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { listAllUsers, updateUserRole } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatDateShort } from '@/utils/date';
import type { UserProfile } from '@/types/user';
import type { UserRole } from '@/types/common';

export default function AdminUsersPage() {
  const { profile: currentAdmin } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const users = useAsync(listAllUsers, []);

  async function handleRoleChange(user: UserProfile, role: UserRole) {
    try {
      await updateUserRole(user.uid, role);
      toast.success(t(role === 'admin' ? 'admin.users.roleChangedAdmin' : 'admin.users.roleChangedUser', { name: user.firstName }));
      users.refetch();
    } catch (error) {
      toast.error(t('admin.users.roleUpdateError'), error instanceof Error ? error.message : undefined);
    }
  }

  if (users.error) return <ErrorState description={users.error} onRetry={users.refetch} />;

  const filtered = (users.data ?? []).filter((u) => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<UserProfile>[] = [
    {
      key: 'user',
      header: t('admin.users.colUser'),
      render: (u) => (
        <div className="flex items-center gap-2.5">
          {u.photoURL ? <img src={u.photoURL} alt="" className="size-8 rounded-full object-cover" /> : <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">{u.firstName[0]}{u.lastName[0]}</span>}
          <div>
            <p className="font-medium">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-ink-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'country', header: t('admin.users.colCountry'), render: (u) => u.country ?? '—' },
    { key: 'verified', header: t('admin.users.colEmail'), render: (u) => <Badge tone={u.emailVerified ? 'success' : 'neutral'}>{u.emailVerified ? t('admin.users.verified') : t('admin.users.unverified')}</Badge> },
    { key: 'joined', header: t('admin.users.colJoined'), render: (u) => formatDateShort(u.createdAt) },
    { key: 'role', header: t('admin.users.colRole'), render: (u) => <Badge tone={u.role === 'admin' ? 'brand' : 'neutral'} className="capitalize">{u.role === 'admin' && <ShieldCheck className="size-3" />}{u.role === 'admin' ? t('admin.users.roleAdmin') : t('admin.users.roleUser')}</Badge> },
  ];

  return (
    <div>
      <AdminPageHeader title={t('admin.nav.users')} description={t('admin.users.subtitle')} search={search} onSearchChange={setSearch} />
      <DataTable
        columns={columns}
        rows={filtered}
        keyField={(u) => u.uid}
        loading={users.loading}
        actions={(u) => (
          <Select
            value={u.role}
            disabled={u.uid === currentAdmin?.uid}
            onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
            className="h-8 w-28 text-xs"
            aria-label={t('admin.users.changeRoleAriaLabel', { name: u.firstName })}
          >
            <option value="user">{t('admin.users.roleUser')}</option>
            <option value="admin">{t('admin.users.roleAdmin')}</option>
          </Select>
        )}
      />
    </div>
  );
}
