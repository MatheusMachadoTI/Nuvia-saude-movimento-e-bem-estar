import { ago, today } from '../utils/date.js';

export const storageKey = 'mare-v1';

export function createInitialData() {
  return {
    nome: 'Ana Souza',
    idade: 29,
    alt: '1,68 m',
    dark: null,
    notif: true,
    priv: true,
    treinos: [
      {
        id: 'a',
        nome: 'Treino A — Peito e Tríceps',
        ex: [
          { n: 'Supino reto', s: 3, r: 12, c: 30 },
          { n: 'Supino inclinado', s: 3, r: 10, c: 24 },
          { n: 'Crucifixo', s: 3, r: 12, c: 12 },
          { n: 'Tríceps corda', s: 3, r: 12, c: 20 },
        ],
      },
      {
        id: 'b',
        nome: 'Treino B — Costas e Bíceps',
        ex: [
          { n: 'Puxada frontal', s: 3, r: 12, c: 40 },
          { n: 'Remada curvada', s: 3, r: 10, c: 28 },
          { n: 'Rosca direta', s: 3, r: 12, c: 14 },
        ],
      },
    ],
    hist: [
      { d: ago(1), nome: 'Treino A — Peito e Tríceps', n: 4 },
      { d: ago(3), nome: 'Treino B — Costas e Bíceps', n: 3 },
      { d: ago(5), nome: 'Treino A — Peito e Tríceps', n: 4 },
    ],
    refs: [
      { id: 'r1', t: 'Aveia com frutas e café', tipo: 'Café da manhã', h: '07:30', d: today },
      { id: 'r2', t: 'Arroz, feijão, frango e salada', tipo: 'Almoço', h: '12:40', d: today },
      { id: 'r3', t: 'Omelete com legumes', tipo: 'Jantar', h: '20:00', d: ago(1) },
    ],
    sono: [
      [0, '23:10', '06:50', 3],
      [1, '00:20', '06:30', 2],
      [2, '23:00', '07:00', 3],
      [3, '23:40', '06:20', 2],
      [4, '22:50', '06:40', 3],
      [5, '01:00', '07:10', 1],
    ].map(([daysAgo, start, end, quality]) => ({
      d: ago(daysAgo),
      a: start,
      b: end,
      q: quality,
    })),
    peso: [
      { d: ago(28), v: 72.4 },
      { d: ago(21), v: 71.8 },
      { d: ago(14), v: 71.2 },
      { d: ago(7), v: 70.6 },
      { d: ago(1), v: 70.2 },
    ],
    obj: [
      { id: 'o1', t: 'Treinar 4 vezes por semana' },
      { id: 'o2', t: 'Dormir pelo menos 7 horas por noite' },
      { id: 'o3', t: 'Manter uma rotina alimentar organizada' },
    ],
  };
}

export function loadData() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...createInitialData(), ...JSON.parse(saved) } : createInitialData();
  } catch (error) {
    console.error('Não foi possível carregar os dados salvos.', error);
    return createInitialData();
  }
}
