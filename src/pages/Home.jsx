import Button from '../components/Button.jsx';
import Empty from '../components/Empty.jsx';

export default function Home({
  data,
  days,
  today,
  formatDate,
  formatWeekday,
  formatHours,
  duration,
  lastSleep,
  weekSleep,
  exerciseDays,
  onAddMeal,
  onStartWorkout,
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const todayMeals = data.refs.filter(meal => meal.d === today);
  const nextWorkout = data.treinos[0];
  const sleepQualities = ['', 'Ruim', 'Regular', 'Bom'];

  return (
    <div className="page page-home">
      <div className="top">
        <div>
          <h1>{greeting}, {data.nome.split(' ')[0]}</h1>
          <p className="sub">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </div>
      <div className="grid">
        <div className="c pt" style={{ gridColumn: '1 / -1' }}>
          <h2>Sua semana</h2>
          <p className="sub">
            {exerciseDays.filter(Boolean).length} dias de treino · {weekSleep.filter(sleep => sleep.q >= 2).length} noites de sono satisfatório
          </p>
          <div className="dots">
            {days.map((day, index) => (
              <div className={`dot ${exerciseDays[index] ? 'on' : ''}`} key={day}>
                <b />
                {formatWeekday(day)}
              </div>
            ))}
          </div>
        </div>
        <div className="c tq">
          <h2>Treinos</h2>
          <div className="big">{data.hist.filter(item => item.d >= days[0]).length}</div>
          <p className="sub">treinos nesta semana</p>
          <p style={{ margin: '10px 0 14px', fontWeight: 600 }}>
            {nextWorkout ? `Próximo: ${nextWorkout.nome}` : 'Crie sua primeira planilha'}
          </p>
          <Button icon="play" variant="w" onClick={() => nextWorkout && onStartWorkout(nextWorkout.id)}>
            Iniciar
          </Button>
        </div>
        <div className="c mt">
          <h2>Alimentação</h2>
          <div className="big">{todayMeals.length}</div>
          <p className="sub">refeições registradas hoje</p>
          <div className="row" style={{ marginTop: 14 }}>
            <Button icon="plus" onClick={onAddMeal}>Registrar</Button>
            <a className="btn s" href="#alimentacao" style={{ textDecoration: 'none' }}>Ver dia</a>
          </div>
        </div>
        <div className="c lv">
          <h2>Sono</h2>
          <div className="big">{lastSleep ? formatHours(duration(lastSleep)) : '—'}</div>
          <p className="sub">
            {lastSleep ? `Última noite · ${sleepQualities[lastSleep.q]}` : 'Nenhum registro ainda'}
          </p>
          <div className="row" style={{ marginTop: 14 }}>
            <a className="btn w" href="#sono" style={{ textDecoration: 'none' }}>Histórico</a>
          </div>
        </div>
        <div className="c">
          <h2>Evolução</h2>
          <p className="sub">Peso mais recente</p>
          <div className="big">
            {data.peso.length ? `${data.peso[data.peso.length - 1].v} kg` : '—'}
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <a className="btn s" href="#evolucao" style={{ textDecoration: 'none' }}>Ver evolução</a>
          </div>
        </div>
      </div>
      <div className="c">
        <h2>Atividades recentes</h2>
        {data.hist.length ? (
          data.hist.slice(0, 3).map((item, index) => (
            <div className="li" key={`${item.d}-${item.nome}-${index}`}>
              <span>{item.nome}</span>
              <span className="tag">{formatDate(item.d)}</span>
            </div>
          ))
        ) : (
          <Empty icon="dumb">Seus treinos concluídos aparecem aqui.</Empty>
        )}
      </div>
    </div>
  );
}
