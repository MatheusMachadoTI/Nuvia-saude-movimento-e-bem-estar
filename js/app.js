import { loadData, saveData } from './data.js';
import { renderPage } from './pages.js';
import {
  days,
  escapeHtml as e,
  formatHours,
  icon,
  minutesBetween,
  newId,
  today,
} from './utils.js';

const $ = selector => document.querySelector(selector);
const navItems = [
  ['inicio', 'Início', 'home'],
  ['treinos', 'Treinos', 'dumb'],
  ['evolucao', 'Evolução', 'chart'],
  ['perfil', 'Perfil', 'user'],
];
const activeRoutes = {
  treinos: 'treinos',
  editar: 'treinos',
  exec: 'treinos',
  alimentacao: 'inicio',
  sono: 'inicio',
};

let data = loadData();
let photos = [];
let runningWorkout = null;
let editingWorkoutId = null;
let toastTimer;

function showToast(message) {
  $('#t').innerHTML = `<div class="tg">${e(message)}</div>`;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    $('#t').innerHTML = '';
  }, 2000);
}

function setTheme() {
  if (data.dark === null) {
    document.documentElement.removeAttribute('data-t');
  } else {
    document.documentElement.dataset.t = data.dark ? 'dark' : 'light';
  }
}

function openModal(title, fields, onSave, ok = 'Salvar') {
  $('#o').innerHTML = `
    <div class="ov">
      <form class="md" id="modal-form" role="dialog" aria-modal="true" aria-label="${e(title)}">
        <h2>${e(title)}</h2>
        ${fields.map(field => `
          <label for="f_${e(field[0])}">
            ${e(field[1])}
            ${field[2] === 'sel'
              ? `<select id="f_${e(field[0])}">${field[4].map(option =>
                `<option ${option === field[3] ? 'selected' : ''}>${e(option)}</option>`,
              ).join('')}</select>`
              : `<input id="f_${e(field[0])}" type="${e(field[2])}" value="${e(field[3] ?? '')}"${field[2] === 'number' ? ' step="any"' : ''}>`}
          </label>
        `).join('')}
        <div class="row modal-actions">
          <button class="btn" type="submit">${e(ok)}</button>
          <button class="btn s" type="button" id="modal-cancel">Cancelar</button>
        </div>
      </form>
    </div>`;
  $('#modal-cancel').onclick = () => { $('#o').innerHTML = ''; };
  $('#modal-form').onsubmit = event => {
    event.preventDefault();
    const values = {};
    fields.forEach(field => { values[field[0]] = document.getElementById(`f_${field[0]}`).value; });
    if (onSave(values) !== false) $('#o').innerHTML = '';
  };
  const first = $('#o input, #o select');
  if (first) first.focus();
}

function showWorkoutComplete(name, exercises, series) {
  $('#o').innerHTML = `
    <div class="ov">
      <div class="md completion-modal" role="dialog" aria-modal="true" aria-label="Treino concluído">
        <div class="av completion-icon">${icon('check', 38)}</div>
        <h2>Treino concluído!</h2>
        <p class="sub">${e(name)}</p>
        <p class="completion-summary"><b>${exercises}</b> exercícios · <b>${series}</b> séries</p>
        <button class="btn" id="return-to-workouts">Voltar aos treinos</button>
      </div>
    </div>`;
  $('#return-to-workouts').onclick = () => {
    $('#o').innerHTML = '';
    window.location.hash = 'treinos';
  };
}

