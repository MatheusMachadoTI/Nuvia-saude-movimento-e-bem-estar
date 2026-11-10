# Nuvia — Saúde, movimento e bem-estar em um só lugar

<p align="center">
  <strong>Cuide da sua rotina. Acompanhe sua evolução.</strong>
</p>

<p align="center">
  Um aplicativo de saúde e bem-estar desenvolvido para reunir exercícios físicos, alimentação e sono em uma experiência simples, intuitiva e personalizada.
</p>

---

## Sobre o projeto

O **Nuvia** é um aplicativo de acompanhamento de saúde e bem-estar que tem como objetivo reunir diferentes aspectos da rotina em um único ambiente.

A proposta surgiu da percepção de que acompanhar a própria evolução física e cuidar da saúde frequentemente exige a utilização de diferentes aplicativos e ferramentas. Além disso, muitas soluções apresentam uma quantidade excessiva de informações e exigem registros constantes, tornando a experiência cansativa.

O Nuvia busca solucionar esse problema por meio de uma plataforma que integra três pilares:

- **Exercícios físicos:** organização de treinos, acompanhamento de atividades e histórico de desempenho.
- **Alimentação:** registro e acompanhamento simplificado das refeições.
- **Bem-estar:** acompanhamento básico do sono e de hábitos relacionados à qualidade de vida.

Além disso, o aplicativo oferece uma área de evolução, permitindo que o usuário visualize seu progresso ao longo do tempo.

O principal princípio do projeto é oferecer uma experiência útil, organizada e agradável, sem exigir que o usuário registre informações em excesso.

## Objetivos

- Reunir diferentes áreas relacionadas à saúde em uma única plataforma.
- Facilitar o acompanhamento da evolução física.
- Incentivar a consistência na prática de exercícios e nos cuidados pessoais.
- Oferecer uma experiência simples, intuitiva e visualmente agradável.
- Permitir que cada usuário acompanhe as áreas que considera mais importantes.
- Apresentar informações relevantes sem sobrecarregar a interface.

## Funcionalidades

### 1. Início

A tela inicial funciona como um painel de acompanhamento da rotina, apresentando um resumo das principais informações do usuário.

- Visão geral das atividades.
- Resumo semanal.
- Indicadores de exercícios físicos.
- Resumo de alimentação.
- Informações sobre o sono.
- Acesso rápido às demais áreas.

### 2. Exercícios físicos

Área destinada à organização e ao acompanhamento dos treinos.

- Criação e gerenciamento de planilhas de treino.
- Cadastro e organização de exercícios.
- Definição de séries, repetições e cargas.
- Acompanhamento de treinos em andamento.
- Marcação de exercícios e séries concluídas.
- Opção de finalizar o treino sem registrar individualmente cada exercício.
- Histórico de atividades realizadas.

### 3. Evolução

Área dedicada à visualização do progresso do usuário em diferentes aspectos.

**Atividade física**
- Quantidade de dias com exercícios durante a semana.
- Número de treinos concluídos.
- Histórico de frequência.
- Evolução de cargas e desempenho.

**Sono**
- Quantidade de noites com sono satisfatório.
- Média de horas dormidas.
- Histórico de qualidade do sono.

**Evolução corporal**
- Registro do peso.
- Histórico de alterações.
- Gráficos de acompanhamento.
- Registro de fotos de progresso.
- Comparação de fotos de diferentes períodos.

### 4. Alimentação

Área para acompanhamento simplificado da rotina alimentar.

- Registro de refeições.
- Identificação do tipo de refeição.
- Organização das refeições por dia.
- Histórico alimentar.
- Visualização das refeições registradas.

A proposta inicial prioriza a praticidade, evitando a obrigatoriedade de preencher informações nutricionais detalhadas.

### 5. Sono

Área destinada ao acompanhamento básico do descanso.

- Registro do horário de dormir.
- Registro do horário de acordar.
- Cálculo da duração do sono.
- Avaliação da qualidade do sono.
- Histórico de registros.
- Média de horas dormidas.

### 6. Perfil e objetivos

Área para personalização da experiência.

- Informações pessoais.
- Definição de objetivos.
- Preferências do aplicativo.
- Configurações de aparência.
- Preferências de notificações e privacidade.

### 7. Resumo semanal

Apresentação consolidada dos principais indicadores da semana:

- Dias de exercícios.
- Treinos concluídos.
- Noites de sono satisfatório.
- Média de horas de sono.
- Refeições registradas.

---

## Identidade visual

O Nuvia possui uma identidade visual desenvolvida para transmitir equilíbrio, tecnologia, saúde e bem-estar.

A interface utiliza uma combinação de cores inspirada em elementos naturais e tecnológicos, com destaque para tons de azul-petróleo, verde-menta e turquesa.

**Paleta de cores principal:**

