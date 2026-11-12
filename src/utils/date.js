export const iso = date => date.toISOString().slice(0, 10);

export const ago = days => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return iso(date);
};

export const today = ago(0);

export const formatDate = date =>
  new Date(`${date}T12:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

export const formatWeekday = date =>
  new Date(`${date}T12:00`).toLocaleDateString('pt-BR', {
    weekday: 'narrow',
  }).toUpperCase();

export const minutesBetween = (start, end) => {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return (endHour * 60 + endMinute - (startHour * 60 + startMinute) + 1440) % 1440;
};

export const formatHours = minutes =>
  `${Math.floor(minutes / 60)}h${String(Math.round(minutes % 60)).padStart(2, '0')}`;

export const getWeekDays = () => Array.from({ length: 7 }, (_, index) => ago(6 - index));
