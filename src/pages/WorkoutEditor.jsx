import Button from '../components/Button.jsx';
import Empty from '../components/Empty.jsx';
import Icon from '../components/Icon.jsx';

export default function WorkoutEditor({ workout, onUpdateExercise, onAddExercise, onDeleteExercise, onMoveExercise }) {
  if (!workout) return null;

  return (
    <div className="page">
      <div className="top">
        <div className="row">
          <a className="btn s ic" href="#treinos" aria-label="Voltar"><Icon name="back" /></a>
          <h1 style={{ fontSize: 22 }}>{workout.nome}</h1>
        </div>
      </div>
      <div className="c">
        {workout.ex.length ? workout.ex.map((exercise, index) => (
          <div className="li" style={{ display: 'block' }} key={`${workout.id}-${index}`}>
            <input
              value={exercise.n}
              aria-label="Exercício"
              onChange={event => onUpdateExercise(index, 'n', event.target.value)}
            />
            <div className="row" style={{ marginTop: 8 }}>
              <label style={{ flex: 1, margin: 0 }}>
                Séries
                <input
                  type="number"
                  value={exercise.s}
                  min="1"
                  onChange={event => onUpdateExercise(index, 's', Number(event.target.value))}
                />
              </label>
              <label style={{ flex: 1, margin: 0 }}>
                Reps
                <input
                  type="number"
                  value={exercise.r}
                  min="1"
                  onChange={event => onUpdateExercise(index, 'r', Number(event.target.value))}
                />
              </label>
              <label style={{ flex: 1, margin: 0 }}>
                Carga kg
                <input
                  type="number"
                  value={exercise.c}
                  min="0"
                  onChange={event => onUpdateExercise(index, 'c', Number(event.target.value))}
                />
              </label>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <Button variant="s" disabled={index === 0} onClick={() => onMoveExercise(index)}>Subir</Button>
              <Button icon="trash" variant="d" onClick={() => onDeleteExercise(index)}>Remover</Button>
            </div>
          </div>
        )) : (
          <Empty icon="dumb">Adicione o primeiro exercício.</Empty>
        )}
        <div style={{ marginTop: 14 }}>
          <Button icon="plus" onClick={onAddExercise}>Adicionar exercício</Button>
        </div>
      </div>
    </div>
  );
}
