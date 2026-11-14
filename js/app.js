import { loadData, saveData } from './data.js';
import { getWorkoutCategory, getWorkoutMuscles, renderPage } from './pages.js';
import {
  days,
  button,
  escapeHtml as e,
  formatDate,
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
  ['alimentacao', 'Alimentação', 'food'],
  ['evolucao', 'Evolução', 'chart'],
  ['perfil', 'Perfil', 'user'],
];
const activeRoutes = {
  treinos: 'treinos',
  editar: 'treinos',
  exec: 'treinos',
  alimentacao: 'alimentacao',
  'detalhe-refeicao': 'alimentacao',
  atividades: 'inicio',
  sono: 'inicio',
};

let data = loadData();
let photos = [];
let runningWorkout = null;
let editingWorkoutId = null;
let selectedHomeDay = today;
let workoutCategoryFilter = 'Todos';
let workoutHistoryExpanded = false;
let selectedMealId = null;
let workoutClockTimer;
let toastTimer;

function showToast(message) {
  $('#t').innerHTML = `<div class="tg">${e(message)}</div>`;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    $('#t').innerHTML = '';
  }, 2000);
}

function updateMealStatus(id, status) {
  const meal = data.refeicoes.find(item => item.id === id);
  if (!meal) return;
  const log = data.refs.find(item => item.templateId === id && item.d === today);
  if (log) {
    log.status = status;
  } else {
    data.refs.unshift({
      ...meal,
      id: newId(),
      templateId: meal.id,
      d: today,
      status,
      observacao: '',
    });
  }
  saveData(data);
  render();
}

function setTheme() {
  const dark = data.dark === null
    ? window.matchMedia('(prefers-color-scheme:dark)').matches
    : data.dark;
  if (data.dark === null) {
    document.documentElement.removeAttribute('data-t');
  } else {
    document.documentElement.dataset.t = dark ? 'dark' : 'light';
  }
  document.querySelector('meta[name="theme-color"]').content = dark ? '#141414' : '#F5F5F5';
}

