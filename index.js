/**
 * LAS 11 PREGUNTAS EXACTAS SOLICITADAS
 */
const QUESTIONS = [
  { id: 1, category: "Energía Matutina", text: "¿Te costó levantarte hoy?" },
  {
    id: 2,
    category: "Cansancio",
    text: "¿Te sentiste cansado/a durante el día?",
  },
  {
    id: 3,
    category: "Pensamientos",
    text: "¿Te preocupaste por cosas pequeñas?",
  },
  {
    id: 4,
    category: "Estado de Animo",
    text: "¿Te sentiste nervioso/a o inquieto/a?",
  },
  {
    id: 5,
    category: "Concentración",
    text: "¿Te costó concentrarte en tus actividades?",
  },
  {
    id: 6,
    category: "Tolerancia",
    text: "¿Te molestaste o frustraste fácilmente?",
  },
  {
    id: 7,
    category: "Carga de Trabajo",
    text: "¿Sentiste que tenías demasiadas cosas que hacer?",
  },
  {
    id: 8,
    category: "Relajación",
    text: "¿Te costó relajarte en algún momento?",
  },
  {
    id: 9,
    category: "Espacio Personal",
    text: "¿Tuviste ganas de estar solo/a más de lo normal?",
  },
  {
    id: 10,
    category: "Necesidad de Apoyo",
    text: "¿Sentiste que necesitabas un descanso o apoyo hoy?",
  },
  {
    id: 11,
    category: "Preferencia de Ayuda",
    text: "¿Prefieres utilizar el peluche sensorial o ir donde un adulto?",
  },
];

// Estado del Cuestionario
let currentIndex = 0;
let answers = {}; // { [questionId]: "Sí" | "Tal vez" | "No" }

// Estado de Respiración Guiada
let breathingInterval = null;
let isBreathingActive = false;

// Elementos DOM
const quizCard = document.getElementById("quiz-card");
const resultsCard = document.getElementById("results-card");
const questionCategory = document.getElementById("question-category");
const questionText = document.getElementById("question-text");
const currentQuestionNum = document.getElementById("current-question-num");
const totalQuestionsNum = document.getElementById("total-questions-num");
const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");
const optionButtons = document.querySelectorAll(".option-card");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const nextBtnText = document.getElementById("next-btn-text");
const nextBtnIcon = document.getElementById("next-btn-icon");

// Inicialización al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  initQuiz();
  setupEventListeners();
});

function initQuiz() {
  currentIndex = 0;
  answers = {};
  stopBreathingCycle();
  quizCard.classList.remove("hidden");
  resultsCard.classList.add("hidden");
  updateQuestionUI();
}

/**
 * Actualiza la pregunta y el estado visual de la pantalla actual
 */
function updateQuestionUI() {
  const q = QUESTIONS[currentIndex];

  // Contadores y Barra de Progreso
  currentQuestionNum.textContent = currentIndex + 1;
  totalQuestionsNum.textContent = QUESTIONS.length;

  const pct = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);
  progressBar.style.width = `${pct}%`;
  progressPercent.textContent = `${pct}%`;

  // Texto de la pregunta
  questionCategory.textContent = q.category;
  questionText.textContent = q.text;

  // Estado visual de los botones de respuesta
  const currentAnswer = answers[q.id];
  optionButtons.forEach((btn) => {
    const val = btn.getAttribute("data-value");
    const iconDiv = btn.querySelector(".selected-icon");

    if (val === currentAnswer) {
      btn.classList.add(
        "border-snow-900",
        "bg-snow-200",
        "ring-2",
        "ring-snow-900",
      );
      btn.classList.remove("border-snow-300", "bg-snow-50");
      if (iconDiv) iconDiv.classList.remove("hidden");
    } else {
      btn.classList.remove(
        "border-snow-900",
        "bg-snow-200",
        "ring-2",
        "ring-snow-900",
      );
      btn.classList.add("border-snow-300", "bg-snow-50");
      if (iconDiv) iconDiv.classList.add("hidden");
    }
  });

  // Navegación
  btnPrev.disabled = currentIndex === 0;

  const isLast = currentIndex === QUESTIONS.length - 1;
  nextBtnText.textContent = isLast ? "Ver Mi Diagnóstico" : "Siguiente";
  nextBtnIcon.className = isLast
    ? "fa-solid fa-heart text-xs"
    : "fa-solid fa-arrow-right text-xs";

  btnNext.disabled = !currentAnswer;
}

