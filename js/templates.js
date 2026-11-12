import home from '../templates/inicio.html?raw';
import workouts from '../templates/treinos.html?raw';
import progress from '../templates/evolucao.html?raw';
import profile from '../templates/perfil.html?raw';
import food from '../templates/alimentacao.html?raw';
import sleep from '../templates/sono.html?raw';
import workoutEditor from '../templates/editar-treino.html?raw';
import workoutSession from '../templates/executar-treino.html?raw';

export default {
  inicio: home,
  treinos: workouts,
  evolucao: progress,
  perfil: profile,
  alimentacao: food,
  sono: sleep,
  editar: workoutEditor,
  exec: workoutSession,
};
