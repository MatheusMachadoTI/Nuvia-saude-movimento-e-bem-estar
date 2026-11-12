import Button from '../components/Button.jsx';
import Empty from '../components/Empty.jsx';
import { BarChart } from '../components/Charts.jsx';

export default function Sleep({
  data,
  days,
  formatDate,
  formatWeekday,
  formatHours,
  duration,
  average,
  onAddSleep,
}) {
  const records = [...data.sono].sort((first, second) => second.d.localeCompare(first.d));
  const averageSleep = average(records.slice(0, 7).map(duration));
  const sleepQuality = ['', 'Ruim', 'Regular', 'Bom'];

  return (
    <div className="page">
      <div className="top">
        <div>
          <h1>Sono</h1>
          <p className="sub">Acompanhamento simples</p>
        </div>
        <Button icon="plus" onClick={onAddSleep}>Registrar sono</Button>
      </div>
      <div className="grid">
        <div className="c lv">
          <p className="sub">Média de horas</p>
          <div className="big">{records.length ? formatHours(averageSleep) : '—'}</div>
        </div>
        <div className="c pt">
          <p className="sub">Noites satisfatórias</p>
          <div className="big">
            {records.filter(record => record.q >= 2).length}
            <span style={{ fontSize: 18 }}> de {records.length}</span>
          </div>
        </div>
      </div>
      <div className="c" style={{ marginBottom: 16 }}>
        <h2>Últimos 7 dias</h2>
        {records.length ? (
          <BarChart
            values={days.map(day => {
              const record = records.find(item => item.d === day);
              return record ? +(duration(record) / 60).toFixed(1) : 0;
            })}
            labels={days.map(formatWeekday)}
            color="#7F94D1"
            max={10}
          />
        ) : (
          <Empty icon="moon">Registre sua primeira noite.</Empty>
        )}
      </div>
      <div className="c">
        <h2>Registros</h2>
        {records.map(record => (
          <div className="li" key={record.d}>
            <div>
              <b>{formatHours(duration(record))}</b>
              <div className="sub">{record.a} → {record.b}</div>
            </div>
            <div className="row">
              <span className="tag">{sleepQuality[record.q]}</span>
              <span className="sub">{formatDate(record.d)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