/**
 * Registra una opción elegida y pasa a la siguiente pregunta
 */
function selectOption(value) {
  const q = QUESTIONS[currentIndex];
  answers[q.id] = value;
  updateQuestionUI();

  // Transición automática suave
  setTimeout(() => {
    if (currentIndex < QUESTIONS.length - 1) {
      currentIndex++;
      updateQuestionUI();
    }
  }, 250);
}

function handleNext() {
  const q = QUESTIONS[currentIndex];
  if (!answers[q.id]) {
    showToast(
      "Por favor selecciona una opción para responder",
      "fa-triangle-exclamation",
    );
    return;
  }

  if (currentIndex < QUESTIONS.length - 1) {
    currentIndex++;
    updateQuestionUI();
  } else {
    renderResults();
  }
}

function handlePrev() {
  if (currentIndex > 0) {
    currentIndex--;
    updateQuestionUI();
  }
}

/**
 * Calcula los resultados y determina el diagnóstico + recomendación
 */
function renderResults() {
  quizCard.classList.add("hidden");
  resultsCard.classList.remove("hidden");

  let yesCount = 0;
  let maybeCount = 0;
  let noCount = 0;
  const total = QUESTIONS.length;

  QUESTIONS.forEach((q) => {
    const ans = answers[q.id];
    if (ans === "Sí") yesCount++;
    else if (ans === "Tal vez") maybeCount++;
    else if (ans === "No") noCount++;
  });

  const yesPct = Math.round((yesCount / total) * 100);
  const maybePct = Math.round((maybeCount / total) * 100);
  const noPct = Math.round((noCount / total) * 100);

  // Actualizar contadores
  document.getElementById("stat-yes-count").textContent = yesCount;
  document.getElementById("stat-yes-percent").textContent = `${yesPct}%`;

  document.getElementById("stat-maybe-count").textContent = maybeCount;
  document.getElementById("stat-maybe-percent").textContent = `${maybePct}%`;

  document.getElementById("stat-no-count").textContent = noCount;
  document.getElementById("stat-no-percent").textContent = `${noPct}%`;

  // Barra visual proporcional
  document.getElementById("bar-yes").style.width = `${yesPct}%`;
  document.getElementById("bar-maybe").style.width = `${maybePct}%`;
  document.getElementById("bar-no").style.width = `${noPct}%`;

  // Evaluación del Estado y Recomendación Principal
  const statusTitle = document.getElementById("status-title");
  const statusBadge = document.getElementById("status-badge");
  const statusIcon = document.getElementById("status-icon");
  const recText = document.getElementById("rec-text");
  const recIcon = document.getElementById("rec-icon");

  const q11Answer = answers[11]; // Pregunta sobre peluche vs adulto

  // Variable para almacenar la orden al ESP32
  let bleCommand = "G";

  if (yesCount >= maybeCount && yesCount >= noCount) {
    // ----------------------------------------------------
    // ROJO: Persona de Apoyo (Comando 'R')
    // ----------------------------------------------------
    bleCommand = "R";

    statusTitle.textContent = "Te sientes algo abrumado/a hoy";
    statusBadge.textContent = "Estado: Necesitas un descanso o apoyo";
    statusIcon.className = "fa-solid fa-hand-holding-heart text-2xl";

    if (q11Answer === "No") {
      recText.textContent =
        "Te vendría muy bien ir donde un adulto de confianza o persona de apoyo para compartir cómo te sientes, recibir un abrazo y conversar con calma.";
      recIcon.className = "fa-solid fa-user-nurse text-xl";
    } else {
      recText.textContent =
        "Te vendría muy bien ir donde un adulto de confianza o persona de apoyo para compartir cómo te sientes y recibir ayuda. Si lo prefieres, también puedes abrazar tu peluche sensorial.";
      recIcon.className = "fa-solid fa-people-hold text-xl";
    }
  } else if (maybeCount >= yesCount && maybeCount >= noCount) {
    // ----------------------------------------------------
    // AMARILLO: Peluche Sensorial (Comando 'Y')
    // ----------------------------------------------------
    bleCommand = "Y";

    statusTitle.textContent = "Te sientes algo inquieto/a o dudoso/a";
    statusBadge.textContent = "Estado: Intermedio / En pausa";
    statusIcon.className = "fa-solid fa-cloud-sun text-2xl";

    recText.textContent =
      "Te recomendamos utilizar el peluche sensorial de respiración guiada para realizar un ejercicio de calma (inhalar/sostener/exhalar). Te ayudará a enfocar tu atención.";
    recIcon.className = "fa-solid fa-wind text-xl";

    // Iniciar guía suavemente
    setTimeout(() => {
      if (!isBreathingActive) startBreathingCycle();
    }, 800);
  } else {
    // ----------------------------------------------------
    // VERDE: Estado en Calma (Comando 'G')
    // ----------------------------------------------------
    bleCommand = "G";

    statusTitle.textContent = "¡Te sientes tranquilo/a y bien!";
    statusBadge.textContent = "Estado: Bienestar y Armonía";
    statusIcon.className = "fa-solid fa-face-smile text-2xl";

    recText.textContent =
      "¡Te sientes muy bien hoy! Continúa disfrutando tu día y manteniendo tu bienestar. Si en algún momento necesitas una pausa, el peluche o un adulto siempre estarán disponibles.";
    recIcon.className = "fa-solid fa-sparkles text-xl";
  }

  // ----------------------------------------------------
  // ENVIAR SEÑAL BLE AL ESP32
  // ----------------------------------------------------
  sendResultToESP32(bleCommand);

  // Detalle de las 11 preguntas
  renderDetailedList();
}

