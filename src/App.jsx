import { useEffect, useMemo, useState } from 'react';
import Button from './components/Button.jsx';
import Icon from './components/Icon.jsx';
import Modal from './components/Modal.jsx';
import Home from './pages/Home.jsx';
import Workouts from './pages/Workouts.jsx';
import Progress from './pages/Progress.jsx';
import Profile from './pages/Profile.jsx';
import Food from './pages/Food.jsx';
import Sleep from './pages/Sleep.jsx';
import WorkoutEditor from './pages/WorkoutEditor.jsx';
import WorkoutSession from './pages/WorkoutSession.jsx';
import { loadData, storageKey } from './data/initialData.js';
import {
  formatDate,
  formatHours,
  formatWeekday,
  getWeekDays,
  minutesBetween,
  today,
} from './utils/date.js';

const navigation = [
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

const newId = () => Math.random().toString(36).slice(2, 8);
const average = values => values.length
  ? values.reduce((total, value) => total + value, 0) / values.length
  : 0;
const duration = sleep => minutesBetween(sleep.a, sleep.b);

export default function App() {
  const [data, setData] = useState(loadData);
  const [route, setRoute] = useState(() => (window.location.hash || '#inicio').slice(1));
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [photos, setPhotos] = useState([]);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [workoutSession, setWorkoutSession] = useState(null);
  const days = useMemo(getWeekDays, []);
  const weekSleep = data.sono.filter(sleep => sleep.d >= days[0]);
  const exerciseDays = days.map(day => data.hist.some(workout => workout.d === day));
  const lastSleep = [...data.sono].sort((first, second) => second.d.localeCompare(first.d))[0];
  const editingWorkout = data.treinos.find(workout => workout.id === editingWorkoutId);
  const sessionWorkout = data.treinos.find(workout => workout.id === workoutSession?.id);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute((window.location.hash || '#inicio').slice(1));
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Não foi possível salvar os dados.', error);
    }
  }, [data]);

  useEffect(() => {
    if (data.dark === null) {
      document.documentElement.removeAttribute('data-t');
    } else {
      document.documentElement.dataset.t = data.dark ? 'dark' : 'light';
    }
  }, [data.dark]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (route === 'exec' && !workoutSession && !modal?.completion) {
      window.location.hash = 'treinos';
    }
    if (route === 'editar' && !editingWorkout) {
      window.location.hash = 'treinos';
    }
  }, [route, workoutSession, modal, editingWorkout]);

  const notify = message => setToast(message);
  const showModal = (title, fields, onSave, ok) => setModal({ id: newId(), title, fields, onSave, ok });
  const updateData = updater => setData(current => updater(current));
  const handleModalClose = () => setModal(null);

  const createWorkout = () => {
    showModal(
      'Nova planilha',
      [['n', 'Nome da planilha', 'text', '']],
      values => {
        if (!values.n.trim()) return false;
        const workout = { id: newId(), nome: values.n.trim(), ex: [] };
        updateData(current => ({ ...current, treinos: [...current.treinos, workout] }));
        setEditingWorkoutId(workout.id);
        window.location.hash = 'editar';
      },
      'Criar',
    );
  };

  const deleteWorkout = id => {
    if (!window.confirm('Excluir esta planilha?')) return;
    updateData(current => ({
      ...current,
      treinos: current.treinos.filter(workout => workout.id !== id),
    }));
    notify('Planilha excluída');
  };

  const startWorkout = id => {
    setWorkoutSession({ id, done: {} });
    window.location.hash = 'exec';
  };

  const toggleSeries = key => {
    setWorkoutSession(current => ({
      ...current,
      done: { ...current.done, [key]: !current.done[key] },
    }));
  };

  const finishWorkout = () => {
    if (!sessionWorkout || !workoutSession) return;
    const totalSeries = sessionWorkout.ex.reduce((total, exercise) => total + exercise.s, 0);
    const completedSeries = Object.values(workoutSession.done).filter(Boolean).length;
    const completedExercises = completedSeries
      ? sessionWorkout.ex.filter((exercise, exerciseIndex) =>
        Array.from({ length: exercise.s }, (_, seriesIndex) =>
          workoutSession.done[`${exerciseIndex}-${seriesIndex}`],
        ).every(Boolean),
      ).length
      : sessionWorkout.ex.length;

    updateData(current => ({
      ...current,
      hist: [
        { d: today, nome: sessionWorkout.nome, n: completedExercises },
        ...current.hist,
      ],
    }));
    setModal({
      completion: {
        workoutName: sessionWorkout.nome,
        exercises: completedExercises,
        series: completedSeries || totalSeries,
      },
    });
  };

  const finishCompletion = () => {
    setWorkoutSession(null);
    setModal(null);
    window.location.hash = 'treinos';
  };

  const addMeal = () => {
    showModal(
      'Registrar refeição',
      [
        ['t', 'O que você comeu?', 'text', ''],
        ['tipo', 'Tipo', 'sel', 'Almoço', ['Café da manhã', 'Almoço', 'Lanche', 'Jantar']],
        ['h', 'Horário (opcional)', 'time', new Date().toTimeString().slice(0, 5)],
      ],
      values => {
        if (!values.t.trim()) return false;
        updateData(current => ({
          ...current,
          refs: [{ id: newId(), t: values.t.trim(), tipo: values.tipo, h: values.h, d: today }, ...current.refs],
        }));
        notify('Refeição registrada');
      },
    );
  };

  const deleteMeal = id => updateData(current => ({
    ...current,
    refs: current.refs.filter(meal => meal.id !== id),
  }));

  const addSleep = () => {
    showModal(
      'Registrar sono',
      [
        ['a', 'Dormi às', 'time', '23:00'],
        ['b', 'Acordei às', 'time', '07:00'],
        ['q', 'Como foi a noite?', 'sel', 'Bom', ['Bom', 'Regular', 'Ruim']],
      ],
      values => {
        const quality = { Bom: 3, Regular: 2, Ruim: 1 };
        const record = { d: today, a: values.a, b: values.b, q: quality[values.q] };
        updateData(current => ({
          ...current,
          sono: [...current.sono.filter(sleep => sleep.d !== today), record],
        }));
        notify(`Sono registrado: ${formatHours(minutesBetween(values.a, values.b))}`);
      },
    );
  };

  const registerWeight = () => {
    showModal(
      'Registrar peso',
      [['v', 'Peso (kg)', 'number', data.peso.length ? data.peso[data.peso.length - 1].v : '']],
      values => {
        const weight = parseFloat(values.v);
        if (!weight) return false;
        updateData(current => ({
          ...current,
          peso: [
            ...current.peso.filter(item => item.d !== today),
            { d: today, v: weight },
          ].sort((first, second) => first.d.localeCompare(second.d)),
        }));
        notify('Peso registrado');
      },
    );
  };

  const addPhoto = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotos(current => [{ d: today, u: reader.result }, ...current]);
      notify('Foto adicionada');
      event.target.value = '';
    };
    reader.onerror = () => notify('Não foi possível carregar a foto.');
    reader.readAsDataURL(file);
  };

  const editProfile = () => {
    showModal(
      'Editar perfil',
      [
        ['nome', 'Nome', 'text', data.nome],
        ['idade', 'Idade', 'number', data.idade],
        ['alt', 'Altura', 'text', data.alt],
      ],
      values => {
        updateData(current => ({
          ...current,
          nome: values.nome || current.nome,
          idade: values.idade,
          alt: values.alt,
        }));
        notify('Perfil atualizado');
      },
    );
  };

  const editGoal = id => {
    const goal = data.obj.find(item => item.id === id);
    showModal(
      goal ? 'Editar objetivo' : 'Novo objetivo',
      [['t', 'Objetivo', 'text', goal ? goal.t : '']],
      values => {
        if (!values.t.trim()) return false;
        updateData(current => ({
          ...current,
          obj: goal
            ? current.obj.map(item => item.id === id ? { ...item, t: values.t.trim() } : item)
            : [...current.obj, { id: newId(), t: values.t.trim() }],
        }));
      },
    );
  };

  const deleteGoal = id => updateData(current => ({
    ...current,
    obj: current.obj.filter(goal => goal.id !== id),
  }));

  const toggleTheme = () => {
    const isDark = data.dark === null
      ? window.matchMedia('(prefers-color-scheme:dark)').matches
      : data.dark;
    updateData(current => ({ ...current, dark: !isDark }));
  };

  const toggleSetting = key => updateData(current => ({
    ...current,
    [key]: !current[key],
  }));

  const updateExercise = (index, field, value) => updateData(current => ({
    ...current,
    treinos: current.treinos.map(workout => workout.id !== editingWorkoutId
      ? workout
      : {
        ...workout,
        ex: workout.ex.map((exercise, exerciseIndex) =>
          exerciseIndex === index ? { ...exercise, [field]: value } : exercise,
        ),
      }),
  }));

  const addExercise = () => updateData(current => ({
    ...current,
    treinos: current.treinos.map(workout => workout.id === editingWorkoutId
      ? { ...workout, ex: [...workout.ex, { n: 'Novo exercício', s: 3, r: 10, c: 0 }] }
      : workout),
  }));

  const deleteExercise = index => updateData(current => ({
    ...current,
    treinos: current.treinos.map(workout => workout.id === editingWorkoutId
      ? { ...workout, ex: workout.ex.filter((_, exerciseIndex) => exerciseIndex !== index) }
      : workout),
  }));

  const moveExercise = index => {
    if (index < 1) return;
    updateData(current => ({
      ...current,
      treinos: current.treinos.map(workout => {
        if (workout.id !== editingWorkoutId) return workout;
        const exercises = [...workout.ex];
        [exercises[index - 1], exercises[index]] = [exercises[index], exercises[index - 1]];
        return { ...workout, ex: exercises };
      }),
    }));
  };

  const isDark = data.dark === null
    ? window.matchMedia('(prefers-color-scheme:dark)').matches
    : data.dark;
  const activeSection = activeRoutes[route] || route;
  const page = {
    inicio: (
      <Home
        data={data}
        days={days}
        today={today}
        formatDate={formatDate}
        formatWeekday={formatWeekday}
        formatHours={formatHours}
        duration={duration}
        lastSleep={lastSleep}
        weekSleep={weekSleep}
        exerciseDays={exerciseDays}
        onAddMeal={addMeal}
        onStartWorkout={startWorkout}
      />
    ),
    treinos: (
      <Workouts
        data={data}
        formatDate={formatDate}
        onNewWorkout={createWorkout}
        onEditWorkout={id => {
          setEditingWorkoutId(id);
          window.location.hash = 'editar';
        }}
        onDeleteWorkout={deleteWorkout}
        onStartWorkout={startWorkout}
      />
    ),
    evolucao: (
      <Progress
        data={data}
        days={days}
        photos={photos}
        formatDate={formatDate}
        formatWeekday={formatWeekday}
        formatHours={formatHours}
        duration={duration}
        average={average}
        exerciseDays={exerciseDays}
        weekSleep={weekSleep}
        onRegisterWeight={registerWeight}
        onAddPhoto={addPhoto}
      />
    ),
    perfil: (
      <Profile
        data={data}
        dark={isDark}
        onEditProfile={editProfile}
        onEditGoal={editGoal}
        onDeleteGoal={deleteGoal}
        onToggleTheme={toggleTheme}
        onToggleSetting={toggleSetting}
      />
    ),
    alimentacao: (
      <Food
        data={data}
        today={today}
        formatDate={formatDate}
        onAddMeal={addMeal}
        onDeleteMeal={deleteMeal}
      />
    ),
    sono: (
      <Sleep
        data={data}
        days={days}
        formatDate={formatDate}
        formatWeekday={formatWeekday}
        formatHours={formatHours}
        duration={duration}
        average={average}
        onAddSleep={addSleep}
      />
    ),
    editar: (
      <WorkoutEditor
        workout={editingWorkout}
        onUpdateExercise={updateExercise}
        onAddExercise={addExercise}
        onDeleteExercise={deleteExercise}
        onMoveExercise={moveExercise}
      />
    ),
    exec: (
      <WorkoutSession
        workout={sessionWorkout}
        done={workoutSession?.done || {}}
        onToggle={toggleSeries}
        onFinish={finishWorkout}
        onExit={() => {
          setWorkoutSession(null);
          window.location.hash = 'treinos';
        }}
      />
    ),
  }[route] || null;

  return (
    <>
      <nav id="nav" aria-label="Navegação principal">
        <div className="lg">Maré</div>
        {navigation.map(([key, label, icon]) => (
          <a
            href={`#${key}`}
            className={key === activeSection ? 'on' : ''}
            aria-current={key === activeSection ? 'page' : undefined}
            key={key}
          >
            <Icon name={icon} size={22} />
            {label}
          </a>
        ))}
      </nav>
      <main id="m">{page || <Home
        data={data}
        days={days}
        today={today}
        formatDate={formatDate}
        formatWeekday={formatWeekday}
        formatHours={formatHours}
        duration={duration}
        lastSleep={lastSleep}
        weekSleep={weekSleep}
        exerciseDays={exerciseDays}
        onAddMeal={addMeal}
        onStartWorkout={startWorkout}
      />}</main>
      <Modal
        key={modal?.completion ? 'completion' : modal?.id || 'closed'}
        modal={modal}
        onClose={handleModalClose}
        onCompletedClose={finishCompletion}
      />
      {toast && <div className="tg" role="status">{toast}</div>}
    </>
  );
}
