import templates from './templates.js';
import {
  average,
  bars,
  button,
  duration,
  empty,
  escapeHtml as e,
  fillTemplate,
  formatDate,
  formatHours,
  formatWeekday,
  icon,
  weightLine,
} from './utils.js';

const sleepLabels = ['', 'Ruim', 'Regular', 'Bom'];

function renderHome({ data, days, today, weekSleep, lastSleep, exerciseDays }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const todayMeals = data.refs.filter(meal => meal.d === today);
  const nextWorkout = data.treinos[0];
  const weekWorkoutCount = data.hist.filter(workout => workout.d >= days[0]).length;

  return fillTemplate(templates.inicio, {
    greeting,
    firstName: e(data.nome.split(' ')[0]),
    date: e(new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })),
    weekSummary: `${exerciseDays.filter(Boolean).length} dias de treino · ${weekSleep.filter(sleep => sleep.q >= 2).length} noites de sono satisfatório`,
    weekDays: days.map((day, index) =>
      `<div class="dot ${exerciseDays[index] ? 'on' : ''}"><b></b>${formatWeekday(day)}</div>`,
    ).join(''),
    workoutCount: weekWorkoutCount,
    nextWorkout: `<span style="margin:10px 0 14px;font-weight:600;display:block">${nextWorkout ? `Próximo: ${e(nextWorkout.nome)}` : 'Crie sua primeira planilha'}</span>`,
    startWorkoutButton: nextWorkout ? button('iniciar', 'Iniciar', 'play', 'w', nextWorkout.id) : '',
    mealCount: todayMeals.length,
    addMealButton: button('refeicao', 'Registrar', 'plus'),
    sleepDuration: lastSleep ? formatHours(duration(lastSleep)) : '—',
    lastSleep: lastSleep ? `Última noite · ${sleepLabels[lastSleep.q]}` : 'Nenhum registro ainda',
    latestWeight: data.peso.length ? `${e(data.peso[data.peso.length - 1].v)} kg` : '—',
    recentActivities: data.hist.length
      ? data.hist.slice(0, 3).map(item =>
        `<div class="li"><span>${e(item.nome)}</span><span class="tag">${formatDate(item.d)}</span></div>`,
      ).join('')
      : empty('dumb', 'Seus treinos concluídos aparecem aqui.'),
  });
}

function renderWorkouts({ data }) {
  const workoutCards = data.treinos.length
    ? data.treinos.map((workout, index) => `
      <div class="c ${index % 2 ? '' : 'pt'}">
        <h2>${e(workout.nome)}</h2>
        <p class="sub" style="margin-bottom:8px">${workout.ex.length} exercícios</p>
        ${workout.ex.map(exercise => `
          <div class="li" style="border-color:rgba(255,255,255,.2)">
            <span>${e(exercise.n)}</span>
            <span class="sub">${exercise.s}×${exercise.r}${exercise.c ? ` · ${e(exercise.c)} kg` : ''}</span>
          </div>
        `).join('')}
        <div class="row" style="margin-top:14px">
          ${workout.ex.length ? button('iniciar', 'Iniciar', 'play', 'w', workout.id) : ''}
          ${button('editar', '', 'edit', 'ic s', workout.id, `Editar ${workout.nome}`)}
          ${button('delT', '', 'trash', 'ic d', workout.id, `Excluir ${workout.nome}`)}
        </div>
      </div>
    `).join('')
    : `<div class="c" style="grid-column:1/-1">${empty('dumb', 'Nenhuma planilha ainda. Crie a primeira para começar.', button('novoTreino', 'Criar planilha', 'plus'))}</div>`;

  const history = data.hist.length
    ? data.hist.map(item => `
      <div class="li">
        <div><b>${e(item.nome)}</b><div class="sub">${item.n} exercícios</div></div>
        <span class="tag">${formatDate(item.d)}</span>
      </div>
    `).join('')
    : empty('cal', 'Nenhum treino realizado ainda.');

  return fillTemplate(templates.treinos, {
    newWorkoutButton: button('novoTreino', 'Nova planilha', 'plus'),
    workoutCards,
    history,
  });
}

