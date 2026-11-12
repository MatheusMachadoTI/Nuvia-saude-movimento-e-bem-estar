import Button from '../components/Button.jsx';
import Empty from '../components/Empty.jsx';

export default function Workouts({ data, formatDate, onNewWorkout, onEditWorkout, onDeleteWorkout, onStartWorkout }) {
  return (
    <div className="page page-workouts">
      <div className="top">
        <div>
          <h1>Treinos</h1>
          <p className="sub">Suas planilhas e histórico</p>
        </div>
        <Button icon="plus" onClick={onNewWorkout}>Nova planilha</Button>
      </div>
      <div className="grid">
        {data.treinos.length ? (
          data.treinos.map((workout, index) => (
            <div className={`c ${index % 2 ? '' : 'pt'}`} key={workout.id}>
              <h2>{workout.nome}</h2>
              <p className="sub" style={{ marginBottom: 8 }}>{workout.ex.length} exercícios</p>
              {workout.ex.map((exercise, exerciseIndex) => (
                <div
                  className="li"
                  style={{ borderColor: 'rgba(255,255,255,.2)' }}
                  key={`${exercise.n}-${exerciseIndex}`}
                >
                  <span>{exercise.n}</span>
                  <span className="sub">
                    {exercise.s}×{exercise.r}{exercise.c ? ` · ${exercise.c} kg` : ''}
                  </span>
                </div>
              ))}
              <div className="row" style={{ marginTop: 14 }}>
                {workout.ex.length > 0 && (
                  <Button icon="play" variant="w" onClick={() => onStartWorkout(workout.id)}>Iniciar</Button>
                )}
                <Button
                  icon="edit"
                  variant="ic s"
                  aria-label={`Editar ${workout.nome}`}
                  onClick={() => onEditWorkout(workout.id)}
                />
                <Button
                  icon="trash"
                  variant="ic d"
                  aria-label={`Excluir ${workout.nome}`}
                  onClick={() => onDeleteWorkout(workout.id)}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="c" style={{ gridColumn: '1 / -1' }}>
            <Empty
              icon="dumb"
              action={<Button icon="plus" onClick={onNewWorkout}>Criar planilha</Button>}
            >
              Nenhuma planilha ainda. Crie a primeira para começar.
            </Empty>
          </div>
        )}
      </div>
      <div className="c">
        <h2>Histórico</h2>
        {data.hist.length ? (
          data.hist.map((item, index) => (
            <div className="li" key={`${item.d}-${item.nome}-${index}`}>
              <div>
                <b>{item.nome}</b>
                <div className="sub">{item.n} exercícios</div>
              </div>
              <span className="tag">{formatDate(item.d)}</span>
            </div>
          ))
        ) : (
          <Empty icon="cal">Nenhum treino realizado ainda.</Empty>
        )}
      </div>
    </div>
  );
}