const actions = {
  novoTreino() {
    openModal('Nova planilha', [['n', 'Nome da planilha', 'text', '']], values => {
      if (!values.n.trim()) return false;
      const workout = { id: newId(), nome: values.n.trim(), ex: [] };
      data.treinos.push(workout);
      saveData(data);
      editingWorkoutId = workout.id;
      window.location.hash = 'editar';
    }, 'Criar');
  },
  editar(id) {
    editingWorkoutId = id;
    window.location.hash = 'editar';
  },
  delT(id) {
    if (!window.confirm('Excluir esta planilha?')) return;
    data.treinos = data.treinos.filter(workout => workout.id !== id);
    saveData(data);
    render();
    showToast('Planilha excluída');
  },
  addEx() {
    const workout = data.treinos.find(item => item.id === editingWorkoutId);
    if (!workout) return;
    workout.ex.push({ n: 'Novo exercício', s: 3, r: 10, c: 0 });
    saveData(data);
    render();
  },
  delEx(index) {
    const workout = data.treinos.find(item => item.id === editingWorkoutId);
    if (!workout) return;
    workout.ex.splice(Number(index), 1);
    saveData(data);
    render();
  },
  mov(index) {
    const workout = data.treinos.find(item => item.id === editingWorkoutId);
    const position = Number(index);
    if (!workout || position < 1) return;
    [workout.ex[position - 1], workout.ex[position]] = [workout.ex[position], workout.ex[position - 1]];
    saveData(data);
    render();
  },
  iniciar(id) {
    const workout = data.treinos.find(item => item.id === id);
    if (!workout) return;
    runningWorkout = { id, done: {} };
    window.location.hash = 'exec';
  },
  tgl(key) {
    if (!runningWorkout) return;
    runningWorkout.done[key] = !runningWorkout.done[key];
    render();
  },
  fim() {
    const workout = data.treinos.find(item => item.id === runningWorkout?.id);
    if (!workout) return;
    const totalSeries = workout.ex.reduce((total, exercise) => total + exercise.s, 0);
    const completedSeries = Object.values(runningWorkout.done).filter(Boolean).length;
    const completedExercises = completedSeries
      ? workout.ex.filter((exercise, exerciseIndex) =>
        [...Array(exercise.s)].every((_, seriesIndex) => runningWorkout.done[`${exerciseIndex}-${seriesIndex}`]),
      ).length
      : workout.ex.length;
    data.hist.unshift({ d: today, nome: workout.nome, n: completedExercises });
    saveData(data);
    runningWorkout = null;
    showWorkoutComplete(workout.nome, completedExercises, completedSeries || totalSeries);
  },
  sair() {
    runningWorkout = null;
    window.location.hash = 'treinos';
  },
  refeicao() {
    openModal('Registrar refeição', [
      ['t', 'O que você comeu?', 'text', ''],
      ['tipo', 'Tipo', 'sel', 'Almoço', ['Café da manhã', 'Almoço', 'Lanche', 'Jantar']],
      ['h', 'Horário (opcional)', 'time', new Date().toTimeString().slice(0, 5)],
    ], values => {
      if (!values.t.trim()) return false;
      data.refs.unshift({ id: newId(), t: values.t.trim(), tipo: values.tipo, h: values.h, d: today });
      saveData(data);
      render();
      showToast('Refeição registrada');
    });
  },
  delR(id) {
    data.refs = data.refs.filter(meal => meal.id !== id);
    saveData(data);
    render();
  },
  dormir() {
    openModal('Registrar sono', [
      ['a', 'Dormi às', 'time', '23:00'],
      ['b', 'Acordei às', 'time', '07:00'],
      ['q', 'Como foi a noite?', 'sel', 'Bom', ['Bom', 'Regular', 'Ruim']],
    ], values => {
      data.sono = data.sono.filter(sleep => sleep.d !== today);
      data.sono.push({ d: today, a: values.a, b: values.b, q: { Bom: 3, Regular: 2, Ruim: 1 }[values.q] });
      saveData(data);
      render();
      showToast(`Sono registrado: ${formatHours(minutesBetween(values.a, values.b))}`);
    });
  },
  pesar() {
    openModal('Registrar peso', [['v', 'Peso (kg)', 'number', data.peso.length ? data.peso[data.peso.length - 1].v : '']], values => {
      const weight = parseFloat(values.v);
      if (!weight) return false;
      data.peso = data.peso.filter(item => item.d !== today);
      data.peso.push({ d: today, v: weight });
      data.peso.sort((first, second) => first.d.localeCompare(second.d));
      saveData(data);
      render();
      showToast('Peso registrado');
    });
  },
  foto() {
    $('#fi')?.click();
  },
  perfil() {
    openModal('Editar perfil', [
      ['nome', 'Nome', 'text', data.nome],
      ['idade', 'Idade', 'number', data.idade],
      ['alt', 'Altura', 'text', data.alt],
    ], values => {
      Object.assign(data, { nome: values.nome || data.nome, idade: values.idade, alt: values.alt });
      saveData(data);
      render();
      showToast('Perfil atualizado');
    });
  },
  obj(id) {
    const goal = data.obj.find(item => item.id === id);
    openModal(goal ? 'Editar objetivo' : 'Novo objetivo', [['t', 'Objetivo', 'text', goal ? goal.t : '']], values => {
      if (!values.t.trim()) return false;
      if (goal) goal.t = values.t.trim();
      else data.obj.push({ id: newId(), t: values.t.trim() });
      saveData(data);
      render();
    });
  },
  delO(id) {
    data.obj = data.obj.filter(goal => goal.id !== id);
    saveData(data);
    render();
  },
  tema() {
    const dark = data.dark === null
      ? window.matchMedia('(prefers-color-scheme:dark)').matches
      : data.dark;
    data.dark = !dark;
    setTheme();
    saveData(data);
    render();
  },
  sw(key) {
    data[key] = !data[key];
    saveData(data);
    render();
  },
};

