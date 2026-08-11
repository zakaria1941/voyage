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
import { formatDateShort } from '@/utils/date';
import type { UserProfile } from '@/types/user';
import type { UserRole } from '@/types/common';

export default function AdminUsersPage() {
  const { profile: currentAdmin } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const users = useAsync(listAllUsers, []);

  async function handleRoleChange(user: UserProfile, role: UserRole) {
    try {
      await updateUserRole(user.uid, role);
      toast.success(`${user.firstName} is now ${role === 'admin' ? 'an admin' : 'a regular user'}`);
      users.refetch();
    } catch (error) {
      toast.error('Couldn’t update role', error instanceof Error ? error.message : undefined);
    }
  }

  if (users.error) return <ErrorState description={users.error} onRetry={users.refetch} />;

  const filtered = (users.data ?? []).filter((u) => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<UserProfile>[] = [
    {
      key: 'user',
      header: 'User',
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
    { key: 'country', header: 'Country', render: (u) => u.country ?? '—' },
    { key: 'verified', header: 'Email', render: (u) => <Badge tone={u.emailVerified ? 'success' : 'neutral'}>{u.emailVerified ? 'Verified' : 'Unverified'}</Badge> },
    { key: 'joined', header: 'Joined', render: (u) => formatDateShort(u.createdAt) },
    { key: 'role', header: 'Role', render: (u) => <Badge tone={u.role === 'admin' ? 'brand' : 'neutral'} className="capitalize">{u.role === 'admin' && <ShieldCheck className="size-3" />}{u.role}</Badge> },
  ];

  return (
    <div>
      <AdminPageHeader title="Users" description="Everyone with a Voyago account." search={search} onSearchChange={setSearch} />
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
            aria-label={`Change role for ${u.firstName}`}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>
        )}
      />
    </div>
  );
}
