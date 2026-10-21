
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const answerButtons = [
  document.getElementById("answer-a"),
  document.getElementById("answer-b")
];

const questionElement = document.getElementById("question");
const feedbackElement = document.getElementById("feedback");
const livesElement = document.getElementById("lives");
const streakElement = document.getElementById("streak");
const timerElement = document.getElementById("timer");
const timerBar = document.getElementById("timer-bar");
const operationLabel = document.getElementById("operation-label");
const bestScoreElement = document.getElementById("best-score");
const finalScoreElement = document.getElementById("final-score");

const TIME_LIMIT = 15;

let lives = 3;
let streak = 0;
let timeLeft = TIME_LIMIT;
let correctAnswer = 0;
let timerInterval = null;
let nextQuestionTimeout = null;
let answered = false;
let gameActive = false;

let bestScore = Number(localStorage.getItem("mathStreakBest")) || 0;

bestScoreElement.textContent = bestScore;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const operations = ["+", "-"];

  if (streak >= 5) {
    operations.push("*");
  }

  if (streak >= 10) {
    operations.push("/");
  }

  const operation = operations[randomInt(0, operations.length - 1)];
  let a;
  let b;
  let answer;

  if (operation === "+") {
    a = randomInt(1, 50);
    b = randomInt(1, 50);
    answer = a + b;
    operationLabel.textContent = "ADIÇÃO";
  } else if (operation === "-") {
    a = randomInt(1, 50);
    b = randomInt(1, a);
    answer = a - b;
    operationLabel.textContent = "SUBTRAÇÃO";
  } else if (operation === "*") {
    a = randomInt(2, 12);
    b = randomInt(2, 12);
    answer = a * b;
    operationLabel.textContent = "MULTIPLICAÇÃO";
  } else {
    b = randomInt(2, 12);
    answer = randomInt(2, 12);
    a = b * answer;
    operationLabel.textContent = "DIVISÃO";
  }

  correctAnswer = answer;
  questionElement.textContent =
    `${a} ${operation === "*" ? "×" : operation === "/" ? "÷" : operation} ${b} = ?`;

  const wrongAnswer = createWrongAnswer(answer);
  const options = [answer, wrongAnswer];

  if (Math.random() < 0.5) {
    options.reverse();
  }

  answerButtons.forEach((button, index) => {
    button.textContent = options[index];
    button.disabled = false;
  });

  feedbackElement.textContent = "Escolha a resposta correta!";
  feedbackElement.className = "feedback";
  answered = false;

  startTimer();
}

function createWrongAnswer(answer) {
  let wrong;

  do {
    const offset = randomInt(1, 10);
    wrong = Math.random() < 0.5
      ? answer + offset
      : answer - offset;
  } while (wrong === answer || wrong < 0);

  return wrong;
}

function startTimer() {
  clearInterval(timerInterval);

  timeLeft = TIME_LIMIT;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleAnswer(null);
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerElement.textContent = `${timeLeft}s`;

  const percentage = (timeLeft / TIME_LIMIT) * 100;
  timerBar.style.width = `${percentage}%`;

  if (timeLeft <= 5) {
    timerBar.style.background = "var(--red)";
  } else if (timeLeft <= 8) {
    timerBar.style.background = "#fbbf24";
  } else {
    timerBar.style.background = "var(--green)";
  }
}

function handleAnswer(selectedAnswer) {
  if (!gameActive || answered) return;

  answered = true;
  clearInterval(timerInterval);

  answerButtons.forEach(button => {
    button.disabled = true;
  });

  if (selectedAnswer === correctAnswer) {
    streak++;

    feedbackElement.textContent = "Muito bem! Resposta correta! 🎉";
    feedbackElement.className = "feedback correct";

    updateStreakDisplay();

    if (streak > bestScore) {
      bestScore = streak;
      bestScoreElement.textContent = bestScore;
      localStorage.setItem("mathStreakBest", bestScore);
    }

    nextQuestionTimeout = setTimeout(() => {
      if (gameActive) generateQuestion();
    }, 650);
  } else {
    feedbackElement.textContent = selectedAnswer === null
      ? `Tempo esgotado! A resposta era ${correctAnswer}.`
      : `Ops! A resposta era ${correctAnswer}.`;

    feedbackElement.className = "feedback wrong";

    nextQuestionTimeout = setTimeout(() => {
      if (!gameActive) return;

      lives--;
      updateLivesDisplay();

      if (lives <= 0) {
        endGame();
      } else {
        generateQuestion();
      }
    }, 900);
  }
}

function updateLivesDisplay() {
  livesElement.textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
}

function updateStreakDisplay() {
  streakElement.textContent = `🔥 ${streak}`;
  streakElement.classList.remove("fire-red", "fire-purple");

  if (streak >= 20) {
    streakElement.classList.add("fire-purple");
  } else if (streak >= 10) {
    streakElement.classList.add("fire-red");
  }
}

function startGame() {
  clearInterval(timerInterval);
  clearTimeout(nextQuestionTimeout);

  lives = 3;
  streak = 0;
  gameActive = true;
  answered = false;

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  updateLivesDisplay();
  updateStreakDisplay();
  generateQuestion();
}

function endGame() {
  gameActive = false;

  clearInterval(timerInterval);
  clearTimeout(nextQuestionTimeout);

  gameScreen.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");

  finalScoreElement.textContent = streak;
  bestScoreElement.textContent = bestScore;
}

answerButtons.forEach(button => {
  button.addEventListener("click", () => {
    handleAnswer(Number(button.textContent));
  });
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
