import { cn, passwordStrength } from '@/lib/utils';

export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = passwordStrength(password);
  if (!password) return null;
  const colors = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-grass', 'bg-success'];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className={cn('h-1.5 flex-1 rounded-full transition-colors', index < score ? colors[score] : 'bg-forest/10')}
          />
        ))}
      </div>
      <p className="mt-1.5 flex items-center justify-between text-[10.5px] text-slateink-light">
        <span>Use 8+ characters with a capital letter, number and symbol.</span>
        <span className="font-bold text-slateink">{label}</span>
      </p>
    </div>
  );
}