function openModal(title, fields, onSave, ok = 'Salvar') {
  $('#o').innerHTML = `
    <div class="ov">
      <form class="md" id="modal-form" role="dialog" aria-modal="true" aria-label="${e(title)}">
        <h2>${e(title)}</h2>
        ${fields.map(field => `
          <label for="f_${e(field[0])}">
            ${e(field[1])}
            ${field[2] === 'textarea'
              ? `<textarea id="f_${e(field[0])}" rows="3" maxlength="500">${e(field[3] ?? '')}</textarea>`
              : field[2] === 'sel'
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
  const first = $('#o input, #o select, #o textarea');
  if (first) first.focus();
}

function formatSessionDuration(minutes) {
  const totalMinutes = Math.max(0, Math.round(minutes));
  if (!totalMinutes) return 'Menos de 1 min';
  return totalMinutes < 60
    ? `${totalMinutes} min`
    : `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, '0')}min`;
}

function updateWorkoutClock() {
  const clock = $('#workout-session-clock');
  if (!clock || !runningWorkout?.startedAt) return;
  const elapsedMinutes = Math.floor((Date.now() - runningWorkout.startedAt) / 60000);
  clock.textContent = formatSessionDuration(elapsedMinutes);
}

function showWorkoutSummary(summary) {
  $('#o').innerHTML = `
    <div class="ov">
      <form class="md workout-summary-modal" id="workout-summary-form" role="dialog" aria-modal="true" aria-labelledby="workout-summary-title">
        <div class="av completion-icon">${icon('check', 34)}</div>
        <span class="workout-summary-eyebrow">SESSÃO CONCLUÍDA</span>
        <h2 id="workout-summary-title">${e(summary.name)}</h2>
        <div class="workout-summary-grid">
          <div><span>Data</span><strong>${e(formatDate(today))}</strong></div>
          <div><span>Duração</span><strong>${e(formatSessionDuration(summary.durationMinutes))}</strong></div>
          <div><span>Exercícios</span><strong>${summary.exercisesCompleted} de ${summary.totalExercises}</strong></div>
          ${summary.seriesCompleted
            ? `<div><span>Séries marcadas</span><strong>${summary.seriesCompleted} de ${summary.totalSeries}</strong></div>`
            : ''}
        </div>
        <label for="workout-summary-notes">Observações <span>(opcional)</span></label>
        <textarea id="workout-summary-notes" rows="3" maxlength="500" placeholder="Como foi o treino?"></textarea>
        <div class="row modal-actions">
          <button class="btn" type="submit">Salvar no histórico</button>
          <button class="btn s" type="button" id="workout-summary-back">Voltar à sessão</button>
        </div>
      </form>
    </div>`;
  $('#workout-summary-back').onclick = () => {
    $('#o').innerHTML = '';
  };
  $('#workout-summary-form').onsubmit = event => {
    event.preventDefault();
    const notes = $('#workout-summary-notes').value.trim();
    data.hist.unshift({
      id: newId(),
      workoutId: summary.workoutId,
      d: today,
      nome: summary.name,
      categoria: summary.category,
      n: summary.exercisesCompleted,
      seriesCompleted: summary.seriesCompleted,
      durationMinutes: summary.durationMinutes,
      observacoes: notes,
      status: 'concluído',
    });
    saveData(data);
    runningWorkout = null;
    $('#o').innerHTML = '';
    window.location.hash = 'treinos';
    showToast('Treino salvo no histórico');
  };
}

const actions = {
  selectDay(day) {
    selectedHomeDay = day;
    render();
  },
  filtrarTreinos(category) {
    workoutCategoryFilter = category;
    render();
  },
  historial() {
    workoutHistoryExpanded = !workoutHistoryExpanded;
    render();
  },
  novoTreino() {
    openModal('Criar treino', [
      ['n', 'Nome do treino', 'text', ''],
      ['observacoes', 'Observações (opcional)', 'textarea', ''],
    ], values => {
      if (!values.n.trim()) {
        showToast('Informe um nome para o treino.');
        return false;
      }
      const workout = {
        id: newId(),
        nome: values.n.trim(),
        observacoes: values.observacoes.trim(),
        ex: [],
      };
      data.treinos.push(workout);
      saveData(data);
      editingWorkoutId = workout.id;
      window.location.hash = 'editar';
    }, 'Criar');
  },
  editar(id) {
    if (runningWorkout?.id === id) {
      if (!window.confirm('Sair do acompanhamento sem salvar para editar este treino?')) return;
      runningWorkout = null;
    }
    $('#o').innerHTML = '';
    editingWorkoutId = id;
    window.location.hash = 'editar';
  },
  toggleGrupo(group) {
    const workout = data.treinos.find(item => item.id === editingWorkoutId);
    if (!workout) return;
    const selected = getWorkoutMuscles(workout);
    const groups = selected.includes(group)
      ? selected.filter(item => item !== group)
      : [...selected, group];
    const baseName = String(workout.nomeBase || workout.nome)
      .replace(/\s*[—–-]\s*.+$/, '')
      .trim() || 'Treino';
    workout.gruposMusculares = groups;
    workout.categoria = groups.join(' e ') || 'Sem categoria';
    workout.nomeBase = baseName;
    workout.nome = groups.length ? `${baseName} — ${groups.join(' e ')}` : baseName;
    saveData(data);
    render();
  },
  delT(id) {
    const hasActiveSession = runningWorkout?.id === id;
    const message = hasActiveSession
      ? 'Excluir esta planilha e encerrar o acompanhamento em andamento?'
      : 'Excluir esta planilha?';
    if (!window.confirm(message)) return;
    $('#o').innerHTML = '';
    if (hasActiveSession) runningWorkout = null;
    data.treinos = data.treinos.filter(workout => workout.id !== id);
    saveData(data);
    render();
    showToast('Planilha excluída');
  },
  addEx() {
    const workout = data.treinos.find(item => item.id === editingWorkoutId);
    if (!workout) return;
    workout.ex.push({ n: 'Novo exercício', s: 3, r: 10, c: 0, observacoes: '' });
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
  mov(index, target) {
    const workout = data.treinos.find(item => item.id === editingWorkoutId);
    const position = Number(index);
    const nextPosition = position + (target.dataset.dir === 'down' ? 1 : -1);
    if (!workout || nextPosition < 0 || nextPosition >= workout.ex.length) return;
    [workout.ex[position], workout.ex[nextPosition]] = [workout.ex[nextPosition], workout.ex[position]];
    saveData(data);
    render();
  },
  iniciar(id) {
    const workout = data.treinos.find(item => item.id === id);
    if (!workout) return;
    $('#o').innerHTML = '';
    runningWorkout = { id, done: {}, skipped: [], startedAt: Date.now() };
    window.location.hash = 'exec';
  },
  tgl(key) {
    if (!runningWorkout) return;
    const exerciseIndex = Number(key.split('-')[0]);
    if (runningWorkout.skipped.includes(exerciseIndex)) return;
    runningWorkout.done[key] = !runningWorkout.done[key];
    render();
  },
  pularEx(index) {
    if (!runningWorkout) return;
    const exerciseIndex = Number(index);
    if (!runningWorkout.skipped.includes(exerciseIndex)) runningWorkout.skipped.push(exerciseIndex);
    render();
  },
  retomarEx(index) {
    if (!runningWorkout) return;
    runningWorkout.skipped = runningWorkout.skipped.filter(item => item !== Number(index));
    render();
  },
  fim() {
    const workout = data.treinos.find(item => item.id === runningWorkout?.id);
    if (!workout) return;
    const totalSeries = workout.ex.reduce((total, exercise) => total + (Number(exercise.s) || 0), 0);
    const completedSeries = Object.values(runningWorkout.done).filter(Boolean).length;
    const skipped = new Set(runningWorkout.skipped);
    const completedExercises = completedSeries
      ? workout.ex.filter((exercise, exerciseIndex) =>
        !skipped.has(exerciseIndex)
          && Number(exercise.s) > 0
          && Array.from({ length: Number(exercise.s) || 0 }, (_, seriesIndex) =>
            runningWorkout.done[`${exerciseIndex}-${seriesIndex}`],
          ).every(Boolean),
      ).length
      : workout.ex.filter((_, exerciseIndex) => !skipped.has(exerciseIndex)).length;
    const durationMinutes = Math.floor(Math.max(0, Date.now() - runningWorkout.startedAt) / 60000);
    showWorkoutSummary({
      workoutId: workout.id,
      name: workout.nome,
      category: getWorkoutCategory(workout),
      totalExercises: workout.ex.length,
      totalSeries,
      exercisesCompleted: completedExercises,
      seriesCompleted: completedSeries,
      durationMinutes,
    });
  },
  sair() {
    runningWorkout = null;
    window.location.hash = 'treinos';
  },
  refeicao(id) {
    const meal = id ? data.refeicoes.find(item => item.id === id) : null;
    openModal(meal ? 'Editar refeição' : 'Registrar refeição', [
      ['tipo', 'Tipo', 'sel', meal?.tipo || 'Almoço', ['Café da manhã', 'Almoço', 'Lanche', 'Jantar']],
      ['t', 'O que você comeu?', 'text', meal?.t || ''],
      ['qtd', 'Quantidade ou porção', 'text', meal?.qtd || '1 porção'],
      ['h', 'Horário', 'time', meal?.h || new Date().toTimeString().slice(0, 5)],
      ['cal', 'Calorias', 'number', meal?.cal ?? 0],
      ['p', 'Proteínas (g)', 'number', meal?.p ?? 0],
      ['c', 'Carboidratos (g)', 'number', meal?.c ?? 0],
      ['g', 'Gorduras (g)', 'number', meal?.g ?? 0],
    ], values => {
      if (!values.t.trim() || !values.qtd.trim()) {
        showToast('Informe o alimento e a quantidade ou porção.');
        return false;
      }
      const nutritionValues = [values.cal, values.p, values.c, values.g].map(Number);
      if (nutritionValues.some(value => !Number.isFinite(value) || value < 0)) {
        showToast('Calorias e macros devem ser valores iguais ou maiores que zero.');
        return false;
      }
      const nextMeal = {
        id: meal?.id || newId(),
        t: values.t.trim(),
        qtd: values.qtd.trim(),
        tipo: values.tipo,
        h: values.h || '',
        cal: nutritionValues[0],
        p: nutritionValues[1],
        c: nutritionValues[2],
        g: nutritionValues[3],
      };
      if (meal) {
        const index = data.refeicoes.findIndex(item => item.id === meal.id);
        if (index >= 0) data.refeicoes[index] = nextMeal;
        const todayLog = data.refs.find(item => item.templateId === meal.id && item.d === today);
        if (todayLog) {
          Object.assign(todayLog, nextMeal, {
            id: todayLog.id,
            templateId: meal.id,
            d: today,
            status: todayLog.status,
            observacao: todayLog.observacao || '',
          });
        }
      } else {
        data.refeicoes.unshift(nextMeal);
      }
      saveData(data);
      render();
      showToast(meal ? 'Refeição atualizada' : 'Refeição registrada');
    }, meal ? 'Salvar' : 'Registrar');
  },
  abrirRefeicao(id) {
    if (!data.refeicoes.some(meal => meal.id === id)) return;
    selectedMealId = id;
    window.location.hash = `detalhe-refeicao?id=${encodeURIComponent(id)}`;
  },
  delR(id) {
    data.refeicoes = data.refeicoes.filter(meal => meal.id !== id);
    data.refs = data.refs.filter(meal => !(meal.templateId === id && meal.d === today));
    saveData(data);
    render();
    showToast('Refeição excluída do planejamento');
  },
  concluirR(id) {
    updateMealStatus(id, 'feito');
    showToast('Refeição marcada como feita');
  },
  pularR(id) {
    updateMealStatus(id, 'pulado');
    showToast('Refeição marcada como pulada');
  },
  desfazerR(id) {
    data.refs = data.refs.filter(meal => !(meal.templateId === id && meal.d === today));
    saveData(data);
    render();
    showToast('Registro do dia desfeito');
  },
  observacaoR(id) {
    const log = data.refs.find(meal => meal.templateId === id && meal.d === today);
    if (!log) return;
    openModal('Observação da refeição', [
      ['observacao', 'Observação (opcional)', 'textarea', log.observacao || ''],
    ], values => {
      log.observacao = values.observacao.trim();
      saveData(data);
      render();
      showToast('Observação salva');
    });
  },
  editarHistorico(id) {
    const meal = data.refs.find(item => item.id === id);
    if (!meal) return;
    openModal('Editar registro', [
      ['tipo', 'Tipo', 'sel', meal.tipo, ['Café da manhã', 'Almoço', 'Lanche', 'Jantar']],
      ['t', 'O que você comeu?', 'text', meal.t],
      ['qtd', 'Quantidade ou porção', 'text', meal.qtd || '1 porção'],
      ['h', 'Horário', 'time', meal.h || ''],
      ['cal', 'Calorias', 'number', meal.cal ?? 0],
      ['p', 'Proteínas (g)', 'number', meal.p ?? 0],
      ['c', 'Carboidratos (g)', 'number', meal.c ?? 0],
      ['g', 'Gorduras (g)', 'number', meal.g ?? 0],
    ], values => {
      if (!values.t.trim() || !values.qtd.trim()) {
        showToast('Informe o alimento e a quantidade ou porção.');
        return false;
      }
      const nutritionValues = [values.cal, values.p, values.c, values.g].map(Number);
      if (nutritionValues.some(value => !Number.isFinite(value) || value < 0)) {
        showToast('Calorias e macros devem ser valores iguais ou maiores que zero.');
        return false;
      }
      Object.assign(meal, {
        t: values.t.trim(),
        tipo: values.tipo,
        qtd: values.qtd.trim(),
        h: values.h,
        cal: nutritionValues[0],
        p: nutritionValues[1],
        c: nutritionValues[2],
        g: nutritionValues[3],
      });
      saveData(data);
      render();
      showToast('Registro atualizado');
    });
  },
  delHistorico(id) {
    data.refs = data.refs.filter(meal => meal.id !== id);
    saveData(data);
    render();
    showToast('Registro excluído do histórico');
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
  const [requestedRoute, routeQuery = ''] = (window.location.hash || '#inicio').slice(1).split('?');
  const route = ['inicio', 'treinos', 'editar', 'exec', 'evolucao', 'alimentacao', 'detalhe-refeicao', 'atividades', 'sono', 'perfil'].includes(requestedRoute)
    ? requestedRoute
    : 'inicio';
  if (route === 'detalhe-refeicao') {
    selectedMealId = new URLSearchParams(routeQuery).get('id') || selectedMealId;
  }
  if (route === 'editar' && !data.treinos.some(workout => workout.id === editingWorkoutId)) {
    window.location.hash = 'treinos';
    return;
  }
  if (route === 'exec' && !runningWorkout) {
    window.location.hash = 'treinos';
    return;
  }
  const selectedMeal = data.refeicoes.find(meal => meal.id === selectedMealId);
  if (route === 'detalhe-refeicao' && !selectedMeal) {
    window.location.hash = 'alimentacao';
    return;
  }

  const activeSection = activeRoutes[route] || route;
  document.body.dataset.page = route;
  $('#nav').innerHTML = `<div class="lg">Maré</div>${navItems.map(([key, label, iconName]) =>
    `<a href="#${key}" class="${key === activeSection ? 'on' : ''}"${key === activeSection ? ' aria-current="page"' : ''}>${icon(iconName, 22)}<span class="nav-label">${e(label)}</span></a>`,
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
    selectedHomeDay,
    weekSleep,
    exerciseDays,
    lastSleep,
    workout: route === 'exec' ? sessionWorkout : workout,
    session: runningWorkout,
    meal: selectedMeal,
    todayLog: data.refs.find(item => item.templateId === selectedMealId && item.d === today),
    workoutCategoryFilter,
    workoutHistoryExpanded,
    photos,
    dark: data.dark === null
      ? window.matchMedia('(prefers-color-scheme:dark)').matches
      : data.dark,
  };
  const focusedId = document.activeElement?.id;
  $('#m').innerHTML = renderPage(route, context);
  if (focusedId) document.getElementById(focusedId)?.focus();
  window.clearInterval(workoutClockTimer);
  workoutClockTimer = null;
  if (route === 'exec' && runningWorkout) {
    updateWorkoutClock();
    workoutClockTimer = window.setInterval(updateWorkoutClock, 1000);
  }
}

function scheduleDailyRefresh() {
  const now = new Date();
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 100);
  window.setTimeout(() => window.location.reload(), nextDay.getTime() - now.getTime());
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-a]');
  if (target && actions[target.dataset.a]) actions[target.dataset.a](target.dataset.i, target);
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const card = event.target.closest('.workout-card[role="button"]');
  if (!card || card !== event.target) return;
  event.preventDefault();
  card.click();
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
  if (target.dataset.wf) {
    const workout = data.treinos.find(item => item.id === editingWorkoutId);
    if (!workout) return;
    if (target.dataset.wf === 'nome') {
      const name = target.value.trim();
      if (!name) {
        target.value = workout.nome;
        showToast('O nome do treino não pode ficar vazio.');
        return;
      }
      const previousName = workout.nome;
      data.hist.forEach(item => {
        if (!item.workoutId && item.nome === previousName) item.workoutId = workout.id;
      });
      const groups = getWorkoutMuscles(workout);
      const baseName = name.replace(/\s*[—–-]\s*.+$/, '').trim() || name;
      workout.nomeBase = baseName;
      workout.nome = groups.length ? `${baseName} — ${groups.join(' e ')}` : name;
      target.value = workout.nome;
      const title = document.querySelector('.edit-workout-title');
      if (title) title.textContent = workout.nome;
    } else if (target.dataset.wf === 'categoria') {
      workout.categoria = target.value;
    } else {
      workout.observacoes = target.value.trim();
    }
    saveData(data);
    return;
  }
  if (target.dataset.f) {
    const workout = data.treinos.find(item => item.id === editingWorkoutId);
    const exercise = workout?.ex[Number(target.dataset.k)];
    if (!exercise) return;
    if (target.dataset.f === 'n' && !target.value.trim()) {
      target.value = exercise.n;
      showToast('Informe o nome do exercício.');
      return;
    }
    if (target.dataset.f === 'n') {
      const editorCard = target.closest('.exercise-editor-card');
      editorCard?.querySelectorAll('[data-dir]').forEach(button => {
        const direction = button.dataset.dir === 'down' ? 'para baixo' : 'para cima';
        button.setAttribute('aria-label', `Mover exercício ${target.value.trim()} ${direction}`);
      });
    }
    if ((target.dataset.f === 's' || target.dataset.f === 'r')
      && (!Number.isInteger(Number(target.value)) || Number(target.value) < 1)) {
      target.value = exercise[target.dataset.f];
      showToast('Séries e repetições devem ser maiores que zero.');
      return;
    }
    if (target.dataset.f === 'c' && target.value !== '' && Number(target.value) < 0) {
      target.value = exercise.c || '';
      showToast('A carga não pode ser negativa.');
      return;
    }
    exercise[target.dataset.f] = target.type === 'number'
      ? target.value === '' ? 0 : Number(target.value)
      : target.value.trim();
    saveData(data);
  }
});

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});

setTheme();
render();
scheduleDailyRefresh();
