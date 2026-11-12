import Button from '../components/Button.jsx';
import Empty from '../components/Empty.jsx';
import Icon from '../components/Icon.jsx';

export default function Profile({
  data,
  dark,
  onEditProfile,
  onEditGoal,
  onDeleteGoal,
  onToggleTheme,
  onToggleSetting,
}) {
  const setting = (key, enabled, label) => (
    <div className="li" key={key}>
      <span>{label}</span>
      <button
        className={`sw ${enabled ? 'on' : ''}`}
        onClick={key === 'tema' ? onToggleTheme : () => onToggleSetting(key)}
        role="switch"
        aria-checked={Boolean(enabled)}
        aria-label={label}
      />
    </div>
  );

  return (
    <div className="page page-profile">
      <div className="top"><h1>Perfil</h1></div>
      <div className="grid">
        <div className="c pt">
          <div className="row">
            <div className="av">{data.nome[0]}</div>
            <div>
              <h2 style={{ margin: 0 }}>{data.nome}</h2>
              <p className="sub">{data.idade} anos · {data.alt}</p>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Button icon="edit" variant="w" onClick={onEditProfile}>Editar perfil</Button>
          </div>
        </div>
        <div className="c lv">
          <div className="row sp">
            <h2>Objetivos</h2>
            <Button icon="plus" variant="w" onClick={() => onEditGoal()}>Novo</Button>
          </div>
          {data.obj.length ? (
            data.obj.map(goal => (
              <div className="li" style={{ borderColor: 'rgba(42,35,80,.15)' }} key={goal.id}>
                <span><Icon name="target" size={16} /> {goal.t}</span>
                <span className="row">
                  <Button
                    icon="edit"
                    variant="ic w"
                    aria-label={`Editar ${goal.t}`}
                    onClick={() => onEditGoal(goal.id)}
                  />
                  <Button
                    icon="trash"
                    variant="ic w"
                    aria-label={`Excluir ${goal.t}`}
                    onClick={() => onDeleteGoal(goal.id)}
                  />
                </span>
              </div>
            ))
          ) : (
            <Empty icon="target">Objetivos são opcionais. Defina os seus quando quiser.</Empty>
          )}
        </div>
      </div>
      <div className="c">
        <h2>Configurações</h2>
        {setting('tema', dark, 'Modo escuro')}
        {setting('notif', data.notif, 'Notificações')}
        {setting('priv', data.priv, 'Manter dados só neste aparelho')}
      </div>
      <p className="sub" style={{ marginTop: 12, textAlign: 'center' }}>Protótipo com dados fictícios.</p>
    </div>
  );
}
