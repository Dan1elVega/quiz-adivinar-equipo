'use strict';

/* ==========================================================
   1. CONFIGURACIÓN
   ========================================================== */
const CONFIG = {
  // Carpeta o URL base de los escudos. Para usar imágenes propias: "img/"
  logosBase: "https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/",
  nextDelay: 1500,         // ms que se muestra el acierto/error antes de pasar a la siguiente
  shuffleQuestions: true,  // mezclar el orden de las preguntas en cada partida
};

/* ==========================================================
   2. PREGUNTAS — agrega, quita o edita objetos libremente
   escudo:      ruta del archivo (relativa a logosBase) o URL completa (https://...)
   respuesta:   nombre correcto del equipo
   incorrectas: exactamente 3 nombres incorrectos (las opciones se mezclan solas)
   ========================================================== */
const QUESTIONS = [
  { liga: "Premier League", escudo: "England - Premier League/Liverpool FC.png",        respuesta: "Liverpool",       incorrectas: ["Chelsea", "Arsenal", "Tottenham"] },
  { liga: "Premier League", escudo: "England - Premier League/Manchester United.png",   respuesta: "Manchester United", incorrectas: ["Manchester City", "Liverpool", "Chelsea"] },
  { liga: "LaLiga",         escudo: "Spain - LaLiga/Real Madrid.png",                   respuesta: "Real Madrid",     incorrectas: ["FC Barcelona", "Sevilla", "Valencia"] },
  { liga: "LaLiga",         escudo: "Spain - LaLiga/Valencia CF.png",                   respuesta: "Valencia",        incorrectas: ["Sevilla", "Real Madrid", "Espanyol"] },
  { liga: "Serie A",        escudo: "Italy - Serie A/Juventus FC.png",                  respuesta: "Juventus",        incorrectas: ["AC Milan", "Inter", "Napoli"] },
  { liga: "Serie A",        escudo: "Italy - Serie A/AS Roma.png",                      respuesta: "AS Roma",         incorrectas: ["Napoli", "Juventus", "Inter"] },
  { liga: "Bundesliga",     escudo: "Germany - Bundesliga/Borussia Dortmund.png",       respuesta: "Borussia Dortmund", incorrectas: ["Bayern Múnich", "Bayer Leverkusen", "RB Leipzig"] },
  { liga: "Bundesliga",     escudo: "Germany - Bundesliga/RB Leipzig.png",              respuesta: "RB Leipzig",      incorrectas: ["Bayer Leverkusen", "Borussia Dortmund", "Bayern Múnich"] },
  { liga: "Ligue 1",        escudo: "France - Ligue 1/Paris Saint-Germain.png",         respuesta: "Paris Saint-Germain", incorrectas: ["Marsella", "Lyon", "Mónaco"] },
  { liga: "Ligue 1",        escudo: "France - Ligue 1/Olympique Lyon.png",              respuesta: "Lyon",            incorrectas: ["Marsella", "Mónaco", "Paris Saint-Germain"] },
];

// Mensajes motivacionales según el porcentaje de aciertos (de mayor a menor)
const MESSAGES = [
  { min: 100, title: "¡Perfecto!",        text: "Conoces cada escudo. Eres una leyenda del fútbol europeo." },
  { min: 80,  title: "¡Crack!",           text: "Casi impecable. Tienes ojo de ojeador." },
  { min: 50,  title: "Buen partido",      text: "Vas por buen camino. Una revancha y llegas a la cima." },
  { min: 30,  title: "Calentando",        text: "Todavía estás en pretemporada. ¡Vuelve a intentarlo!" },
  { min: 0,   title: "Debut complicado",  text: "Todos empezamos en el banquillo. ¡La próxima será mejor!" },
];

/* ==========================================================
   3. UTILIDADES Y ESTADO
   ========================================================== */
const $ = (id) => document.getElementById(id);
const el = {
  start: $('screen-start'), quiz: $('screen-quiz'), result: $('screen-result'),
  count: $('q-count'), score: $('q-score'), league: $('q-league'),
  progress: $('progress'), bar: $('progress-bar'), stage: $('stage'),
  crest: $('crest'), img: $('q-crest'), options: $('options'), feedback: $('feedback'),
  ring: $('ring-fill'), rScore: $('r-score'), rTotal: $('r-total'), rTitle: $('r-title'), rText: $('r-text'),
};
const RING_LENGTH = 326.7;   // circunferencia del anillo SVG (2·π·52)
let state = { queue: [], index: 0, score: 0, locked: false };

