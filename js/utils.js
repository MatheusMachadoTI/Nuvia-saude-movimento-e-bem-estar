export const icons = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  dumb: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
  chart: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  food: '<path d="M3 2v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2M6 2v20M19 2c-2 1-3 4-3 8h3v12"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  play: '<path d="M6 3l14 9-14 9z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
  cam: '<path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
};

export const iso = date => date.toISOString().slice(0, 10);

export const ago = days => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return iso(date);
};

export const today = ago(0);
export const days = Array.from({ length: 7 }, (_, index) => ago(6 - index));

export const formatDate = date =>
  new Date(`${date}T12:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

export const formatWeekday = date =>
  new Date(`${date}T12:00`).toLocaleDateString('pt-BR', { weekday: 'narrow' }).toUpperCase();

export const minutesBetween = (start, end) => {
  const [startHour, startMinute] = start.split(':');
  const [endHour, endMinute] = end.split(':');
  return ((+endHour * 60 + +endMinute) - (+startHour * 60 + +startMinute) + 1440) % 1440;
};

export const formatHours = minutes =>
  `${Math.floor(minutes / 60)}h${String(Math.round(minutes % 60)).padStart(2, '0')}`;

export const average = values =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;

export const duration = sleep => minutesBetween(sleep.a, sleep.b);

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

export const fillTemplate = (template, values) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? '');

export const icon = (name, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg>`;

export const button = (action, text, iconName, className = '', id = '', ariaLabel = '') =>
  `<button class="btn ${className}" data-a="${escapeHtml(action)}" data-i="${escapeHtml(id)}"${ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : ''}>${iconName ? icon(iconName, 18) : ''}${escapeHtml(text)}</button>`;

export const empty = (iconName, text, action = '') =>
  `<div class="empty">${icon(iconName, 34)}<p>${escapeHtml(text)}</p>${action}</div>`;

export function bars(values, labels, color, maximum) {
  const max = maximum || Math.max(...values, 1);
  return `<svg viewBox="0 0 ${values.length * 44} 110" width="100%" role="img">${values.map((value, index) => {
    const height = value / max * 72;
    return `<rect x="${index * 44 + 8}" y="${80 - height}" width="28" height="${Math.max(height, value ? 3 : 0)}" rx="8" fill="${color}"/><text x="${index * 44 + 22}" y="100" text-anchor="middle" font-size="11" fill="currentColor" opacity=".7">${escapeHtml(labels[index])}</text>`;
  }).join('')}</svg>`;
}

export function weightLine(points) {
  if (points.length < 2) return '';
  const values = points.map(point => point.v);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const width = 320;
  const coordinates = points.map((point, index) => [
    10 + index * (width - 20) / (points.length - 1),
    90 - (point.v - min) / (max - min) * 70,
  ]);
  return `<svg viewBox="0 0 ${width} 110" width="100%" role="img" aria-label="Gráfico de peso"><polyline points="${coordinates.map(point => point.join(',')).join(' ')}" fill="none" stroke="#FE492A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${coordinates.map((point, index) => `<circle cx="${point[0]}" cy="${point[1]}" r="5" fill="#16336F"/><text x="${point[0]}" y="106" text-anchor="middle" font-size="10" fill="currentColor" opacity=".7">${formatDate(points[index].d)}</text>`).join('')}</svg>`;
}

export const newId = () => Math.random().toString(36).slice(2, 8);
