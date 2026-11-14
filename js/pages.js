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

function localDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getWeekDates(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const weekday = new Date(date);
    weekday.setDate(date.getDate() + index);
    return localDateKey(weekday);
  });
}

function renderHome({ data, today, selectedHomeDay }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const week = getWeekDates(today);
  const weekStart = week[0];
  const weekEnd = week[week.length - 1];
  const selectedDay = week.includes(selectedHomeDay) ? selectedHomeDay : today;
  const selectedDateValue = new Date(`${selectedDay}T12:00:00`);
  const weekWorkouts = data.hist.filter(workout => workout.d >= weekStart && workout.d <= weekEnd);
  const activeWorkoutDays = new Set(weekWorkouts.map(workout => workout.d));
  const weekSleep = data.sono.filter(sleep => sleep.d >= weekStart && sleep.d <= weekEnd);
  const selectedWorkouts = data.hist.filter(workout => workout.d === selectedDay);
  const selectedSleep = data.sono.find(sleep => sleep.d === selectedDay);
  const selectedMeals = data.refs.filter(meal => meal.d === selectedDay && meal.status === 'feito');
  const nextWorkout = data.treinos[0];
  const firstName = String(data.nome || '').trim().split(/\s+/)[0] || 'por aqui';
  const mealTypes = [...new Set(selectedMeals.map(meal => meal.tipo))];
  const dayLabels = week.map(day => {
    const date = new Date(`${day}T12:00:00`);
    const label = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const shortLabel = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').slice(0, 3);
    const selected = day === selectedDay;
    const hasWorkout = activeWorkoutDays.has(day);
    return `
      <button id="home-day-${day}" class="home-day-button${selected ? ' is-selected' : ''}${hasWorkout ? ' has-activity' : ''}"
        type="button" data-a="selectDay" data-i="${day}" aria-pressed="${selected}"
        aria-label="${e(label)}, ${date.getDate()} de ${e(date.toLocaleDateString('pt-BR', { month: 'long' }))}${hasWorkout ? ', treino registrado' : ''}">
        <span class="home-day-name">${e(shortLabel)}</span>
        <span class="home-day-number">${date.getDate()}</span>
        <span class="home-day-marker" aria-hidden="true"></span>
      </button>`;
  }).join('');
  const selectedWorkoutCount = selectedWorkouts.length;
  const selectedMealSummary = selectedMeals.length
    ? mealTypes.map(e).join(' · ')
    : selectedDay === today
      ? 'Registre sua primeira refeição'
      : 'Nenhuma refeição registrada';
  const dayActivities = [
    ...data.hist.filter(item => item.d === today).map(item => ({ label: item.nome, type: 'Treino' })),
    ...data.refs.filter(item => item.d === today).map(item => ({
      label: `${item.tipo}: ${item.t}`,
      type: item.status === 'pulado' ? 'Pulada' : 'Alimentação',
    })),
    ...data.sono.filter(item => item.d === today).map(item => ({ label: 'Sono registrado', type: 'Sono' })),
  ];
  const recentActivities = dayActivities.length
    ? dayActivities.slice(0, 3).map(item =>
      `<div class="li"><span>${e(item.label)}</span><span class="tag">${e(item.type)}</span></div>`,
    ).join('')
    : empty('cal', 'As atividades registradas hoje aparecerão aqui.');

  return fillTemplate(templates.inicio, {
    greeting: e(greeting),
    firstName: e(firstName),
    avatar: e(firstName[0].toUpperCase()),
    date: e(new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })),
    weekSummary: `${activeWorkoutDays.size} ${activeWorkoutDays.size === 1 ? 'dia ativo' : 'dias ativos'} · ${weekSleep.filter(sleep => sleep.q >= 2).length} noites de sono satisfatório`,
    weekRange: `${formatDate(weekStart)} — ${formatDate(weekEnd)}`,
    weekDays: dayLabels,
    selectedDate: e(selectedDateValue.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })),
    workoutIcon: icon('dumb', 18),
    dayWorkoutCount: String(selectedWorkoutCount),
    workoutDayTitle: selectedWorkoutCount
      ? selectedWorkoutCount === 1 ? 'Treino concluído' : 'Treinos concluídos'
      : selectedDay === today ? 'Pronto para começar' : 'Dia de recuperação',
    workoutDayDescription: selectedWorkoutCount
      ? e(selectedWorkouts.map(workout => workout.nome).join(' · '))
      : selectedDay === today && nextWorkout
        ? `Próximo: ${e(nextWorkout.nome)}`
        : selectedDay === today
          ? 'Você ainda não criou uma planilha.'
          : 'Nenhuma atividade registrada.',
    sleepIcon: icon('moon', 18),
    sleepDuration: selectedSleep ? formatHours(duration(selectedSleep)) : '—',
    sleepQuality: selectedSleep ? `Qualidade ${sleepLabels[selectedSleep.q]}` : 'Sem registro para este dia',
    foodIcon: icon('food', 18),
    mealCount: String(selectedMeals.length),
    mealSummary: selectedMealSummary,
    mealAction: selectedDay === today
      ? '<a class="home-tile-link home-meal-button" href="#alimentacao">Registrar refeição <span aria-hidden="true">→</span></a>'
      : '<a class="home-tile-link" href="#alimentacao">Ver diário <span aria-hidden="true">→</span></a>',
    progressIcon: icon('chart', 18),
    workoutCount: String(weekWorkouts.length),
    activeDayCount: String(activeWorkoutDays.size),
    activeDayDots: week.map(day =>
      `<span class="home-week-dot${activeWorkoutDays.has(day) ? ' is-active' : ''}" title="${e(formatDate(day))}${activeWorkoutDays.has(day) ? ': treino registrado' : ''}"></span>`,
    ).join(''),
    recentActivities,
  });
}

