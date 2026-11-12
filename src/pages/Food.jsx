import Button from '../components/Button.jsx';
import Empty from '../components/Empty.jsx';

export default function Food({ data, today, formatDate, onAddMeal, onDeleteMeal }) {
  const todayMeals = data.refs
    .filter(meal => meal.d === today)
    .sort((first, second) => (first.h || '').localeCompare(second.h || ''));
  const olderMeals = data.refs
    .filter(meal => meal.d !== today)
    .sort((first, second) => second.d.localeCompare(first.d));
  const colors = ['mt', 'tq', 'lv', 'pt'];

  const mealCard = (meal, color) => (
    <div className={`c ${color}`} style={{ padding: 16 }} key={meal.id}>
      <div className="row sp">
        <div>
          <span className="tag">{meal.tipo}{meal.h ? ` · ${meal.h}` : ''}</span>
          <p style={{ marginTop: 8, fontWeight: 600 }}>{meal.t}</p>
        </div>
        <Button
          icon="trash"
          variant="s ic"
          aria-label="Remover refeição"
          onClick={() => onDeleteMeal(meal.id)}
        />
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="top">
        <div>
          <h1>Alimentação</h1>
          <p className="sub">Sem contar calorias, só registrar</p>
        </div>
        <Button icon="plus" onClick={onAddMeal}>Registrar refeição</Button>
      </div>
      <h2>Hoje</h2>
      <div className="grid">
        {todayMeals.length ? todayMeals.map((meal, index) => mealCard(meal, colors[index % colors.length])) : (
          <div className="c" style={{ gridColumn: '1 / -1' }}>
            <Empty icon="food">Nenhuma refeição hoje.</Empty>
          </div>
        )}
      </div>
      <h2>Histórico</h2>
      <div className="grid">
        {olderMeals.length ? olderMeals.map(meal => (
          <div className="c" style={{ padding: 16 }} key={meal.id}>
            <span className="tag">{formatDate(meal.d)} · {meal.tipo}</span>
            <p style={{ marginTop: 8 }}>{meal.t}</p>
          </div>
        )) : (
          <div className="c" style={{ gridColumn: '1 / -1' }}>
            <Empty icon="cal">O histórico aparece aqui.</Empty>
          </div>
        )}
      </div>
    </div>
  );
}
