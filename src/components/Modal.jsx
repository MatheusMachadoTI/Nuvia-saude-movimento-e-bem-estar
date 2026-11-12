import { useState } from 'react';
import Button from './Button.jsx';
import Icon from './Icon.jsx';

export default function Modal({ modal, onClose, onCompletedClose }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries((modal?.fields || []).map(field => [field[0], field[3] ?? ''])),
  );

  if (!modal) return null;

  const updateValue = (key, value) => {
    setValues(current => ({ ...current, [key]: value }));
  };

  if (modal.completion) {
    const { workoutName, exercises, series } = modal.completion;
    return (
      <div className="ov" onMouseDown={event => event.target === event.currentTarget && onCompletedClose()}>
        <div className="md" role="dialog" aria-modal="true" aria-labelledby="completion-title" style={{ textAlign: 'center' }}>
          <div className="av" style={{ margin: '0 auto 12px', background: 'var(--tq)' }}>
            <Icon name="check" size={38} />
          </div>
          <h2 id="completion-title">Treino concluído!</h2>
          <p className="sub">{workoutName}</p>
          <p style={{ margin: '12px 0' }}>
            <b>{exercises}</b> exercícios · <b>{series}</b> séries
          </p>
          <Button onClick={onCompletedClose}>Voltar aos treinos</Button>
        </div>
      </div>
    );
  }

  const submit = event => {
    event.preventDefault();
    if (modal.onSave(values) !== false) onClose();
  };

  return (
    <div className="ov" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <form className="md" role="dialog" aria-modal="true" aria-label={modal.title} onSubmit={submit}>
        <h2>{modal.title}</h2>
        {modal.fields.map(([key, label, type, , options]) => (
          <label key={key} htmlFor={`field-${key}`}>
            {label}
            {type === 'sel' ? (
              <select
                id={`field-${key}`}
                value={values[key]}
                onChange={event => updateValue(key, event.target.value)}
              >
                {options.map(option => <option key={option}>{option}</option>)}
              </select>
            ) : (
              <input
                id={`field-${key}`}
                type={type}
                value={values[key]}
                step={type === 'number' ? 'any' : undefined}
                onChange={event => updateValue(key, event.target.value)}
              />
            )}
          </label>
        ))}
        <div className="row" style={{ marginTop: 18 }}>
          <Button type="submit">{modal.ok || 'Salvar'}</Button>
          <Button variant="s" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