export const workoutMuscleGroups = [
  'Peito',
  'Tríceps',
  'Costas',
  'Bíceps',
  'Ombros',
  'Perna',
  'Posterior de coxa',
  'Glúteos',
  'Panturrilhas',
  'Abdômen',
  'Antebraço',
  'Cardio',
];

export const workoutCategories = ['Sem categoria', ...workoutMuscleGroups];

function categoryKey(category) {
  return String(category)
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR');
}

function canonicalMuscleGroups(value) {
  const knownGroups = new Map(workoutMuscleGroups.map(group => [categoryKey(group), group]));
  const legacyAliases = new Map([['pernas', 'Perna']]);
  return String(value)
    .split(/\s*(?:,| e )\s*/i)
    .map(group => group.trim())
    .filter(Boolean)
    .map(group => knownGroups.get(categoryKey(group)) || legacyAliases.get(categoryKey(group)) || group);
}

export function getWorkoutMuscles(workout) {
  if (Array.isArray(workout.gruposMusculares)) {
    return [...new Set(workout.gruposMusculares.map(group => canonicalMuscleGroups(group)[0]).filter(Boolean))];
  }
  const category = String(workout.categoria || '').trim();
  const inferred = workout.nomeBase ? null : String(workout.nome || '').match(/[—–-]\s*(.+)$/);
  const value = category && categoryKey(category) !== categoryKey('Sem categoria')
    ? category
    : inferred ? inferred[1] : '';
  return canonicalMuscleGroups(value);
}

export function getWorkoutCategory(workout) {
  return getWorkoutMuscles(workout).join(' e ') || 'Sem categoria';
}

function totalWorkoutSets(workout) {
  return workout.ex.reduce((total, exercise) => total + (Number(exercise.s) || 0), 0);
}