| Cor | Código | Aplicação |
|---|---|---|
| Azul-petróleo | `#245B63` | Cor principal |
| Verde-menta | `#8FC9B5` | Elementos de destaque |
| Verde-claro | `#E5F2ED` | Fundos e superfícies |
| Fundo claro | `#F8FAF9` | Base da interface |
| Azul-escuro | `#24363A` | Textos e elementos escuros |
| Turquesa | `#36B8A7` | Destaques e interações |
| Lavanda | `#A99AD8` | Cor complementar |

**Diretrizes de design:**

- Interface moderna e minimalista.
- Cards independentes e organizados.
- Gradientes suaves em tons de azul-petróleo e verde-água.
- Hierarquia visual bem definida.
- Componentes reutilizáveis.
- Gráficos e indicadores de fácil compreensão.
- Layout responsivo.
- Atenção especial à experiência mobile.

## Tecnologias

O projeto utiliza tecnologias voltadas ao desenvolvimento de interfaces web modernas.

- **React:** construção da interface por meio de componentes.
- **Vite:** ambiente de desenvolvimento e build.
- **JavaScript:** implementação das interações e funcionalidades.
- **CSS:** estilização e responsividade.
- **Lucide React:** biblioteca de ícones.

> As tecnologias e versões devem corresponder à configuração efetivamente utilizada no projeto.

## Estrutura do projeto

O projeto é organizado para facilitar a manutenção, a reutilização de componentes e a evolução das funcionalidades.

A estrutura de referência é:

```text
nuvia/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── Home/
│   │   ├── Workouts/
│   │   ├── Evolution/
│   │   ├── Nutrition/
│   │   ├── Sleep/
│   │   ├── Profile/
│   │   └── Settings/
│   ├── styles/
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── README.md
```

*Estrutura ilustrativa: a organização acima representa a separação conceitual dos módulos e pode variar conforme a implementação atual.*

## Como executar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/)
- npm (instalado junto com o Node.js)
- Git (opcional, para clonar o repositório)

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Acesse a pasta

```bash
cd nuvia
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute o projeto

```bash
npm run dev
```

### 5. Acesse no navegador

O Vite disponibilizará um endereço local, normalmente:

```text
http://localhost:5173
```

---

## Estado atual do desenvolvimento

O Nuvia está em desenvolvimento.

A etapa atual está concentrada na construção e no refinamento do front-end, incluindo a identidade visual, a organização das telas, a navegação e as interações da interface.

Nesta fase, o aplicativo utiliza dados de demonstração e funcionalidades simuladas no próprio navegador.

**O projeto ainda não possui:**

- Back-end integrado.
- Banco de dados.
- Sistema de autenticação real.
- Armazenamento de dados em servidor.
- Integrações com dispositivos ou serviços externos.

Esses recursos poderão ser considerados nas próximas etapas do desenvolvimento.

## Roadmap

- [x] Definição da proposta e dos objetivos do aplicativo.
- [x] Definição dos três pilares principais.
- [x] Definição inicial da identidade visual.
- [x] Planejamento das principais telas e funcionalidades.
- [x] Desenvolvimento inicial do front-end.
- [ ] Refinamento da experiência visual e de usabilidade.
- [ ] Revisão e aprimoramento da responsividade.
- [ ] Finalização das interações do front-end.
- [ ] Planejamento da arquitetura do back-end.
- [ ] Modelagem do banco de dados.
- [ ] Implementação de autenticação.
- [ ] Integração entre front-end e back-end.
- [ ] Testes e validação da aplicação.

## Princípios do projeto

O desenvolvimento do Nuvia segue alguns princípios importantes:

**Simplicidade:** evitar funcionalidades desnecessárias e registros excessivos.

**Autonomia:** permitir que o usuário escolha quais áreas deseja acompanhar.

**Consistência:** valorizar a construção gradual de hábitos, sem abordagens punitivas.

**Evolução:** apresentar informações que ajudem o usuário a compreender seu próprio progresso.

**Experiência do usuário:** priorizar uma interface intuitiva, acessível e agradável.

**Privacidade:** considerar a proteção e o controle dos dados pessoais desde o planejamento da arquitetura.

## Objetivo de aprendizado e desenvolvimento

Além de sua proposta como produto, o Nuvia também representa um projeto de desenvolvimento de software, envolvendo planejamento de funcionalidades, design de interfaces, organização de componentes, implementação de interações e, futuramente, integração com uma arquitetura completa de back-end.

O projeto será desenvolvido de forma incremental, permitindo aprimoramentos e novas funcionalidades conforme sua evolução.

---

## Licença

Este projeto ainda não possui uma licença de distribuição definida.

---

<p align="center">
  <strong>Nuvia</strong><br>
  Saúde, movimento e bem-estar em um só lugar.
</p>