function render() {
  const requestedRoute = (window.location.hash || '#inicio').slice(1);
  const route = ['inicio', 'treinos', 'editar', 'exec', 'evolucao', 'alimentacao', 'sono', 'perfil'].includes(requestedRoute)
    ? requestedRoute
    : 'inicio';
  if (route === 'editar' && !data.treinos.some(workout => workout.id === editingWorkoutId)) {
    window.location.hash = 'treinos';
    return;
  }
  if (route === 'exec' && !runningWorkout) {
    window.location.hash = 'treinos';
    return;
  }

  const activeSection = activeRoutes[route] || route;
  $('#nav').innerHTML = `<div class="lg">Maré</div>${navItems.map(([key, label, iconName]) =>
    `<a href="#${key}" class="${key === activeSection ? 'on' : ''}"${key === activeSection ? ' aria-current="page"' : ''}>${icon(iconName, 22)}${label}</a>`,
  ).join('')}`;

  const weekSleep = data.sono.filter(sleep => sleep.d >= days[0]);
  const exerciseDays = days.map(day => data.hist.some(workout => workout.d === day));
  const lastSleep = [...data.sono].sort((first, second) => second.d.localeCompare(first.d))[0];
  const workout = data.treinos.find(item => item.id === editingWorkoutId);
  const sessionWorkout = data.treinos.find(item => item.id === runningWorkout?.id);
  const context = {
    data,
    days,
    today,
    weekSleep,
    exerciseDays,
    lastSleep,
    workout: route === 'exec' ? sessionWorkout : workout,
    session: runningWorkout,
    photos,
    dark: data.dark === null
      ? window.matchMedia('(prefers-color-scheme:dark)').matches
      : data.dark,
  };
  const focusedId = document.activeElement?.id;
  $('#m').innerHTML = renderPage(route, context);
  if (focusedId) document.getElementById(focusedId)?.focus();
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-a]');
  if (target && actions[target.dataset.a]) actions[target.dataset.a](target.dataset.i, target);
});

document.addEventListener('change', event => {
  const target = event.target;
  if (target.id === 'fi' && target.files?.[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      photos.unshift({ d: today, u: reader.result });
      render();
      showToast('Foto adicionada');
    };
    reader.onerror = () => showToast('Não foi possível carregar a foto.');
    reader.readAsDataURL(target.files[0]);
  }
  if (target.dataset.f) {
    const workout = data.treinos.find(item => item.id === editingWorkoutId);
    const exercise = workout?.ex[Number(target.dataset.k)];
    if (!exercise) return;
    exercise[target.dataset.f] = target.type === 'number' ? +target.value : target.value;
    saveData(data);
  }
});

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});

setTheme();
render();
