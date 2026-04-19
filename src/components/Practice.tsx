import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Numpad } from './Numpad';
import { Problem, SessionStats, Settings, StatsMap } from '../types';
import { pickNextProblem, recordAnswer } from '../adaptive';
import { formatMs } from '../utils/format';

type Phase =
  | { kind: 'answering' }
  | { kind: 'correct'; elapsedMs: number }
  | { kind: 'wrong'; correctAnswer: number; stage: 'reveal' | 'retype' };

interface PracticeProps {
  settings: Settings;
  stats: StatsMap;
  onStatsChange: (next: StatsMap) => void;
  session: SessionStats;
  onSessionChange: (next: SessionStats) => void;
}

export function Practice({
  settings,
  stats,
  onStatsChange,
  session,
  onSessionChange,
}: PracticeProps) {
  const [problem, setProblem] = useState<Problem>(() =>
    pickNextProblem(settings, stats, null),
  );
  const previousRef = useRef<Problem | null>(null);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>({ kind: 'answering' });
  const startedAtRef = useRef<number>(performance.now());

  // Reset problem when settings range changes in a way that excludes current problem.
  useEffect(() => {
    const { minA, maxA, minB, maxB } = settings;
    const inRange =
      problem.a >= minA &&
      problem.a <= maxA &&
      problem.b >= minB &&
      problem.b <= maxB;
    if (!inRange) {
      const next = pickNextProblem(settings, stats, previousRef.current);
      previousRef.current = problem;
      setProblem(next);
      setInput('');
      setPhase({ kind: 'answering' });
      startedAtRef.current = performance.now();
    }
  }, [settings, problem, stats]);

  const correctAnswer = problem.a * problem.b;
  const expectedDigits = String(correctAnswer).length;

  const nextProblem = useCallback(() => {
    const next = pickNextProblem(settings, stats, problem);
    previousRef.current = problem;
    setProblem(next);
    setInput('');
    setPhase({ kind: 'answering' });
    startedAtRef.current = performance.now();
  }, [settings, stats, problem]);

  const submit = useCallback(
    (value: string) => {
      if (phase.kind !== 'answering') return;
      const elapsedMs = performance.now() - startedAtRef.current;
      const parsed = parseInt(value, 10);
      const isCorrect = parsed === correctAnswer;
      const nextStats = recordAnswer(stats, problem, isCorrect, elapsedMs);
      onStatsChange(nextStats);

      const nextStreak = isCorrect ? session.currentStreak + 1 : 0;
      onSessionChange({
        answered: session.answered + 1,
        correct: session.correct + (isCorrect ? 1 : 0),
        responseTimesMs: isCorrect
          ? [...session.responseTimesMs, elapsedMs]
          : session.responseTimesMs,
        currentStreak: nextStreak,
        bestStreak: Math.max(session.bestStreak, nextStreak),
      });

      if (isCorrect) {
        setPhase({ kind: 'correct', elapsedMs });
      } else {
        setPhase({
          kind: 'wrong',
          correctAnswer,
          stage: 'reveal',
        });
        setInput('');
      }
    },
    [phase, correctAnswer, stats, problem, onStatsChange, onSessionChange, session],
  );

  // Auto-advance after a brief celebration of a correct answer.
  useEffect(() => {
    if (phase.kind !== 'correct') return;
    const t = window.setTimeout(nextProblem, 750);
    return () => window.clearTimeout(t);
  }, [phase, nextProblem]);

  // On wrong -> reveal, move to retype phase after a short pause so the user sees the answer.
  useEffect(() => {
    if (phase.kind !== 'wrong' || phase.stage !== 'reveal') return;
    const t = window.setTimeout(() => {
      setPhase({
        kind: 'wrong',
        correctAnswer: phase.correctAnswer,
        stage: 'retype',
      });
    }, 900);
    return () => window.clearTimeout(t);
  }, [phase]);

  const onDigit = useCallback(
    (d: number) => {
      if (phase.kind === 'correct') return;
      if (phase.kind === 'wrong' && phase.stage === 'reveal') return;

      const expected =
        phase.kind === 'wrong'
          ? String(phase.correctAnswer).length
          : expectedDigits;

      setInput((prev) => {
        if (prev.length >= expected) return prev;
        const next = prev + String(d);

        if (phase.kind === 'wrong' && phase.stage === 'retype') {
          if (next.length === expected) {
            if (parseInt(next, 10) === phase.correctAnswer) {
              // Successfully re-typed the correct answer — move on without
              // double-counting stats.
              window.setTimeout(nextProblem, 180);
            } else {
              // They typed the wrong value again: clear and let them keep trying.
              window.setTimeout(() => setInput(''), 180);
            }
          }
          return next;
        }

        if (next.length === expected) {
          // Defer to let React paint the final digit before we evaluate.
          window.setTimeout(() => submit(next), 0);
        }
        return next;
      });
    },
    [phase, expectedDigits, submit, nextProblem],
  );

  const onBackspace = useCallback(() => {
    if (phase.kind === 'correct') return;
    if (phase.kind === 'wrong' && phase.stage === 'reveal') return;
    setInput((prev) => prev.slice(0, -1));
  }, [phase]);

  // Physical keyboard support (desktop).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= '0' && e.key <= '9') {
        onDigit(parseInt(e.key, 10));
      } else if (e.key === 'Backspace') {
        onBackspace();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDigit, onBackspace]);

  const answerCells = useMemo(() => {
    const expected =
      phase.kind === 'wrong'
        ? String(phase.correctAnswer).length
        : expectedDigits;
    return Array.from({ length: expected });
  }, [phase, expectedDigits]);

  const disableDigits =
    phase.kind === 'correct' ||
    (phase.kind === 'wrong' && phase.stage === 'reveal');

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <ProblemDisplay
        problem={problem}
        input={input}
        answerCells={answerCells}
        phase={phase}
      />

      <FeedbackBar phase={phase} />

      <div className="mt-auto">
        <Numpad
          onDigit={onDigit}
          onBackspace={onBackspace}
          disabled={disableDigits}
        />
      </div>
    </div>
  );
}