function renderWorkoutEditor({ workout }) {
  if (!workout) return '';
  const exerciseFields = workout.ex.length
    ? workout.ex.map((exercise, index) => `
      <div class="li exercise-editor" style="display:block">
        <input data-k="${index}" data-f="n" value="${e(exercise.n)}" aria-label="Exercício">
        <div class="row" style="margin-top:8px">
          <label style="flex:1;margin:0">Séries<input type="number" data-k="${index}" data-f="s" value="${exercise.s}" min="1"></label>
          <label style="flex:1;margin:0">Reps<input type="number" data-k="${index}" data-f="r" value="${exercise.r}" min="1"></label>
          <label style="flex:1;margin:0">Carga kg<input type="number" data-k="${index}" data-f="c" value="${exercise.c}" min="0"></label>
        </div>
        <div class="row" style="margin-top:8px">
          ${button('mov', 'Subir', '', 's', index)}
          ${button('delEx', 'Remover', 'trash', 'd', index)}
        </div>
      </div>
    `).join('')
    : empty('dumb', 'Adicione o primeiro exercício.');

  return fillTemplate(templates.editar, {
    backIcon: icon('back'),
    workoutName: e(workout.nome),
    exerciseFields,
    addExerciseButton: button('addEx', 'Adicionar exercício', 'plus'),
  });
}

function renderWorkoutSession({ workout, session }) {
  if (!workout || !session) return '';
  const totalSeries = workout.ex.reduce((total, exercise) => total + exercise.s, 0);
  const completedSeries = Object.values(session.done).filter(Boolean).length;
  const exerciseCards = workout.ex.map((exercise, exerciseIndex) => `
    <div class="c exercise-session-card" style="margin-bottom:12px">
      <div class="row sp">
        <h2 style="margin:0">${e(exercise.n)}</h2>
        <span class="tag">${exercise.r} reps${exercise.c ? ` · ${e(exercise.c)} kg` : ''}</span>
      </div>
      <div class="row" style="margin-top:12px">
        ${Array.from({ length: exercise.s }, (_, seriesIndex) => {
          const key = `${exerciseIndex}-${seriesIndex}`;
          return `<button class="set ${session.done[key] ? 'on' : ''}" data-a="tgl" data-i="${key}" aria-pressed="${Boolean(session.done[key])}">${seriesIndex + 1}</button>`;
        }).join('')}
      </div>
    </div>
  `).join('');

  return fillTemplate(templates.exec, {
    workoutName: e(workout.nome),
    completedSeries,
    totalSeries,
    progress: totalSeries ? (completedSeries / totalSeries) * 100 : 0,
    exerciseCards,
    finishButton: `<button class="btn finish-workout-button" data-a="fim">${icon('check')}Finalizar treino</button>`,
    exitButton: button('sair', 'Sair', 'x', 's'),
  });
}

function renderProgress({ data, days, weekSleep, exerciseDays, photos }) {
  const latestWeight = data.peso[data.peso.length - 1];
  const averageSleep = average(weekSleep.map(duration));
  const sleepChart = weekSleep.length
    ? bars(days.map(day => {
      const sleep = weekSleep.find(item => item.d === day);
      return sleep ? +(duration(sleep) / 60).toFixed(1) : 0;
    }), days.map(formatWeekday), '#7F94D1', 10)
    : empty('moon', 'Sem registros de sono nesta semana.');
  const photoGallery = photos.length
    ? `<div class="ph">${photos.map(photo =>
      `<div><img src="${e(photo.u)}" alt="Foto de ${formatDate(photo.d)}">${formatDate(photo.d)}</div>`,
    ).join('')}</div>`
    : empty('cam', 'Adicione uma foto para acompanhar sua jornada. Ela fica só neste aparelho.');

  return fillTemplate(templates.evolucao, {
    trainingDays: exerciseDays.filter(Boolean).length,
    weeklyWorkouts: data.hist.filter(item => item.d >= days[0]).length,
    goodSleepDays: weekSleep.filter(sleep => sleep.q >= 2).length,
    averageSleep: weekSleep.length ? `média de ${formatHours(averageSleep)}` : 'sem registros',
    weeklyMeals: data.refs.filter(meal => meal.d >= days[0]).length,
    latestWeight: latestWeight ? `${e(latestWeight.v)} kg` : '—',
    trainingChart: bars(exerciseDays.map(Number), days.map(formatWeekday), '#16336F', 1),
    sleepChart,
    registerWeightButton: button('pesar', 'Registrar', 'plus', 's'),
    weightChart: data.peso.length > 1
      ? weightLine(data.peso)
      : empty('chart', 'Registre seu peso para ver a evolução.'),
    addPhotoButton: button('foto', 'Adicionar', 'cam', 's'),
    photoGallery,
  });
}

