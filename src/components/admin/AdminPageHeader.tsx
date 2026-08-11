import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  addLabel?: string;
  onAdd?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function AdminPageHeader({ title, description, addLabel = 'Add new', onAdd, search, onSearchChange, searchPlaceholder = 'Search…' }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-950">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      <div className="flex items-center gap-2.5">
        {onSearchChange && (
          <Input
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            icon={<Search className="size-4" />}
            className="w-56"
          />
        )}
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="size-4" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
