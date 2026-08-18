/** Pure daily-streak maths, shared by every service implementation. */

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function nextStreak(lastActiveDay: string | null, streakDays: number, now: Date): number {
  const today = dayKey(now);
  if (lastActiveDay === today) return Math.max(1, streakDays);
  const yesterday = dayKey(new Date(now.getTime() - 86_400_000));
  if (lastActiveDay === yesterday) return streakDays + 1;
  return 1;
}
