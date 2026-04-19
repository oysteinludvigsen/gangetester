import { memo } from 'react';

interface NumpadProps {
  onDigit: (digit: number) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function NumpadImpl({ onDigit, onBackspace, disabled }: NumpadProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 select-none">
      {DIGITS.map((d) => (
        <NumpadButton key={d} disabled={disabled} onClick={() => onDigit(d)}>
          {d}
        </NumpadButton>
      ))}
      <NumpadButton
        disabled={disabled}
        onClick={onBackspace}
        variant="secondary"
        ariaLabel="Slett siste siffer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7 mx-auto"
          aria-hidden
        >
          <path d="M21 5H9l-6 7 6 7h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      </NumpadButton>
      <NumpadButton disabled={disabled} onClick={() => onDigit(0)}>
        0
      </NumpadButton>
      <div aria-hidden />
    </div>
  );
}

interface BtnProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  ariaLabel?: string;
}

function NumpadButton({
  onClick,
  children,
  disabled,
  variant = 'primary',
  ariaLabel,
}: BtnProps) {
  const base =
    'h-16 sm:h-20 rounded-2xl font-semibold text-3xl sm:text-4xl shadow-sm transition-transform active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none';
  const styles =
    variant === 'primary'
      ? 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-50 dark:border-slate-700 dark:hover:bg-slate-700'
      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/70';

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
}

export const Numpad = memo(NumpadImpl);
