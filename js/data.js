import { ago, newId, today } from './utils.js';

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
      { id: 'a', nome: 'Treino A — Peito e Tríceps', ex: [
        { n: 'Supino reto', s: 3, r: 12, c: 30 },
        { n: 'Supino inclinado', s: 3, r: 10, c: 24 },
        { n: 'Crucifixo', s: 3, r: 12, c: 12 },
        { n: 'Tríceps corda', s: 3, r: 12, c: 20 },
      ] },
      { id: 'b', nome: 'Treino B — Costas e Bíceps', ex: [
        { n: 'Puxada frontal', s: 3, r: 12, c: 40 },
        { n: 'Remada curvada', s: 3, r: 10, c: 28 },
        { n: 'Rosca direta', s: 3, r: 12, c: 14 },
      ] },
    ],
    hist: [
      { d: ago(1), nome: 'Treino A — Peito e Tríceps', n: 4 },
      { d: ago(3), nome: 'Treino B — Costas e Bíceps', n: 3 },
      { d: ago(5), nome: 'Treino A — Peito e Tríceps', n: 4 },
    ],
    refeicoes: [
      {
        id: 'm1',
        t: 'Aveia com frutas e café',
        qtd: '1 porção',
        tipo: 'Café da manhã',
        h: '07:30',
        cal: 420,
        p: 18,
        c: 45,
        g: 14,
      },
      {
        id: 'm2',
        t: 'Arroz, feijão, frango e salada',
        qtd: '1 porção',
        tipo: 'Almoço',
        h: '12:40',
        cal: 760,
        p: 42,
        c: 68,
        g: 26,
      },
    ],
    refs: [
      {
        id: 'r3',
        t: 'Omelete com legumes',
        tipo: 'Jantar',
        h: '20:00',
        d: ago(1),
        cal: 510,
        p: 29,
        c: 22,
        g: 31,
        status: 'feito',
        observacao: '',
      },
    ],
    sono: [
      [0, '23:10', '06:50', 3],
      [1, '00:20', '06:30', 2],
      [2, '23:00', '07:00', 3],
      [3, '23:40', '06:20', 2],
      [4, '22:50', '06:40', 3],
      [5, '01:00', '07:10', 1],
    ].map(([offset, start, end, quality]) => ({
      d: ago(offset),
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
    if (!saved) return createInitialData();
    const storedData = JSON.parse(saved);
    const data = { ...createInitialData(), ...storedData };
    if (!Object.prototype.hasOwnProperty.call(storedData, 'refeicoes') && Array.isArray(storedData.refs)) {
      data.refeicoes = storedData.refs
        .filter(meal => meal.d === today)
        .map(meal => {
          const template = { ...meal };
          delete template.d;
          delete template.status;
          delete template.templateId;
          delete template.observacao;
          return { ...template, id: meal.id || newId() };
        });
      data.refs = storedData.refs.map(meal => ({
        ...meal,
        templateId: meal.d === today ? meal.templateId || meal.id : meal.templateId,
        status: meal.status || 'feito',
        observacao: meal.observacao || '',
      }));
    } else {
      data.refs = Array.isArray(data.refs) ? data.refs : [];
      data.refs.forEach(meal => {
        if (!meal.status) meal.status = 'feito';
        if (meal.observacao === undefined) meal.observacao = '';
      });
    }
    data.refeicoes = Array.isArray(data.refeicoes) ? data.refeicoes : [];
    return data;
  } catch (error) {
    console.error('Não foi possível carregar os dados salvos.', error);
    return createInitialData();
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error('Não foi possível salvar os dados.', error);
  }
}
