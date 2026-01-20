export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function calculatePercentage(current: number, goal: number): number {
  return Math.min(Math.round((current / goal) * 100), 100);
}

export function getCurrentDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getWeekDays(): Array<{ day: string; date: number; today: boolean }> {
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    result.push({
      day: days[i],
      date: date.getDate(),
      today: date.toDateString() === today.toDateString()
    });
  }
  
  return result;
}