function ProblemDisplay({
  problem,
  input,
  answerCells,
  phase,
}: {
  problem: Problem;
  input: string;
  answerCells: unknown[];
  phase: Phase;
}) {
  const shown =
    phase.kind === 'wrong' && phase.stage === 'reveal'
      ? String(phase.correctAnswer)
      : input;

  const wrongShake = phase.kind === 'wrong' && phase.stage === 'reveal';

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 text-center shadow-sm ${wrongShake ? 'animate-shake' : ''}`}
    >
      <div className="text-5xl sm:text-7xl font-extrabold tracking-tight tabular-nums flex items-center justify-center gap-3 sm:gap-5">
        <span>{problem.a}</span>
        <span className="text-slate-400 dark:text-slate-500">×</span>
        <span>{problem.b}</span>
        <span className="text-slate-400 dark:text-slate-500">=</span>
        <span className="inline-flex gap-1.5 sm:gap-2">
          {answerCells.map((_, i) => {
            const ch = shown[i];
            const isRevealed =
              phase.kind === 'wrong' && phase.stage === 'reveal';
            return (
              <span
                key={i}
                className={`inline-flex items-center justify-center w-12 sm:w-16 h-14 sm:h-20 rounded-xl border-2 tabular-nums ${
                  ch !== undefined
                    ? isRevealed
                      ? 'border-rose-400 bg-rose-50 text-rose-600 dark:border-rose-500 dark:bg-rose-500/10 dark:text-rose-300'
                      : phase.kind === 'correct'
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300 animate-pop'
                      : 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                }`}
              >
                {ch ?? ''}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
}

function FeedbackBar({ phase }: { phase: Phase }) {
  if (phase.kind === 'correct') {
    return (
      <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold animate-pop">
        <CheckIcon />
        <span>Riktig!</span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {formatMs(phase.elapsedMs)}
        </span>
      </div>
    );
  }
  if (phase.kind === 'wrong') {
    return (
      <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-semibold">
        <CrossIcon />
        <span>
          {phase.stage === 'reveal'
            ? `Fasit: ${phase.correctAnswer}`
            : `Skriv inn ${phase.correctAnswer} for å fortsette`}
        </span>
      </div>
    );
  }
  return (
    <div className="text-center text-slate-400 dark:text-slate-500 text-sm">
      Trykk sifrene for å svare
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
