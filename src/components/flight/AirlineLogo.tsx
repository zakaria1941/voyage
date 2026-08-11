import { cn } from '@/utils/cn';

function hueFromCode(code: string): number {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

export function AirlineLogo({ code, className }: { code: string; className?: string }) {
  const hue = hueFromCode(code || 'XX');
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white', className)}
      style={{ backgroundColor: `hsl(${hue} 55% 38%)` }}
      aria-hidden="true"
    >
      {code}
    </span>
  );
}
