import Button from '../components/Button.jsx';

export default function WorkoutSession({ workout, done, onToggle, onFinish, onExit }) {
  if (!workout) return null;

  const totalSeries = workout.ex.reduce((total, exercise) => total + exercise.s, 0);
  const completedSeries = Object.values(done).filter(Boolean).length;

  return (
    <div className="page page-workouts">
      <div className="c pt" style={{ position: 'sticky', top: 8, zIndex: 5, marginBottom: 16 }}>
        <div className="row sp">
          <h2 style={{ margin: 0 }}>{workout.nome}</h2>
          <span>{completedSeries}/{totalSeries}</span>
        </div>
        <div className="bar" style={{ marginTop: 12 }}>
          <i style={{ width: `${totalSeries ? (completedSeries / totalSeries) * 100 : 0}%` }} />
        </div>
      </div>
      {workout.ex.map((exercise, exerciseIndex) => (
        <div className="c" style={{ marginBottom: 12 }} key={`${exercise.n}-${exerciseIndex}`}>
          <div className="row sp">
            <h2 style={{ margin: 0 }}>{exercise.n}</h2>
            <span className="tag">{exercise.r} reps{exercise.c ? ` · ${exercise.c} kg` : ''}</span>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            {Array.from({ length: exercise.s }, (_, seriesIndex) => {
              const key = `${exerciseIndex}-${seriesIndex}`;
              return (
                <button
                  className={`set ${done[key] ? 'on' : ''}`}
                  key={key}
                  onClick={() => onToggle(key)}
                  aria-pressed={Boolean(done[key])}
                >
                  {seriesIndex + 1}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="row">
        <Button
          icon="check"
          onClick={onFinish}
          style={{ flex: 1, justifyContent: 'center', minHeight: 56, fontSize: 17 }}
        >
          Finalizar treino
        </Button>
        <Button icon="x" variant="s" onClick={onExit}>Sair</Button>
      </div>
      <p className="sub" style={{ marginTop: 8 }}>Marcar séries é opcional: você pode finalizar direto.</p>
    </div>
  );
}