// Fisher–Yates: devuelve una copia mezclada
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const crestUrl = (path) => (/^https?:\/\//.test(path) ? path : CONFIG.logosBase + encodeURI(path));

// Muestra una pantalla y oculta las demás
function showScreen(name) {
  ['start', 'quiz', 'result'].forEach((n) => { el[n].hidden = n !== name; });
  el[name].querySelector('[data-focus]')?.focus({ preventScroll: true });
}

/* ==========================================================
   4. LÓGICA DEL JUEGO
   ========================================================== */
function startGame() {
  state = { queue: CONFIG.shuffleQuestions ? shuffle(QUESTIONS) : [...QUESTIONS], index: 0, score: 0, locked: false };
  el.bar.style.width = '0%';
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = state.queue[state.index];
  const total = state.queue.length;
  state.locked = false;

  el.count.textContent = `Pregunta ${state.index + 1} de ${total}`;
  el.score.textContent = `${state.score} ${state.score === 1 ? 'acierto' : 'aciertos'}`;
  el.league.textContent = q.liga;
  el.feedback.textContent = '';
  el.feedback.className = 'feedback';

  // Escudo: los manejadores se asignan antes de definir el src
  el.crest.classList.remove('ready', 'broken');
  el.img.onload = () => el.crest.classList.add('ready');
  el.img.onerror = () => el.crest.classList.add('broken');
  el.img.src = crestUrl(q.escudo);

  // Opciones mezcladas
  el.options.replaceChildren(...shuffle([q.respuesta, ...q.incorrectas]).map((text, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.dataset.value = text;
    btn.innerHTML = `<span class="key">${i + 1}</span><span></span>`;
    btn.lastChild.textContent = text;       // textContent evita inyectar HTML
    btn.addEventListener('click', () => handleAnswer(btn));
    return btn;
  }));

  // Precarga el siguiente escudo para que aparezca al instante
  const next = state.queue[state.index + 1];
  if (next) new Image().src = crestUrl(next.escudo);
}

function handleAnswer(chosen) {
  if (state.locked) return;
  state.locked = true;

  const q = state.queue[state.index];
  const isCorrect = chosen.dataset.value === q.respuesta;
  if (isCorrect) state.score++;

  // Colorea: elegida (verde/roja) + revela la correcta + atenúa el resto
  el.options.querySelectorAll('.option').forEach((btn) => {
    btn.classList.add('locked');
    if (btn.dataset.value === q.respuesta) btn.classList.add('correct');
    else if (btn === chosen) btn.classList.add('wrong');
    else btn.classList.add('dim');
  });

  el.feedback.textContent = isCorrect ? '¡Correcto!' : `Era ${q.respuesta}`;
  el.feedback.className = `feedback ${isCorrect ? 'ok' : 'bad'}`;
  el.score.textContent = `${state.score} ${state.score === 1 ? 'acierto' : 'aciertos'}`;

  // Barra de progreso = preguntas respondidas
  const pct = Math.round(((state.index + 1) / state.queue.length) * 100);
  el.bar.style.width = `${pct}%`;
  el.progress.setAttribute('aria-valuenow', pct);

  setTimeout(goNext, CONFIG.nextDelay);
}

function goNext() {
  state.index++;
  if (state.index >= state.queue.length) return showResult();

  el.stage.classList.add('is-out');           // 1. sale la pregunta actual
  setTimeout(() => {
    el.stage.classList.remove('is-out');
    renderQuestion();                         // 2. se carga la nueva
    el.stage.classList.remove('is-in');
    void el.stage.offsetWidth;                // reinicia la animación
    el.stage.classList.add('is-in');          // 3. entra
  }, 260);
}

function showResult() {
  const total = state.queue.length;
  const pct = Math.round((state.score / total) * 100);
  const msg = MESSAGES.find((m) => pct >= m.min);

  el.rScore.textContent = state.score;
  el.rTotal.textContent = `de ${total}`;
  el.rTitle.textContent = msg.title;
  el.rText.textContent = msg.text;
  el.ring.style.strokeDashoffset = RING_LENGTH;
  showScreen('result');
  // Doble rAF: garantiza que el anillo se anime desde vacío hasta el puntaje
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.ring.style.strokeDashoffset = RING_LENGTH * (1 - pct / 100);
  }));
}

/* ==========================================================
   5. EVENTOS
   ========================================================== */
$('btn-start').addEventListener('click', startGame);
$('btn-restart').addEventListener('click', startGame);

// Atajos de teclado: teclas 1–4 eligen la opción correspondiente
document.addEventListener('keydown', (e) => {
  if (el.quiz.hidden || state.locked) return;
  const btn = el.options.querySelectorAll('.option')[Number(e.key) - 1];
  if (btn) btn.click();
});
