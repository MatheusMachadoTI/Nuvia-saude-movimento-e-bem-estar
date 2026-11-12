import Button from '../components/Button.jsx';
import Empty from '../components/Empty.jsx';
import { BarChart, WeightChart } from '../components/Charts.jsx';

export default function Progress({
  data,
  days,
  photos,
  formatDate,
  formatWeekday,
  formatHours,
  duration,
  average,
  exerciseDays,
  weekSleep,
  onRegisterWeight,
  onAddPhoto,
}) {
  const latestWeight = data.peso[data.peso.length - 1];
  const averageSleep = average(weekSleep.map(duration));

  return (
    <div className="page page-progress">
      <div className="top">
        <div>
          <h1>Evolução</h1>
          <p className="sub">Resumo da semana</p>
        </div>
      </div>
      <div className="grid">
        <div className="c pt">
          <p className="sub">Dias de treino</p>
          <div className="big">{exerciseDays.filter(Boolean).length}</div>
          <p className="sub">{data.hist.filter(item => item.d >= days[0]).length} treinos concluídos</p>
        </div>
        <div className="c lv">
          <p className="sub">Sono satisfatório</p>
          <div className="big">{weekSleep.filter(sleep => sleep.q >= 2).length}</div>
          <p className="sub">{weekSleep.length ? `média de ${formatHours(averageSleep)}` : 'sem registros'}</p>
        </div>
        <div className="c mt">
          <p className="sub">Refeições</p>
          <div className="big">{data.refs.filter(meal => meal.d >= days[0]).length}</div>
          <p className="sub">registradas na semana</p>
        </div>
        <div className="c tq">
          <p className="sub">Peso</p>
          <div className="big">{latestWeight ? `${latestWeight.v} kg` : '—'}</div>
          <p className="sub">último registro</p>
        </div>
      </div>
      <div className="grid">
        <div className="c">
          <h2>Frequência de treinos</h2>
          <BarChart values={exerciseDays.map(Number)} labels={days.map(formatWeekday)} color="#16336F" max={1} />
        </div>
        <div className="c">
          <h2>Horas de sono</h2>
          {weekSleep.length ? (
            <BarChart
              values={days.map(day => {
                const sleep = weekSleep.find(item => item.d === day);
                return sleep ? +(duration(sleep) / 60).toFixed(1) : 0;
              })}
              labels={days.map(formatWeekday)}
              color="#7F94D1"
              max={10}
            />
          ) : (
            <Empty icon="moon">Sem registros de sono nesta semana.</Empty>
          )}
        </div>
      </div>
      <div className="c" style={{ marginBottom: 16 }}>
        <div className="row sp">
          <h2>Peso corporal</h2>
          <Button icon="plus" variant="s" onClick={onRegisterWeight}>Registrar</Button>
        </div>
        {data.peso.length > 1 ? <WeightChart points={data.peso} /> : <Empty icon="chart">Registre seu peso para ver a evolução.</Empty>}
      </div>
      <div className="c">
        <div className="row sp">
          <h2>Fotos de progresso</h2>
          <Button icon="cam" variant="s" onClick={() => document.getElementById('fi')?.click()}>Adicionar</Button>
          <input id="fi" type="file" accept="image/*" hidden onChange={onAddPhoto} />
        </div>
        {photos.length ? (
          <div className="ph">
            {photos.map((photo, index) => (
              <div key={`${photo.d}-${index}`}>
                <img src={photo.u} alt={`Foto de ${formatDate(photo.d)}`} />
                {formatDate(photo.d)}
              </div>
            ))}
          </div>
        ) : (
          <Empty icon="cam">Adicione uma foto para acompanhar sua jornada. Ela fica só neste aparelho.</Empty>
        )}
      </div>
    </div>
  );
}