/**
 * Renderiza la lista desplegable con las 11 respuestas
 */
function renderDetailedList() {
  const container = document.getElementById("detailed-results");
  container.innerHTML = "";

  QUESTIONS.forEach((q, idx) => {
    const userAns = answers[q.id] || "Sin responder";
    let badgeStyle = "bg-snow-200 text-snow-800 border-snow-300";

    if (userAns === "Sí") {
      badgeStyle = "bg-snow-900 text-snow-50 border-snow-900";
    } else if (userAns === "Tal vez") {
      badgeStyle = "bg-snow-500 text-snow-950 border-snow-600";
    } else if (userAns === "No") {
      badgeStyle = "bg-snow-300 text-snow-900 border-snow-400";
    }

    const div = document.createElement("div");
    div.className =
      "p-3 rounded-xl border border-snow-300 bg-snow-100 flex items-center justify-between gap-3 text-xs";
    div.innerHTML = `
          <div class="flex items-start gap-2">
            <span class="font-bold text-snow-600">${idx + 1}.</span>
            <div>
              <p class="font-semibold text-snow-950 leading-snug">${escapeHtml(q.text)}</p>
              <span class="text-[10px] text-snow-600 uppercase font-medium tracking-wider">${escapeHtml(q.category)}</span>
            </div>
          </div>
          <span class="font-bold px-2.5 py-1 rounded-lg border ${badgeStyle} shrink-0">
            ${userAns}
          </span>
        `;
    container.appendChild(div);
  });
}

/**
 * CICLO DE RESPIRACIÓN GUIADA (4s Inhalar - 4s Sostener - 4s Exhalar)
 */
function toggleBreathingCycle() {
  if (isBreathingActive) {
    stopBreathingCycle();
  } else {
    startBreathingCycle();
  }
}