function renderFood({ data, today }) {
  const todayMeals = data.refs
    .filter(meal => meal.d === today)
    .sort((first, second) => (first.h || '').localeCompare(second.h || ''));
  const olderMeals = data.refs
    .filter(meal => meal.d !== today)
    .sort((first, second) => second.d.localeCompare(first.d));
  const colors = ['mt', 'tq', 'lv', 'pt'];
  const card = (meal, color) => `
    <div class="c ${color}" style="padding:16px">
      <div class="row sp">
        <div>
          <span class="tag">${e(meal.tipo)}${meal.h ? ` · ${e(meal.h)}` : ''}</span>
          <p style="margin-top:8px;font-weight:600">${e(meal.t)}</p>
        </div>
        <button class="btn s ic" data-a="delR" data-i="${e(meal.id)}" aria-label="Remover">${icon('trash', 16)}</button>
      </div>
    </div>`;
  const todayMarkup = todayMeals.length
    ? todayMeals.map((meal, index) => card(meal, colors[index % colors.length])).join('')
    : `<div class="c" style="grid-column:1/-1">${empty('food', 'Nenhuma refeição hoje.')}</div>`;
  const historyMarkup = olderMeals.length
    ? olderMeals.map(meal => `
      <div class="c" style="padding:16px">
        <span class="tag">${formatDate(meal.d)} · ${e(meal.tipo)}</span>
        <p style="margin-top:8px">${e(meal.t)}</p>
      </div>
    `).join('')
    : `<div class="c" style="grid-column:1/-1">${empty('cal', 'O histórico aparece aqui.')}</div>`;

  return fillTemplate(templates.alimentacao, {
    addMealButton: button('refeicao', 'Registrar refeição', 'plus'),
    todayMeals: todayMarkup,
    mealHistory: historyMarkup,
  });
}

function renderSleep({ data, days }) {
  const records = [...data.sono].sort((first, second) => second.d.localeCompare(first.d));
  const averageSleep = average(records.slice(0, 7).map(duration));
  const sleepChart = records.length
    ? bars(days.map(day => {
      const record = records.find(item => item.d === day);
      return record ? +(duration(record) / 60).toFixed(1) : 0;
    }), days.map(formatWeekday), '#7F94D1', 10)
    : empty('moon', 'Registre sua primeira noite.');
  const sleepRecords = records.map(record => `
    <div class="li">
      <div><b>${formatHours(duration(record))}</b><div class="sub">${e(record.a)} → ${e(record.b)}</div></div>
      <div class="row"><span class="tag">${sleepLabels[record.q]}</span><span class="sub">${formatDate(record.d)}</span></div>
    </div>
  `).join('');

  return fillTemplate(templates.sono, {
    addSleepButton: button('dormir', 'Registrar sono', 'plus'),
    averageSleep: records.length ? formatHours(averageSleep) : '—',
    goodNights: records.filter(record => record.q >= 2).length,
    totalNights: records.length,
    sleepChart,
    sleepRecords,
  });
}

function renderProfile({ data, dark }) {
  const setting = (key, enabled, label) =>
    `<div class="li"><span>${label}</span><button class="sw ${enabled ? 'on' : ''}" data-a="${key === 'tema' ? 'tema' : 'sw'}" data-i="${key}" role="switch" aria-checked="${Boolean(enabled)}" aria-label="${label}"></button></div>`;
  const goals = data.obj.length
    ? data.obj.map(goal => `
      <div class="li" style="border-color:rgba(42,35,80,.15)">
        <span>${icon('target', 16)} ${e(goal.t)}</span>
        <span class="row">
          ${button('obj', '', 'edit', 'ic w', goal.id, 'Editar')}
          ${button('delO', '', 'trash', 'ic w', goal.id, 'Excluir')}
        </span>
      </div>
    `).join('')
    : empty('target', 'Objetivos são opcionais. Defina os seus quando quiser.');

  return fillTemplate(templates.perfil, {
    avatar: e(data.nome[0] || ''),
    name: e(data.nome),
    age: e(data.idade),
    height: e(data.alt),
    editProfileButton: button('perfil', 'Editar perfil', 'edit', 'w'),
    newGoalButton: button('obj', 'Novo', 'plus', 'w'),
    goals,
    settings: setting('tema', dark, 'Modo escuro')
      + setting('notif', data.notif, 'Notificações')
      + setting('priv', data.priv, 'Manter dados só neste aparelho'),
  });
}

export function renderPage(route, context) {
  const pages = {
    inicio: renderHome,
    treinos: renderWorkouts,
    evolucao: renderProgress,
    perfil: renderProfile,
    alimentacao: renderFood,
    sono: renderSleep,
    editar: renderWorkoutEditor,
    exec: renderWorkoutSession,
  };
  const render = pages[route];
  return render ? render(context) : renderHome(context);
}