function formatWorkoutDuration(value) {
  if (!Number.isFinite(Number(value)) || value === null || value === undefined) return '';
  const minutes = Math.max(0, Math.round(Number(value)));
  if (!minutes) return 'Menos de 1 min';
  return minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}min`;
}

function renderWorkouts({ data, historyExpanded, workoutCategoryFilter = 'Todos' }) {
  const categoryLabels = new Map(workoutCategories.map(category => [categoryKey(category), category]));
  const categoriesByKey = new Map();
  data.treinos.forEach(workout => {
    const category = getWorkoutCategory(workout).trim().replace(/\s+/g, ' ');
    const key = categoryKey(category);
    if (!categoriesByKey.has(key)) {
      categoriesByKey.set(key, categoryLabels.get(key) || category);
    }
  });
  const categories = [...categoriesByKey.values()];
  const requestedCategoryKey = categoryKey(workoutCategoryFilter);
  const selectedCategory = categories.find(category => categoryKey(category) === requestedCategoryKey) || 'Todos';
  const selectedCategoryKey = selectedCategory === 'Todos' ? '' : categoryKey(selectedCategory);
  const filteredWorkouts = selectedCategory === 'Todos'
    ? data.treinos
    : data.treinos.filter(workout => categoryKey(getWorkoutCategory(workout)) === selectedCategoryKey);
  const workoutFilter = ['Todos', ...categories].map(category => `
    <button class="workout-filter${category === selectedCategory ? ' is-selected' : ''}"
      type="button" data-a="filtrarTreinos" data-i="${e(category)}"
      aria-pressed="${category === selectedCategory}">${e(category)}</button>
  `).join('');
  const workoutCards = filteredWorkouts.length
    ? filteredWorkouts.map((workout, index) => {
      const lastWorkout = [...data.hist]
        .sort((first, second) => second.d.localeCompare(first.d))
        .find(item => item.workoutId === workout.id || (!item.workoutId && item.nome === workout.nome));
      const exerciseCount = workout.ex.length;
      const sets = totalWorkoutSets(workout);
      const lastDuration = lastWorkout ? formatWorkoutDuration(lastWorkout.durationMinutes) : '';
      const lastLabel = lastWorkout
        ? `Último treino · ${formatDate(lastWorkout.d)}${lastDuration ? ` · ${lastDuration}` : ''}`
        : 'Ainda não realizado';
      const action = exerciseCount ? 'iniciar' : 'editar';
      const actionLabel = exerciseCount
        ? `Acompanhar ${workout.nome}`
        : `Adicionar exercícios a ${workout.nome}`;
      return `
        <article class="workout-card workout-card-tone-${index % 3}" role="button" tabindex="0"
          data-a="${action}" data-i="${e(workout.id)}" aria-label="${e(actionLabel)}">
          <div class="workout-card-top">
            <span class="workout-card-icon">${icon('dumb', 22)}</span>
            <span class="workout-category">${e(getWorkoutCategory(workout))}</span>
            <span class="workout-card-open" aria-hidden="true">${icon(exerciseCount ? 'play' : 'edit', 16)}</span>
          </div>
          <h3>${e(workout.nome)}</h3>
          <div class="workout-card-stats">
            <span><strong>${exerciseCount}</strong> ${exerciseCount === 1 ? 'exercício' : 'exercícios'}</span>
            <span><strong>${sets}</strong> ${sets === 1 ? 'série' : 'séries'}</span>
          </div>
          <p class="workout-card-last">${e(lastLabel)}</p>
        </article>`;
    }).join('')
    : data.treinos.length
      ? `<div class="workout-empty workout-empty-filter">${empty('cal', 'Nenhum treino nesta categoria.')}</div>`
      : `
        <div class="workout-empty">
          <span class="workout-empty-icon">${icon('dumb', 34)}</span>
          <h3>Seu próximo treino começa aqui</h3>
          <p>Crie uma planilha do seu jeito e organize os exercícios no seu ritmo.</p>
          ${button('novoTreino', 'Criar primeiro treino', 'plus', 'workout-create-button')}
        </div>`;
  const featuredWorkout = data.treinos[0];
  const featuredHistory = featuredWorkout
    ? [...data.hist]
      .sort((first, second) => second.d.localeCompare(first.d))
      .find(item => item.workoutId === featuredWorkout.id || (!item.workoutId && item.nome === featuredWorkout.nome))
    : null;
  const featuredDuration = featuredHistory
    ? formatWorkoutDuration(featuredHistory.durationMinutes)
    : '';
  const featuredCard = featuredWorkout
    ? `
      <section class="workout-feature" aria-labelledby="workout-feature-title">
        <div class="workout-feature-copy">
          <span class="workout-feature-status">${featuredWorkout.ex.length ? 'PRONTO PARA COMEÇAR' : 'ADICIONE EXERCÍCIOS'}</span>
          <h2 id="workout-feature-title">${e(featuredWorkout.nome)}</h2>
          <p>${e(getWorkoutCategory(featuredWorkout))}</p>
          <div class="workout-feature-stats">
            <span>${featuredWorkout.ex.length} ${featuredWorkout.ex.length === 1 ? 'exercício' : 'exercícios'}</span>
            <span>${totalWorkoutSets(featuredWorkout)} ${totalWorkoutSets(featuredWorkout) === 1 ? 'série' : 'séries'}</span>
            ${featuredDuration ? `<span>Último · ${e(featuredDuration)}</span>` : ''}
          </div>
          ${featuredWorkout.ex.length
            ? button('iniciar', 'Iniciar treino', 'play', 'workout-feature-action', featuredWorkout.id)
            : button('editar', 'Adicionar exercícios', 'edit', 'workout-feature-action', featuredWorkout.id)}
        </div>
        <div class="workout-feature-art" aria-hidden="true">${icon('dumb', 72)}</div>
      </section>`
    : `
      <section class="workout-feature workout-feature-empty" aria-labelledby="workout-feature-title">
        <div class="workout-feature-copy">
          <span class="workout-feature-status">MOVIMENTO NO SEU RITMO</span>
          <h2 id="workout-feature-title">Tudo começa com um plano.</h2>
          <p>Monte sua primeira sequência de exercícios.</p>
          ${button('novoTreino', 'Criar treino', 'plus', 'workout-feature-action')}
        </div>
        <div class="workout-feature-art" aria-hidden="true">${icon('dumb', 72)}</div>
      </section>`;
  const historyItems = [...data.hist].sort((first, second) => second.d.localeCompare(first.d));
  const visibleHistory = historyExpanded ? historyItems : historyItems.slice(0, 3);
  const history = visibleHistory.length
    ? visibleHistory.map(item => {
      const durationLabel = formatWorkoutDuration(item.durationMinutes);
      const details = [
        `${Number(item.n) || 0} ${(Number(item.n) || 0) === 1 ? 'exercício' : 'exercícios'}`,
        item.seriesCompleted
          ? `${item.seriesCompleted} ${item.seriesCompleted === 1 ? 'série marcada' : 'séries marcadas'}`
          : '',
        durationLabel,
      ].filter(Boolean);
      return `
        <article class="workout-history-item">
          <span class="workout-history-icon">${icon('check', 18)}</span>
          <div class="workout-history-copy">
            <h3>${e(item.nome)}</h3>
            <p>${details.map(e).join(' · ')}</p>
            ${item.observacoes ? `<p class="workout-history-note">${e(item.observacoes)}</p>` : ''}
          </div>
          <div class="workout-history-meta">
            <span class="workout-history-status">Concluído</span>
            <time datetime="${e(item.d)}">${formatDate(item.d)}</time>
          </div>
        </article>`;
    }).join('')
    : empty('cal', 'Seus treinos concluídos aparecerão aqui.');
  const historyToggle = historyItems.length > 3
    ? `<button class="workout-history-toggle" type="button" data-a="historial" aria-expanded="${Boolean(historyExpanded)}">${historyExpanded ? 'Mostrar menos' : 'Ver histórico completo'} ${icon('chart', 16)}</button>`
    : '';

  return fillTemplate(templates.treinos, {
    avatar: e(String(data.nome || '').trim()[0] || ''),
    newWorkoutButton: button('novoTreino', 'Criar treino', 'plus', 'workout-create-button'),
    featuredCard,
    workoutCount: String(data.treinos.length),
    workoutFilter: data.treinos.length ? workoutFilter : '',
    workoutCards,
    history,
    historyToggle,
  });
}

function renderWorkoutEditor({ workout }) {
  if (!workout) return '';
  const selectedMuscles = getWorkoutMuscles(workout);
  const muscleOptions = [...new Set([
    ...workoutMuscleGroups,
    ...selectedMuscles.filter(group => !workoutMuscleGroups.includes(group)),
  ])].map(group => `
    <button class="workout-muscle-option${selectedMuscles.includes(group) ? ' is-selected' : ''}"
      type="button" data-a="toggleGrupo" data-i="${e(group)}"
      aria-pressed="${selectedMuscles.includes(group)}">${e(group)}</button>
  `).join('');
  const workoutFields = `
    <div class="workout-editor-fields">
      <label>Nome do treino
        <input data-wf="nome" value="${e(workout.nome)}" maxlength="80" aria-label="Nome do treino">
      </label>
      <div class="workout-muscle-field">
        <span class="workout-muscle-label">Grupos musculares <small>Escolha um ou mais</small></span>
        <div class="workout-muscle-options" role="group" aria-label="Grupos musculares">
          ${muscleOptions}
        </div>
        <p class="workout-muscle-selected">${selectedMuscles.length
          ? `Selecionados: ${e(selectedMuscles.join(' e '))}`
          : 'Nenhum grupo selecionado'}</p>
      </div>
      <label>Observações do treino <span>(opcional)</span>
        <textarea data-wf="observacoes" rows="3" maxlength="500" aria-label="Observações do treino">${e(workout.observacoes || '')}</textarea>
      </label>
    </div>`;
  const exerciseFields = workout.ex.length
    ? workout.ex.map((exercise, index) => `
      <article class="exercise-editor-card">
        <div class="exercise-editor-heading">
          <span class="exercise-editor-number">${String(index + 1).padStart(2, '0')}</span>
          <span>Exercício</span>
          <div class="exercise-editor-order">
            <button class="btn s ic" type="button" data-a="mov" data-i="${index}" data-dir="up"
              aria-label="Mover exercício ${e(exercise.n)} para cima"${index === 0 ? ' disabled' : ''}>${icon('up', 16)}</button>
            <button class="btn s ic" type="button" data-a="mov" data-i="${index}" data-dir="down"
              aria-label="Mover exercício ${e(exercise.n)} para baixo"${index === workout.ex.length - 1 ? ' disabled' : ''}>${icon('down', 16)}</button>
          </div>
        </div>
        <label>Nome do exercício
          <input data-k="${index}" data-f="n" value="${e(exercise.n)}" maxlength="80" aria-label="Nome do exercício">
        </label>
        <div class="exercise-editor-numbers">
          <label>Séries<input type="number" data-k="${index}" data-f="s" value="${exercise.s}" min="1" inputmode="numeric" aria-label="Séries"></label>
          <label>Repetições<input type="number" data-k="${index}" data-f="r" value="${exercise.r}" min="1" inputmode="numeric" aria-label="Repetições"></label>
          <label>Carga <span>(opcional)</span><input type="number" data-k="${index}" data-f="c" value="${exercise.c || ''}" min="0" step="any" inputmode="decimal" aria-label="Carga em quilos"></label>
        </div>
        <label>Observações <span>(opcional)</span>
          <textarea data-k="${index}" data-f="observacoes" rows="2" maxlength="300" aria-label="Observações do exercício">${e(exercise.observacoes || '')}</textarea>
        </label>
        <button class="exercise-remove-button" type="button" data-a="delEx" data-i="${index}">${icon('trash', 16)} Remover exercício</button>
      </article>
    `).join('')
    : `<div class="workout-empty exercise-empty">${empty('dumb', 'Adicione o primeiro exercício para montar sua sequência.')}</div>`;

  return fillTemplate(templates.editar, {
    backIcon: icon('back'),
    savedIcon: icon('check', 15),
    workoutName: e(workout.nome),
    workoutFields,
    exerciseCount: String(workout.ex.length),
    exerciseFields,
    addExerciseButton: button('addEx', 'Adicionar exercício', 'plus', 'workout-create-button'),
  });
}

function renderWorkoutSession({ workout, session }) {
  if (!workout || !session) return '';
  const totalSeries = totalWorkoutSets(workout);
  const completedSeries = Object.values(session.done).filter(Boolean).length;
  const skippedExercises = new Set(session.skipped || []);
  const completedExercises = workout.ex.filter((exercise, exerciseIndex) =>
    !skippedExercises.has(exerciseIndex)
      && Number(exercise.s) > 0
      && Array.from({ length: Number(exercise.s) || 0 }, (_, seriesIndex) =>
        session.done[`${exerciseIndex}-${seriesIndex}`],
      ).every(Boolean),
  ).length;
  const remainingExercises = workout.ex.filter((exercise, exerciseIndex) =>
    !skippedExercises.has(exerciseIndex)
      && !Array.from({ length: Number(exercise.s) || 0 }, (_, seriesIndex) =>
        session.done[`${exerciseIndex}-${seriesIndex}`],
      ).every(Boolean),
  ).length;
  const elapsedMinutes = Math.floor(Math.max(0, Date.now() - (session.startedAt || Date.now())) / 60000);
  const elapsedLabel = formatWorkoutDuration(elapsedMinutes) || 'Menos de 1 min';
  const exerciseCards = workout.ex.map((exercise, exerciseIndex) => {
    const skipped = skippedExercises.has(exerciseIndex);
    const sets = Array.from({ length: Number(exercise.s) || 0 }, (_, seriesIndex) => {
      const key = `${exerciseIndex}-${seriesIndex}`;
      return `<button class="set ${session.done[key] ? 'on' : ''}" type="button" data-a="tgl" data-i="${key}"
        aria-pressed="${Boolean(session.done[key])}" aria-label="Série ${seriesIndex + 1} de ${e(exercise.n)}">${seriesIndex + 1}</button>`;
    }).join('');
    return `
      <article class="exercise-session-card${skipped ? ' is-skipped' : ''}">
        <div class="exercise-session-heading">
          <div>
            <span class="exercise-session-index">EXERCÍCIO ${String(exerciseIndex + 1).padStart(2, '0')}</span>
            <h2>${e(exercise.n)}</h2>
          </div>
          ${skipped
            ? '<span class="exercise-skipped-tag">Pulado</span>'
            : `<span class="exercise-session-prescription">${exercise.r} reps${exercise.c ? ` · ${e(exercise.c)} kg` : ''}</span>`}
        </div>
        ${exercise.observacoes ? `<p class="exercise-session-note">${e(exercise.observacoes)}</p>` : ''}
        ${skipped
          ? button('retomarEx', 'Retomar exercício', 'plus', 'session-skip-button', exerciseIndex)
          : `
            <div class="session-sets" aria-label="Marque cada série concluída">${sets || '<span class="sub">Sem séries definidas</span>'}</div>
            <button class="session-skip-button" type="button" data-a="pularEx" data-i="${exerciseIndex}">Pular exercício</button>`}
      </article>`;
  }).join('');
  const progress = totalSeries ? Math.min(100, (completedSeries / totalSeries) * 100) : 0;

  return fillTemplate(templates.exec, {
    workoutName: e(workout.nome),
    category: e(getWorkoutCategory(workout)),
    backIcon: icon('back'),
    completedSeries,
    totalSeries,
    completedExercises,
    remainingExercises,
    elapsedLabel,
    progress,
    exerciseCards: exerciseCards || `<div class="workout-empty">${empty('dumb', 'Este treino ainda não tem exercícios.')}</div>`,
    editPlanButton: button('editar', 'Editar plano', 'edit', 's', workout.id),
    deletePlanButton: button('delT', 'Excluir treino', 'trash', 'd', workout.id),
    finishButton: `<button class="btn finish-workout-button" type="button" data-a="fim">${icon('check')}Finalizar treino</button>`,
    exitButton: button('sair', 'Sair do treino', 'x', 's'),
  });
}

function renderProgress({ data, days, weekSleep, exerciseDays, photos }) {
  const latestWeight = data.peso[data.peso.length - 1];
  const averageSleep = average(weekSleep.map(duration));
  const sleepChart = weekSleep.length
    ? bars(days.map(day => {
      const sleep = weekSleep.find(item => item.d === day);
      return sleep ? +(duration(sleep) / 60).toFixed(1) : 0;
    }), days.map(formatWeekday), 'var(--lv)', 10)
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
    weeklyMeals: data.refs.filter(meal => meal.d >= days[0] && meal.status === 'feito').length,
    latestWeight: latestWeight ? `${e(latestWeight.v)} kg` : '—',
    trainingChart: bars(exerciseDays.map(Number), days.map(formatWeekday), 'var(--green)', 1),
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
  const todayMeals = [...(data.refeicoes || [])]
    .sort((first, second) => (first.h || '').localeCompare(second.h || ''));
  const todayLogs = data.refs.filter(meal => meal.d === today);
  const logsByMeal = new Map(todayLogs.map(meal => [meal.templateId, meal]));
  const olderMeals = data.refs
    .filter(meal => meal.d !== today)
    .sort((first, second) => second.d.localeCompare(first.d));

  const mealCalories = meal => Number(meal.cal) || 0;
  const mealMacros = meal => ({
    protein: Number(meal.p) || 0,
    carb: Number(meal.c) || 0,
    fat: Number(meal.g) || 0,
  });

  const totals = todayLogs
    .filter(meal => meal.status === 'feito')
    .reduce((summary, meal) => {
      const calories = mealCalories(meal);
      const macros = mealMacros(meal);
      summary.calories += calories;
      summary.protein += macros.protein;
      summary.carb += macros.carb;
      summary.fat += macros.fat;
      return summary;
    }, { calories: 0, protein: 0, carb: 0, fat: 0 });

  const dailyGoal = 2100;
  const progressPercent = Math.min(100, Math.round((totals.calories / dailyGoal) * 100) || 0);
  const macroGrams = totals.protein + totals.carb + totals.fat;
  const macroTotal = macroGrams || 1;
  const proteinShare = Math.round((totals.protein / macroTotal) * 100);
  const fatShare = Math.round((totals.fat / macroTotal) * 100);
  const carbShare = Math.max(0, 100 - proteinShare - fatShare);
  const macroChart = totals.protein + totals.carb + totals.fat
    ? `conic-gradient(var(--pt) 0 ${proteinShare}%, var(--mt) ${proteinShare}% ${proteinShare + carbShare}%, var(--tq) ${proteinShare + carbShare}% 100%)`
    : 'var(--g1)';

  const mealPlan = todayMeals.length
    ? todayMeals.map(meal => {
      const log = logsByMeal.get(meal.id);
      return `
      <div class="food-plan-item">
        <span class="food-plan-time">${e(meal.h || '—')}</span>
        <div>
          <strong>${e(meal.tipo)}</strong>
          <small>${e(meal.t)} · ${e(meal.qtd || '1 porção')}</small>
        </div>
        <span class="food-plan-status">${log?.status === 'feito' ? 'Feita' : log?.status === 'pulado' ? 'Pulada' : 'Pendente'}</span>
      </div>`;
    }).join('')
    : `<div class="food-empty-state">${empty('food', 'Seu planejamento aparece aqui após registrar uma refeição.')}</div>`;

  const mealCard = (meal, index) => {
    const status = logsByMeal.get(meal.id)?.status || 'pendente';
    const statusLabel = status === 'feito' ? 'Feita' : status === 'pulado' ? 'Pulada' : 'Pendente';
    return `
      <button class="food-meal-card food-card-tone-${index % 5} is-${status}" type="button"
        data-a="abrirRefeicao" data-i="${e(meal.id)}"
        aria-label="Abrir ${e(meal.tipo)}: ${e(meal.t)}, ${statusLabel}">
        <span class="food-card-type">${e(meal.tipo)}</span>
        <span class="food-meal-copy">
          <strong>${e(meal.t)}</strong>
          <small>${e(meal.h || 'Sem horário')} · ${statusLabel}</small>
        </span>
        <span class="food-meal-open" aria-hidden="true">${icon(status === 'feito' ? 'check' : 'down', 18)}</span>
      </button>`;
  };

  const todayMarkup = todayMeals.length
    ? todayMeals.map(mealCard).join('')
    : `<div class="food-empty-state full-width">${empty('food', 'Nenhuma refeição registrada hoje.')}</div>`;

  const historyMarkup = olderMeals.length
    ? olderMeals.map(meal => `
      <div class="food-history-card">
        <div>
          <span class="food-date">${formatDate(meal.d)}</span>
          <strong>${e(meal.tipo)}</strong>
          <span class="food-history-status">${meal.status === 'pulado' ? 'Pulada' : 'Feita'}</span>
          <div class="food-history-actions">
            ${button('editarHistorico', '', 'edit', 'ic food-inline-action', meal.id, 'Editar')}
            ${button('delHistorico', '', 'trash', 'ic food-inline-action', meal.id, 'Excluir')}
          </div>
        </div>
        <p>${e(meal.t)} · ${e(meal.qtd || '1 porção')}</p>
        <small>${mealCalories(meal)} kcal</small>
        ${meal.observacao ? `<p class="food-observation">${e(meal.observacao)}</p>` : ''}
      </div>
    `).join('')
    : `<div class="food-empty-state full-width">${empty('cal', 'O histórico de refeições aparece aqui.')}</div>`;

  return fillTemplate(templates.alimentacao, {
    avatar: e(String(data.nome || 'A').trim()[0] || 'A'),
    firstName: e(String(data.nome || 'Perfil').trim().split(/\s+/)[0]),
    addMealButton: `<button class="btn food-cta" type="button" data-a="refeicao" aria-label="Registrar refeição">${icon('plus', 18)}Registrar</button>`,
    dailyCalories: `${totals.calories} kcal`,
    dailyGoal: `${dailyGoal} kcal`,
    progressPercent: String(progressPercent),
    macroGrams: String(macroGrams),
    macroChart,
    proteinValue: `${totals.protein}g`,
    carbValue: `${totals.carb}g`,
    fatValue: `${totals.fat}g`,
    proteinShare: String(proteinShare || 0),
    carbShare: String(carbShare || 0),
    fatShare: String(fatShare || 0),
    mealCount: `${todayMeals.length} ${todayMeals.length === 1 ? 'refeição' : 'refeições'}`,
    todayMeals: todayMarkup,
    mealPlan,
    mealHistory: historyMarkup,
  });
}

function renderFoodDetails({ meal, todayLog }) {
  if (!meal) return '';
  const status = todayLog?.status || 'pendente';
  const statusLabel = status === 'feito' ? 'Feita' : status === 'pulado' ? 'Pulada' : 'Pendente';
  const actions = status === 'feito'
    ? button('observacaoR', 'Observação', 'edit', 'food-action-secondary', meal.id)
      + button('pularR', 'Pular refeição', 'x', 'food-action-secondary', meal.id)
      + button('desfazerR', 'Desfazer status', 'back', 'food-action-secondary', meal.id)
    : status === 'pulado'
      ? button('concluirR', 'Marcar como feita', 'check', 'food-action-primary', meal.id)
        + button('desfazerR', 'Desfazer status', 'back', 'food-action-secondary', meal.id)
      : button('concluirR', 'Marcar como feita', 'check', 'food-action-primary', meal.id)
        + button('pularR', 'Pular refeição', 'x', 'food-action-secondary', meal.id);

  return fillTemplate(templates.detalheRefeicao, {
    backIcon: icon('back', 18),
    mealType: e(meal.tipo),
    mealName: e(meal.t),
    mealStatus: statusLabel,
    mealStatusClass: status,
    mealTime: e(meal.h || 'Sem horário'),
    mealQuantity: e(meal.qtd || '1 porção'),
    mealCalories: String(Number(meal.cal) || 0),
    mealProtein: String(Number(meal.p) || 0),
    mealCarbs: String(Number(meal.c) || 0),
    mealFat: String(Number(meal.g) || 0),
    observation: todayLog?.observacao
      ? `<p class="food-detail-observation"><strong>Observação</strong>${e(todayLog.observacao)}</p>`
      : '',
    statusActions: actions,
    editButton: button('refeicao', 'Editar refeição', 'edit', 'food-detail-edit', meal.id),
    deleteButton: button('delR', 'Excluir refeição', 'trash', 'food-detail-delete', meal.id),
  });
}

function renderActivities({ data, today }) {
  const workouts = data.hist.filter(item => item.d === today);
  const meals = data.refs.filter(item => item.d === today && item.status !== 'pendente');
  const sleep = data.sono.find(item => item.d === today);
  const mealMarkup = meals.map(meal => `
    <article class="activity-card activity-card-food">
      <span class="activity-card-icon">${icon('food', 20)}</span>
      <div class="activity-card-copy">
        <small>${e(meal.tipo)} · ${meal.status === 'pulado' ? 'Pulada' : 'Feita'}${meal.h ? ` · ${e(meal.h)}` : ''}</small>
        <h3>${e(meal.t)}</h3>
        <p>${e(meal.qtd || '1 porção')} · ${Number(meal.cal) || 0} kcal</p>
      </div>
    </article>
  `).join('');
  const workoutMarkup = workouts.map(workout => `
    <article class="activity-card activity-card-workout">
      <span class="activity-card-icon">${icon('dumb', 20)}</span>
      <div class="activity-card-copy">
        <small>Treino concluído</small>
        <h3>${e(workout.nome)}</h3>
        <p>${Number(workout.n) || 0} ${(Number(workout.n) || 0) === 1 ? 'exercício' : 'exercícios'}${workout.durationMinutes ? ` · ${e(formatWorkoutDuration(workout.durationMinutes))}` : ''}</p>
      </div>
    </article>
  `).join('');
  const sleepMarkup = sleep ? `
    <article class="activity-card activity-card-sleep">
      <span class="activity-card-icon">${icon('moon', 20)}</span>
      <div class="activity-card-copy">
        <small>Sono registrado · ${e(sleepLabels[sleep.q] || 'Sem avaliação')}</small>
        <h3>${e(formatHours(duration(sleep)))}</h3>
        <p>${e(sleep.a)} – ${e(sleep.b)}</p>
      </div>
    </article>
  ` : '';
  const count = workouts.length + meals.length + (sleep ? 1 : 0);
  const content = count
    ? `${workoutMarkup}${mealMarkup}${sleepMarkup}`
    : `<div class="activity-empty">${empty('cal', 'Ainda não há atividades registradas hoje.')}</div>`;

  return fillTemplate(templates.atividades, {
    backIcon: icon('back', 18),
    activityDate: e(new Date(`${today}T12:00:00`).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })),
    activitySummary: `${count} ${count === 1 ? 'atividade registrada' : 'atividades registradas'}`,
    activityContent: content,
  });
}

function renderSleep({ data, days }) {
  const records = [...data.sono].sort((first, second) => second.d.localeCompare(first.d));
  const averageSleep = average(records.slice(0, 7).map(duration));
  const sleepChart = records.length
    ? bars(days.map(day => {
      const record = records.find(item => item.d === day);
      return record ? +(duration(record) / 60).toFixed(1) : 0;
    }), days.map(formatWeekday), 'var(--lv)', 10)
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
      <div class="li" style="border-color:var(--ln)">
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
    'detalhe-refeicao': renderFoodDetails,
    atividades: renderActivities,
    sono: renderSleep,
    editar: renderWorkoutEditor,
    exec: renderWorkoutSession,
  };
  const render = pages[route];
  return render ? render(context) : renderHome(context);
}