function startBreathingCycle() {
  isBreathingActive = true;
  document.getElementById("breathing-btn-text").textContent =
    "Pausar Respiración";
  document.getElementById("breathing-btn-icon").className = "fa-solid fa-pause";

  const node = document.getElementById("breathing-node");
  const phaseText = document.getElementById("breathing-phase");
  const timerText = document.getElementById("breathing-timer");

  let step = 0; // 0: Inhala, 1: Sostén, 2: Exhala

  const runPhase = () => {
    if (!isBreathingActive) return;

    if (step === 0) {
      phaseText.textContent = "Inhala profundamente...";
      timerText.textContent = "Toma aire con calma (4s)";
      node.className =
        "breathing-circle w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-snow-200 border-4 border-snow-900 flex items-center justify-center shadow-md mb-4 breathing-inhale";
      step = 1;
    } else if (step === 1) {
      phaseText.textContent = "Sostén el aire...";
      timerText.textContent = "Mantén la calma en tu pecho (4s)";
      node.className =
        "breathing-circle w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-snow-300 border-4 border-snow-900 flex items-center justify-center shadow-md mb-4 breathing-hold";
      step = 2;
    } else {
      phaseText.textContent = "Exhala suavemente...";
      timerText.textContent = "Suelta todo el aire despacio (4s)";
      node.className =
        "breathing-circle w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-snow-50 border-4 border-snow-700 flex items-center justify-center shadow-md mb-4 breathing-exhale";
      step = 0;
    }
  };

  runPhase();
  breathingInterval = setInterval(runPhase, 4000);
}

function stopBreathingCycle() {
  isBreathingActive = false;
  clearInterval(breathingInterval);

  const node = document.getElementById("breathing-node");
  const phaseText = document.getElementById("breathing-phase");
  const timerText = document.getElementById("breathing-timer");

  if (node) {
    node.className =
      "breathing-circle w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-snow-50 border-4 border-snow-800 flex items-center justify-center shadow-md mb-4";
  }
  if (phaseText) phaseText.textContent = "Presiona iniciar";
  if (timerText) timerText.textContent = "Ritmo 4s - 4s - 4s";

  const btnText = document.getElementById("breathing-btn-text");
  const btnIcon = document.getElementById("breathing-btn-icon");
  if (btnText) btnText.textContent = "Iniciar Respiración";
  if (btnIcon) btnIcon.className = "fa-solid fa-play";
}

/**
 * Event Listeners
 */
function setupEventListeners() {
  // Opciones de respuesta
  optionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectOption(btn.getAttribute("data-value"));
    });
  });

  // Navegación
  btnNext.addEventListener("click", handleNext);
  btnPrev.addEventListener("click", handlePrev);

  // Reiniciar
  document.getElementById("btn-restart").addEventListener("click", () => {
    initQuiz();
    showToast("Cuestionario listo para iniciar nuevamente");
  });

  // Toggle Respiración
  document
    .getElementById("btn-toggle-breathing")
    .addEventListener("click", toggleBreathingCycle);

  // Toggle Desplegable de Detalles
  document
    .getElementById("btn-toggle-details")
    .addEventListener("click", () => {
      const detailedResults = document.getElementById("detailed-results");
      const arrow = document.getElementById("details-arrow");

      detailedResults.classList.toggle("hidden");
      arrow.classList.toggle("rotate-180");
    });

  // Atajos de teclado
  document.addEventListener("keydown", (e) => {
    if (!quizCard.classList.contains("hidden")) {
      if (e.key === "1") selectOption("Sí");
      if (e.key === "2") selectOption("Tal vez");
      if (e.key === "3") selectOption("No");
      if (e.key === "ArrowRight" && !btnNext.disabled) handleNext();
      if (e.key === "ArrowLeft" && !btnPrev.disabled) handlePrev();
    }
  });
}

/**
 * Utilidad Toast
 */
function showToast(message, iconClass = "fa-circle-check") {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");

  toastMsg.textContent = message;
  toastIcon.className = `fa-solid ${iconClass} text-snow-300`;

  toast.classList.remove("translate-y-20", "opacity-0");

  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0");
  }, 2500);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
